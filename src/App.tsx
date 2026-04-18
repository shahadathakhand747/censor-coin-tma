import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { UserProvider } from './context/UserContext';
import BottomNav from './components/BottomNav';
import SplashScreen from './pages/SplashScreen';
import VerifyPage from './pages/VerifyPage';
import HomePage from './pages/HomePage';
import EarnPage from './pages/EarnPage';
import ProfilePage from './pages/ProfilePage';
import { useDisableContextMenu } from './hooks/useDisableContextMenu';
import { useUser } from './context/UserContext';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { state, loading } = useUser();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a1a]">
        <div className="w-10 h-10 rounded-full border-4 border-yellow-400/30 border-t-yellow-400 animate-spin" />
      </div>
    );
  }
  if (!state?.membership_verified) {
    return <Navigate to="/verify" replace />;
  }
  return <>{children}</>;
}

function AppLayout({ children }: { children: React.ReactNode }) {
  useDisableContextMenu();
  return (
    <div className="relative max-w-md mx-auto min-h-screen">
      {children}
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<SplashScreen />} />
      <Route path="/verify" element={<VerifyPage />} />
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <AppLayout>
              <HomePage />
              <BottomNav />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/earn"
        element={
          <ProtectedRoute>
            <AppLayout>
              <EarnPage />
              <BottomNav />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ProfilePage />
              <BottomNav />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <UserProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL?.replace(/\/$/, '')}>
        <AppRoutes />
        <Toaster />
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;
