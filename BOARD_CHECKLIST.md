## 게시판 기능 개발 체크리스트

### 1. 환경 설정
- [x] `c:\Users\SAMSUNG\Desktop\SHCI_front\.env.local` 파일에 Supabase URL 및 anon key 추가
- [x] Supabase 클라이언트 라이브러리 설치 (`npm install @supabase/supabase-js`)
- [x] Supabase 클라이언트 인스턴스 생성 및 설정 (`src/lib/supabaseClient.ts`)

### 2. UI 개발
- [x] 헤더 컴포넌트에 '건의/오류 게시판' 버튼 추가
- [x] 게시판 페이지 라우팅 설정 (`src/app/board/page.tsx`)
- [x] 게시판 목록 UI 컴포넌트 생성 (`src/components/board/BoardList.tsx`)
- [x] 글쓰기/수정 팝업(모달) UI 컴포넌트 생성 (`src/components/board/PostForm.tsx`)
- [x] 게시글 상세 보기 컴포넌트 (필요시)

### 3. 기능 개발
- [x] 게시글 목록 불러오기 기능
- [x] 새 게시글 작성 기능
- [x] 게시글 비밀번호 확인 후 수정/삭제 기능
- [x] 관리자 모드 기능 (비밀번호 확인)

### 4. 테스트 및 배포
- [x] 기능별 테스트 진행
- [ ] 최종 확인 및 배포
