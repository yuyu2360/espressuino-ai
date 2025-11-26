
import { useTheme } from '../context/ThemeContext';
import { useAuthStore } from '../store/authStore';
import { useNavigationStore } from '../store/navigationStore';
import '../styles/Header.css';

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const { profile, signOut } = useAuthStore();
  const { currentPage, navigateTo } = useNavigationStore();

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-left">
          <h1 className="app-title">Espresso Control</h1>
          <span className="account-type">{profile?.accountType === 'guest' ? 'Guest' : 'Account'}</span>
        </div>

        <nav className="header-nav">
          <button
            className={`nav-link ${currentPage === 'dashboard' ? 'active' : ''}`}
            onClick={() => navigateTo('dashboard')}
          >
            Dashboard
          </button>
          <button
            className={`nav-link ${currentPage === 'profiles' ? 'active' : ''}`}
            onClick={() => navigateTo('profiles')}
          >
            Brew Profiles
          </button>
        </nav>

        <div className="header-right">
          <button className="btn-icon theme-toggle" onClick={toggleTheme} title="Toggle theme">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          <button className="btn-secondary" onClick={signOut}>
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
}
