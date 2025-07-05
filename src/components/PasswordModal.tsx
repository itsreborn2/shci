'use client';

import { useState } from 'react';

interface PasswordModalProps {
  onSuccess: () => void;
}

const PasswordModal: React.FC<PasswordModalProps> = ({ onSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handlePasswordSubmit = () => {
    if (password === process.env.NEXT_PUBLIC_APP_PASSWORD) {
      onSuccess();
    } else {
      // 틀렸을 경우 에러 메시지를 설정합니다.
      setError('비밀번호가 올바르지 않습니다.');
      setPassword('');
    }
  };

  // Enter 키를 눌렀을 때도 제출이 가능하도록 합니다.
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handlePasswordSubmit();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-2 text-center text-gray-700">
          접근 인증
        </h2>
        <p className="mb-6 text-center text-gray-500">
          계속하려면 비밀번호를 입력하세요.
        </p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyPress={handleKeyPress}
          className="w-full px-4 py-2.5 border border-gray-200 bg-gray-50 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition"
          placeholder="비밀번호"
          autoFocus
        />
        {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
        <button
          onClick={handlePasswordSubmit}
          className="w-full mt-6 bg-cyan-500 text-white font-semibold py-2.5 rounded-lg hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-50 transition duration-200"
        >
          확인
        </button>
      </div>
    </div>
  );
};

export default PasswordModal;
