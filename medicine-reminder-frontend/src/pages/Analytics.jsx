import { useNavigate } from 'react-router-dom';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import useAuth from '../hooks/useAuth';
import { useState } from 'react';

export default function Analytics() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        onLogout={() => {
          logout();
          navigate('/logout');
        }}
      />

      <div className="flex min-h-screen flex-1 flex-col">
        <Navbar
          onMenuToggle={() => setSidebarOpen((prev) => !prev)}
          user={user}
          onLogout={() => {
            logout();
            navigate('/logout');
          }}
        />

        <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8">
          <AnalyticsDashboard />
        </main>
      </div>
    </div>
  );
}