import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@/shared/components/layout/AppLayout';
import { AdminRouteGuard } from '@/components/AdminRouteGuard';
import { AdminLogin } from '@/pages/AdminLogin';
import { AdminOnboarding } from '@/pages/AdminOnboarding';
import { Setup } from '@/pages/Setup';
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';
import { TripsPage } from '@/features/trips/pages/TripsPage';
import { TripDetailPage } from '@/features/trips/pages/TripDetailPage';
import { CreateTripPage } from '@/features/trips/pages/CreateTripPage';

// Placeholder imports for other pages (using existing ones for now)
import { VehiclesList } from '@/pages/VehiclesList';
import { TrailersList } from '@/pages/TrailersList';
import { DriversList } from '@/pages/DriversList';
import { ChatCenter } from '@/pages/ChatCenter';
import { CopilotPage } from '@/pages/CopilotPage';
import { Alerts } from '@/pages/Alerts';
import { Reports } from '@/pages/Reports';
import { FileManager } from '@/pages/FileManager';
import { Settings } from '@/pages/Settings';
import { Fueling } from '@/pages/Fueling';

// Detail/Create pages
import { CreateTrip } from '@/pages/CreateTrip';
import { TripDetail } from '@/pages/TripDetail';
import { CreateVehicle } from '@/pages/CreateVehicle';
import { VehicleDetail } from '@/pages/VehicleDetail';
import { CreateTrailer } from '@/pages/CreateTrailer';
import { CreateDriver } from '@/pages/CreateDriver';
import { DriverDetail } from '@/pages/DriverDetail';
import { CreateUser } from '@/pages/CreateUser';
import { AssignTrip } from '@/pages/AssignTrip';
import { LiveMap } from '@/pages/LiveMap';
import { Geofences } from '@/pages/Geofences';
import { Maintenance } from '@/pages/Maintenance';
import { AuditLogs } from '@/pages/AuditLogs';

export function AppRoutes() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<AdminLogin />} />
            <Route path="/onboarding" element={<AdminOnboarding />} />
            <Route path="/setup" element={<Setup />} />

            {/* Protected Routes with Layout */}
            <Route element={<AdminRouteGuard><AppLayout /></AdminRouteGuard>}>
                <Route path="/" element={<DashboardPage />} />

                {/* Trips */}
                <Route path="/trips" element={<TripsPage />} />
                <Route path="/trips/create" element={<CreateTripPage />} />
                <Route path="/trips/:id" element={<TripDetailPage />} />
                <Route path="/trips/:id/assign" element={<AssignTrip />} />

                {/* Vehicles */}
                <Route path="/vehicles" element={<VehiclesList />} />
                <Route path="/vehicles/create" element={<CreateVehicle />} />
                <Route path="/vehicles/:id" element={<VehicleDetail />} />

                {/* Trailers */}
                <Route path="/trailers" element={<TrailersList />} />
                <Route path="/trailers/create" element={<CreateTrailer />} />
                <Route path="/trailers/edit/:id" element={<CreateTrailer />} />

                {/* Drivers */}
                <Route path="/drivers" element={<DriversList />} />
                <Route path="/drivers/create" element={<CreateDriver />} />
                <Route path="/drivers/:id" element={<DriverDetail />} />

                {/* Map */}
                <Route path="/map" element={<LiveMap />} />

                {/* Features */}
                <Route path="/chat" element={<ChatCenter />} />
                <Route path="/copilot" element={<CopilotPage />} />
                <Route path="/alerts" element={<Alerts />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/files" element={<FileManager />} />
                <Route path="/fueling" element={<Fueling />} />
                <Route path="/geofences" element={<Geofences />} />
                <Route path="/maintenance" element={<Maintenance />} />
                <Route path="/audit" element={<AuditLogs />} />

                {/* Settings */}
                <Route path="/settings" element={<Settings />} />
                <Route path="/users" element={<Settings initialTab="users" />} />
                <Route path="/settings/users/create" element={<CreateUser />} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
        </Routes>
    );
}
