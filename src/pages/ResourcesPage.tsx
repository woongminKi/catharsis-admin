import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { adminResourceAPI } from '../utils/api';

interface Resource {
  _id: string;
  title: string;
  content: string;
  thumbnailUrl?: string;
  viewCount: number;
  createdAt: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

const ResourcesPage: React.FC = () => {
  const navigate = useNavigate();
  const [resources, setResources] = useState<Resource[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // 검색 필터
  const [keyword, setKeyword] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchResources = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page, limit: 10 };
      if (keyword) params.keyword = keyword;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await adminResourceAPI.getAll(params as any);
      setResources(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  }, [keyword, startDate, endDate]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const handleSearch = () => {
    fetchResources(1);
  };

  const handleReset = () => {
    setKeyword('');
    setStartDate('');
    setEndDate('');
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(resources.map((n) => n._id));
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
      await adminResourceAPI.bulkDelete(selectedIds);
      alert('삭제되었습니다.');
      setSelectedIds([]);
      fetchResources(pagination.currentPage);
    } catch (error) {
      alert('삭제에 실패했습니다.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('이 게시글을 삭제하시겠습니까?')) return;

    try {
      await adminResourceAPI.delete(id);
      alert('삭제되었습니다.');
      fetchResources(pagination.currentPage);
    } catch (error) {
      alert('삭제에 실패했습니다.');
    }
  };

  const handleWrite = () => {
    navigate('/resources/write');
  };

  const handleEdit = (id: string) => {
    navigate(`/resources/write/${id}`);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  // HTML 태그 제거하여 미리보기 생성
  const stripHtml = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
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
          onClick={() => fetchResources(i)}
        >
          {i}
        </PageButton>
      );
    }

    return pages;
  };

  return (
    <Container>
      <PageHeader>
        <PageTitle>입시자료실 관리</PageTitle>
        <WriteButton onClick={handleWrite}>글쓰기</WriteButton>
      </PageHeader>

      <FilterBox>
        <FilterRow>
          <FilterGroup>
            <FilterLabel>제목</FilterLabel>
            <Input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="제목 검색"
            />
          </FilterGroup>
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
                checked={selectedIds.length === resources.length && resources.length > 0}
                onChange={handleSelectAll}
              />
            </Th>
            <Th style={{ width: '70px' }}>번호</Th>
            <Th>제목</Th>
            <Th style={{ width: '250px' }}>내용 미리보기</Th>
            <Th style={{ width: '80px' }}>조회수</Th>
            <Th style={{ width: '120px' }}>작성일</Th>
            <Th style={{ width: '140px' }}>기능</Th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <Td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}>
                로딩 중...
              </Td>
            </tr>
          ) : resources.length === 0 ? (
            <tr>
              <Td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}>
                게시글이 없습니다.
              </Td>
            </tr>
          ) : (
            resources.map((resource, index) => (
              <tr key={resource._id}>
                <Td>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(resource._id)}
                    onChange={() => handleSelectOne(resource._id)}
                  />
                </Td>
                <Td>{pagination.totalItems - (pagination.currentPage - 1) * 10 - index}</Td>
                <Td style={{ textAlign: 'left' }}>{resource.title}</Td>
                <Td style={{ textAlign: 'left' }}>
                  <ContentPreview>{stripHtml(resource.content)}</ContentPreview>
                </Td>
                <Td>{resource.viewCount}</Td>
                <Td>{formatDate(resource.createdAt)}</Td>
                <Td>
                  <ActionButtons>
                    <EditButton onClick={() => handleEdit(resource._id)}>수정</EditButton>
                    <DeleteButton onClick={() => handleDelete(resource._id)}>삭제</DeleteButton>
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
    </Container>
  );
};

const Container = styled.div``;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const PageTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #333;
`;

const WriteButton = styled.button`
  padding: 10px 24px;
  background: #4dabf7;
  color: white;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;

  &:hover {
    background: #339af0;
  }
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
  vertical-align: middle;
`;

const ContentPreview = styled.div`
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #666;
  font-size: 12px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 6px;
  justify-content: center;
`;

const EditButton = styled.button`
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

export default ResourcesPage;
