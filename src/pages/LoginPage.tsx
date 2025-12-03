import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

interface LoginPageProps {
  onLogin: (username: string, password: string) => Promise<void>;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('아이디와 비밀번호를 입력해주세요.');
      return;
    }

    setLoading(true);

    try {
      await onLogin(username, password);
      navigate('/posts');
    } catch (err: any) {
      setError(err.response?.data?.message || '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <LoginBox>
        <Logo>카타르시스 연기학원</Logo>
        <Subtitle>관리자 로그인</Subtitle>

        <Form onSubmit={handleSubmit}>
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <InputGroup>
            <Label>아이디</Label>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="아이디를 입력하세요"
              autoFocus
            />
          </InputGroup>

          <InputGroup>
            <Label>비밀번호</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
            />
          </InputGroup>

          <LoginButton type="submit" disabled={loading}>
            {loading ? '로그인 중...' : '로그인'}
          </LoginButton>
        </Form>
      </LoginBox>
    </Container>
  );
};

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
`;

const LoginBox = styled.div`
  background: white;
  padding: 48px 40px;
  border-radius: 16px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const Logo = styled.h1`
  font-size: 24px;
  font-weight: 700;
  text-align: center;
  color: #1a1a2e;
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  text-align: center;
  color: #666;
  font-size: 14px;
  margin-bottom: 32px;
`;

const Form = styled.form``;

const ErrorMessage = styled.div`
  background: #fff5f5;
  color: #e03131;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 13px;
  margin-bottom: 20px;
  text-align: center;
`;

const InputGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;

  &:focus {
    border-color: #4dabf7;
  }

  &::placeholder {
    color: #aaa;
  }
`;

const LoginButton = styled.button`
  width: 100%;
  padding: 14px;
  background: #1a1a2e;
  color: white;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  margin-top: 8px;
  transition: background 0.2s;

  &:hover:not(:disabled) {
    background: #2d2d44;
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

export default LoginPage;
