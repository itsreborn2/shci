'use client';

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
// 요청에 따라 추정금액(est_amt), 입찰률(bid_rate), 세부지역(district), 시작일(start_date), 종료일(end_date) 컬럼을 제거했습니다.
const columns = [
  { header: '계약명', key: 'ctrt_name' },
  { header: '계약자', key: 'contractor' },
  { header: '대표자', key: 'representative' },
  { header: '계약 금액', key: 'ctrt_amt' },
  { header: '계약 기간', key: 'ctrt_period' },
  { header: '부서', key: 'department' },
  { header: '지역', key: 'province' },
  { header: 'URL', key: 'url' }, // URL 컬럼 추가
  { header: '계약 유형', key: 'ctrt_type' },
];

const ResultsTable: React.FC<ResultsTableProps> = ({ results, isLoading }) => {
  if (isLoading) {
    return <div className="text-center p-8 text-gray-500 dark:text-gray-400">검색 중...</div>;
  }

  if (results.length === 0) {
    return <div className="text-center p-8 text-gray-500 dark:text-gray-400">검색 결과가 없습니다.</div>;
  }

  // 셀 데이터를 포맷하는 헬퍼 함수
  const formatCell = (key: string, value: string | number | null) => {
    if (value === null || value === undefined || value === '') return '-';

    // URL을 클릭 가능한 링크로 만들기
    if (key === 'url' && typeof value === 'string' && value.startsWith('http')) {
      return (
        <a href={value} target="_blank" rel="noopener noreferrer" className="text-cyan-600 hover:text-cyan-700 hover:underline">
          보기
        </a>
      );
    }


    // 계약 금액에 쉼표 추가
    if (key === 'ctrt_amt') {
      const amount = Number(value);
      return isNaN(amount) ? value : amount.toLocaleString('ko-KR');
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
