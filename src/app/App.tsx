import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AppProvider } from './context/AppContext';
import { useEffect, useState } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Toaster } from 'sonner';

function AppContent() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // 초기 렌더링 완료 후 준비 상태로 변경
    setIsReady(true);
  }, []);

  if (!isReady) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-white">
        <div className="w-16 h-16 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  return <RouterProvider router={router} />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <div className="w-full flex justify-center bg-gray-100 min-h-screen">
        <div className="w-full md:max-w-[480px] bg-white min-h-screen">
          <AppProvider>
            <AppContent />
            <Toaster 
              position="top-center" 
              expand={false}
              richColors
              toastOptions={{
                style: { 
                  fontFamily: "'Noto Sans KR', sans-serif",
                  maxWidth: '100%',
                },
              }}
            />
          </AppProvider>
        </div>
      </div>
    </ErrorBoundary>
  );
}