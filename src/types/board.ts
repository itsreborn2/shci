export interface Post {
  id: number;
  created_at: string;
  name: string;
  title: string;
  content: string;
  affiliation: string | null;
  contact: string | null;
  password?: string; // 비밀번호는 항상 불러오지 않으므로 선택적 필드로 지정합니다.
}
