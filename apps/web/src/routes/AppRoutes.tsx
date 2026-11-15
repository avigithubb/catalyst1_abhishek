import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthLayout } from '@/layouts/AuthLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { LandingPage } from '@/modules/patient/pages/LandingPage';
import { LoginPage } from '@/modules/auth/pages/LoginPage';
import { SignupPage } from '@/modules/auth/pages/SignupPage';
import { PatientDashboardPage } from '@/modules/patient/pages/PatientDashboardPage';
import { MedicationsPage } from '@/modules/patient/pages/MedicationsPage';
import { ExercisesPage } from '@/modules/patient/pages/ExercisesPage';
import { CaregiversPage } from '@/modules/caregiver/pages/CaregiversPage';
import { SecurityAuditPage } from '@/modules/admin/pages/SecurityAuditPage';
import { ROUTES } from './routeConfig';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Landing Page */}
      <Route path={ROUTES.HOME} element={<LandingPage />} />

      {/* Public Authentication routes */}
      <Route element={<AuthLayout />}>
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.SIGNUP} element={<SignupPage />} />
      </Route>

      {/* Authenticated Dashboard routes */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path={ROUTES.DASHBOARD} element={<PatientDashboardPage />} />
        <Route path={ROUTES.MEDICATIONS} element={<MedicationsPage />} />
        <Route path={ROUTES.EXERCISES} element={<ExercisesPage />} />
        <Route path={ROUTES.CAREGIVERS} element={<CaregiversPage />} />
        <Route path={ROUTES.SECURITY} element={<SecurityAuditPage />} />
        <Route path={ROUTES.SETTINGS} element={<SecurityAuditPage />} />
        <Route path={ROUTES.APPOINTMENTS} element={<PatientDashboardPage />} />
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
    </Routes>
  );
};
