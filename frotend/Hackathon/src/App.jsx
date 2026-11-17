import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CivicProvider } from './context/CivicContext';
import Layout from './components/Layout';
import ProtectedDepartmentRoute from './components/ProtectedDepartmentRoute';

// Citizen View Pages
import Dashboard from './pages/Dashboard';
import RaiseIssue from './pages/RaiseIssue';
import MyComplaints from './pages/MyComplaints';
import TrackStatus from './pages/TrackStatus';
import NotificationsPage from './pages/NotificationsPage';
import Reports from './pages/Reports';
import About from './pages/About';
import Settings from './pages/Settings';

// Department Command View Pages
import CommandDashboard from './pages/department/CommandDashboard';
import IncomingComplaints from './pages/department/IncomingComplaints';
import AssignedComplaints from './pages/department/AssignedComplaints';
import OfficerManagement from './pages/department/OfficerManagement';
import EscalatedComplaints from './pages/department/EscalatedComplaints';
import ResolvedComplaints from './pages/department/ResolvedComplaints';

export default function App() {
  return (
    <CivicProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            {/* Citizen View Routes */}
            <Route index element={<Dashboard />} />
            <Route path="raise-issue" element={<RaiseIssue />} />
            <Route path="my-complaints" element={<MyComplaints />} />
            <Route path="track-status" element={<TrackStatus />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="profile" element={<Settings />} />
            <Route path="reports" element={<Reports />} />
            <Route path="about" element={<About />} />
            <Route path="settings" element={<Settings />} />

            {/* Department Command & Control Centre Protected Routes */}
            <Route
              path="dept/dashboard"
              element={
                <ProtectedDepartmentRoute>
                  <CommandDashboard />
                </ProtectedDepartmentRoute>
              }
            />
            <Route
              path="dept/incoming"
              element={
                <ProtectedDepartmentRoute>
                  <IncomingComplaints />
                </ProtectedDepartmentRoute>
              }
            />
            <Route
              path="dept/assigned"
              element={
                <ProtectedDepartmentRoute>
                  <AssignedComplaints />
                </ProtectedDepartmentRoute>
              }
            />
            <Route
              path="dept/officers"
              element={
                <ProtectedDepartmentRoute>
                  <OfficerManagement />
                </ProtectedDepartmentRoute>
              }
            />
            <Route
              path="dept/escalated"
              element={
                <ProtectedDepartmentRoute>
                  <EscalatedComplaints />
                </ProtectedDepartmentRoute>
              }
            />
            <Route
              path="dept/resolved"
              element={
                <ProtectedDepartmentRoute>
                  <ResolvedComplaints />
                </ProtectedDepartmentRoute>
              }
            />
            <Route
              path="dept/analytics"
              element={
                <ProtectedDepartmentRoute>
                  <Reports />
                </ProtectedDepartmentRoute>
              }
            />
            <Route
              path="dept/notifications"
              element={
                <ProtectedDepartmentRoute>
                  <NotificationsPage />
                </ProtectedDepartmentRoute>
              }
            />
            <Route
              path="dept/settings"
              element={
                <ProtectedDepartmentRoute>
                  <Settings />
                </ProtectedDepartmentRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CivicProvider>
  );
}
