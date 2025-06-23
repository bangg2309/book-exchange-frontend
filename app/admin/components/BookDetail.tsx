<div className="mt-4">
  <h3 className="text-lg font-medium mb-2">Mô tả</h3>
  <div 
    className="prose prose-sm max-w-none"
    dangerouslySetInnerHTML={{ __html: book.description || 'Không có mô tả' }}
  />
</div> 