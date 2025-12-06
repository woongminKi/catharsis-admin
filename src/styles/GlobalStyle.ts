import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: 'Pretendard';
    font-weight: 100;
    src: url('/fonts/Pretendard-Thin.woff') format('woff');
  }
  @font-face {
    font-family: 'Pretendard';
    font-weight: 200;
    src: url('/fonts/Pretendard-ExtraLight.woff') format('woff');
  }
  @font-face {
    font-family: 'Pretendard';
    font-weight: 300;
    src: url('/fonts/Pretendard-Light.woff') format('woff');
  }
  @font-face {
    font-family: 'Pretendard';
    font-weight: 400;
    src: url('/fonts/Pretendard-Regular.woff') format('woff');
  }
  @font-face {
    font-family: 'Pretendard';
    font-weight: 500;
    src: url('/fonts/Pretendard-Medium.woff') format('woff');
  }
  @font-face {
    font-family: 'Pretendard';
    font-weight: 600;
    src: url('/fonts/Pretendard-SemiBold.woff') format('woff');
  }
  @font-face {
    font-family: 'Pretendard';
    font-weight: 700;
    src: url('/fonts/Pretendard-Bold.woff') format('woff');
  }
  @font-face {
    font-family: 'Pretendard';
    font-weight: 800;
    src: url('/fonts/Pretendard-ExtraBold.woff') format('woff');
  }
  @font-face {
    font-family: 'Pretendard';
    font-weight: 900;
    src: url('/fonts/Pretendard-Black.woff') format('woff');
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: #f5f5f5;
    color: #333;
    line-height: 1.6;
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  button {
    cursor: pointer;
    border: none;
    outline: none;
    font-family: inherit;
  }

  input, textarea, select {
    font-family: inherit;
    outline: none;
  }

  table {
    border-collapse: collapse;
  }
`;

export default GlobalStyle;
