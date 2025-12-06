import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { adminPasserAPI, imageAPI } from '../utils/api';

const PasserWritePage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const [title, setTitle] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const imagesInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEdit) {
      fetchPasser();
    }
  }, [id]);

  const fetchPasser = async () => {
    try {
      setLoading(true);
      const response = await adminPasserAPI.getOne(id!);
      const data = response.data.data;
      setTitle(data.title);
      setThumbnailUrl(data.thumbnailUrl);
      setImageUrls(data.imageUrls || []);
    } catch (error) {
      alert('게시글을 불러올 수 없습니다.');
      navigate('/passers');
    } finally {
      setLoading(false);
    }
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const response = await imageAPI.upload(file, 'passers/thumbnails');
      setThumbnailUrl(response.data.data.url);
    } catch (error) {
      alert('썸네일 업로드에 실패했습니다.');
    } finally {
      setUploading(false);
    }
  };

  const handleImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploading(true);
      const fileArray = Array.from(files);
      const response = await imageAPI.uploadMultiple(fileArray, 'passers/images');
      const uploadedUrls = response.data.data.map((item: { url: string }) => item.url);
      setImageUrls((prev) => [...prev, ...uploadedUrls]);
    } catch (error) {
      alert('이미지 업로드에 실패했습니다.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveThumbnail = () => {
    setThumbnailUrl('');
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }
    if (!thumbnailUrl) {
      alert('썸네일 이미지를 업로드해주세요.');
      return;
    }

    try {
      setLoading(true);
      if (isEdit) {
        await adminPasserAPI.update(id!, {
          title: title.trim(),
          thumbnailUrl,
          imageUrls,
        });
        alert('게시글이 수정되었습니다.');
      } else {
        await adminPasserAPI.create({
          title: title.trim(),
          thumbnailUrl,
          imageUrls,
        });
        alert('게시글이 등록되었습니다.');
      }
      navigate('/passers');
    } catch (error) {
      alert(isEdit ? '수정에 실패했습니다.' : '등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('작성을 취소하시겠습니까? 입력한 내용은 저장되지 않습니다.')) {
      navigate('/passers');
    }
  };

  if (loading && isEdit) {
    return (
      <Container>
        <PageTitle>{isEdit ? '합격자 수정' : '합격자 등록'}</PageTitle>
        <LoadingText>로딩 중...</LoadingText>
      </Container>
    );
  }

  return (
    <Container>
      <PageTitle>{isEdit ? '합격자 수정' : '합격자 등록'}</PageTitle>

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
          <FormLabel>썸네일 이미지 *</FormLabel>
          <UploadSection>
            <input
              type="file"
              ref={thumbnailInputRef}
              onChange={handleThumbnailUpload}
              accept="image/*"
              style={{ display: 'none' }}
            />
            <UploadButton
              type="button"
              onClick={() => thumbnailInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? '업로드 중...' : '파일 선택'}
            </UploadButton>
            {!thumbnailUrl && <UploadHint>선택된 파일 없음</UploadHint>}
          </UploadSection>
          {thumbnailUrl && (
            <ThumbnailPreview>
              <PreviewImage src={thumbnailUrl} alt="썸네일" />
              <RemoveButton type="button" onClick={handleRemoveThumbnail}>
                삭제
              </RemoveButton>
            </ThumbnailPreview>
          )}
        </FormRow>

        <FormRow>
          <FormLabel>상세 이미지</FormLabel>
          <UploadSection>
            <input
              type="file"
              ref={imagesInputRef}
              onChange={handleImagesUpload}
              accept="image/*"
              multiple
              style={{ display: 'none' }}
            />
            <UploadButton
              type="button"
              onClick={() => imagesInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? '업로드 중...' : '파일 선택'}
            </UploadButton>
            <UploadHint>여러 파일을 선택할 수 있습니다</UploadHint>
          </UploadSection>
          {imageUrls.length > 0 && (
            <ImagePreviews>
              {imageUrls.map((url, index) => (
                <ImagePreviewItem key={index}>
                  <PreviewImage src={url} alt={`이미지 ${index + 1}`} />
                  <RemoveButton type="button" onClick={() => handleRemoveImage(index)}>
                    삭제
                  </RemoveButton>
                </ImagePreviewItem>
              ))}
            </ImagePreviews>
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

const ThumbnailPreview = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-top: 16px;
`;

const ImagePreviews = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 16px;
`;

const ImagePreviewItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

const PreviewImage = styled.img`
  max-width: 200px;
  max-height: 200px;
  object-fit: cover;
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

export default PasserWritePage;
