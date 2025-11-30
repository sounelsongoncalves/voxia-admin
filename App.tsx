
import React, { useState, useEffect } from 'react';
import { supabase } from './services/supabase';
import { HashRouter as Router, Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { AdminRouteGuard } from './components/AdminRouteGuard';
import { Copilot } from './components/Copilot';
import { AdminLogin } from './pages/AdminLogin';
import { AdminHome } from './pages/AdminHome';
import { LiveMap } from './pages/LiveMap';
import { TripsList } from './pages/TripsList';
import { TripDetail } from './pages/TripDetail';
import { CreateTrip } from './pages/CreateTrip';
import { AssignTrip } from './pages/AssignTrip';
import { VehiclesList } from './pages/VehiclesList';
import { CreateVehicle } from './pages/CreateVehicle';
import { VehicleDetail } from './pages/VehicleDetail';
import { TrailersList } from './pages/TrailersList';
import { CreateTrailer } from './pages/CreateTrailer';
import { DriversList } from './pages/DriversList';
import { CreateDriver } from './pages/CreateDriver';
import { DriverDetail } from './pages/DriverDetail';
import { Alerts } from './pages/Alerts';
import { Settings } from './pages/Settings';
import { CreateUser } from './pages/CreateUser';
import { Reports } from './pages/Reports';
import { ChatCenter } from './pages/ChatCenter';
import { Geofences } from './pages/Geofences';
import { Maintenance } from './pages/Maintenance';
import { AuditLogs } from './pages/AuditLogs';
import { AdminOnboarding } from './pages/AdminOnboarding';
import { CopilotPage } from './pages/CopilotPage';
import { FileManager } from './pages/FileManager';
import { Setup } from './pages/Setup';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  // Initialize based on screen width: Open on desktop, Closed on mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth >= 768);
  const isNoLayoutPage = ['/login', '/onboarding', '/setup'].includes(location.pathname);

  if (isNoLayoutPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-bg-main text-txt-primary font-sans">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden relative transition-all duration-300">
        {/* Topbar */}
        <Topbar onToggleSidebar={() => setIsSidebarOpen(prev => !prev)} />

        {/* Conteúdo das páginas */}
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-[1600px] mx-auto h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

import { ToastProvider } from './components/ToastContext';
import { AppSettingsProvider } from './components/AppSettingsContext';
import { UserProvider, useUser } from './components/UserContext';

import { Topbar } from './components/Topbar';

const App: React.FC = () => {
  return (
    <Router>
      <AppSettingsProvider>
        <UserProvider>
          <ToastProvider>
            <Layout>
              <Routes>
                <Route path="/login" element={<AdminLogin />} />
                <Route path="/onboarding" element={<AdminOnboarding />} />
                <Route path="/setup" element={<Setup />} />
                <Route path="/" element={<AdminRouteGuard><AdminHome /></AdminRouteGuard>} />
                <Route path="/map" element={<AdminRouteGuard><LiveMap /></AdminRouteGuard>} />
                <Route path="/trips" element={<AdminRouteGuard><TripsList /></AdminRouteGuard>} />
                <Route path="/trips/create" element={<AdminRouteGuard><CreateTrip /></AdminRouteGuard>} />
                <Route path="/trips/:id" element={<AdminRouteGuard><TripDetail /></AdminRouteGuard>} />
                <Route path="/trips/:id/assign" element={<AdminRouteGuard><AssignTrip /></AdminRouteGuard>} />
                <Route path="/vehicles" element={<AdminRouteGuard><VehiclesList /></AdminRouteGuard>} />
                <Route path="/vehicles/create" element={<AdminRouteGuard><CreateVehicle /></AdminRouteGuard>} />
                <Route path="/vehicles/:id" element={<AdminRouteGuard><VehicleDetail /></AdminRouteGuard>} />
                <Route path="/trailers" element={<AdminRouteGuard><TrailersList /></AdminRouteGuard>} />
                <Route path="/trailers/create" element={<AdminRouteGuard><CreateTrailer /></AdminRouteGuard>} />
                <Route path="/trailers/edit/:id" element={<AdminRouteGuard><CreateTrailer /></AdminRouteGuard>} />
                <Route path="/drivers" element={<AdminRouteGuard><DriversList /></AdminRouteGuard>} />
                <Route path="/drivers/create" element={<AdminRouteGuard><CreateDriver /></AdminRouteGuard>} />
                <Route path="/drivers/:id" element={<AdminRouteGuard><DriverDetail /></AdminRouteGuard>} />
                <Route path="/alerts" element={<AdminRouteGuard><Alerts /></AdminRouteGuard>} />
                <Route path="/reports" element={<AdminRouteGuard><Reports /></AdminRouteGuard>} />
                <Route path="/geofences" element={<AdminRouteGuard><Geofences /></AdminRouteGuard>} />
                <Route path="/maintenance" element={<AdminRouteGuard><Maintenance /></AdminRouteGuard>} />
                <Route path="/audit" element={<AdminRouteGuard><AuditLogs /></AdminRouteGuard>} />
                <Route path="/settings" element={<AdminRouteGuard><Settings /></AdminRouteGuard>} />
                <Route path="/users" element={<AdminRouteGuard><Settings initialTab="users" /></AdminRouteGuard>} />
                <Route path="/settings/users/create" element={<AdminRouteGuard><CreateUser /></AdminRouteGuard>} />
                <Route path="/chat" element={<AdminRouteGuard><ChatCenter /></AdminRouteGuard>} />
                <Route path="/files" element={<AdminRouteGuard><FileManager /></AdminRouteGuard>} />
                <Route path="/copilot" element={<AdminRouteGuard><CopilotPage /></AdminRouteGuard>} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </ToastProvider>
        </UserProvider>
      </AppSettingsProvider>
    </Router>
  );
};

export default App;
