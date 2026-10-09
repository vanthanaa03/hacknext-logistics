import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { ManagerDashboard } from './pages/ManagerDashboard';
import { DriverDashboard } from './pages/DriverDashboard';
import { CustomerDashboard } from './pages/CustomerDashboard';

const AppContent: React.FC = () => {
  const { user, activeRole } = useAuth();

  if (!user) {
    return <LandingPage />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <Navbar />
      <div className="flex-1">
        {activeRole === 'MANAGER' && <ManagerDashboard />}
        {activeRole === 'DRIVER' && <DriverDashboard />}
        {activeRole === 'CUSTOMER' && <CustomerDashboard />}
      </div>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
