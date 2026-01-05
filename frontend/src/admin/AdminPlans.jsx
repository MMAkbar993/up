import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminSidebar from './AdminSidebar'
import AdminHeader from './AdminHeader'

const AdminPlans = () => {
  const [activeNav, setActiveNav] = useState('plans')
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is authenticated
    const isAuthenticated = sessionStorage.getItem('adminAuthenticated')
    if (!isAuthenticated) {
      navigate('/admin/login')
    }
  }, [navigate])

  const plans = [
    {
      id: 'free',
      name: 'Free Plan',
      price: '$0/month',
      iconColor: 'text-blue-500',
      quotas: {
        signage: 3,
        template: 50,
        ai: 1,
        export: 10
      },
      features: {
        aiGenerator: true,
        templateLibrary: true,
        companyBranding: false,
        multiLanguage: false,
        highResExport: false,
        bulkExport: false
      }
    },
    {
      id: 'pro',
      name: 'Pro Plan',
      price: '$5/month',
      iconColor: 'text-blue-500',
      quotas: {
        signage: 'Unlimited',
        template: 'Unlimited',
        ai: 'Unlimited',
        export: 'Unlimited'
      },
      features: {
        aiGenerator: true,
        templateLibrary: true,
        companyBranding: true,
        multiLanguage: true,
        highResExport: true,
        bulkExport: true
      }
    },
    {
      id: 'enterprise',
      name: 'Enterprise Plan',
      price: '$50/month',
      iconColor: 'text-purple-500',
      quotas: {
        signage: 'Unlimited',
        template: 'Unlimited',
        ai: 'Unlimited',
        export: 'Unlimited'
      },
      features: {
        aiGenerator: true,
        templateLibrary: true,
        companyBranding: true,
        multiLanguage: true,
        highResExport: true,
        bulkExport: true
      }
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />

      <div className="flex max-w-[1920px] mx-auto">
        <AdminSidebar activeNav={activeNav} setActiveNav={setActiveNav} />

        <main className="flex-1 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="bg-white rounded-xl border border-gray-200 shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                {/* Crown Icon */}
                <div className="flex justify-center mb-4">
                  <svg
                    className={`w-12 h-12 ${plan.iconColor}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                    />
                  </svg>
                </div>

                {/* Plan Name */}
                <h3 className="text-2xl font-bold text-gray-900 text-center mb-2">{plan.name}</h3>

                {/* Price */}
                <p className="text-3xl font-bold text-gray-900 text-center mb-6">{plan.price}</p>

                {/* Quotas Section */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Quotas</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">signage:</span>
                      <span className="text-sm font-semibold text-gray-900">{plan.quotas.signage}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">template:</span>
                      <span className="text-sm font-semibold text-gray-900">{plan.quotas.template}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">ai:</span>
                      <span className="text-sm font-semibold text-gray-900">{plan.quotas.ai}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">export:</span>
                      <span className="text-sm font-semibold text-gray-900">{plan.quotas.export}</span>
                    </div>
                  </div>
                </div>

                {/* Features Section */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Features</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {plan.features.aiGenerator ? (
                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                      <span className={`text-sm ${plan.features.aiGenerator ? 'text-gray-900' : 'text-gray-500'}`}>
                        ai Generator
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {plan.features.templateLibrary ? (
                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                      <span className={`text-sm ${plan.features.templateLibrary ? 'text-gray-900' : 'text-gray-500'}`}>
                        template Library
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {plan.features.companyBranding ? (
                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                      <span className={`text-sm ${plan.features.companyBranding ? 'text-gray-900' : 'text-gray-500'}`}>
                        company Branding
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {plan.features.multiLanguage ? (
                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                      <span className={`text-sm ${plan.features.multiLanguage ? 'text-gray-900' : 'text-gray-500'}`}>
                        multi Language
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {plan.features.highResExport ? (
                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                      <span className={`text-sm ${plan.features.highResExport ? 'text-gray-900' : 'text-gray-500'}`}>
                        high Res Export
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {plan.features.bulkExport ? (
                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                      <span className={`text-sm ${plan.features.bulkExport ? 'text-gray-900' : 'text-gray-500'}`}>
                        bulk Export
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminPlans
