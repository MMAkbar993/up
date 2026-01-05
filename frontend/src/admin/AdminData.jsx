import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminSidebar from './AdminSidebar'
import AdminHeader from './AdminHeader'

const AdminData = () => {
  const [activeNav, setActiveNav] = useState('data')
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is authenticated
    const isAuthenticated = sessionStorage.getItem('adminAuthenticated')
    if (!isAuthenticated) {
      navigate('/admin/login')
    }
  }, [navigate])

  const handleExportBackup = () => {
    // Collect all data from localStorage
    const backupData = {
      timestamp: new Date().toISOString(),
      branding: localStorage.getItem('companyBranding'),
      featureSettings: localStorage.getItem('featureSettings'),
      securitySettings: localStorage.getItem('securitySettings'),
      notificationSettings: localStorage.getItem('notificationSettings'),
      // Add other data sources as needed
    }

    // Create a downloadable JSON file
    const dataStr = JSON.stringify(backupData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `system-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    alert('System backup exported successfully!')
  }

  const handleClearAllData = () => {
    const confirmMessage = 'Are you absolutely sure you want to clear ALL system data?\n\nThis will permanently delete:\n- All users\n- All logs\n- All templates\n- All settings\n- All branding data\n\nThis action CANNOT be undone!'
    
    if (window.confirm(confirmMessage)) {
      // Double confirmation
      if (window.confirm('FINAL WARNING: This will delete EVERYTHING. Type "DELETE ALL" to confirm.')) {
        // Clear all localStorage data
        localStorage.clear()
        sessionStorage.clear()
        
        alert('All system data has been cleared. You will be redirected to the login page.')
        navigate('/admin/login')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />

      <div className="flex max-w-[1920px] mx-auto">
        <AdminSidebar activeNav={activeNav} setActiveNav={setActiveNav} />

        <main className="flex-1 p-6 space-y-6">
          {/* Data Management Section */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-md p-6">
            <div className="flex items-center gap-3 mb-6">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
              </svg>
              <h2 className="text-xl font-bold text-gray-900">Data Management</h2>
            </div>

            <button
              onClick={handleExportBackup}
              className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-lg flex items-center justify-center gap-3 transition-colors text-lg font-semibold"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export Complete System Backup
            </button>
          </div>

          {/* Danger Zone Section */}
          <div className="bg-white rounded-xl border-2 border-red-300 shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h2 className="text-xl font-bold text-red-600">Danger Zone</h2>
            </div>

            <p className="text-red-700 mb-6 font-medium">
              This action will permanently delete ALL data including users, logs, templates, and settings.
            </p>

            <button
              onClick={handleClearAllData}
              className="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-lg flex items-center justify-center gap-3 transition-colors text-lg font-semibold"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear All System Data
            </button>
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminData
