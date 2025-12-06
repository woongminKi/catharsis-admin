import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

interface LayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
  adminName?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, onLogout, adminName }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <Container>
      <Sidebar>
        <Logo>카타르시스 관리자</Logo>
        <Nav>
          <NavItem to="/posts" end>
            게시글 통합 관리
          </NavItem>
          <NavItem to="/posts/deleted">
            삭제된 게시글 관리
          </NavItem>
          <NavDivider />
          <NavItem to="/passers" end>
            실시간 합격자 관리
          </NavItem>
        </Nav>
        <SidebarFooter>
          <AdminInfo>{adminName || '관리자'}님</AdminInfo>
        </SidebarFooter>
      </Sidebar>
      <Main>
        <Header>
          <HeaderTitle>관리자 페이지</HeaderTitle>
          <HeaderActions>
            <LogoutButton onClick={handleLogout}>로그아웃</LogoutButton>
          </HeaderActions>
        </Header>
        <Content>{children}</Content>
      </Main>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  min-height: 100vh;
`;

const Sidebar = styled.aside`
  width: 240px;
  background: #1a1a2e;
  color: white;
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  left: 0;
  top: 0;
`;

const Logo = styled.div`
  padding: 24px 20px;
  font-size: 18px;
  font-weight: 700;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const Nav = styled.nav`
  flex: 1;
  padding: 20px 0;
`;

const NavItem = styled(NavLink)`
  display: block;
  padding: 14px 24px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    color: white;
  }

  &.active {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border-left: 3px solid #4dabf7;
  }
`;

const NavDivider = styled.div`
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 12px 0;
`;

const SidebarFooter = styled.div`
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const AdminInfo = styled.div`
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
`;

const Main = styled.main`
  flex: 1;
  margin-left: 240px;
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  background: white;
  padding: 16px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0;
  z-index: 100;
`;

const HeaderTitle = styled.h1`
  font-size: 18px;
  font-weight: 600;
  color: #333;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 12px;
`;

const LogoutButton = styled.button`
  padding: 8px 16px;
  background: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 13px;
  color: #666;
  transition: all 0.2s;

  &:hover {
    background: #e9ecef;
  }
`;

const Content = styled.div`
  flex: 1;
  padding: 32px;
  background: #f5f5f5;
`;

export default Layout;
