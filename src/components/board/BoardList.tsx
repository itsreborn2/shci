'use client';

import { useState, useEffect, useCallback, Fragment } from 'react';
import { Post } from '@/types/board';

import { supabase } from '@/lib/supabaseClient';
import PostForm from './PostForm';

interface BoardListProps {
  isAdmin: boolean;
}



export default function BoardList({ isAdmin }: BoardListProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
    const [expandedPostId, setExpandedPostId] = useState<number | null>(null);
    const [postToEdit, setPostToEdit] = useState<Post | null>(null);

    const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('posts')
        .select('id, created_at, name, title, content, affiliation, contact')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setPosts(data || []);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('알 수 없는 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

    const handleRowClick = async (post: Post) => {
    // 이미 열려있는 게시글을 다시 클릭하면 닫습니다.
    if (expandedPostId === post.id) {
      setExpandedPostId(null);
      return;
    }

    // 관리자는 비밀번호 없이 모든 게시글을 볼 수 있습니다.
    if (isAdmin) {
      setExpandedPostId(post.id);
      return;
    }

    // 일반 사용자는 비밀번호를 입력해야 합니다.
    const password = prompt('게시글을 보려면 비밀번호를 입력하세요.');
    if (password === null) return; // 사용자가 입력을 취소한 경우

    try {
      const { data, error } = await supabase.rpc('check_post_password', {
        post_id_to_check: post.id,
        password_to_check: password,
      });

      if (error) throw error;

      if (data) {
        // 비밀번호가 일치하면 게시글을 보여줍니다.
        setExpandedPostId(post.id);
      } else {
        // 비밀번호가 틀린 경우
        alert('비밀번호가 일치하지 않습니다.');
      }
    } catch (err) {
      if (err instanceof Error) {
        alert(`오류가 발생했습니다: ${err.message}`);
      } else {
        alert('알 수 없는 오류가 발생했습니다.');
      }
    }
  };

      const handleCloseDetail = () => {
    setExpandedPostId(null);
    setPostToEdit(null);
    setIsFormOpen(false);
  };

    const handleEditPost = async (post: Post) => {
    if (isAdmin) {
      setPostToEdit(post);
      setExpandedPostId(null); // 상세 내용은 닫고
      setIsFormOpen(true);   // 수정 폼을 엽니다.
      return;
    }

    const password = prompt('게시글을 수정하려면 비밀번호를 입력하세요.');
    if (password === null) return;

    try {
      const { data, error } = await supabase.rpc('check_post_password', {
        post_id_to_check: post.id,
        password_to_check: password,
      });

      if (error) throw error;

      if (data) {
        setPostToEdit(post);
        setExpandedPostId(null); // 상세 내용은 닫고
        setIsFormOpen(true);   // 수정 폼을 엽니다.
      } else {
        alert('비밀번호가 일치하지 않습니다.');
      }
    } catch (err) {
      if (err instanceof Error) {
        alert(`오류가 발생했습니다: ${err.message}`);
      } else {
        alert('알 수 없는 오류가 발생했습니다.');
      }
    }
  };

    const handleDeletePost = async (postId: number) => {
    if (isAdmin) {
      const confirmDelete = confirm('관리자 권한으로 이 게시글을 즉시 삭제하시겠습니까?');
      if (confirmDelete) {
        try {
          const { error } = await supabase.from('posts').delete().eq('id', postId);
          if (error) throw error;
          alert('게시글이 삭제되었습니다.');
          fetchPosts();
          handleCloseDetail();
        } catch (err) {
          if (err instanceof Error) {
            alert(`삭제 중 오류가 발생했습니다: ${err.message}`);
          } else {
            alert('삭제 중 알 수 없는 오류가 발생했습니다.');
          }
        }
      }
      return;
    }
    const password = prompt('게시글을 삭제하려면 비밀번호를 입력하세요.');
    if (password === null) return; // 사용자가 취소한 경우

    try {
      const { data, error } = await supabase.rpc('delete_post_with_password', {
        post_id_to_delete: postId,
        password_to_check: password,
      });

      if (error) throw error;

      if (data) {
        alert('게시글이 삭제되었습니다.');
        fetchPosts(); // 목록 새로고침
        handleCloseDetail();
      } else {
        alert('비밀번호가 일치하지 않거나 삭제에 실패했습니다.');
      }
    } catch (err) {
      if (err instanceof Error) {
        alert(`삭제 중 오류가 발생했습니다: ${err.message}`);
      } else {
        alert('삭제 중 알 수 없는 오류가 발생했습니다.');
      }
    }
  };

    const handleSavePost = async (postData: Omit<Post, 'id' | 'created_at'>, postId?: number) => {
    try {
      let error;
      if (postId) {
        // 수정 모드
        const { error: updateError } = await supabase
          .from('posts')
          .update(postData)
          .eq('id', postId);
        error = updateError;
      } else {
        // 새 글 작성 모드
        const { error: insertError } = await supabase.from('posts').insert([postData]);
        error = insertError;
      }

      if (error) throw error;

      setIsFormOpen(false);
      setPostToEdit(null);
      fetchPosts(); // 목록 새로고침
      alert(postId ? '게시글이 수정되었습니다.' : '게시글이 작성되었습니다.');
    } catch (err) {
      if (err instanceof Error) {
        alert(`저장 중 오류가 발생했습니다: ${err.message}`);
      } else {
        alert('저장 중 알 수 없는 오류가 발생했습니다.');
      }
    }
  };

  if (loading) {
    return <div className="text-center py-8">게시글을 불러오는 중...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">오류: {error}</div>;
  }

      return (
    <div className="bg-white p-4 sm:p-8 rounded-xl shadow-md">
            {isFormOpen && (
        <PostForm
          onClose={handleCloseDetail}
          onSave={handleSavePost}
          postToEdit={postToEdit}
        />
      )}
      <div className="flex justify-between items-center mb-4">
        <div>
          {isAdmin && <span className="font-semibold text-red-500">관리자 모드 활성화</span>}
        </div>
        <button 
          onClick={() => {
            setPostToEdit(null); // 수정 상태 초기화
            setIsFormOpen(true);
          }}
          className="bg-cyan-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-cyan-700 transition-colors text-sm font-semibold"
        >
          새 글 작성
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 w-16">번호</th>
              <th scope="col" className="px-6 py-3">제목</th>
              <th scope="col" className="px-6 py-3 w-32">작성자</th>
              <th scope="col" className="px-6 py-3 w-40">작성일</th>
            </tr>
          </thead>
          <tbody>
            {posts.length > 0 ? (
                            posts.map((post) => (
                <Fragment key={post.id}>
                  <tr key={post.id} className="bg-white border-b hover:bg-gray-50 cursor-pointer" onClick={() => handleRowClick(post)}>
                    <td className="px-6 py-4">{post.id}</td>
                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                      {post.title}
                    </th>
                    <td className="px-6 py-4">{post.name}</td>
                    <td className="px-6 py-4">{new Date(post.created_at).toLocaleDateString()}</td>
                  </tr>
                  {expandedPostId === post.id && (
                    <tr key={`${post.id}-detail`} className="bg-gray-50">
                      <td colSpan={4} className="p-4 sm:p-6">
                        <div className="space-y-4">
                          <div>
                            <h3 className="font-semibold text-gray-800">내용</h3>
                            <p className="mt-1 text-gray-700 whitespace-pre-wrap">{post.content}</p>
                          </div>
                          {(post.affiliation || post.contact) && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                              {post.affiliation && <div><span className="font-semibold">소속:</span> {post.affiliation}</div>}
                              {post.contact && <div><span className="font-semibold">연락처:</span> {post.contact}</div>}
                            </div>
                          )}
                          <div className="flex justify-end space-x-2 pt-2">
                            <button onClick={() => handleEditPost(post)} className="text-sm font-semibold text-cyan-600 hover:text-cyan-800">수정</button>
                            <button onClick={() => handleDeletePost(post.id)} className="text-sm font-semibold text-red-600 hover:text-red-800">삭제</button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center py-8">게시글이 없습니다.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
