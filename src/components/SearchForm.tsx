'use client';

import { useState, useRef, KeyboardEvent } from 'react';

interface SearchFormProps {
  onSearch: (searchParams: { corporationName: string; representativeName: string; corporationNumber: string; }) => void;
  isLoading: boolean;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isLoading }) => {
  const [corporationName, setCorporationName] = useState('');
  const [representativeName, setRepresentativeName] = useState('');
  const [corporationNumber, setCorporationNumber] = useState('');
  const [error, setError] = useState('');

  // 각 입력 필드에 대한 ref를 생성합니다.
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const handleSearch = () => {
    // 업체명 또는 대표자명 중 하나는 필수로 입력하도록 유효성 검사를 유지합니다.
    if (corporationName.trim() === '' && representativeName.trim() === '') {
      setError('업체명 또는 대표자명 중 하나 이상을 입력해야 합니다.');
      return;
    }

    setError('');
    onSearch({ corporationName, representativeName, corporationNumber });
  };

  // Enter 키를 눌렀을 때의 동작을 처리하는 함수입니다.
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // 기본 폼 제출 동작을 막습니다.

      if (index < inputRefs.length - 1) {
        // 마지막 입력 필드가 아니면 다음 필드로 포커스를 이동합니다.
        inputRefs[index + 1].current?.focus();
      } else {
        // 마지막 입력 필드이면 검색을 실행합니다.
        handleSearch();
      }
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-700">채무자 정보 검색</h2>
      <div className="space-y-4">
        <input
          ref={inputRefs[0]}
          type="text"
          value={corporationName}
          onChange={(e) => setCorporationName(e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, 0)}
          placeholder="법인명"
          className="w-full px-4 py-2.5 border border-gray-200 bg-gray-50 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition"
        />
        <input
          ref={inputRefs[1]}
          type="text"
          value={representativeName}
          onChange={(e) => setRepresentativeName(e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, 1)}
          placeholder="대표자명"
          className="w-full px-4 py-2.5 border border-gray-200 bg-gray-50 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition"
        />
        {/* 법인번호 입력 필드 숨김 처리 - 필요시 주석 해제하여 사용 가능합니다 */}
        {/* <input
          ref={inputRefs[2]}
          type="text"
          value={corporationNumber}
          onChange={(e) => setCorporationNumber(e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, 2)}
          placeholder="법인번호"
          className="w-full px-4 py-2.5 border border-gray-200 bg-gray-50 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition"
        /> */}
      </div>
      {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
      <button
        onClick={handleSearch}
        disabled={isLoading}
        className="w-full mt-6 bg-cyan-500 text-white font-semibold py-2.5 rounded-lg hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-50 transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isLoading ? '검색 중...' : '검색'}
      </button>
    </div>
  );
};

export default SearchForm;
