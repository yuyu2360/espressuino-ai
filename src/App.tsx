import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { useNavigationStore } from './store/navigationStore';
import { ThemeProvider } from './context/ThemeContext';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { BrewProfilesPage } from './pages/BrewProfilesPage';
import './App.css';

function AppContent() {
  const { profile, fetchCurrentUser } = useAuthStore();
  const { currentPage } = useNavigationStore();

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  if (!profile) {
    return <LoginPage />;
  }

  return (
    <>
      {currentPage === 'dashboard' ? (
        <DashboardPage />
      ) : (
        <BrewProfilesPage />
      )}
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
