'use client';

import { useState, useEffect } from 'react';
import PasswordModal from '@/components/PasswordModal';
import SearchForm from '@/components/SearchForm';
import ResultsTable from '@/components/ResultsTable';
import Spinner from '@/components/Spinner';
import WelcomeGuide from '@/components/WelcomeGuide';
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
  const [ongoingResults, setOngoingResults] = useState<Result[]>([]); // 진행중인 공사 결과
  const [completedResults, setCompletedResults] = useState<Result[]>([]); // 완료된 공사 결과
  
  // 각 API의 로딩 상태
  const [isLoading, setIsLoading] = useState(false); // 첨 번째 API 로딩 상태
  const [secondIsLoading, setSecondIsLoading] = useState(false); // 두 번째 엔드포인트 로딩 상태
  
  // 통합 검색 상태 - 두 API 모두 완료될 때까지 검색이 비활성화됨
  // 이 플래그가 true일 경우 추가 검색을 방지하여 데이터가 엇기는 문제 해결
  const [isSearching, setIsSearching] = useState(false);
  
  const [error, setError] = useState('');
  const [secondError, setSecondError] = useState(''); // 두 번째 엔드포인트 오류 상태
  const [searched, setSearched] = useState(false); // 검색 실행 여부 상태
  const [integratedMode, setIntegratedMode] = useState(false); // 통합 검색 여부 (AI 섹션 노출 제어)

  // 페이지 로드 시 sessionStorage에서 인증 상태 확인
  useEffect(() => {
    const storedAuth = sessionStorage.getItem('isAuthenticated');
    if (storedAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []); // 빈 배열을 전달하여 컴포넌트가 마운트될 때 한 번만 실행

  // 두 API의 로딩 상태가 모두 변경될 때 isSearching 상태를 업데이트
  useEffect(() => {
    if (!isLoading && !secondIsLoading) {
      setIsSearching(false);
    }
  }, [isLoading, secondIsLoading]);

  // API 결과가 변경될 때마다 진행중/완료된 공사를 필터링
  useEffect(() => {
    if (results.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // 날짜 비교를 위해 시간은 0으로 설정

      // 신규 스키마: 완료 기준은 completion_date 사용
      const ongoing = results.filter(result => {
        const comp = result.completion_date as string | undefined;
        if (!comp || typeof comp !== 'string') return true; // 완료일이 없으면 진행중으로 간주
        const compDate = new Date(comp);
        return compDate >= today;
      });

      const completed = results.filter(result => {
        const comp = result.completion_date as string | undefined;
        if (!comp || typeof comp !== 'string') return false; // 완료일이 없으면 완료로 분류하지 않음
        const compDate = new Date(comp);
        return compDate < today;
      });

      setOngoingResults(ongoing);
      setCompletedResults(completed);
    } else {
      // 검색 결과가 없으면 둘 다 비움
      setOngoingResults([]);
      setCompletedResults([]);
    }
  }, [results]);

  // 비밀번호 인증 성공 시 호출될 함수
  const handleAuthSuccess = () => {
    sessionStorage.setItem('isAuthenticated', 'true');
    setIsAuthenticated(true);
  };

  // 검색 실행 시 호출될 함수들
  // 1) DB 전용 검색: 첫 번째 API만 호출하며 AI 섹션은 숨김
  const handleSearch = async (searchParams: { corporationName: string; representativeName: string; }) => {
    // (주) 및 공백 제거
    const cleanedCorporationName = searchParams.corporationName.replace(/\(주\)|주식회사|\s/g, '');
    const cleanedSearchParams = { ...searchParams, corporationName: cleanedCorporationName, corporationNumber: '' };

    // 통합 모드 끄기 (AI 섹션 비노출)
    setIntegratedMode(false);
    setIsSearching(false); // 폼 비활성화는 통합 검색에서만 사용

    // 첫 번째 API 로딩 상태 및 결과 초기화
    setIsLoading(true);
    setError('');
    setResults([]);

    // 두 번째 API 상태는 초기화하되 로딩은 걸지 않음
    setSecondIsLoading(false);
    setSecondError('');
    setSecondResults([]);

    setSearched(true);

    // 첫 번째 API 호출 (DB 검색)
    fetchFirstAPI(cleanedSearchParams);
  };

  // 2) AI 통합 검색: 두 API를 병행 호출하며 완료까지 폼 비활성화
  const handleSearchAI = async (searchParams: { corporationName: string; representativeName: string; }) => {
    // 이미 통합 검색이 진행 중이면 무시
    if (isSearching) return;

    // (주) 및 공백 제거
    const cleanedCorporationName = searchParams.corporationName.replace(/\(주\)|주식회사|\s/g, '');
    const cleanedSearchParams = { ...searchParams, corporationName: cleanedCorporationName, corporationNumber: '' };

    setIntegratedMode(true);
    setIsSearching(true); // 통합 검색 중 폼 비활성화

    // 첫 번째 API 초기화
    setIsLoading(true);
    setError('');
    setResults([]);

    // 두 번째 API 초기화
    setSecondIsLoading(true);
    setSecondError('');
    setSecondResults([]);

    setSearched(true);

    // 두 API 병렬 호출
    fetchFirstAPI(cleanedSearchParams);
    fetchSecondAPI(cleanedSearchParams);
  };
  

  
  // 첫 번째 API 호출 함수
  // 첫 번째 API 호출 함수
  const fetchFirstAPI = async (searchParams: { corporationName: string; representativeName: string; corporationNumber: string; }) => {
    // 응답을 신규 스키마에 맞게 표준화하는 헬퍼
    const normalizeItem = (item: unknown) => {
      // 주의: 기존 키(ctrt_name 등)와 신규 키가 혼재할 수 있어, 우선순위에 따라 병합합니다.
      const o: Record<string, unknown> = (typeof item === 'object' && item !== null) ? (item as Record<string, unknown>) : {};
      // 새로 추가된 광역 단위(도/시) 필드 - 그대로 보존하여 테이블에서 "도시"로 표시합니다.
      const province = (o['province'] ?? null) as string | null;

      // 지역(region_name) 정규화 규칙
      // - 백엔드 값이 null/빈문자열이면 null로 표준화
      // - 값이 존재하면 그대로 통과 (province와 동일하더라도 변경하지 않음)
      let region_name: string | null = null;
      if (typeof o['region_name'] === 'string') {
        const rn = (o['region_name'] as string).trim();
        region_name = rn === '' ? null : rn;
      }
      const category = (o['category'] ?? o['ctrt_type'] ?? null) as string | null;
      const contract_name = (o['contract_name'] ?? o['ctrt_name'] ?? null) as string | null;
      const agency_name = (o['agency_name'] ?? o['department'] ?? null) as string | null;
      const contract_amount = (o['contract_amount'] ?? o['ctrt_amt'] ?? null) as number | string | null;
      const contractor = (o['contractor'] ?? null) as string | null;
      const representative = (o['representative'] ?? null) as string | null;
      const contract_date = (o['contract_date'] ?? o['start_date'] ?? null) as string | null;
      const completion_date = (o['completion_date'] ?? o['end_date'] ?? null) as string | null;

      return {
        region_name,
        category,
        contract_name,
        agency_name,
        contract_amount,
        contractor,
        representative,
        contract_date,
        completion_date,
        // 결과 객체에 province 포함 (ResultsTable의 "도시" 컬럼에서 사용)
        province,
      } as Result;
    };

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

      // n8n이 { value: [...] , Count: n } 형태로 응답하는 경우를 언래핑하고,
      // value 안에 에러 객체가 담긴 경우를 감지해 에러로 처리합니다.
      let payload: unknown = data;
      const hasValueArray = (u: unknown): u is { value: unknown[] } =>
        typeof u === 'object' && u !== null && 'value' in u && Array.isArray((u as { value?: unknown }).value);
      const isErrorItem = (u: unknown): u is { message: string; error: unknown } =>
        typeof u === 'object' && u !== null && 'message' in u && typeof (u as { message?: unknown }).message === 'string' && 'error' in u;

      if (hasValueArray(payload)) {
        payload = (payload as { value: unknown[] }).value;
      }
      const arr: unknown[] = Array.isArray(payload) ? (payload as unknown[]) : [payload];
      if (arr.length > 0 && isErrorItem(arr[0])) {
        throw new Error(arr[0].message || '업스트림 에러');
      }

      // 표준화된 스키마로 변환하여 저장
      const normalized = arr.map(normalizeItem);
      setResults(normalized);

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      setError(`첫 번째 API: ${message}`);
    } finally {
      setIsLoading(false);
      

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
      

    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center bg-gray-50">
      <div className="w-full max-w-7xl relative">
        {/* 모바일(작은 화면)에서는 숨기고, sm 이상에서만 표시 */}
        <Link href="/board" className="hidden sm:inline-flex absolute top-4 right-4 bg-slate-500 text-white px-3 py-1.5 rounded-lg shadow-md hover:bg-slate-600 transition-colors text-sm font-semibold z-10">
          건의/오류 게시판
        </Link>
      
        <header className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 leading-tight">
            <span className="inline-block bg-cyan-100 text-cyan-800 text-sm font-semibold px-3 py-1.5 rounded-full mb-2">새한신용정보 직원 전용</span><br />
            <span className="text-2xl sm:text-3xl font-semibold">전국 지자체 공사,물품,용역 수주 현황 및 AI리서치<br/><span className="text-base sm:text-lg font-medium text-gray-500">(현재 서울, 경기만 적용중)</span></span>
          </h1>
        </header>

        {!isAuthenticated ? (
          <PasswordModal onSuccess={handleAuthSuccess} />
        ) : (
          <div className="w-full">
            <SearchForm onSearch={handleSearch} onSearchAI={handleSearchAI} isSearching={isSearching} />

            {!searched ? (
              <WelcomeGuide />
            ) : (
              <>
                {/* 첫 번째 API 결과 관련 */}
                {error && <p className="text-center text-red-500 mt-4">오류: {error}</p>}

                {/* 진행중인 공사 결과 섹션 */}
                <div>
                  <h2 className="text-center text-xl font-bold text-gray-800 mt-8 mb-4">수주 검색 결과 (진행중인 공사)</h2>
                  <ResultsTable results={ongoingResults} isLoading={isLoading} />
                </div>

                {/* 완료된 수주 검색 결과 섹션 */}
                <div>
                  <h2 className="text-center text-xl font-bold text-gray-800 mt-8 mb-4">완료된 수주 검색 결과</h2>
                  <ResultsTable results={completedResults} isLoading={isLoading} />
                </div>

                {/* 두 번째 API 결과 관련 */}
                {secondError && <p className="text-center text-red-500 mt-4">오류: {secondError}</p>}

                {/* 두 번째 API 결과 섹션: 통합 검색일 때만 노출 */}
                {integratedMode && (
                  <div className="mb-16">
                    <h2 className="text-center text-xl font-bold text-gray-800 mt-8 mb-4">AI 기업 리서치 결과</h2>
                    <p className="text-center text-sm text-gray-500 -mt-2 mb-4">기업에 따라 1~2분 가량 소요될 수 있습니다.</p>
                    <div className="w-full max-w-7xl mx-auto mt-8 bg-white p-4 sm:p-6 rounded-xl shadow-md">
                      {secondIsLoading ? (
                        <Spinner />
                      ) : secondResults.length > 0 ? (
                        <div className="prose max-w-none text-gray-900">
                          {secondResults.map((result, index) => (
                            <div key={index} dangerouslySetInnerHTML={{ __html: markdownToHtml(result.content as string) }} />
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-gray-500">검색 결과가 없습니다.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}


          </div>
        )}
      </div>
    </main>
  );
}

