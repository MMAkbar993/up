import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './components/Dashboard'
import AdminLogin from './admin/AdminLogin'
import AdminDashboard from './admin/AdminDashboard'
import AdminUsers from './admin/AdminUsers'
import AdminPlans from './admin/AdminPlans'
import AdminDailyQuotas from './admin/AdminDailyQuotas'
import AdminAnalytics from './admin/AdminAnalytics'
import AdminActivityLogs from './admin/AdminActivityLogs'
import AdminReports from './admin/AdminReports'
import AdminBlogManagement from './admin/AdminBlogManagement'
import AdminBranding from './admin/AdminBranding'
import AdminFeatures from './admin/AdminFeatures'
import AdminSecurity from './admin/AdminSecurity'
import AdminNotifications from './admin/AdminNotifications'
import AdminSystemHealth from './admin/AdminSystemHealth'
import AdminData from './admin/AdminData'
import AdminSettings from './admin/AdminSettings'
import AdminTemplates from './admin/AdminTemplates'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/plans" element={<AdminPlans />} />
        <Route path="/admin/daily-quotas" element={<AdminDailyQuotas />} />
        <Route path="/admin/analytics" element={<AdminAnalytics />} />
        <Route path="/admin/activity-logs" element={<AdminActivityLogs />} />
        <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/admin/blog" element={<AdminBlogManagement />} />
        <Route path="/admin/branding" element={<AdminBranding />} />
        <Route path="/admin/features" element={<AdminFeatures />} />
        <Route path="/admin/security" element={<AdminSecurity />} />
        <Route path="/admin/notifications" element={<AdminNotifications />} />
        <Route path="/admin/system-health" element={<AdminSystemHealth />} />
        <Route path="/admin/data" element={<AdminData />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/admin/templates" element={<AdminTemplates />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
