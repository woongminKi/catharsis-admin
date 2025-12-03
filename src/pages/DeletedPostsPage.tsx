import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { adminConsultationAPI } from '../utils/api';

interface Post {
  _id: string;
  title: string;
  content: string;
  writerId: string;
  boardType: string;
  isSecret: boolean;
  status: string;
  viewCount: number;
  deletedAt: string;
  createdAt: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

const DeletedPostsPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const fetchDeletedPosts = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const response = await adminConsultationAPI.getDeleted({ page, limit: 10 });
      setPosts(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching deleted posts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeletedPosts();
  }, [fetchDeletedPosts]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(posts.map((p) => p._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleRestore = async (id: string) => {
    if (!window.confirm('이 게시글을 복구하시겠습니까?')) return;

    try {
      await adminConsultationAPI.restore(id);
      alert('복구되었습니다.');
      fetchDeletedPosts(pagination.currentPage);
    } catch (error) {
      alert('복구에 실패했습니다.');
    }
  };

  const handlePermanentDelete = async (id: string) => {
    if (!window.confirm('이 게시글을 완전히 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;

    try {
      await adminConsultationAPI.permanentDelete(id);
      alert('완전히 삭제되었습니다.');
      fetchDeletedPosts(pagination.currentPage);
    } catch (error) {
      alert('삭제에 실패했습니다.');
    }
  };

  const handleBulkRestore = async () => {
    if (selectedIds.length === 0) {
      alert('복구할 게시글을 선택해주세요.');
      return;
    }
    if (!window.confirm(`${selectedIds.length}개의 게시글을 복구하시겠습니까?`)) return;

    try {
      await adminConsultationAPI.bulkRestore(selectedIds);
      alert('복구되었습니다.');
      setSelectedIds([]);
      fetchDeletedPosts(pagination.currentPage);
    } catch (error) {
      alert('복구에 실패했습니다.');
    }
  };

  const handleBulkPermanentDelete = async () => {
    if (selectedIds.length === 0) {
      alert('삭제할 게시글을 선택해주세요.');
      return;
    }
    if (!window.confirm(`${selectedIds.length}개의 게시글을 완전히 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) return;

    try {
      await adminConsultationAPI.bulkPermanentDelete(selectedIds);
      alert('완전히 삭제되었습니다.');
      setSelectedIds([]);
      fetchDeletedPosts(pagination.currentPage);
    } catch (error) {
      alert('삭제에 실패했습니다.');
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const renderPagination = () => {
    const pages = [];
    const { currentPage, totalPages } = pagination;

    let startPage = Math.max(1, currentPage - 4);
    let endPage = Math.min(totalPages, startPage + 9);

    if (endPage - startPage < 9) {
      startPage = Math.max(1, endPage - 9);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PageButton
          key={i}
          $active={i === currentPage}
          onClick={() => fetchDeletedPosts(i)}
        >
          {i}
        </PageButton>
      );
    }

    return pages;
  };

  return (
    <Container>
      <PageTitle>삭제된 게시글 관리</PageTitle>

      <TableInfo>
        삭제된 게시글 수 : <strong>{pagination.totalItems}</strong> 개
      </TableInfo>

      <Table>
        <thead>
          <tr>
            <Th style={{ width: '40px' }}>
              <input
                type="checkbox"
                checked={selectedIds.length === posts.length && posts.length > 0}
                onChange={handleSelectAll}
              />
            </Th>
            <Th style={{ width: '70px' }}>번호</Th>
            <Th style={{ width: '120px' }}>게시판종류</Th>
            <Th>제목</Th>
            <Th style={{ width: '100px' }}>작성자</Th>
            <Th style={{ width: '160px' }}>삭제일</Th>
            <Th style={{ width: '160px' }}>기능</Th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <Td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}>
                로딩 중...
              </Td>
            </tr>
          ) : posts.length === 0 ? (
            <tr>
              <Td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}>
                삭제된 게시글이 없습니다.
              </Td>
            </tr>
          ) : (
            posts.map((post, index) => (
              <tr key={post._id}>
                <Td>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(post._id)}
                    onChange={() => handleSelectOne(post._id)}
                  />
                </Td>
                <Td>{pagination.totalItems - (pagination.currentPage - 1) * 10 - index}</Td>
                <Td>수강문의 게시판</Td>
                <Td style={{ textAlign: 'left' }}>
                  {post.isSecret && <SecretBadge>비밀</SecretBadge>}
                  {post.title}
                </Td>
                <Td>{post.writerId}</Td>
                <Td>{formatDate(post.deletedAt || post.createdAt)}</Td>
                <Td>
                  <ActionButtons>
                    <RestoreButton onClick={() => handleRestore(post._id)}>복구</RestoreButton>
                    <DeleteButton onClick={() => handlePermanentDelete(post._id)}>완전삭제</DeleteButton>
                  </ActionButtons>
                </Td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {pagination.totalPages > 1 && (
        <PaginationWrapper>{renderPagination()}</PaginationWrapper>
      )}

      <BulkActions>
        <BulkRestoreButton onClick={handleBulkRestore}>체크복구</BulkRestoreButton>
        <BulkDeleteButton onClick={handleBulkPermanentDelete}>체크완전삭제</BulkDeleteButton>
      </BulkActions>
    </Container>
  );
};

const Container = styled.div``;

const PageTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 24px;
  color: #333;
`;

const TableInfo = styled.div`
  margin-bottom: 12px;
  font-size: 14px;
  color: #555;
`;

const Table = styled.table`
  width: 100%;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const Th = styled.th`
  padding: 14px 12px;
  background: #f8f9fa;
  font-size: 13px;
  font-weight: 600;
  color: #333;
  text-align: center;
  border-bottom: 1px solid #ddd;
`;

const Td = styled.td`
  padding: 14px 12px;
  font-size: 13px;
  color: #333;
  text-align: center;
  border-bottom: 1px solid #eee;
`;

const SecretBadge = styled.span`
  display: inline-block;
  padding: 2px 6px;
  background: #ffeaa7;
  color: #d68910;
  font-size: 11px;
  border-radius: 4px;
  margin-right: 6px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 6px;
  justify-content: center;
`;

const RestoreButton = styled.button`
  padding: 6px 12px;
  background: #51cf66;
  color: white;
  border-radius: 4px;
  font-size: 12px;

  &:hover {
    background: #40c057;
  }
`;

const DeleteButton = styled.button`
  padding: 6px 12px;
  background: #ff6b6b;
  color: white;
  border-radius: 4px;
  font-size: 12px;

  &:hover {
    background: #fa5252;
  }
`;

const PaginationWrapper = styled.div`
  display: flex;
  justify-content: center;
  gap: 4px;
  margin-top: 24px;
`;

const PageButton = styled.button<{ $active?: boolean }>`
  padding: 8px 12px;
  background: ${({ $active }) => ($active ? '#4dabf7' : 'white')};
  color: ${({ $active }) => ($active ? 'white' : '#333')};
  border: 1px solid ${({ $active }) => ($active ? '#4dabf7' : '#ddd')};
  border-radius: 4px;
  font-size: 13px;

  &:hover {
    background: ${({ $active }) => ($active ? '#4dabf7' : '#f8f9fa')};
  }
`;

const BulkActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 16px;
`;

const BulkRestoreButton = styled.button`
  padding: 10px 20px;
  background: #51cf66;
  color: white;
  border-radius: 6px;
  font-size: 13px;

  &:hover {
    background: #40c057;
  }
`;

const BulkDeleteButton = styled.button`
  padding: 10px 20px;
  background: #ff6b6b;
  color: white;
  border-radius: 6px;
  font-size: 13px;

  &:hover {
    background: #fa5252;
  }
`;

export default DeletedPostsPage;
