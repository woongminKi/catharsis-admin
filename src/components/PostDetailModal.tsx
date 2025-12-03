import React, { useState } from 'react';
import styled from 'styled-components';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { adminConsultationAPI } from '../utils/api';

interface Comment {
  _id: string;
  author: string;
  content: string;
  createdAt: string;
}

interface Post {
  _id: string;
  title: string;
  content: string;
  writerId: string;
  boardType: string;
  isSecret: boolean;
  status: string;
  viewCount: number;
  comments: Comment[];
  createdAt: string;
}

interface PostDetailModalProps {
  post: Post;
  onClose: () => void;
  onCommentSubmit: (content: string) => Promise<void>;
  onRefresh: () => void;
}

const PostDetailModal: React.FC<PostDetailModalProps> = ({
  post,
  onClose,
  onCommentSubmit,
  onRefresh,
}) => {
  const [mode, setMode] = useState<'view' | 'edit' | 'reply'>('view');
  const [replyContent, setReplyContent] = useState('');
  const [editData, setEditData] = useState({
    title: post.title,
    content: post.content,
    isSecret: post.isSecret,
  });
  const [submitting, setSubmitting] = useState(false);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const handleReplySubmit = async () => {
    if (!replyContent.trim()) {
      alert('답변 내용을 입력해주세요.');
      return;
    }

    setSubmitting(true);
    try {
      await onCommentSubmit(replyContent);
      setReplyContent('');
      setMode('view');
      alert('답변이 등록되었습니다.');
    } catch (error) {
      alert('답변 등록에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async () => {
    setSubmitting(true);
    try {
      await adminConsultationAPI.update(post._id, editData);
      alert('수정되었습니다.');
      onRefresh();
      onClose();
    } catch (error) {
      alert('수정에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('이 게시글을 삭제하시겠습니까?')) return;

    try {
      await adminConsultationAPI.delete(post._id);
      alert('삭제되었습니다.');
      onRefresh();
      onClose();
    } catch (error) {
      alert('삭제에 실패했습니다.');
    }
  };

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'image'],
      ['clean'],
    ],
  };

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>게시글 통합 관리</ModalTitle>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>

        <ModalContent>
          {mode === 'view' && (
            <>
              <PostHeader>
                <PostTitle>{post.title}</PostTitle>
                <PostMeta>
                  <span>{post.writerId}</span>
                  <span>{formatDate(post.createdAt)}</span>
                  <span>조회 {post.viewCount}</span>
                </PostMeta>
              </PostHeader>

              <PostBody dangerouslySetInnerHTML={{ __html: post.content }} />

              {post.comments && post.comments.length > 0 && (
                <CommentsSection>
                  <CommentsTitle>답변</CommentsTitle>
                  {post.comments.map((comment) => (
                    <CommentItem key={comment._id}>
                      <CommentContent>{comment.content}</CommentContent>
                    </CommentItem>
                  ))}
                </CommentsSection>
              )}

              <ModalActions>
                <ActionButton onClick={onClose}>목록</ActionButton>
                <ActionButton onClick={() => setMode('edit')}>수정</ActionButton>
                <ActionButton onClick={handleDelete}>삭제</ActionButton>
                <ActionButton $primary onClick={() => setMode('reply')}>
                  답변쓰기
                </ActionButton>
                <ActionButton onClick={onClose}>글쓰기</ActionButton>
              </ModalActions>
            </>
          )}

          {mode === 'edit' && (
            <>
              <FormGroup>
                <FormRow>
                  <FormLabel>작성자</FormLabel>
                  <FormInput value={post.writerId} disabled />
                </FormRow>
                <FormRow>
                  <FormLabel>비밀번호</FormLabel>
                  <FormInput value="****" disabled />
                </FormRow>
              </FormGroup>

              <FormRow>
                <FormLabel>제목</FormLabel>
                <FormInput
                  value={editData.title}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                />
              </FormRow>

              <CheckboxRow>
                <input
                  type="checkbox"
                  checked={editData.isSecret}
                  onChange={(e) => setEditData({ ...editData, isSecret: e.target.checked })}
                />
                <span>비밀글</span>
              </CheckboxRow>

              <EditorWrapper>
                <ReactQuill
                  theme="snow"
                  value={editData.content}
                  onChange={(value) => setEditData({ ...editData, content: value })}
                  modules={quillModules}
                />
              </EditorWrapper>

              <ModalActions>
                <ActionButton onClick={() => setMode('view')}>취소</ActionButton>
                <ActionButton $primary onClick={handleEditSubmit} disabled={submitting}>
                  {submitting ? '저장 중...' : '저장'}
                </ActionButton>
              </ModalActions>
            </>
          )}

          {mode === 'reply' && (
            <>
              <PostHeader>
                <PostTitle>{post.title}</PostTitle>
                <PostMeta>
                  <span>{post.writerId}</span>
                  <span>{formatDate(post.createdAt)}</span>
                </PostMeta>
              </PostHeader>

              <PostBody dangerouslySetInnerHTML={{ __html: post.content }} />

              <ReplySection>
                <ReplyTitle>답변 작성</ReplyTitle>
                <EditorWrapper>
                  <ReactQuill
                    theme="snow"
                    value={replyContent}
                    onChange={setReplyContent}
                    modules={quillModules}
                    placeholder="답변 내용을 입력하세요..."
                  />
                </EditorWrapper>
              </ReplySection>

              <ModalActions>
                <ActionButton onClick={() => setMode('view')}>취소</ActionButton>
                <ActionButton $primary onClick={handleReplySubmit} disabled={submitting}>
                  {submitting ? '등록 중...' : '답변 등록'}
                </ActionButton>
              </ModalActions>
            </>
          )}
        </ModalContent>
      </Modal>
    </Overlay>
  );
};

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const Modal = styled.div`
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #eee;
  background: #f8f9fa;
`;

const ModalTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #333;
`;

const CloseButton = styled.button`
  font-size: 24px;
  color: #999;
  background: none;

  &:hover {
    color: #333;
  }
`;

const ModalContent = styled.div`
  padding: 24px;
`;

const PostHeader = styled.div`
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
  margin-bottom: 20px;
`;

const PostTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #333;
`;

const PostMeta = styled.div`
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #666;
`;

const PostBody = styled.div`
  min-height: 150px;
  padding: 20px 0;
  line-height: 1.8;
  color: #333;

  img {
    max-width: 100%;
  }
`;

const CommentsSection = styled.div`
  margin-top: 24px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
`;

const CommentsTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px dashed #ddd;
`;

const CommentItem = styled.div`
  padding: 12px 0;

  &:not(:last-child) {
    border-bottom: 1px solid #eee;
  }
`;

const CommentContent = styled.div`
  font-size: 14px;
  line-height: 1.6;
  color: #333;
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #eee;
`;

const ActionButton = styled.button<{ $primary?: boolean }>`
  padding: 10px 20px;
  background: ${({ $primary }) => ($primary ? '#4dabf7' : 'white')};
  color: ${({ $primary }) => ($primary ? 'white' : '#333')};
  border: 1px solid ${({ $primary }) => ($primary ? '#4dabf7' : '#ddd')};
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;

  &:hover:not(:disabled) {
    background: ${({ $primary }) => ($primary ? '#339af0' : '#f8f9fa')};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const FormGroup = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 16px;
`;

const FormRow = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const FormLabel = styled.label`
  font-size: 13px;
  font-weight: 500;
  color: #555;
  min-width: 60px;
`;

const FormInput = styled.input`
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 13px;

  &:disabled {
    background: #f5f5f5;
  }
`;

const CheckboxRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 14px;
`;

const EditorWrapper = styled.div`
  .ql-container {
    min-height: 200px;
  }

  .ql-editor {
    min-height: 200px;
  }
`;

const ReplySection = styled.div`
  margin-top: 24px;
  padding-top: 24px;
  border-top: 2px solid #eee;
`;

const ReplyTitle = styled.h4`
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #333;
`;

export default PostDetailModal;
