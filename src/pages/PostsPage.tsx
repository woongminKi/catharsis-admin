import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { adminConsultationAPI } from '../utils/api';
import PostDetailModal from '../components/PostDetailModal';

interface Post {
  _id: string;
  title: string;
  content: string;
  writerId: string;
  boardType: string;
  isSecret: boolean;
  status: string;
  viewCount: number;
  comments: Array<{
    _id: string;
    author: string;
    content: string;
    createdAt: string;
  }>;
  createdAt: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

const PostsPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showModal, setShowModal] = useState(false);

  // 검색 필터
  const [boardType, setBoardType] = useState('all');
  const [searchType, setSearchType] = useState('title');
  const [keyword, setKeyword] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchPosts = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page, limit: 10 };
      if (boardType !== 'all') params.boardType = boardType;
      if (keyword) {
        params.searchType = searchType;
        params.keyword = keyword;
      }
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await adminConsultationAPI.getAll(params as any);
      setPosts(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  }, [boardType, searchType, keyword, startDate, endDate]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleSearch = () => {
    fetchPosts(1);
  };

  const handleReset = () => {
    setBoardType('all');
    setSearchType('title');
    setKeyword('');
    setStartDate('');
    setEndDate('');
  };

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

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      alert('삭제할 게시글을 선택해주세요.');
      return;
    }
    if (!window.confirm(`${selectedIds.length}개의 게시글을 삭제하시겠습니까?`)) return;

    try {
      await adminConsultationAPI.bulkDelete(selectedIds);
      alert('삭제되었습니다.');
      setSelectedIds([]);
      fetchPosts(pagination.currentPage);
    } catch (error) {
      alert('삭제에 실패했습니다.');
    }
  };

  const handleView = async (id: string) => {
    try {
      const response = await adminConsultationAPI.getOne(id);
      setSelectedPost(response.data.data);
      setShowModal(true);
    } catch (error) {
      alert('게시글을 불러올 수 없습니다.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('이 게시글을 삭제하시겠습니까?')) return;

    try {
      await adminConsultationAPI.delete(id);
      alert('삭제되었습니다.');
      fetchPosts(pagination.currentPage);
    } catch (error) {
      alert('삭제에 실패했습니다.');
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedPost(null);
  };

  const handleCommentSubmit = async (content: string) => {
    if (!selectedPost) return;

    try {
      const response = await adminConsultationAPI.addComment(selectedPost._id, content);
      setSelectedPost(response.data.data);
      fetchPosts(pagination.currentPage);
    } catch (error) {
      alert('답변 등록에 실패했습니다.');
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
          onClick={() => fetchPosts(i)}
        >
          {i}
        </PageButton>
      );
    }

    return pages;
  };

  return (
    <Container>
      <PageTitle>게시글 통합 관리</PageTitle>

      <FilterBox>
        <FilterRow>
          <FilterGroup>
            <FilterLabel>게시판종류</FilterLabel>
            <Select value={boardType} onChange={(e) => setBoardType(e.target.value)}>
              <option value="all">전체</option>
              <option value="INQUIRY">수강문의 게시판</option>
            </Select>
          </FilterGroup>
          <FilterGroup>
            <FilterLabel>제목</FilterLabel>
            <Input
              type="text"
              value={searchType === 'title' ? keyword : ''}
              onChange={(e) => {
                setSearchType('title');
                setKeyword(e.target.value);
              }}
              placeholder="제목 검색"
            />
          </FilterGroup>
        </FilterRow>
        <FilterRow>
          <FilterGroup>
            <FilterLabel>작성자</FilterLabel>
            <Input
              type="text"
              value={searchType === 'writerId' ? keyword : ''}
              onChange={(e) => {
                setSearchType('writerId');
                setKeyword(e.target.value);
              }}
              placeholder="작성자 검색"
            />
          </FilterGroup>
          <FilterGroup>
            <FilterLabel>내용</FilterLabel>
            <Input
              type="text"
              value={searchType === 'content' ? keyword : ''}
              onChange={(e) => {
                setSearchType('content');
                setKeyword(e.target.value);
              }}
              placeholder="내용 검색"
            />
          </FilterGroup>
        </FilterRow>
        <FilterRow>
          <FilterGroup>
            <FilterLabel>작성일</FilterLabel>
            <DateInputs>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <span>~</span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </DateInputs>
          </FilterGroup>
        </FilterRow>
        <FilterActions>
          <ResetButton onClick={handleReset}>검색초기화</ResetButton>
          <SearchButton onClick={handleSearch}>검색</SearchButton>
        </FilterActions>
      </FilterBox>

      <TableInfo>
        검색 게시글 수 : <strong>{pagination.totalItems}</strong> 개
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
            <Th style={{ width: '80px' }}>기타</Th>
            <Th style={{ width: '160px' }}>작성일</Th>
            <Th style={{ width: '140px' }}>기능</Th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <Td colSpan={8} style={{ textAlign: 'center', padding: '40px' }}>
                로딩 중...
              </Td>
            </tr>
          ) : posts.length === 0 ? (
            <tr>
              <Td colSpan={8} style={{ textAlign: 'center', padding: '40px' }}>
                게시글이 없습니다.
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
                <Td>
                  <MetaInfo>
                    <span>👁 {post.viewCount}</span>
                    <span>💬 {post.comments?.length || 0}</span>
                  </MetaInfo>
                </Td>
                <Td>{formatDate(post.createdAt)}</Td>
                <Td>
                  <ActionButtons>
                    <ViewButton onClick={() => handleView(post._id)}>보기</ViewButton>
                    <DeleteButton onClick={() => handleDelete(post._id)}>삭제</DeleteButton>
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
        <BulkDeleteButton onClick={handleBulkDelete}>체크삭제</BulkDeleteButton>
      </BulkActions>

      {showModal && selectedPost && (
        <PostDetailModal
          post={selectedPost}
          onClose={handleModalClose}
          onCommentSubmit={handleCommentSubmit}
          onRefresh={() => fetchPosts(pagination.currentPage)}
        />
      )}
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

const FilterBox = styled.div`
  background: white;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const FilterRow = styled.div`
  display: flex;
  gap: 24px;
  margin-bottom: 16px;

  &:last-of-type {
    margin-bottom: 0;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
`;

const FilterLabel = styled.label`
  font-size: 13px;
  font-weight: 500;
  color: #555;
  min-width: 60px;
`;

const Select = styled.select`
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 13px;
`;

const Input = styled.input`
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 13px;
`;

const DateInputs = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;

  span {
    color: #666;
  }
`;

const FilterActions = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
`;

const ResetButton = styled.button`
  padding: 10px 32px;
  background: #6c757d;
  color: white;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
`;

const SearchButton = styled.button`
  padding: 10px 32px;
  background: #4dabf7;
  color: white;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
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

const MetaInfo = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;
  font-size: 12px;
  color: #666;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 6px;
  justify-content: center;
`;

const ViewButton = styled.button`
  padding: 6px 12px;
  background: #4dabf7;
  color: white;
  border-radius: 4px;
  font-size: 12px;
`;

const DeleteButton = styled.button`
  padding: 6px 12px;
  background: #e9ecef;
  color: #495057;
  border-radius: 4px;
  font-size: 12px;

  &:hover {
    background: #dee2e6;
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
  margin-top: 16px;
`;

const BulkDeleteButton = styled.button`
  padding: 10px 20px;
  background: white;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 13px;

  &:hover {
    background: #f8f9fa;
  }
`;

export default PostsPage;
