import { Show } from 'solid-js';
import { AppProvider, useApp } from './store/AppStore';
import { Login } from './components/Login';
import { BottomNavigation } from './components/BottomNavigation';
import { AudioPlayer } from './components/AudioPlayer';
import { HomePage } from './pages/HomePage';
import { MutunPage } from './pages/MutunPage';
import { HalaqatPage } from './pages/HalaqatPage';
import { UsersPage } from './pages/UsersPage';
import { NewsPage } from './pages/NewsPage';
import { MorePage } from './pages/MorePage';

function AppContent() {
  const app = useApp();
  
  const renderCurrentPage = () => {
    switch (app.currentPage()) {
      case 'home': return <HomePage />;
      case 'mutuun': return <MutunPage />;
      case 'halaqat': return <HalaqatPage />;
      case 'users': return <UsersPage />;
      case 'news': return <NewsPage />;
      case 'more': return <MorePage />;
      default: return <HomePage />;
    }
  };
  
  return (
    <div style={{
      'min-height': '100vh',
      'background-color': 'var(--color-surface)',
      'font-family': 'system-ui, -apple-system, sans-serif'
    }}>
      <Show 
        when={app.isAuthenticated()}
        fallback={<Login />}
      >
        {renderCurrentPage()}
        <BottomNavigation />
        <AudioPlayer />
      </Show>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
