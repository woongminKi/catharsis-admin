import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { adminGalleryAPI, imageAPI } from '../utils/api';

const GalleryWritePage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEdit && id) {
      const loadGallery = async () => {
        try {
          setLoading(true);
          const response = await adminGalleryAPI.getOne(id);
          const data = response.data.data;
          setTitle(data.title);
          setImageUrl(data.imageUrl);
        } catch (error) {
          alert('갤러리를 불러올 수 없습니다.');
          navigate('/galleries');
        } finally {
          setLoading(false);
        }
      };
      loadGallery();
    }
  }, [id, isEdit, navigate]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const response = await imageAPI.upload(file, 'galleries');
      setImageUrl(response.data.data.url);
    } catch (error) {
      alert('이미지 업로드에 실패했습니다.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setImageUrl('');
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }
    if (!imageUrl) {
      alert('이미지를 업로드해주세요.');
      return;
    }

    try {
      setLoading(true);
      if (isEdit) {
        await adminGalleryAPI.update(id!, {
          title: title.trim(),
          imageUrl,
        });
        alert('갤러리가 수정되었습니다.');
      } else {
        await adminGalleryAPI.create({
          title: title.trim(),
          imageUrl,
        });
        alert('갤러리가 등록되었습니다.');
      }
      navigate('/galleries');
    } catch (error) {
      alert(isEdit ? '수정에 실패했습니다.' : '등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('작성을 취소하시겠습니까? 입력한 내용은 저장되지 않습니다.')) {
      navigate('/galleries');
    }
  };

  if (loading && isEdit) {
    return (
      <Container>
        <PageTitle>{isEdit ? '포토갤러리 수정' : '포토갤러리 등록'}</PageTitle>
        <LoadingText>로딩 중...</LoadingText>
      </Container>
    );
  }

  return (
    <Container>
      <PageTitle>{isEdit ? '포토갤러리 수정' : '포토갤러리 등록'}</PageTitle>

      <FormBox>
        <FormRow>
          <FormLabel>제목 *</FormLabel>
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력해주세요"
          />
        </FormRow>

        <FormRow>
          <FormLabel>이미지 *</FormLabel>
          <UploadSection>
            <input
              type="file"
              ref={imageInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              style={{ display: 'none' }}
            />
            <UploadButton
              type="button"
              onClick={() => imageInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? '업로드 중...' : '파일 선택'}
            </UploadButton>
            {!imageUrl && <UploadHint>선택된 파일 없음</UploadHint>}
          </UploadSection>
          {imageUrl && (
            <ImagePreview>
              <PreviewImage src={imageUrl} alt="갤러리 이미지" />
              <RemoveButton type="button" onClick={handleRemoveImage}>
                삭제
              </RemoveButton>
            </ImagePreview>
          )}
        </FormRow>
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
  padding: 32px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const FormRow = styled.div`
  margin-bottom: 24px;

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

const UploadSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
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
`;

const ImagePreview = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-top: 16px;
`;

const PreviewImage = styled.img`
  max-width: 400px;
  max-height: 300px;
  object-fit: contain;
  border-radius: 4px;
  border: 1px solid #ddd;
`;

const RemoveButton = styled.button`
  padding: 4px 12px;
  background: #ff6b6b;
  color: white;
  border-radius: 4px;
  font-size: 12px;

  &:hover {
    background: #fa5252;
  }
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
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

export default GalleryWritePage;
