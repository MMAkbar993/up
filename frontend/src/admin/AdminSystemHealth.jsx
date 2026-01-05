import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminSidebar from './AdminSidebar'
import AdminHeader from './AdminHeader'

const AdminSystemHealth = () => {
  const [activeNav, setActiveNav] = useState('system-health')
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is authenticated
    const isAuthenticated = sessionStorage.getItem('adminAuthenticated')
    if (!isAuthenticated) {
      navigate('/admin/login')
    }
  }, [navigate])

  const handleRefresh = () => {
    // Refresh system health data
    window.location.reload()
  }

  // Mock system health data
  const systemHealth = {
    status: 'Online',
    cpuUsage: 45,
    memoryUsage: 62,
    storageUsage: 38,
    uptime: 99.9,
    activeUsers: 142,
    requestsPerSecond: 23,
    responseTime: 45,
    serverStatus: 'Online',
    database: 'Connected',
    apiStatus: 'Operational',
    lastBackup: '2 hours ago'
  }

  const getProgressBarColor = (value) => {
    if (value < 50) return 'bg-green-500'
    if (value < 80) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />

      <div className="flex max-w-[1920px] mx-auto">
        <AdminSidebar activeNav={activeNav} setActiveNav={setActiveNav} />

        <main className="flex-1 p-6 space-y-6">
          {/* System Status Card */}
          <div className="bg-white rounded-xl border-2 border-green-500 shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-green-600 mb-2">
                  System Status: {systemHealth.status}
                </div>
                <div className="text-lg text-gray-600">All systems operational</div>
              </div>
              <div className="flex items-center gap-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                </svg>
                <button
                  onClick={handleRefresh}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Refresh"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Usage Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* CPU Usage */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
                <div className="text-2xl font-bold text-gray-900">{systemHealth.cpuUsage}%</div>
              </div>
              <div className="text-sm text-gray-600 mb-2">CPU Usage</div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getProgressBarColor(systemHealth.cpuUsage)}`}
                  style={{ width: `${systemHealth.cpuUsage}%` }}
                />
              </div>
            </div>

            {/* Memory Usage */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
                <div className="text-2xl font-bold text-gray-900">{systemHealth.memoryUsage}%</div>
              </div>
              <div className="text-sm text-gray-600 mb-2">Memory Usage</div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getProgressBarColor(systemHealth.memoryUsage)}`}
                  style={{ width: `${systemHealth.memoryUsage}%` }}
                />
              </div>
            </div>

            {/* Storage Usage */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
                <div className="text-2xl font-bold text-gray-900">{systemHealth.storageUsage}%</div>
              </div>
              <div className="text-sm text-gray-600 mb-2">Storage Usage</div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getProgressBarColor(systemHealth.storageUsage)}`}
                  style={{ width: `${systemHealth.storageUsage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Performance Metrics Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-md p-6">
            <div className="flex items-center gap-3 mb-6">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h2 className="text-xl font-bold text-gray-900">Performance Metrics</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600 mb-1">{systemHealth.uptime}%</div>
                <div className="text-sm text-gray-700">System Uptime</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-gray-900 mb-1">{systemHealth.activeUsers}</div>
                <div className="text-sm text-gray-700">Active Users</div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-600 mb-1">{systemHealth.requestsPerSecond}</div>
                <div className="text-sm text-gray-700">Requests/Second</div>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-orange-600 mb-1">{systemHealth.responseTime}ms</div>
                <div className="text-sm text-gray-700">Response Time</div>
              </div>
            </div>
          </div>

          {/* System Information Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">System Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700 font-medium">Server Status:</span>
                <span className="text-green-600 font-semibold">{systemHealth.serverStatus}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700 font-medium">Database:</span>
                <span className="text-green-600 font-semibold">{systemHealth.database}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700 font-medium">API Status:</span>
                <span className="text-green-600 font-semibold">{systemHealth.apiStatus}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700 font-medium">Last Backup:</span>
                <span className="text-gray-500">{systemHealth.lastBackup}</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminSystemHealth
