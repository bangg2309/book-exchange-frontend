'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '@/services/authService';

// Define paths that require admin role
const ADMIN_PATHS = ['/admin'];
// Define public paths that don't require auth
const PUBLIC_PATHS = ['/', '/login', '/register', '/about', '/categories', '/insight'];

export default function AuthInitializer() {
  const router = useRouter();
  const pathname = usePathname();
  const [initialized, setInitialized] = useState(false);
  const [lastAuthCheck, setLastAuthCheck] = useState(0);

  // Function to check admin access
  const checkAdminAccess = async () => {
    // Prevent multiple checks in a short time period
    const now = Date.now();
    if (now - lastAuthCheck < 2000) {
      console.log('AuthInitializer - Skipping check, too recent');
      return;
    }
    setLastAuthCheck(now);
    
    try {
      const currentPath = pathname || '';
      console.log('AuthInitializer - Checking permissions for path:', currentPath);
      
      // Skip checks for public paths
      if (PUBLIC_PATHS.some(path => currentPath === path || currentPath.startsWith(path + '/'))) {
        console.log('AuthInitializer - On public path, skipping access check');
        return;
      }
      
      // Check if current path requires admin role
      const isAdminPath = ADMIN_PATHS.some(path => 
        currentPath === path || currentPath.startsWith(path + '/')
      );
      
      // Check if we have a token
      const hasToken = authService.isAuthenticated();
      console.log('AuthInitializer - Has token:', hasToken);
      
      if (!hasToken) {
        // No token and not on a public path, redirect to login
        console.log('AuthInitializer - No token on protected path, redirecting to login');
        router.push('/login');
        return;
      }
      
      // Only perform admin role checks for admin paths
      if (isAdminPath) {
        console.log('AuthInitializer - Admin path detected, checking permissions');
        
        // Check admin status
        const user = authService.getCurrentUser();
        if (!user) {
          console.log('AuthInitializer - No user data found, redirecting to login');
          router.push('/login');
          return;
        }
        
        // Check if user is admin
        let isAdmin = false;
        if (user.roles && Array.isArray(user.roles)) {
          isAdmin = user.roles.some(
            (role: any) => role && role.name && role.name.toUpperCase() === 'ADMIN'
          );
        }
        console.log('AuthInitializer - User is admin:', isAdmin);
        
        // If non-admin trying to access admin area, redirect to profile
        if (!isAdmin) {
          console.log('AuthInitializer - Non-admin trying to access admin area, redirecting to profile');
          router.push('/profile');
        }
      }
    } catch (error) {
      console.error('AuthInitializer - Authentication error:', error);
    }
  };

  // Initial setup
  useEffect(() => {
    if (!initialized) {
      console.log('AuthInitializer - Initializing');
      checkAdminAccess().then(() => {
        setInitialized(true);
      });
    }
  }, [initialized]);

  // Listen for pathname changes to check access rights
  useEffect(() => {
    if (initialized && pathname) {
      console.log('AuthInitializer - Path changed to:', pathname);
      checkAdminAccess();
    }
  }, [pathname]);

  // Listen for auth-changed events
  useEffect(() => {
    const handleAuthChanged = () => {
      console.log('AuthInitializer - Auth changed event received');
      checkAdminAccess();
    };
    
    window.addEventListener('auth-changed', handleAuthChanged);
    return () => {
      window.removeEventListener('auth-changed', handleAuthChanged);
    };
  }, []);

  // This component doesn't render anything
  return null;
} 