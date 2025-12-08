import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import GlobalStyle from './styles/GlobalStyle';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import PostsPage from './pages/PostsPage';
import DeletedPostsPage from './pages/DeletedPostsPage';
import PassersPage from './pages/PassersPage';
import PasserWritePage from './pages/PasserWritePage';
import NoticesPage from './pages/NoticesPage';
import NoticeWritePage from './pages/NoticeWritePage';

const App: React.FC = () => {
  const { isAuthenticated, loading, login, logout, admin } = useAuth();

  if (loading) {
    return (
      <>
        <GlobalStyle />
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: '#f5f5f5'
        }}>
          로딩 중...
        </div>
      </>
    );
  }

  return (
    <>
      <GlobalStyle />
      <Router>
        <Routes>
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to="/posts" replace />
              ) : (
                <LoginPage onLogin={login} />
              )
            }
          />
          <Route
            path="/posts"
            element={
              isAuthenticated ? (
                <Layout onLogout={logout} adminName={admin?.name}>
                  <PostsPage />
                </Layout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/posts/deleted"
            element={
              isAuthenticated ? (
                <Layout onLogout={logout} adminName={admin?.name}>
                  <DeletedPostsPage />
                </Layout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/passers"
            element={
              isAuthenticated ? (
                <Layout onLogout={logout} adminName={admin?.name}>
                  <PassersPage />
                </Layout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/passers/write"
            element={
              isAuthenticated ? (
                <Layout onLogout={logout} adminName={admin?.name}>
                  <PasserWritePage />
                </Layout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/passers/write/:id"
            element={
              isAuthenticated ? (
                <Layout onLogout={logout} adminName={admin?.name}>
                  <PasserWritePage />
                </Layout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/notices"
            element={
              isAuthenticated ? (
                <Layout onLogout={logout} adminName={admin?.name}>
                  <NoticesPage />
                </Layout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/notices/write"
            element={
              isAuthenticated ? (
                <Layout onLogout={logout} adminName={admin?.name}>
                  <NoticeWritePage />
                </Layout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/notices/write/:id"
            element={
              isAuthenticated ? (
                <Layout onLogout={logout} adminName={admin?.name}>
                  <NoticeWritePage />
                </Layout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route path="*" element={<Navigate to={isAuthenticated ? '/posts' : '/login'} replace />} />
        </Routes>
      </Router>
    </>
  );
};

export default App;
