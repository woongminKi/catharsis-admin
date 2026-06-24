import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { adminInstructorAPI, imageAPI, DetailSection } from '../utils/api';

const InstructorWritePage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [education, setEducation] = useState('');
  const [category, setCategory] = useState<'leader' | 'acting' | 'musical' | 'dance'>('acting');
  const [profileImages, setProfileImages] = useState<string[]>([]);
  const [detailSections, setDetailSections] = useState<DetailSection[]>([]);
  const [currentOrder, setCurrentOrder] = useState<number | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEdit && id) {
      const loadInstructor = async () => {
        try {
          setLoading(true);
          const response = await adminInstructorAPI.getOne(id);
          const data = response.data.data;
          setName(data.name);
          setPosition(data.position);
          setEducation(data.education);
          setCategory(data.category);
          setProfileImages(data.profileImages || []);
          setDetailSections(data.detailSections || []);
          setCurrentOrder(data.order || 0);
          setIsActive(data.isActive);
        } catch (error) {
          alert('강사 정보를 불러올 수 없습니다.');
          navigate('/instructors');
        } finally {
          setLoading(false);
        }
      };
      loadInstructor();
    }
  }, [id, isEdit, navigate]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploading(true);
      const fileArray = Array.from(files);
      const response = await imageAPI.uploadMultiple(fileArray, 'instructors');
      // 백엔드 응답: { data: [{ key, url }, ...] }
      const urls = response.data.data.map((item: { key: string; url: string }) => item.url);
      setProfileImages((prev) => [...prev, ...urls]);
    } catch (error) {
      alert('이미지 업로드에 실패했습니다.');
    } finally {
      setUploading(false);
      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    setProfileImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddSection = () => {
    setDetailSections((prev) => [...prev, { title: '', items: [''] }]);
  };

  const handleRemoveSection = (index: number) => {
    setDetailSections((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSectionTitleChange = (index: number, title: string) => {
    setDetailSections((prev) =>
      prev.map((section, i) => (i === index ? { ...section, title } : section))
    );
  };

  const handleAddSectionItem = (sectionIndex: number) => {
    setDetailSections((prev) =>
      prev.map((section, i) =>
        i === sectionIndex ? { ...section, items: [...section.items, ''] } : section
      )
    );
  };

  const handleRemoveSectionItem = (sectionIndex: number, itemIndex: number) => {
    setDetailSections((prev) =>
      prev.map((section, i) =>
        i === sectionIndex
          ? { ...section, items: section.items.filter((_, j) => j !== itemIndex) }
          : section
      )
    );
  };

  const handleSectionItemChange = (sectionIndex: number, itemIndex: number, value: string) => {
    setDetailSections((prev) =>
      prev.map((section, i) =>
        i === sectionIndex
          ? {
              ...section,
              items: section.items.map((item, j) => (j === itemIndex ? value : item)),
            }
          : section
      )
    );
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      alert('이름을 입력해주세요.');
      return;
    }
    if (!position.trim()) {
      alert('직책을 입력해주세요.');
      return;
    }
    if (!education.trim()) {
      alert('학력을 입력해주세요.');
      return;
    }

    // 빈 섹션 아이템 제거
    const cleanedSections = detailSections
      .filter((section) => section.title.trim())
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => item.trim()),
      }));

    try {
      setLoading(true);
      const data = {
        name: name.trim(),
        position: position.trim(),
        education: education.trim(),
        category,
        profileImages,
        detailSections: cleanedSections,
        isActive,
      };

      if (isEdit) {
        await adminInstructorAPI.update(id!, data);
        alert('강사 정보가 수정되었습니다.');
      } else {
        await adminInstructorAPI.create(data);
        alert('강사가 등록되었습니다.');
      }
      navigate('/instructors');
    } catch (error) {
      alert(isEdit ? '수정에 실패했습니다.' : '등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('작성을 취소하시겠습니까? 입력한 내용은 저장되지 않습니다.')) {
      navigate('/instructors');
    }
  };

  if (loading && isEdit) {
    return (
      <Container>
        <PageTitle>{isEdit ? '강사 수정' : '강사 등록'}</PageTitle>
        <LoadingText>로딩 중...</LoadingText>
      </Container>
    );
  }

  return (
    <Container>
      <PageTitle>{isEdit ? '강사 수정' : '강사 등록'}</PageTitle>

      <FormBox>
        <SectionHeader>기본 정보</SectionHeader>

        <FormRow>
          <FormLabel>이름 *</FormLabel>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="강사 이름"
          />
        </FormRow>

        <FormRow>
          <FormLabel>직책 *</FormLabel>
          <Input
            type="text"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            placeholder="예: 홍대점 액팅파트 책임원장"
          />
        </FormRow>

        <FormRow>
          <FormLabel>학력 (간략) *</FormLabel>
          <Input
            type="text"
            value={education}
            onChange={(e) => setEducation(e.target.value)}
            placeholder="예: 중앙대학교 연극학과 연기전공"
          />
        </FormRow>

        <FormRow>
          <FormLabel>카테고리 *</FormLabel>
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value as any)}
          >
            <option value="leader">대표원장</option>
            <option value="acting">연기</option>
            <option value="musical">뮤지컬</option>
            <option value="dance">무용</option>
          </Select>
        </FormRow>

        <FormRow>
          <FormLabel>표시 순서</FormLabel>
          {isEdit ? (
            <OrderDisplay>
              현재 순서: <strong>{currentOrder}</strong>
              <OrderHint>순서 변경은 목록에서 ↑/↓ 버튼으로 조정하세요.</OrderHint>
            </OrderDisplay>
          ) : (
            <OrderHint>저장 시 맨 마지막에 배치됩니다. 저장 후 목록에서 순서를 조정할 수 있습니다.</OrderHint>
          )}
        </FormRow>

        <FormRow>
          <FormLabel>상태</FormLabel>
          <CheckboxLabel>
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            활성화 (체크 해제 시 목록에 표시되지 않음)
          </CheckboxLabel>
        </FormRow>
      </FormBox>

      <FormBox>
        <SectionHeader>프로필 이미지</SectionHeader>

        <FormRow>
          <input
            type="file"
            ref={imageInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            multiple
            style={{ display: 'none' }}
          />
          <UploadButton
            type="button"
            onClick={() => imageInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? '업로드 중...' : '이미지 추가'}
          </UploadButton>
          <UploadHint>여러 이미지를 선택할 수 있습니다.</UploadHint>
        </FormRow>

        {profileImages.length > 0 && (
          <ImageGrid>
            {profileImages.map((url, index) => (
              <ImageItem key={index}>
                <PreviewImage src={url} alt={`프로필 ${index + 1}`} />
                <RemoveImageButton type="button" onClick={() => handleRemoveImage(index)}>
                  삭제
                </RemoveImageButton>
              </ImageItem>
            ))}
          </ImageGrid>
        )}
      </FormBox>

      <FormBox>
        <SectionHeaderRow>
          <SectionHeader>상세 정보 섹션</SectionHeader>
          <AddButton type="button" onClick={handleAddSection}>
            + 섹션 추가
          </AddButton>
        </SectionHeaderRow>
        <SectionHint>
          학력, 레슨경력, 연극, 영화, 뮤지컬, 드라마, 수상, 광고, 자격증 등의 섹션을 추가하세요.
        </SectionHint>

        {detailSections.map((section, sectionIndex) => (
          <SectionBox key={sectionIndex}>
            <SectionTitleRow>
              <Input
                type="text"
                value={section.title}
                onChange={(e) => handleSectionTitleChange(sectionIndex, e.target.value)}
                placeholder="섹션 제목 (예: 학력, 연극, 영화)"
              />
              <RemoveSectionButton
                type="button"
                onClick={() => handleRemoveSection(sectionIndex)}
              >
                섹션 삭제
              </RemoveSectionButton>
            </SectionTitleRow>

            {section.items.map((item, itemIndex) => (
              <ItemRow key={itemIndex}>
                <ItemInput
                  type="text"
                  value={item}
                  onChange={(e) =>
                    handleSectionItemChange(sectionIndex, itemIndex, e.target.value)
                  }
                  placeholder="내용 입력"
                />
                <RemoveItemButton
                  type="button"
                  onClick={() => handleRemoveSectionItem(sectionIndex, itemIndex)}
                >
                  삭제
                </RemoveItemButton>
              </ItemRow>
            ))}

            <AddItemButton type="button" onClick={() => handleAddSectionItem(sectionIndex)}>
              + 항목 추가
            </AddItemButton>
          </SectionBox>
        ))}
      </FormBox>

      <FormActions>
        <CancelButton type="button" onClick={handleCancel}>
          취소
        </CancelButton>
        <SubmitButton type="button" onClick={handleSubmit} disabled={loading}>
          {loading ? '저장 중...' : isEdit ? '수정완료' : '작성완료'}
        </SubmitButton>
      </FormActions>
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

const LoadingText = styled.div`
  text-align: center;
  padding: 40px;
  color: #666;
`;

const FormBox = styled.div`
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
`;

const SectionHeader = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
`;

const SectionHeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;

  ${SectionHeader} {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
  }
`;

const SectionHint = styled.p`
  font-size: 13px;
  color: #888;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
`;

const FormRow = styled.div`
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const FormLabel = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #4dabf7;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #4dabf7;
  }
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #555;
  cursor: pointer;
`;

const OrderDisplay = styled.div`
  font-size: 14px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const OrderHint = styled.span`
  font-size: 13px;
  color: #888;
`;

const UploadButton = styled.button`
  padding: 10px 20px;
  background: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 13px;
  color: #333;
  cursor: pointer;

  &:hover {
    background: #e9ecef;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const UploadHint = styled.span`
  font-size: 13px;
  color: #888;
  margin-left: 12px;
`;

const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
  margin-top: 16px;
`;

const ImageItem = styled.div`
  position: relative;
`;

const PreviewImage = styled.img`
  width: 100%;
  aspect-ratio: 3/4;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #ddd;
`;

const RemoveImageButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px 8px;
  background: rgba(255, 0, 0, 0.8);
  color: white;
  border-radius: 4px;
  font-size: 11px;

  &:hover {
    background: red;
  }
`;

const AddButton = styled.button`
  padding: 8px 16px;
  background: #4dabf7;
  color: white;
  border-radius: 6px;
  font-size: 13px;

  &:hover {
    background: #339af0;
  }
`;

const SectionBox = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
`;

const SectionTitleRow = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
`;

const RemoveSectionButton = styled.button`
  padding: 8px 16px;
  background: #ff6b6b;
  color: white;
  border-radius: 6px;
  font-size: 12px;
  white-space: nowrap;

  &:hover {
    background: #fa5252;
  }
`;

const ItemRow = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
`;

const ItemInput = styled.input`
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 13px;
  background: white;

  &:focus {
    outline: none;
    border-color: #4dabf7;
  }
`;

const RemoveItemButton = styled.button`
  padding: 8px 12px;
  background: #e9ecef;
  color: #495057;
  border-radius: 6px;
  font-size: 12px;

  &:hover {
    background: #dee2e6;
  }
`;

const AddItemButton = styled.button`
  padding: 8px 16px;
  background: white;
  border: 1px dashed #ddd;
  border-radius: 6px;
  font-size: 13px;
  color: #666;
  width: 100%;
  margin-top: 8px;

  &:hover {
    background: #f8f9fa;
    border-color: #aaa;
  }
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const CancelButton = styled.button`
  padding: 12px 32px;
  background: #6c757d;
  color: white;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;

  &:hover {
    background: #5a6268;
  }
`;

const SubmitButton = styled.button`
  padding: 12px 32px;
  background: #4dabf7;
  color: white;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;

  &:hover {
    background: #339af0;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export default InstructorWritePage;
