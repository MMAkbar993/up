import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminSidebar from './AdminSidebar'
import AdminHeader from './AdminHeader'

const AdminSecurity = () => {
  const [activeNav, setActiveNav] = useState('security')
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [sessionTimeout, setSessionTimeout] = useState(24)
  const [blockedIPs, setBlockedIPs] = useState([])
  const [ipInput, setIpInput] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is authenticated
    const isAuthenticated = sessionStorage.getItem('adminAuthenticated')
    if (!isAuthenticated) {
      navigate('/admin/login')
    }

    // Load security settings from localStorage
    const savedSettings = localStorage.getItem('securitySettings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setTwoFactorEnabled(parsed.twoFactorEnabled || false)
        setSessionTimeout(parsed.sessionTimeout || 24)
        setBlockedIPs(parsed.blockedIPs || [])
      } catch (e) {
        console.error('Error parsing security settings:', e)
      }
    }
  }, [navigate])

  const handleSaveSettings = () => {
    const settings = {
      twoFactorEnabled,
      sessionTimeout,
      blockedIPs
    }
    localStorage.setItem('securitySettings', JSON.stringify(settings))
    window.dispatchEvent(new CustomEvent('securitySettingsUpdated', { detail: settings }))
    alert('Security settings saved successfully!')
  }

  const handleBlockIP = () => {
    if (!ipInput.trim()) {
      alert('Please enter a valid IP address')
      return
    }

    // Basic IP validation
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/
    if (!ipRegex.test(ipInput.trim())) {
      alert('Please enter a valid IP address format (e.g., 192.168.1.1)')
      return
    }

    if (blockedIPs.includes(ipInput.trim())) {
      alert('This IP address is already blocked')
      return
    }

    const updatedIPs = [...blockedIPs, ipInput.trim()]
    setBlockedIPs(updatedIPs)
    setIpInput('')

    // Save to localStorage
    const settings = {
      twoFactorEnabled,
      sessionTimeout,
      blockedIPs: updatedIPs
    }
    localStorage.setItem('securitySettings', JSON.stringify(settings))
  }

  const handleUnblockIP = (ip) => {
    if (window.confirm(`Are you sure you want to unblock ${ip}?`)) {
      const updatedIPs = blockedIPs.filter(blockedIP => blockedIP !== ip)
      setBlockedIPs(updatedIPs)

      // Save to localStorage
      const settings = {
        twoFactorEnabled,
        sessionTimeout,
        blockedIPs: updatedIPs
      }
      localStorage.setItem('securitySettings', JSON.stringify(settings))
    }
  }

  // Mock statistics
  const stats = {
    securityLevel: 'High',
    failedLogins: 0,
    blockedIPsCount: blockedIPs.length
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />

      <div className="flex max-w-[1920px] mx-auto">
        <AdminSidebar activeNav={activeNav} setActiveNav={setActiveNav} />

        <main className="flex-1 p-6 space-y-6">
          {/* Security Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Security Level */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="text-2xl font-bold text-green-600 mb-2">{stats.securityLevel}</div>
              <div className="text-sm text-gray-600">Security Level</div>
            </div>

            {/* Failed Logins */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-2">{stats.failedLogins}</div>
              <div className="text-sm text-gray-600">Failed Logins (24h)</div>
            </div>

            {/* Blocked IPs */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-2">{stats.blockedIPsCount}</div>
              <div className="text-sm text-gray-600">Blocked IPs</div>
            </div>
          </div>

          {/* Security Configuration Section */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-md p-6">
            <div className="flex items-center gap-3 mb-6">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <h2 className="text-xl font-bold text-gray-900">Security Configuration</h2>
            </div>

            <div className="space-y-6">
              {/* Two-Factor Authentication */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-900 mb-1">Two-Factor Authentication</div>
                  <div className="text-sm text-gray-600">Require 2FA for admin login</div>
                </div>
                <button
                  onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    twoFactorEnabled
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                  }`}
                >
                  {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>

              {/* Session Timeout */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Session Timeout (hours)</label>
                <input
                  type="number"
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(parseInt(e.target.value) || 24)}
                  min="1"
                  max="168"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Save Button */}
              <button
                onClick={handleSaveSettings}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                Save Security Settings
              </button>
            </div>
          </div>

          {/* IP Blocking Section */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-md p-6">
            <div className="flex items-center gap-3 mb-6">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              <h2 className="text-xl font-bold text-gray-900">IP Blocking</h2>
            </div>

            <div className="flex gap-4 mb-4">
              <input
                type="text"
                value={ipInput}
                onChange={(e) => setIpInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleBlockIP()
                  }
                }}
                placeholder="Enter IP address to block (e.g., 192.168.1.1)"
                className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={handleBlockIP}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Block IP
              </button>
            </div>

            {blockedIPs.length === 0 ? (
              <p className="text-gray-500">No blocked IP addresses</p>
            ) : (
              <div className="space-y-2">
                {blockedIPs.map((ip, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg"
                  >
                    <span className="text-gray-900 font-mono">{ip}</span>
                    <button
                      onClick={() => handleUnblockIP(ip)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Unblock
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Login Attempts Section */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Recent Login Attempts</h2>
            <p className="text-sm text-gray-600 mb-4">Track and monitor all login attempts to your admin panel.</p>
            <div className="text-center py-8 text-gray-500">
              No recent login attempts to display
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminSecurity
