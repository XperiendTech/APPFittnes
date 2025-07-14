
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from './context/UserContext';
import Layout from './components/layout/Layout';
import ProfileSetup from './pages/ProfileSetup';
import Dashboard from './pages/Dashboard';
import Workout from './pages/Workout';
import Nutrition from './pages/Nutrition';
import Progress from './pages/Progress';
import Settings from './pages/Settings';
import Library from './pages/Library';
import ProfileManager from './pages/ProfileManager';

const AppRoutes: React.FC = () => {
  const { activeUser, users, loading } = useUser();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-brand-dark">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-brand-primary"></div>
      </div>
    );
  }
  
  if (activeUser) {
    return (
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/workout" element={<Workout />} />
          <Route path="/library" element={<Library />} />
          <Route path="/nutrition" element={<Nutrition />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    );
  }
  
  return (
    <Routes>
      <Route path="/profiles" element={<ProfileManager />} />
      <Route path="/setup" element={<ProfileSetup />} />
      <Route path="*" element={<Navigate to={users.length > 0 ? "/profiles" : "/setup"} />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <UserProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </UserProvider>
  );
};

export default App;
