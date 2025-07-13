'use client';

import { Post } from '@/types/board'; // Post 타입을 올바른 경로에서 가져옵니다.

interface PostDetailProps {
  post: Post;
  onClose: () => void;
  onEdit: (post: Post) => void;
  onDelete: (postId: number) => void;
}

export default function PostDetail({ post, onClose, onEdit, onDelete }: PostDetailProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-3xl m-4 max-h-[90vh] flex flex-col">
        <div className="flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{post.title}</h2>
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <span>{post.name}</span>
            {post.affiliation && <span className="mx-2">|</span>}
            {post.affiliation && <span>{post.affiliation}</span>}
            <span className="mx-2">|</span>
            <span>{new Date(post.created_at).toLocaleString()}</span>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto border-t border-b border-gray-200 my-4 py-4">
          <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
        </div>

        <div className="flex-shrink-0 flex justify-end space-x-4 mt-4">
          <button
            onClick={() => onEdit(post)}
            className="px-5 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors font-semibold"
          >
            수정
          </button>
          <button
            onClick={() => onDelete(post.id)}
            className="px-5 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors font-semibold"
          >
            삭제
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-cyan-600 text-white hover:bg-cyan-700 transition-colors font-semibold"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
