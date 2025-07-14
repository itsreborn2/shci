'use client';

import { useState, useEffect } from 'react';
import PasswordModal from '@/components/PasswordModal';
import SearchForm from '@/components/SearchForm';
import ResultsTable from '@/components/ResultsTable';
import Link from 'next/link';

// 간단한 마크다운을 HTML로 변환하는 함수
const markdownToHtml = (markdown: string) => {
  if (!markdown) return '';

  return markdown
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>') // **bold** -> <strong>bold</strong>
    .split('\n')
    .map(line => {
      line = line.trim();
      if (line.startsWith('- ')) {
        return `<li>${line.substring(2)}</li>`;
      }
      if (line === '') {
        return '<br />';
      }
      return `<p>${line}</p>`;
    })
    .join('')
    .replace(/<li>/g, '<ul><li>')
    .replace(/<\/li>(?!<li>)/g, '</li></ul>')
    .replace(/<\/li><li>/g, '</li><li>');
};

// 검색 결과 데이터의 타입을 정의합니다.
interface Result {
  [key: string]: string | number | null;
}

export default function Home() {
  // 상태 관리
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const [secondResults, setSecondResults] = useState<Result[]>([]); // 두 번째 엔드포인트 결과
  
  // 각 API의 로딩 상태
  const [isLoading, setIsLoading] = useState(false); // 첨 번째 API 로딩 상태
  const [secondIsLoading, setSecondIsLoading] = useState(false); // 두 번째 엔드포인트 로딩 상태
  
  // 통합 검색 상태 - 두 API 모두 완료될 때까지 검색이 비활성화됨
  // 이 플래그가 true일 경우 추가 검색을 방지하여 데이터가 엇기는 문제 해결
  const [isSearching, setIsSearching] = useState(false);
  
  const [error, setError] = useState('');
  const [secondError, setSecondError] = useState(''); // 두 번째 엔드포인트 오류 상태
  const [searched, setSearched] = useState(false); // 검색 실행 여부 상태

  // 페이지 로드 시 sessionStorage에서 인증 상태 확인
  useEffect(() => {
    const storedAuth = sessionStorage.getItem('isAuthenticated');
    if (storedAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []); // 빈 배열을 전달하여 컴포넌트가 마운트될 때 한 번만 실행

  // 비밀번호 인증 성공 시 호출될 함수
  const handleAuthSuccess = () => {
    sessionStorage.setItem('isAuthenticated', 'true');
    setIsAuthenticated(true);
  };

  // 검색 실행 시 호출될 함수 (새 배포 트리거)
  const handleSearch = async (searchParams: { corporationName: string; representativeName: string; }) => {
    // 검색 중일 경우 추가 검색 방지
    if (isSearching) {
      return;
    }
    
    // (주) 및 공백 제거
    const cleanedCorporationName = searchParams.corporationName.replace(/\(주\)|주식회사|\s/g, '');
    const cleanedSearchParams = { ...searchParams, corporationName: cleanedCorporationName, corporationNumber: '' };

    // 통합 검색 상태 설정
    setIsSearching(true);
    
    // 첫 번째 API 로딩 상태 및 결과 초기화
    setIsLoading(true);
    setError('');
    setResults([]);
    
    // 두 번째 API 로딩 상태 및 결과 초기화
    setSecondIsLoading(true);
    setSecondError('');
    setSecondResults([]);
    
    setSearched(true);

    // 첫 번째 API 호출
    fetchFirstAPI(cleanedSearchParams);
    
    // 두 번째 API 호출
    fetchSecondAPI(cleanedSearchParams);
  };
  

  
  // 첫 번째 API 호출 함수
  // 첫 번째 API 호출 함수
  const fetchFirstAPI = async (searchParams: { corporationName: string; representativeName: string; corporationNumber: string; }) => {
    try {
      const response = await fetch('/api/search-first', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchParams),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '첫 번째 API에서 데이터를 가져오는 데 실패했습니다.');
      }

      setResults(Array.isArray(data) ? data : [data]);

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      setError(`첫 번째 API: ${message}`);
    } finally {
      setIsLoading(false);
      
      // 두 API 모두 완료 시 isSearching 상태 업데이트
      if (!secondIsLoading) {
        setIsSearching(false);
      }
    }
  };
  
  // 두 번째 API 호출 함수
  // 두 번째 API 호출 함수
  const fetchSecondAPI = async (searchParams: { corporationName: string; representativeName: string; corporationNumber: string; }) => {
    try {
      const response = await fetch('/api/search-second', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchParams),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '두 번째 API에서 데이터를 가져오는 데 실패했습니다.');
      }

      setSecondResults(Array.isArray(data) ? data : [data]);

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      setSecondError(`두 번째 API: ${message}`);
    } finally {
      setSecondIsLoading(false);
      
      // 두 API 모두 완료 시 isSearching 상태 업데이트
      if (!isLoading) {
        setIsSearching(false);
      }
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center bg-gray-50">
      <div className="w-full max-w-7xl relative">
        <Link href="/board" className="absolute top-4 right-4 bg-slate-500 text-white px-3 py-1.5 rounded-lg shadow-md hover:bg-slate-600 transition-colors text-sm font-semibold z-10">
          건의/오류 게시판
        </Link>
      
        <header className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 leading-tight">
            <span className="inline-block bg-cyan-100 text-cyan-800 text-sm font-semibold px-3 py-1.5 rounded-full mb-2">새한신용정보 직원 전용</span><br />
            <span className="text-2xl sm:text-3xl font-semibold">전국 지자체 수주 현황<br/><span className="text-base sm:text-lg font-medium text-gray-500">(현재 서울, 경기만 적용중)</span></span>
          </h1>
        </header>

        {!isAuthenticated ? (
          <PasswordModal onSuccess={handleAuthSuccess} />
        ) : (
          <div className="w-full">
            <SearchForm onSearch={handleSearch} isLoading={isLoading} isSearching={isSearching} />
            
            {/* 첫 번째 API 결과 관련 */}
            {error && <p className="text-center text-red-500 mt-4">오류: {error}</p>}
            
            {/* 첫 번째 API: 로딩 중이거나 결과가 있을 때만 테이블 표시 */}
            {(isLoading || results.length > 0) && (
              <div>
                <h2 className="text-center text-xl font-bold text-gray-800 mt-8 mb-4">수주 검색 결과</h2>
                <ResultsTable results={results} isLoading={isLoading} />
              </div>
            )}

            {/* 두 번째 API 결과 관련 */}
            {secondError && <p className="text-center text-red-500 mt-4">오류: {secondError}</p>}
            
            {/* 두 번째 API: 로딩 중이거나 결과가 있을 때만 테이블 표시 */}
            {(secondIsLoading || secondResults.length > 0) && (
              <div>
                <h2 className="text-center text-xl font-bold text-gray-800 mt-8 mb-4">기업 검색 결과</h2>
                <div className="w-full max-w-7xl mx-auto mt-8 bg-white p-4 sm:p-6 rounded-xl shadow-md">

                  {secondIsLoading ? (
                    <div className="text-center py-4">
                      <p className="text-gray-500">검색 중...</p>
                    </div>
                  ) : secondResults.length > 0 ? (
                    <div className="prose max-w-none text-gray-900">
                      {secondResults.map((result, index) => (
                        <div key={index} dangerouslySetInnerHTML={{ __html: markdownToHtml(result.content as string) }} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-500">결과가 없습니다.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

                    {/* 두 API 모두 검색 후 로딩이 끝났고, 에러가 없으며, 결과가 없을 때 메시지 표시 */}
            {searched && !isLoading && !secondIsLoading && !error && !secondError && 
              results.length === 0 && secondResults.length === 0 && (
              <div className="text-center mt-8 p-8 bg-white rounded-lg shadow-md">
                <p className="text-lg font-semibold text-gray-700">검색 결과가 없습니다.</p>
                <p className="text-gray-500 mt-2">다른 검색어로 다시 시도해 주세요.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

