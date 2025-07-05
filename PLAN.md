# 새한신용정보 채무자 정보 검색 페이지 개발 계획 (v2 - Next.js)

## 1. 프로젝트 개요

- **목표:** n8n과 연동하여 새한신용정보주식회사의 채무자 정보를 검색하고 결과를 보여주는 웹 프론트엔드 페이지를 개발합니다.
- **주요 기능:**
    - 비밀번호(`1968`)를 통한 접근 제어
    - 3가지 검색 조건(법인명, 법인주소, 대표자명) 중 최소 2가지 입력 필수
    - n8n 웹훅(Webhook)으로 검색 데이터 전송
    - n8n으로부터 받은 검색 결과를 테이블 형태로 표시
- **기술 스택:**
    - **Backend:** n8n
    - **Frontend:** Next.js (React), CSS Modules (또는 Tailwind CSS)

## 2. n8n 응답 데이터 구조

n8n 웹훅은 아래 명세에 따라 데이터를 반환합니다. 결과 테이블에는 `id1`, `id2`를 제외한 모든 컬럼을 표시합니다.

| column_name                  | data_type         |
| ---------------------------- | ----------------- |
| province                     | character varying |
| district                     | character varying |
| ctrt_type                    | character varying |
| ctrt_name                    | text              |
| department                   | character varying |
| ctrt_amt                     | bigint            |
| ctrt_period                  | character varying |
| contractor                   | text              |
| est_amt                      | bigint            |
| bid_rate                     | numeric           |
| start_date                   | date              |
| end_date                     | date              |
| is_joint_crtr                | character varying |
| ctrt_method                  | character varying |
| direct_ctrt_reason           | text              |
| ctrt_description             | text              |
| contractor_name              | character varying |
| representative               | character varying |
| telephone                    | character varying |
| is_main_contractor           | boolean           |
| ctrt_method2                 | character varying |
| joint_ctrt_amt               | bigint            |
| business_registration_number | character varying |
| ctrt_date                    | date              |
| url                          | text              |

## 3. 개발 단계 (Next.js 기반)

### Phase 0: 프로젝트 설정

1.  `npx create-next-app@latest SHCI_front` 명령어로 Next.js 프로젝트를 생성합니다.

### Phase 1: UI 컴포넌트 개발

1.  **`components/PasswordModal.js`**: 비밀번호 입력을 위한 모달 컴포넌트를 생성합니다.
2.  **`components/SearchForm.js`**: 3개의 입력 필드와 검색 버튼을 포함한 검색 폼 컴포넌트를 생성합니다.
3.  **`components/ResultsTable.js`**: 검색 결과를 반응형 테이블 형태로 표시할 컴포넌트를 생성합니다.

### Phase 2: 페이지 및 상태 관리

1.  **`pages/index.js`**: 메인 페이지를 구성합니다. 여기서 `PasswordModal`, `SearchForm`, `ResultsTable` 컴포넌트를 조합하고, 전체적인 상태(비밀번호 인증, 로딩, 검색 결과 등)를 React Hook(`useState`, `useEffect`)으로 관리합니다.
2.  **입력 유효성 검사**: `SearchForm` 컴포넌트에서 3개 필드 중 최소 2개 이상이 입력되었는지 확인하는 로직을 구현합니다.

### Phase 3: API 연동 및 데이터 처리

1.  **n8n 웹훅 연동**: `fetch` API를 사용하여 n8n 웹훅으로 데이터를 비동기적으로 요청합니다. 요청 중에는 로딩 상태를 표시합니다.
2.  **데이터 표시**: n8n으로부터 받은 응답 데이터를 `ResultsTable` 컴포넌트에 전달하여 테이블을 동적으로 렌더링합니다.

### Phase 4: 스타일링 및 최종 테스트

1.  **CSS 스타일링**: CSS Modules 또는 Tailwind CSS를 사용하여 전체적인 디자인과 반응형 레이아웃을 구현합니다.
2.  **테스트**: 데스크톱 및 모바일 환경에서 기능 및 UI를 종합적으로 테스트합니다.
