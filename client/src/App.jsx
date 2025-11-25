import { Route, Routes } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard.jsx';
import ProjectDetailPage from './pages/ProjectDetailPage.jsx';
import EmployeePortal from './pages/EmployeePortal.jsx';
import DailyUpdateChart from './pages/DailyUpdateChart.jsx';
import EmployeeChecklist from './pages/EmployeeChecklist.jsx';
import AdminEmployeeChecklistViewer from './pages/AdminEmployeeChecklistViewer.jsx';
import ClientPortal from './pages/ClientPortal.jsx';
import ProjectAnalysis from './pages/ProjectAnalysis.jsx';
import AdminChat from './pages/AdminChat.jsx';
import ClientChat from './pages/ClientChat.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import RoleGuard from './components/RoleGuard.jsx';
import RoleBasedRedirect from './components/RoleBasedRedirect.jsx';
import LayoutShell from './components/LayoutShell.jsx';
import LandingPage from './pages/landingPage.jsx';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route
        element={
          <ProtectedRoute>
            <LayoutShell />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<RoleBasedRedirect />} />
        
        {/* Admin only routes */}
        <Route
          path="/admin"
          element={
            <RoleGuard allowedRoles={['admin']}>
              <AdminDashboard />
            </RoleGuard>
          }
        />
        <Route
          path="/analysis"
          element={
            <RoleGuard allowedRoles={['admin']}>
              <ProjectAnalysis />
            </RoleGuard>
          }
        />
        <Route
          path="/admin/employee-checklist"
          element={
            <RoleGuard allowedRoles={['admin']}>
              <AdminEmployeeChecklistViewer />
            </RoleGuard>
          }
        />
        <Route
          path="/admin/chat"
          element={
            <RoleGuard allowedRoles={['admin']}>
              <AdminChat />
            </RoleGuard>
          }
        />
        
        {/* Employee routes (employees and applicants) */}
        <Route
          path="/employee"
          element={
            <RoleGuard allowedRoles={['employee', 'applicant']}>
              <EmployeePortal />
            </RoleGuard>
          }
        />
        <Route
          path="/employee/daily-chart"
          element={
            <RoleGuard allowedRoles={['employee', 'applicant']}>
              <DailyUpdateChart />
            </RoleGuard>
          }
        />
        <Route
          path="/employee/checklist"
          element={
            <RoleGuard allowedRoles={['employee', 'applicant']}>
              <EmployeeChecklist />
            </RoleGuard>
          }
        />
        
        {/* Client only routes */}
        <Route
          path="/client"
          element={
            <RoleGuard allowedRoles={['client']}>
              <ClientPortal />
            </RoleGuard>
          }
        />
        <Route
          path="/client/chat"
          element={
            <RoleGuard allowedRoles={['client']}>
              <ClientChat />
            </RoleGuard>
          }
        />
        
        {/* Project details - accessible by admin and assigned employees */}
        <Route
          path="/projects/:projectId"
          element={
            <RoleGuard allowedRoles={['admin', 'employee', 'client']}>
              <ProjectDetailPage />
            </RoleGuard>
          }
        />
      </Route>
    </Routes>
  );
};

export default App;

