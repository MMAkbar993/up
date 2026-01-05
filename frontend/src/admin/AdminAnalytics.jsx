import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminSidebar from './AdminSidebar'
import AdminHeader from './AdminHeader'

const AdminAnalytics = () => {
  const [activeNav, setActiveNav] = useState('analytics')
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is authenticated
    const isAuthenticated = sessionStorage.getItem('adminAuthenticated')
    if (!isAuthenticated) {
      navigate('/admin/login')
    }
  }, [navigate])

  // Mock analytics data
  const analytics = {
    totalSignage: 0,
    aiGenerations: 0,
    templatesUsed: 0,
    totalExports: 0,
    averageSignagePerUser: 0.0
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />

      <div className="flex max-w-[1920px] mx-auto">
        <AdminSidebar activeNav={activeNav} setActiveNav={setActiveNav} />

        <main className="flex-1 p-6 space-y-6">
          {/* Platform Analytics Section */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-md p-6">
            <div className="flex items-center gap-3 mb-6">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h2 className="text-xl font-bold text-gray-900">Platform Analytics</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Signage Generated */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="text-sm font-semibold text-blue-700 mb-2">Total Signage Generated</div>
                <div className="text-3xl font-bold text-blue-900">{analytics.totalSignage}</div>
              </div>

              {/* AI Generations */}
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <div className="text-sm font-semibold text-purple-700 mb-2">AI Generations</div>
                <div className="text-3xl font-bold text-purple-900">{analytics.aiGenerations}</div>
              </div>

              {/* Templates Used */}
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="text-sm font-semibold text-green-700 mb-2">Templates Used</div>
                <div className="text-3xl font-bold text-green-900">{analytics.templatesUsed}</div>
              </div>

              {/* Total Exports */}
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <div className="text-sm font-semibold text-orange-700 mb-2">Total Exports</div>
                <div className="text-3xl font-bold text-orange-900">{analytics.totalExports}</div>
              </div>
            </div>
          </div>

          {/* User Engagement Section */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">User Engagement</h2>
            <div className="text-gray-700">
              <p>Average signage per user: {analytics.averageSignagePerUser}</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminAnalytics
