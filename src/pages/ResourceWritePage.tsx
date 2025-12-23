import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { adminResourceAPI, imageAPI } from '../utils/api';

const ResourceWritePage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const quillRef = useRef<ReactQuill>(null);

  useEffect(() => {
    if (isEdit && id) {
      const loadResource = async () => {
        try {
          setLoading(true);
          const response = await adminResourceAPI.getOne(id);
          const data = response.data.data;
          setTitle(data.title);
          setContent(data.content);
          setThumbnailUrl(data.thumbnailUrl || '');
        } catch (error) {
          alert('게시글을 불러올 수 없습니다.');
          navigate('/resources');
        } finally {
          setLoading(false);
        }
      };
      loadResource();
    }
  }, [id, isEdit, navigate]);

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const response = await imageAPI.upload(file, 'resources/thumbnails');
      setThumbnailUrl(response.data.data.url);
    } catch (error) {
      alert('썸네일 업로드에 실패했습니다.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveThumbnail = () => {
    setThumbnailUrl('');
  };

  // 에디터 내 이미지 업로드 핸들러
  const imageHandler = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (file) {
        try {
          const response = await imageAPI.upload(file, 'resources/content');
          const imageUrl = response.data.data.url;

          const quill = quillRef.current?.getEditor();
          if (quill) {
            const range = quill.getSelection(true);
            quill.insertEmbed(range.index, 'image', imageUrl);
            quill.setSelection(range.index + 1, 0);
          }
        } catch (error) {
          alert('이미지 업로드에 실패했습니다.');
        }
      }
    };
  };

  // Quill 에디터 모듈 설정
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ color: [] }, { background: [] }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ align: [] }],
        ['link', 'image'],
        ['clean'],
      ],
      handlers: {
        image: imageHandler,
      },
    },
  }), []);

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'list',
    'align',
    'link', 'image',
  ];

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }
    if (!content.trim() || content === '<p><br></p>') {
      alert('내용을 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      if (isEdit) {
        await adminResourceAPI.update(id!, {
          title: title.trim(),
          content,
          thumbnailUrl,
        });
        alert('게시글이 수정되었습니다.');
      } else {
        await adminResourceAPI.create({
          title: title.trim(),
          content,
          thumbnailUrl,
        });
        alert('게시글이 등록되었습니다.');
      }
      navigate('/resources');
    } catch (error) {
      alert(isEdit ? '수정에 실패했습니다.' : '등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('작성을 취소하시겠습니까? 입력한 내용은 저장되지 않습니다.')) {
      navigate('/resources');
    }
  };

  if (loading && isEdit) {
    return (
      <Container>
        <PageTitle>{isEdit ? '입시자료실 수정' : '입시자료실 등록'}</PageTitle>
        <LoadingText>로딩 중...</LoadingText>
      </Container>
    );
  }

  return (
    <Container>
      <PageTitle>{isEdit ? '입시자료실 수정' : '입시자료실 등록'}</PageTitle>

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
          <FormLabel>썸네일 이미지 (선택)</FormLabel>
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
          <FormLabel>내용 *</FormLabel>
          <EditorWrapper>
            <ReactQuill
              ref={quillRef}
              theme="snow"
              value={content}
              onChange={setContent}
              modules={modules}
              formats={formats}
              placeholder="내용을 입력해주세요"
            />
          </EditorWrapper>
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

const EditorWrapper = styled.div`
  .ql-container {
    min-height: 300px;
    font-size: 14px;
  }

  .ql-editor {
    min-height: 300px;
  }

  .ql-toolbar {
    border-top-left-radius: 6px;
    border-top-right-radius: 6px;
    background: #f8f9fa;
  }

  .ql-container {
    border-bottom-left-radius: 6px;
    border-bottom-right-radius: 6px;
  }

  .ql-editor img {
    max-width: 100%;
    height: auto;
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

export default ResourceWritePage;
