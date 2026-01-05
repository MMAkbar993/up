import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminSidebar from './AdminSidebar'
import AdminHeader from './AdminHeader'

const AdminNotifications = () => {
  const [activeNav, setActiveNav] = useState('notifications')
  const [adminEmail, setAdminEmail] = useState('admin@signage.com')
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [systemAlerts, setSystemAlerts] = useState(true)
  const [userActivityAlerts, setUserActivityAlerts] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is authenticated
    const isAuthenticated = sessionStorage.getItem('adminAuthenticated')
    if (!isAuthenticated) {
      navigate('/admin/login')
    }

    // Load notification settings from localStorage
    const savedSettings = localStorage.getItem('notificationSettings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setAdminEmail(parsed.adminEmail || 'admin@signage.com')
        setEmailNotifications(parsed.emailNotifications !== undefined ? parsed.emailNotifications : true)
        setSystemAlerts(parsed.systemAlerts !== undefined ? parsed.systemAlerts : true)
        setUserActivityAlerts(parsed.userActivityAlerts !== undefined ? parsed.userActivityAlerts : true)
      } catch (e) {
        console.error('Error parsing notification settings:', e)
      }
    }
  }, [navigate])

  const handleSaveSettings = () => {
    const settings = {
      adminEmail,
      emailNotifications,
      systemAlerts,
      userActivityAlerts
    }
    localStorage.setItem('notificationSettings', JSON.stringify(settings))
    window.dispatchEvent(new CustomEvent('notificationSettingsUpdated', { detail: settings }))
    alert('Notification settings saved successfully!')
  }

  // Mock recent notifications
  const recentNotifications = [
    {
      id: 1,
      message: 'New user registered',
      time: '2 minutes ago',
      type: 'info',
      borderColor: 'border-blue-500'
    },
    {
      id: 2,
      message: 'System backup completed',
      time: '1 hour ago',
      type: 'success',
      borderColor: 'border-green-500'
    },
    {
      id: 3,
      message: 'High API usage detected',
      time: '3 hours ago',
      type: 'warning',
      borderColor: 'border-orange-500'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />

      <div className="flex max-w-[1920px] mx-auto">
        <AdminSidebar activeNav={activeNav} setActiveNav={setActiveNav} />

        <main className="flex-1 p-6 space-y-6">
          {/* Notification Settings Section */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-md p-6">
            <div className="flex items-center gap-3 mb-6">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <h2 className="text-xl font-bold text-gray-900">Notification Settings</h2>
            </div>

            <div className="space-y-6">
              {/* Admin Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Admin Email</label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@signage.com"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Email Notifications Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 mb-1">Email Notifications</div>
                  <div className="text-sm text-gray-600">Receive email alerts for important events.</div>
                </div>
                <button
                  onClick={() => setEmailNotifications(!emailNotifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    emailNotifications ? 'bg-green-600' : 'bg-gray-300'
                  }`}
                  role="switch"
                  aria-checked={emailNotifications}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      emailNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* System Alerts Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 mb-1">System Alerts</div>
                  <div className="text-sm text-gray-600">Get notified about system issues.</div>
                </div>
                <button
                  onClick={() => setSystemAlerts(!systemAlerts)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    systemAlerts ? 'bg-green-600' : 'bg-gray-300'
                  }`}
                  role="switch"
                  aria-checked={systemAlerts}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      systemAlerts ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* User Activity Alerts Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 mb-1">User Activity Alerts</div>
                  <div className="text-sm text-gray-600">Notifications for new users and activities.</div>
                </div>
                <button
                  onClick={() => setUserActivityAlerts(!userActivityAlerts)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    userActivityAlerts ? 'bg-green-600' : 'bg-gray-300'
                  }`}
                  role="switch"
                  aria-checked={userActivityAlerts}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      userActivityAlerts ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Save Settings Button */}
              <button
                onClick={handleSaveSettings}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                Save Settings
              </button>
            </div>
          </div>

          {/* Recent Notifications Section */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Notifications</h2>
            <div className="space-y-4">
              {recentNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-center justify-between p-4 border-l-4 ${notification.borderColor} bg-gray-50 rounded-lg hover:shadow-md transition-shadow`}
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 mb-1">{notification.message}</div>
                    <div className="text-sm text-gray-500">{notification.time}</div>
                  </div>
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminNotifications
