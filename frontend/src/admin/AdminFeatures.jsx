import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminSidebar from './AdminSidebar'
import AdminHeader from './AdminHeader'

const AdminFeatures = () => {
  const [activeNav, setActiveNav] = useState('features')
  const [features, setFeatures] = useState({
    aiSignageGenerator: true,
    templateLibrary: true,
    multiLanguageSupport: true,
    companyBranding: true
  })
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is authenticated
    const isAuthenticated = sessionStorage.getItem('adminAuthenticated')
    if (!isAuthenticated) {
      navigate('/admin/login')
    }

    // Load feature settings from localStorage if available
    const savedFeatures = localStorage.getItem('featureSettings')
    if (savedFeatures) {
      try {
        const parsed = JSON.parse(savedFeatures)
        setFeatures(parsed)
      } catch (e) {
        console.error('Error parsing feature settings:', e)
      }
    }
  }, [navigate])

  const handleToggle = (featureKey) => {
    setFeatures(prev => {
      const updated = {
        ...prev,
        [featureKey]: !prev[featureKey]
      }
      // Save to localStorage
      localStorage.setItem('featureSettings', JSON.stringify(updated))
      // Dispatch event for other components
      window.dispatchEvent(new CustomEvent('featuresUpdated', { detail: updated }))
      return updated
    })
  }

  const featureList = [
    {
      key: 'aiSignageGenerator',
      title: 'AI Signage Generator',
      description: 'Allow users to generate signage using AI',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      )
    },
    {
      key: 'templateLibrary',
      title: 'Template Library',
      description: 'Access to 7200+ professional templates',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      )
    },
    {
      key: 'multiLanguageSupport',
      title: 'Multi-Language Support',
      description: 'Auto-translate signage to multiple languages',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
      )
    },
    {
      key: 'companyBranding',
      title: 'Company Branding',
      description: 'Add company logos and branding',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />

      <div className="flex max-w-[1920px] mx-auto">
        <AdminSidebar activeNav={activeNav} setActiveNav={setActiveNav} />

        <main className="flex-1 p-6">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <h1 className="text-2xl font-bold text-gray-900">Feature Management</h1>
            </div>
          </div>

          <div className="space-y-4">
            {featureList.map((feature) => (
              <div
                key={feature.key}
                className="bg-white rounded-xl border border-gray-200 shadow-md p-6 flex items-center justify-between hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="text-blue-600">{feature.icon}</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <button
                    onClick={() => handleToggle(feature.key)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      features[feature.key] ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                    role="switch"
                    aria-checked={features[feature.key]}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        features[feature.key] ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminFeatures
