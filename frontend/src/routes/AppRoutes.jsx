import { Navigate, Outlet, Route, Routes } from 'react-router-dom'

import PageLoader from '../components/common/PageLoader'
import { useAuth } from '../context/AuthContext'
import AppShell from '../layouts/AppShell'
import DashboardPage from '../pages/DashboardPage'
import LoginPage from '../pages/LoginPage'
import MyTasksPage from '../pages/MyTasksPage'
import NotFoundPage from '../pages/NotFoundPage'
import ProjectDetailsPage from '../pages/ProjectDetailsPage'
import ProjectsPage from '../pages/ProjectsPage'
import RegisterPage from '../pages/RegisterPage'

function RootRedirect() {
  const { bootstrapping, isAuthenticated } = useAuth()

  if (bootstrapping) {
    return <PageLoader label="Restoring your workspace..." fullScreen />
  }

  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />
}

function ProtectedRoute() {
  const { bootstrapping, isAuthenticated } = useAuth()

  if (bootstrapping) {
    return <PageLoader label="Loading your workspace..." fullScreen />
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}

function PublicRoute() {
  const { bootstrapping, isAuthenticated } = useAuth()

  if (bootstrapping) {
    return <PageLoader label="Checking session..." fullScreen />
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />

      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:projectId" element={<ProjectDetailsPage />} />
          <Route path="/my-tasks" element={<MyTasksPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default AppRoutes
