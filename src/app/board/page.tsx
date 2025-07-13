'use client';

import { useState } from 'react';
import Link from 'next/link';
import BoardList from '@/components/board/BoardList';

export default function BoardPage() {
  const [isAdmin, setIsAdmin] = useState(false);

  const handleAdminLogin = () => {
    if (isAdmin) {
      setIsAdmin(false);
      alert('관리자 모드에서 로그아웃했습니다.');
      return;
    }

    const password = prompt('관리자 비밀번호를 입력하세요.');

    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      setIsAdmin(true);
      alert('관리자 모드로 로그인되었습니다.');
    } else if (password !== null) {
      alert('비밀번호가 일치하지 않습니다.');
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center bg-gray-50 p-4 sm:p-8">
      <div className="w-full max-w-7xl relative">
        <Link href="/" className="absolute top-4 left-4 bg-cyan-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-cyan-700 transition-colors text-sm font-semibold z-10">
          메인으로
        </Link>
        <button
          onClick={handleAdminLogin}
          className="absolute top-4 right-4 bg-gray-700 text-white px-4 py-2 rounded-lg shadow-md hover:bg-gray-800 transition-colors text-sm font-semibold z-10"
        >
          {isAdmin ? '로그아웃' : '관리자 모드'}
        </button>
        <header className="text-center mb-10">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800 leading-tight">
            건의/오류 게시판
          </h1>
          <p className="mt-2 text-gray-600">오류나 건의 사항을 자유롭게 작성해 주세요.</p>
        </header>

        <div className="w-full">
          <BoardList isAdmin={isAdmin} />
        </div>
      </div>
    </main>
  );
}
