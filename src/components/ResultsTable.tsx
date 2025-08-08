'use client';

import Spinner from './Spinner';

// 검색 결과 데이터의 타입을 정의합니다.
// PLAN.md에 명시된 모든 컬럼을 포함할 수 있도록 유연하게 설정합니다.
interface Result {
  [key: string]: string | number | null;
}

interface ResultsTableProps {
  results: Result[];
  isLoading: boolean;
}

// 표시할 컬럼 헤더와 데이터 키를 매핑합니다.
// 신규 응답 스키마에 맞춰 필드를 교체하고, "계약기간" 컬럼은 제거했습니다.
// 매핑:
//  - 도시: province
//  - 지역: region_name
//  - 계약자: contractor
//  - 대표자: representative
//  - 계약유형: category
//  - 계약금액: contract_amount (천 단위 콤마)
//  - 계약날짜: contract_date (YYYY-MM-DD)
//  - 완료날짜: completion_date (YYYY-MM-DD)
//  - 계약명: contract_name
//  - 부서: agency_name
// 표시 순서: 도시,지역,계약자,대표자,계약유형,계약금액,계약날짜,완료날짜,계약명,부서
const columns = [
  { header: '도시', key: 'province' },
  { header: '지역', key: 'region_name' },
  { header: '계약자', key: 'contractor' },
  { header: '대표자', key: 'representative' },
  { header: '계약유형', key: 'category' },
  { header: '계약금액', key: 'contract_amount' },
  { header: '계약날짜', key: 'contract_date' },
  { header: '완료날짜', key: 'completion_date' },
  { header: '계약명', key: 'contract_name' },
  { header: '부서', key: 'agency_name' },
];

const ResultsTable: React.FC<ResultsTableProps> = ({ results, isLoading }) => {
  if (isLoading) {
    return <Spinner />;
  }

  if (results.length === 0) {
    return <div className="text-center p-8 text-gray-500 dark:text-gray-400">검색 결과가 없습니다.</div>;
  }

  // 셀 데이터를 포맷하는 헬퍼 함수
  const formatCell = (key: string, value: string | number | null) => {
    if (value === null || value === undefined || value === '') return '-';

    // 계약금액: 천 단위 콤마 표시
    if (key === 'contract_amount') {
      const amount = Number(value);
      if (isNaN(amount)) return value;
      // 로케일 비의존적 천단위 콤마 포맷 (SSR/CSR 일관성)
      const intStr = Math.trunc(amount).toString();
      const withComma = intStr.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return withComma;
    }

    // 날짜: ISO 문자열에서 날짜(YYYY-MM-DD)만 표시
    if (key === 'contract_date' || key === 'completion_date') {
      const s = String(value);
      // ISO 형식일 경우 앞 10자리 슬라이스로 SSR/CSR 일관성 보장
      if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
      // 비표준 포맷일 경우에만 Date 파싱 (가능하면 원문 유지)
      try {
        const d = new Date(s);
        if (isNaN(d.getTime())) return value;
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
      } catch {
        return value;
      }
    }

    // Boolean 값 처리
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }

    return value;
  };

  return (
    <div className="w-full max-w-7xl mx-auto mt-8 bg-white p-4 sm:p-6 rounded-xl shadow-md">

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {results.map((row, index) => (
              <tr key={index} className="hover:bg-cyan-50/50 transition-colors duration-150">
                {columns.map((col) => (
                  <td key={col.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {formatCell(col.key, row[col.key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResultsTable;
