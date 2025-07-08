'use client';

import { useState } from 'react';
import PasswordModal from '@/components/PasswordModal';
import SearchForm from '@/components/SearchForm';
import ResultsTable from '@/components/ResultsTable';

// 검색 결과 데이터의 타입을 정의합니다.
interface Result {
  [key: string]: string | number | null;
}

export default function Home() {
  // 상태 관리
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const [secondResults, setSecondResults] = useState<Result[]>([]); // 두 번째 엔드포인트 결과
  const [isLoading, setIsLoading] = useState(false);
  const [secondIsLoading, setSecondIsLoading] = useState(false); // 두 번째 엔드포인트 로딩 상태
  const [error, setError] = useState('');
  const [secondError, setSecondError] = useState(''); // 두 번째 엔드포인트 오류 상태
  const [searched, setSearched] = useState(false); // 검색 실행 여부 상태

  // 비밀번호 인증 성공 시 호출될 함수
  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  // 검색 실행 시 호출될 함수
  const handleSearch = async (searchParams: { corporationName: string; representativeName: string; corporationNumber: string; }) => {
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
    fetchFirstAPI(searchParams);
    
    // 두 번째 API 호출
    fetchSecondAPI(searchParams);
  };
  
  // 웹훅 URL 정의
  // 환경변수에서 가져옴
  const FIRST_WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || 'https://moatai.app.n8n.cloud/webhook/266a0512-8fe7-4c6e-9a67-22df77f4b7e0';
  const SECOND_WEBHOOK_URL = process.env.NEXT_PUBLIC_SECOND_N8N_WEBHOOK_URL || 'https://n8n.boolio.co/webhook/77aa93a8-acc7-456f-80eb-ea534d25df56';
  
  // 첫 번째 API 호출 함수
  const fetchFirstAPI = async (searchParams: { corporationName: string; representativeName: string; corporationNumber: string; }) => {
    try {
      const webhookUrl = FIRST_WEBHOOK_URL;
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchParams),
      });

      const text = await response.text();

      if (!response.ok) {
        try {
          // 에러 응답을 JSON으로 파싱 시도
          const errorData = JSON.parse(text);
          // n8n의 '결과 없음' 메시지인지 확인
          if (errorData && errorData.message === "No item to return got found") {
            setResults([]); // 결과 없음으로 처리
            return; // 함수 정상 종료
          }
        } catch {
          // 파싱 실패 시, 일반 에러로 처리 (아래로 계속 진행)
        }
        
        // '결과 없음'이 아닌 다른 모든 에러
        console.error('첫 번째 n8n webhook error:', text);
        throw new Error(`첫 번째 API에서 데이터를 가져오는 데 실패했습니다. 상태: ${response.status}`);
      }

      const data = text ? JSON.parse(text) : [];
      
      let finalResults: Result[] = [];
      if (Array.isArray(data)) {
        finalResults = data;
      } else if (data && typeof data === 'object' && Object.keys(data).length > 0) {
        if (Array.isArray(data.results)) {
          finalResults = data.results;
        } else {
          finalResults = [data];
        }
      }
      
      setResults(finalResults);

    } catch (err: unknown) {
      if (err instanceof SyntaxError) {
        setError('첫 번째 API: 서버로부터 받은 데이터 형식이 올바르지 않습니다.');
      } else if (err instanceof Error) {
        setError(`첫 번째 API: ${err.message}`);
      } else {
        setError('첫 번째 API: 알 수 없는 오류가 발생했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // 두 번째 API 호출 함수
  const fetchSecondAPI = async (searchParams: { corporationName: string; representativeName: string; corporationNumber: string; }) => {
    try {
      const secondWebhookUrl = SECOND_WEBHOOK_URL;
      
      const response = await fetch(secondWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchParams),
      });

      const text = await response.text();

      if (!response.ok) {
        try {
          // 에러 응답을 JSON으로 파싱 시도
          const errorData = JSON.parse(text);
          // n8n의 '결과 없음' 메시지인지 확인
          if (errorData && errorData.message === "No item to return got found") {
            setSecondResults([]); // 결과 없음으로 처리
            return; // 함수 정상 종료
          }
        } catch {
          // 파싱 실패 시, 일반 에러로 처리 (아래로 계속 진행)
        }
        
        // '결과 없음'이 아닌 다른 모든 에러
        console.error('두 번째 n8n webhook error:', text);
        throw new Error(`두 번째 API에서 데이터를 가져오는 데 실패했습니다. 상태: ${response.status}`);
      }

      const data = text ? JSON.parse(text) : [];
      
      let finalResults: Result[] = [];
      if (Array.isArray(data)) {
        finalResults = data;
      } else if (data && typeof data === 'object' && Object.keys(data).length > 0) {
        if (Array.isArray(data.results)) {
          finalResults = data.results;
        } else {
          finalResults = [data];
        }
      }
      
      setSecondResults(finalResults);

    } catch (err: unknown) {
      if (err instanceof SyntaxError) {
        setSecondError('두 번째 API: 서버로부터 받은 데이터 형식이 올바르지 않습니다.');
      } else if (err instanceof Error) {
        setSecondError(`두 번째 API: ${err.message}`);
      } else {
        setSecondError('두 번째 API: 알 수 없는 오류가 발생했습니다.');
      }
    } finally {
      setSecondIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center bg-gray-50 p-4 sm:p-8">
      <div className="w-full max-w-7xl">
        <header className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 leading-tight">
            <span className="inline-block bg-cyan-100 text-cyan-800 text-sm font-semibold px-3 py-1.5 rounded-full mb-2">새한신용정보 직원 전용</span><br />
            <span className="text-2xl sm:text-3xl font-semibold">전국 지자체 건설 수주 현황<br/><span className="text-base sm:text-lg font-medium text-gray-500">(현재 서울,경기 적용)</span></span>
          </h1>
        </header>

        {!isAuthenticated ? (
          <PasswordModal onSuccess={handleAuthSuccess} />
        ) : (
          <div className="w-full">
            <SearchForm onSearch={handleSearch} isLoading={isLoading} />
            
            {/* 첫 번째 API 결과 관련 */}
            {error && <p className="text-center text-red-500 mt-4">오류: {error}</p>}
            
            {/* 첫 번째 API: 로딩 중이거나 결과가 있을 때만 테이블 표시 */}
            {(isLoading || results.length > 0) && (
              <div>
                <h2 className="text-center text-xl font-bold text-gray-800 mt-8 mb-4">기본 검색 결과</h2>
                <ResultsTable results={results} isLoading={isLoading} />
              </div>
            )}

            {/* 두 번째 API 결과 관련 */}
            {secondError && <p className="text-center text-red-500 mt-4">오류: {secondError}</p>}
            
            {/* 두 번째 API: 로딩 중이거나 결과가 있을 때만 테이블 표시 */}
            {(secondIsLoading || secondResults.length > 0) && (
              <div>
                <h2 className="text-center text-xl font-bold text-gray-800 mt-8 mb-4">추가 검색 결과</h2>
                <ResultsTable results={secondResults} isLoading={secondIsLoading} />
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

