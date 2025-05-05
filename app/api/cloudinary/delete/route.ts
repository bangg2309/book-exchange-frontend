import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { publicId } = await request.json();
    
    if (!publicId) {
      return NextResponse.json(
        { success: false, message: 'Public ID is required' },
        { status: 400 }
      );
    }
    
    const timestamp = Math.round(new Date().getTime() / 1000);
    const apiSecret = process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET;
    const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    
    if (!apiSecret || !apiKey || !cloudName) {
      return NextResponse.json(
        { success: false, message: 'Cloudinary configuration is missing' },
        { status: 500 }
      );
    }
    
    const signature = await generateSHA1(`public_id=${publicId}&timestamp=${timestamp}${apiSecret}`);
    
    const formData = new FormData();
    formData.append('public_id', publicId);
    formData.append('timestamp', timestamp.toString());
    formData.append('api_key', apiKey);
    formData.append('signature', signature);
    
    const deleteUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`;
    
    const response = await fetch(deleteUrl, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cloudinary delete API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      return NextResponse.json(
        { success: false, message: `Failed to delete image: ${response.statusText}` },
        { status: response.status }
      );
    }
    
    const result = await response.json();
    
    if (result.result === 'ok') {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, message: 'Failed to delete image', details: result },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to generate SHA1 hash for Cloudinary signature
async function generateSHA1(message: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-1', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
} 