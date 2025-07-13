'use client';

import { useState, useEffect } from 'react';
import { Post } from '@/types/board';

// 컴포넌트의 props 타입을 정의합니다.
interface PostFormProps {
  onClose: () => void;
  onSave: (postData: Omit<Post, 'id' | 'created_at'>, postId?: number) => void;
  postToEdit?: Post | null;
}



export default function PostForm({ onClose, onSave, postToEdit }: PostFormProps) {
  const [name, setName] = useState('');
  const [affiliation, setAffiliation] = useState('');
  const isEditing = !!postToEdit;

  const [formData, setFormData] = useState({
    name: '',
    affiliation: '',
    contact: '',
    title: '',
    content: '',
    password: '',
  });

  useEffect(() => {
    if (isEditing && postToEdit) {
      setFormData({
        name: postToEdit.name,
        affiliation: postToEdit.affiliation || '',
        contact: postToEdit.contact || '',
        title: postToEdit.title,
        content: postToEdit.content,
        password: '', // 수정 시에는 비밀번호 필드를 비워둡니다.
      });
    }
  }, [isEditing, postToEdit]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.title || !formData.content) {
      alert('이름, 제목, 내용은 필수 항목입니다.');
      return;
    }

    // 새 글 작성 시에만 비밀번호를 필수로 요구합니다.
    if (!isEditing && !formData.password) {
      alert('새 글을 작성하려면 비밀번호를 입력해야 합니다.');
      return;
    }

    const dataToSave: Partial<Omit<Post, 'id' | 'created_at'>> & { password?: string } = {
      ...formData,
    };

    // 수정 모드이고 비밀번호를 입력하지 않았다면, password 필드를 전송하지 않습니다.
    if (isEditing && !formData.password) {
      delete dataToSave.password;
    }

    setIsSubmitting(true);
    await onSave(dataToSave as Omit<Post, 'id' | 'created_at'>, postToEdit?.id);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-2xl m-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">{isEditing ? '게시글 수정' : '새 글 작성'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="이름을 입력해주세요. (필수)"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder:text-gray-500 text-gray-900"
              required
            />
            <input
              type="password"
              placeholder={isEditing ? '비밀번호 변경 시에만 입력 (4자 이상)' : '비밀번호 (수정/삭제 시 필요, 4자 이상)'}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder:text-gray-500 text-gray-900"
              minLength={4}
              required={!isEditing}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="소속을 입력해주세요."
              value={formData.affiliation}
              onChange={(e) => setFormData({ ...formData, affiliation: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder:text-gray-500 text-gray-900"
            />
            <input
              type="text"
              placeholder="연락처를 입력해주세요."
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder:text-gray-500 text-gray-900"
            />
          </div>
          <input
            type="text"
            placeholder="제목을 입력해주세요. (필수)"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder:text-gray-500 text-gray-900"
            required
          />
          <textarea
            placeholder="내용을 입력해주세요. (필수)"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 h-40 resize-none placeholder:text-gray-500 text-gray-900"
            required
          />
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors font-semibold"
              disabled={isSubmitting}
            >
              취소
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-cyan-600 text-white hover:bg-cyan-700 transition-colors font-semibold"
              disabled={isSubmitting}
            >
              {isEditing ? '수정 완료' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
