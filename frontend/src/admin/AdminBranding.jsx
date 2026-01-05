import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminSidebar from './AdminSidebar'
import AdminHeader from './AdminHeader'

const AdminBranding = () => {
  const [activeNav, setActiveNav] = useState('branding')
  const [brandingData, setBrandingData] = useState({
    companyName: '',
    contactInformation: '',
    clientLogoUrl: '',
    contractorLogoUrl: ''
  })
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is authenticated
    const isAuthenticated = sessionStorage.getItem('adminAuthenticated')
    if (!isAuthenticated) {
      navigate('/admin/login')
    }

    // Load existing branding data from localStorage
    const savedBranding = localStorage.getItem('companyBranding')
    if (savedBranding) {
      try {
        const parsed = JSON.parse(savedBranding)
        setBrandingData(parsed)
      } catch (e) {
        console.error('Error parsing branding data:', e)
      }
    }
  }, [navigate])

  const handleInputChange = (field, value) => {
    setBrandingData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = () => {
    localStorage.setItem('companyBranding', JSON.stringify(brandingData))
    // Dispatch custom event for other components to listen
    window.dispatchEvent(new CustomEvent('brandingUpdated', { detail: brandingData }))
    alert('Branding saved successfully!')
  }

  const handleViewData = () => {
    const savedData = localStorage.getItem('companyBranding')
    if (savedData) {
      alert('Saved Branding Data:\n\n' + JSON.stringify(JSON.parse(savedData), null, 2))
    } else {
      alert('No branding data found in localStorage.')
    }
  }

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear all branding data? This action cannot be undone.')) {
      localStorage.removeItem('companyBranding')
      setBrandingData({
        companyName: '',
        contactInformation: '',
        clientLogoUrl: '',
        contractorLogoUrl: ''
      })
      window.dispatchEvent(new CustomEvent('brandingUpdated', { detail: null }))
      alert('Branding data cleared successfully!')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />

      <div className="flex max-w-[1920px] mx-auto">
        <AdminSidebar activeNav={activeNav} setActiveNav={setActiveNav} />

        <main className="flex-1 p-6 space-y-6">
          {/* Branding Storage Location Card */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-xl font-bold text-gray-900">Branding Storage Location</h2>
            </div>
            <div className="space-y-2 mb-6 text-gray-700">
              <div>
                <span className="font-semibold">Storage:</span> localStorage (browser-based)
              </div>
              <div>
                <span className="font-semibold">Key:</span> companyBranding
              </div>
              <div>
                <span className="font-semibold">Access:</span> Available globally across all signage
              </div>
              <div>
                <span className="font-semibold">Scope:</span> Applied to all generated signage automatically
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleViewData}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View Saved Data
              </button>
              <button
                onClick={handleClear}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear
              </button>
            </div>
          </div>

          {/* Company Branding Configuration Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-md p-6">
            <div className="flex items-center gap-3 mb-6">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h2 className="text-xl font-bold text-gray-900">Company Branding Configuration</h2>
            </div>

            <div className="space-y-6">
              {/* Company Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Company Name</label>
                <input
                  type="text"
                  value={brandingData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  placeholder="Enter company name (e.g., ABC Safety Corp)"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-sm text-gray-500 mt-1">This will appear on all generated signage.</p>
              </div>

              {/* Contact Information */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Information</label>
                <textarea
                  value={brandingData.contactInformation}
                  onChange={(e) => handleInputChange('contactInformation', e.target.value)}
                  placeholder="Enter contact details (e.g., Phone: +1-xxx-xxx-xxxx, Email: safety@company.com)"
                  rows="4"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-sm text-gray-500 mt-1">Contact information for emergency or inquiries.</p>
              </div>

              {/* Client Logo URL */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Client Logo URL</label>
                <input
                  type="url"
                  value={brandingData.clientLogoUrl}
                  onChange={(e) => handleInputChange('clientLogoUrl', e.target.value)}
                  placeholder="Enter client logo URL"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Contractor Logo URL */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Contractor Logo URL</label>
                <input
                  type="url"
                  value={brandingData.contractorLogoUrl}
                  onChange={(e) => handleInputChange('contractorLogoUrl', e.target.value)}
                  placeholder="Enter contractor logo URL"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <button
              onClick={handleSave}
              className="mt-6 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors w-full justify-center"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Save Branding to localStorage
            </button>
          </div>

          {/* How Branding Works Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-md p-6">
            <div className="flex items-center gap-3 mb-6">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-xl font-bold text-gray-900">How Branding Works</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Automatic Application */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <div className="font-semibold text-green-900 mb-1">Automatic Application</div>
                  <p className="text-sm text-green-800">
                    Once saved, branding is automatically applied to all new signage generated in the Signage Generator
                  </p>
                </div>
              </div>

              {/* Global Access */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <div className="font-semibold text-blue-900 mb-1">Global Access</div>
                  <p className="text-sm text-blue-800">
                    Branding data is accessible from anywhere in the application via localStorage
                  </p>
                </div>
              </div>

              {/* Event-Based Updates */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 flex items-start gap-3">
                <svg className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <div className="font-semibold text-purple-900 mb-1">Event-Based Updates</div>
                  <p className="text-sm text-purple-800">
                    Changes trigger a 'brandingUpdated' event that notifies all components
                  </p>
                </div>
              </div>

              {/* User Visibility */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <div className="font-semibold text-yellow-900 mb-1">User Visibility</div>
                  <p className="text-sm text-yellow-800">
                    Users see branding on all exported/printed signage in the Signage Generator section
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminBranding
