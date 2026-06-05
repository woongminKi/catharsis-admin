import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { adminInstructorAPI } from '../utils/api';
import { rewriteImageUrl } from '../utils/imageUrl';

interface Instructor {
  _id: string;
  name: string;
  position: string;
  education: string;
  category: 'leader' | 'acting' | 'musical' | 'dance';
  profileImages: string[];
  viewCount: number;
  order: number;
  isActive: boolean;
  createdAt: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

const categoryLabels: Record<string, string> = {
  leader: '대표원장',
  acting: '연기',
  musical: '뮤지컬',
  dance: '무용',
};

const categoryTabs = [
  { key: 'leader', label: '대표원장' },
  { key: 'acting', label: '연기' },
  { key: 'musical', label: '뮤지컬' },
  { key: 'dance', label: '무용' },
];

const InstructorsPage: React.FC = () => {
  const navigate = useNavigate();
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // 검색 필터
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('leader'); // 기본값: 대표원장

  const fetchInstructors = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page, limit: 10 };
      if (keyword) params.keyword = keyword;
      if (category) params.category = category;

      const response = await adminInstructorAPI.getAll(params as any);
      setInstructors(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching instructors:', error);
    } finally {
      setLoading(false);
    }
  }, [keyword, category]);

  useEffect(() => {
    fetchInstructors();
  }, [fetchInstructors]);

  const handleSearch = () => {
    fetchInstructors(1);
  };

  const handleReset = () => {
    setKeyword('');
  };

  const handleTabChange = (newCategory: string) => {
    setCategory(newCategory);
    setSelectedIds([]);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(instructors.map((i) => i._id));
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
      alert('삭제할 강사를 선택해주세요.');
      return;
    }
    if (!window.confirm(`${selectedIds.length}명의 강사를 삭제하시겠습니까?`)) return;

    try {
      await adminInstructorAPI.bulkDelete(selectedIds);
      alert('삭제되었습니다.');
      setSelectedIds([]);
      fetchInstructors(pagination.currentPage);
    } catch (error) {
      alert('삭제에 실패했습니다.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('이 강사를 삭제하시겠습니까?')) return;

    try {
      await adminInstructorAPI.delete(id);
      alert('삭제되었습니다.');
      fetchInstructors(pagination.currentPage);
    } catch (error) {
      alert('삭제에 실패했습니다.');
    }
  };

  const handleMoveUp = async (id: string) => {
    const instructor = instructors.find((i) => i._id === id);
    if (instructor?.order === 1) {
      alert('이미 가장 위에 있습니다.');
      return;
    }

    try {
      await adminInstructorAPI.moveUp(id);
      fetchInstructors(pagination.currentPage);
    } catch (error: any) {
      const message = error.response?.data?.message || error.message;
      if (message?.includes('가장 위')) {
        alert('이미 가장 위에 있습니다.');
      } else {
        alert(message || '순서 변경에 실패했습니다.');
      }
    }
  };

  const handleMoveDown = async (id: string) => {
    const instructor = instructors.find((i) => i._id === id);
    if (instructor?.order === pagination.totalItems) {
      alert('이미 가장 아래에 있습니다.');
      return;
    }

    try {
      await adminInstructorAPI.moveDown(id);
      fetchInstructors(pagination.currentPage);
    } catch (error: any) {
      const message = error.response?.data?.message || error.message;
      if (message?.includes('가장 아래')) {
        alert('이미 가장 아래에 있습니다.');
      } else {
        alert(message || '순서 변경에 실패했습니다.');
      }
    }
  };

  const handleWrite = () => {
    navigate('/instructors/write');
  };

  const handleEdit = (id: string) => {
    navigate(`/instructors/write/${id}`);
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
          onClick={() => fetchInstructors(i)}
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
        <PageTitle>강사 관리</PageTitle>
        <WriteButton onClick={handleWrite}>강사 등록</WriteButton>
      </PageHeader>

      <CategoryTabs>
        {categoryTabs.map((tab) => (
          <CategoryTab
            key={tab.key}
            $active={category === tab.key}
            onClick={() => handleTabChange(tab.key)}
          >
            {tab.label}
          </CategoryTab>
        ))}
      </CategoryTabs>

      <SearchBox>
        <SearchInput
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="이름으로 검색"
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <SearchButton onClick={handleSearch}>검색</SearchButton>
        {keyword && <ResetButton onClick={handleReset}>초기화</ResetButton>}
      </SearchBox>

      <TableInfo>
        <strong>{categoryLabels[category]}</strong> 강사 : <strong>{pagination.totalItems}</strong>명
      </TableInfo>

      <Table>
        <thead>
          <tr>
            <Th style={{ width: '40px' }}>
              <input
                type="checkbox"
                checked={selectedIds.length === instructors.length && instructors.length > 0}
                onChange={handleSelectAll}
              />
            </Th>
            <Th style={{ width: '70px' }}>순서</Th>
            <Th style={{ width: '80px' }}>사진</Th>
            <Th style={{ width: '120px' }}>이름</Th>
            <Th>직책</Th>
            <Th style={{ width: '80px' }}>조회수</Th>
            <Th style={{ width: '80px' }}>상태</Th>
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
          ) : instructors.length === 0 ? (
            <tr>
              <Td colSpan={8} style={{ textAlign: 'center', padding: '40px' }}>
                등록된 강사가 없습니다.
              </Td>
            </tr>
          ) : (
            instructors.map((instructor, index) => (
              <tr key={instructor._id}>
                <Td>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(instructor._id)}
                    onChange={() => handleSelectOne(instructor._id)}
                  />
                </Td>
                <Td>
                  <OrderCell>
                    <OrderButtons>
                      <OrderButton
                        onClick={() => handleMoveUp(instructor._id)}
                        title="위로 이동"
                      >
                        ↑
                      </OrderButton>
                      <OrderButton
                        onClick={() => handleMoveDown(instructor._id)}
                        title="아래로 이동"
                      >
                        ↓
                      </OrderButton>
                    </OrderButtons>
                    <OrderNumber>{instructor.order}</OrderNumber>
                  </OrderCell>
                </Td>
                <Td>
                  {instructor.profileImages.length > 0 ? (
                    <ProfileThumbnail src={rewriteImageUrl(instructor.profileImages[0])} alt={instructor.name} />
                  ) : (
                    <NoImage>-</NoImage>
                  )}
                </Td>
                <Td style={{ fontWeight: 500 }}>{instructor.name}</Td>
                <Td style={{ textAlign: 'left' }}>{instructor.position}</Td>
                <Td>{instructor.viewCount}</Td>
                <Td>
                  <StatusBadge $active={instructor.isActive}>
                    {instructor.isActive ? '활성' : '비활성'}
                  </StatusBadge>
                </Td>
                <Td>
                  <ActionButtons>
                    <EditButton onClick={() => handleEdit(instructor._id)}>수정</EditButton>
                    <DeleteButton onClick={() => handleDelete(instructor._id)}>삭제</DeleteButton>
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

const CategoryTabs = styled.div`
  display: flex;
  gap: 0;
  margin-bottom: 24px;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const CategoryTab = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 16px 24px;
  font-size: 15px;
  font-weight: 600;
  color: ${({ $active }) => ($active ? '#4dabf7' : '#666')};
  background: ${({ $active }) => ($active ? '#f0f7ff' : 'white')};
  border-bottom: 3px solid ${({ $active }) => ($active ? '#4dabf7' : 'transparent')};
  transition: all 0.2s ease;

  &:hover {
    background: ${({ $active }) => ($active ? '#f0f7ff' : '#f8f9fa')};
  }
`;

const SearchBox = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
`;

const SearchInput = styled.input`
  flex: 1;
  max-width: 300px;
  padding: 10px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #4dabf7;
  }
`;

const ResetButton = styled.button`
  padding: 10px 20px;
  background: #6c757d;
  color: white;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;

  &:hover {
    background: #5a6268;
  }
`;

const SearchButton = styled.button`
  padding: 10px 20px;
  background: #4dabf7;
  color: white;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;

  &:hover {
    background: #339af0;
  }
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

const ProfileThumbnail = styled.img`
  width: 50px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
`;

const NoImage = styled.span`
  color: #999;
`;

const OrderCell = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
`;

const OrderButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const OrderButton = styled.button<{ disabled?: boolean }>`
  width: 20px;
  height: 16px;
  padding: 0;
  font-size: 10px;
  line-height: 1;
  background: ${({ disabled }) => (disabled ? '#f0f0f0' : '#e9ecef')};
  color: ${({ disabled }) => (disabled ? '#ccc' : '#495057')};
  border: 1px solid ${({ disabled }) => (disabled ? '#e0e0e0' : '#ddd')};
  border-radius: 3px;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};

  &:hover:not(:disabled) {
    background: #dee2e6;
  }
`;

const OrderNumber = styled.span`
  font-size: 13px;
  min-width: 20px;
`;

const StatusBadge = styled.span<{ $active: boolean }>`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  background: ${({ $active }) => ($active ? '#d3f9d8' : '#ffe3e3')};
  color: ${({ $active }) => ($active ? '#2f9e44' : '#e03131')};
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

export default InstructorsPage;
