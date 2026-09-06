import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ToastProvider } from './components/ui/Toast';
import { AppShell } from './components/layout/AppShell';
import { LandingPage } from './routes/LandingPage';
import { DashboardPage } from './routes/DashboardPage';
import { BatchListPage } from './routes/BatchListPage';
import { BatchDetailPage } from './routes/BatchDetailPage';
import { BatchUploadPage } from './routes/BatchUploadPage';
import { BeneficiaryListPage } from './routes/BeneficiaryListPage';
import { BeneficiaryDetailPage } from './routes/BeneficiaryDetailPage';
import { TrackingPage } from './routes/TrackingPage';
import { GrievancesPage } from './routes/GrievancesPage';
import { ReportsPage } from './routes/ReportsPage';
import { DirectoryPage } from './routes/DirectoryPage';
import { SettingsPage } from './routes/SettingsPage';
import { RoleGate } from './routes/RoleGate';

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter basename="/coins">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/batches" element={<BatchListPage />} />
            <Route path="/batches/upload" element={<BatchUploadPage />} />
            <Route path="/batches/:id" element={<BatchDetailPage />} />
            <Route path="/beneficiaries" element={<BeneficiaryListPage />} />
            <Route path="/beneficiaries/:id" element={<BeneficiaryDetailPage />} />
            <Route path="/tracking" element={<TrackingPage />} />
            <Route path="/grievances" element={<GrievancesPage />} />
            <Route
              path="/reports"
              element={
                <RoleGate allow="titan_admin">
                  <ReportsPage />
                </RoleGate>
              }
            />
            <Route path="/directory" element={<DirectoryPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}
