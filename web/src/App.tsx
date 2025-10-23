import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/utils/firebase';
import { useAuthStore } from '@/context/authContext';

// Pages
import DashboardPage from '@/pages/DashboardProduction';
import EditorPage from '@/pages/Editor';
import FilesPage from '@/pages/Files';
import MergePage from '@/pages/MergeEnhanced';
import SplitPage from '@/pages/SplitEnhanced';
import ConvertPage from '@/pages/ConvertAdvanced';
import CloudPage from '@/pages/Cloud';
import CollabPage from '@/pages/Collab';
import HistoryPage from '@/pages/History';
import SettingsPage from '@/pages/Settings';
import HelpPage from '@/pages/Help';
import NotFoundPage from '@/pages/NotFound';

// Components
import LoadingScreen from '@/components/LoadingScreen';
import ErrorBoundary from '@/components/ErrorBoundary';

function App() {
  const { setUser, setLoading } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Initialize auth state
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName || undefined,
          email: firebaseUser.email || undefined,
          photoURL: firebaseUser.photoURL || undefined,
          role: 'free',
          plan: 'free',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      } else {
        setUser(null);
      }
      setIsInitializing(false);
      setLoading(false);
    });

    return unsubscribe;
  }, [setUser, setLoading]);

  if (isInitializing) {
    return <LoadingScreen />;
  }

  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          {/* Public routes - Direct access to dashboard */}
          <Route path="/" element={<DashboardPage />} />
          <Route path="/login" element={<DashboardPage />} />

          {/* All routes accessible without login */}
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/files" element={<FilesPage />} />
          <Route path="/editor/:fileId" element={<EditorPage />} />
          <Route path="/merge" element={<MergePage />} />
          <Route path="/split" element={<SplitPage />} />
          <Route path="/convert" element={<ConvertPage />} />
          <Route path="/convert/image" element={<ConvertPage />} />
          <Route path="/convert/word" element={<ConvertPage />} />
          <Route path="/convert/excel" element={<ConvertPage />} />
          <Route path="/convert/ppt" element={<ConvertPage />} />
          <Route path="/cloud" element={<CloudPage />} />
          <Route path="/collaborate" element={<CollabPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/help" element={<HelpPage />} />

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
      <Toaster
        position="bottom-right"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e293b',
            color: '#fff',
            borderRadius: '0.5rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          },
          success: {
            duration: 3000,
            style: {
              background: '#10b981',
            },
          },
          error: {
            duration: 4000,
            style: {
              background: '#ef4444',
            },
          },
        }}
      />
    </ErrorBoundary>
  );
}

export default App;
