import React from 'react';
import { Bold, Italic, List, Heading, UnderlineIcon } from 'lucide-react';
import { Editor, EditorContent } from '@tiptap/react';

interface DescriptionEditorProps {
  editor: Editor | null;
  value: string;
  onChange: (content: string) => void;
  error?: string;
}

const DescriptionEditor: React.FC<DescriptionEditorProps> = ({
  editor,
  value,
  onChange,
  error
}) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-6">Mô tả sách</h2>
      
      <div className={`border rounded-lg overflow-hidden ${error ? 'border-red-500' : 'border-gray-300'}`}>
        <div className="border-b border-gray-300 bg-gray-50 p-3 flex gap-3">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded hover:bg-gray-200 ${
              editor.isActive('bold') ? 'bg-gray-200' : ''
            }`}
            title="Đậm"
          >
            <Bold size={18} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded hover:bg-gray-200 ${
              editor.isActive('italic') ? 'bg-gray-200' : ''
            }`}
            title="Nghiêng"
          >
            <Italic size={18} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-2 rounded hover:bg-gray-200 ${
              editor.isActive('underline') ? 'bg-gray-200' : ''
            }`}
            title="Gạch dưới"
          >
            <UnderlineIcon size={18} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded hover:bg-gray-200 ${
              editor.isActive('bulletList') ? 'bg-gray-200' : ''
            }`}
            title="Danh sách"
          >
            <List size={18} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-2 rounded hover:bg-gray-200 ${
              editor.isActive('heading', { level: 3 }) ? 'bg-gray-200' : ''
            }`}
            title="Tiêu đề"
          >
            <Heading size={18} />
          </button>
        </div>
        
        <div className="min-h-[250px] relative">
          <EditorContent
            editor={editor}
            className="min-h-[250px] overflow-y-auto"
          />
          
          {!editor.getText() && (
            <div className="absolute top-0 left-0 px-4 py-3 text-gray-400 pointer-events-none">
              Mô tả chi tiết về sách, nội dung, tác giả, v.v. Có thể sử dụng các định dạng văn bản như đậm, nghiêng, gạch dưới.
            </div>
          )}
        </div>
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
      
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
          <h3 className="font-medium text-blue-700 mb-2">Gợi ý mô tả hiệu quả</h3>
          <ul className="text-sm text-blue-700 space-y-1 list-disc pl-5">
            <li>Mô tả nội dung sách ngắn gọn, hấp dẫn</li>
            <li>Nêu lý do bạn thích hoặc giá trị của sách</li>
            <li>Chia sẻ chi tiết đáng chú ý (bìa cứng, có chữ ký, v.v.)</li>
            <li>Đề cập điểm mạnh và lý do mua sách này</li>
          </ul>
        </div>
        
        <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
          <h3 className="font-medium text-amber-700 mb-2">Tránh trong mô tả</h3>
          <ul className="text-sm text-amber-700 space-y-1 list-disc pl-5">
            <li>Thông tin cá nhân (số điện thoại, địa chỉ)</li>
            <li>Liên kết đến trang web khác</li>
            <li>Sao chép mô tả trực tiếp từ nhà xuất bản</li>
            <li>Từ ngữ tiêu cực về nội dung sách</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DescriptionEditor; 