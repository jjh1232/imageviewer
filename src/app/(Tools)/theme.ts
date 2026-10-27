/**
 * 고른 테마를 남기는 localStorage 키. app/layout.tsx 의 첫 그림 스크립트와 ThemeToggle 이 같이 쓴다.
 * "use client" 파일에 두면 서버 컴포넌트(layout)에서 문자열이 아니라 참조로 읽혀 따로 뺐다.
 */
export const THEME_KEY = "theme";
