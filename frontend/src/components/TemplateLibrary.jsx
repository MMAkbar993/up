import { useState } from 'react'

const TemplateLibrary = ({ activeNav, setActiveNav, sidebarOpen, setSidebarOpen }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIndustry, setSelectedIndustry] = useState('All Industries')
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  const [selectedRiskLevel, setSelectedRiskLevel] = useState('All')
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [currentPage, setCurrentPage] = useState(1)
  const [favorites, setFavorites] = useState(new Set())

  const templates = [
    { id: 1, title: 'Hot Work - Welding, Cutting & Grinding', description: 'Welding, cutting, and grinding operations', riskLevel: 'HIGH', categories: ['General', 'Popular'], icon: '🔥', iconColor: 'text-red-600', industry: 'General' },
    { id: 2, title: 'Confined Space Entry', description: 'Entry into confined spaces requiring permits', riskLevel: 'HIGH', categories: ['General', 'Popular'], icon: '⚠️', iconColor: 'text-red-600', industry: 'General' },
    { id: 3, title: 'Working at Heights - Above 6 Feet', description: 'Work performed at elevated heights', riskLevel: 'HIGH', categories: ['General', 'Popular'], icon: '🔺', iconColor: 'text-red-600', industry: 'General' },
    { id: 4, title: 'Lockout/Tagout - Energy Control', description: 'Energy isolation and control procedures', riskLevel: 'HIGH', categories: ['General', 'Popular'], icon: '🛡️', iconColor: 'text-red-600', industry: 'General' },
    { id: 5, title: 'Heavy Lifting & Material Handling', description: 'Manual and mechanical material handling', riskLevel: 'MEDIUM', categories: ['General', 'Popular'], icon: '📦', iconColor: 'text-yellow-600', industry: 'General' },
    { id: 6, title: 'Chemical Handling & Storage', description: 'Handling and storage of hazardous chemicals', riskLevel: 'HIGH', categories: ['General', 'Popular'], icon: '💧', iconColor: 'text-red-600', industry: 'General' },
    { id: 7, title: 'Electrical Work - Live Circuits', description: 'Work on or near energized electrical systems', riskLevel: 'HIGH', categories: ['General', 'Popular'], icon: '⚡', iconColor: 'text-blue-600', industry: 'General' },
    { id: 8, title: 'Mobile Equipment Operation - Forklifts & Vehicles', description: 'Operation of forklifts and mobile equipment', riskLevel: 'MEDIUM', categories: ['General', 'Popular'], icon: '🚜', iconColor: 'text-yellow-600', industry: 'General' },
    { id: 9, title: 'Excavation & Trenching Operations', description: 'Excavation and trenching work activities', riskLevel: 'HIGH', categories: ['General', 'Popular'], icon: '⛏️', iconColor: 'text-red-600', industry: 'General' },
    { id: 10, title: 'Compressed Gas Cylinder Handling', description: 'Handling and storage of compressed gas cylinders', riskLevel: 'MEDIUM', categories: ['General'], icon: '🔵', iconColor: 'text-yellow-600', industry: 'General' },
    { id: 11, title: 'Concrete Cutting & Coring', description: 'Concrete cutting and coring operations', riskLevel: 'MEDIUM', categories: ['Construction'], icon: '🔧', iconColor: 'text-yellow-600', industry: 'Construction' },
    { id: 12, title: 'Roofing Work - Flat & Pitched Roofs', description: 'Roofing installation and maintenance work', riskLevel: 'HIGH', categories: ['Construction'], icon: '🏠', iconColor: 'text-red-600', industry: 'Construction' },
    { id: 13, title: 'Demolition & Deconstruction', description: 'Demolition and deconstruction activities', riskLevel: 'HIGH', categories: ['Construction'], icon: '🔨', iconColor: 'text-red-600', industry: 'Construction' },
    { id: 14, title: 'Steel Erection & Structural Assembly', description: 'Steel erection and structural assembly work', riskLevel: 'HIGH', categories: ['Construction'], icon: '🏗️', iconColor: 'text-red-600', industry: 'Construction' },
    { id: 15, title: 'Machine Operation - General Machinery', description: 'Operation of industrial machinery and equipment', riskLevel: 'HIGH', categories: ['Manufacturing', 'Popular'], icon: '⚙️', iconColor: 'text-red-600', industry: 'Manufacturing' },
    { id: 16, title: 'Assembly Line Work - Production Assembly', description: 'Production assembly line operations', riskLevel: 'MEDIUM', categories: ['Manufacturing'], icon: '🔩', iconColor: 'text-yellow-600', industry: 'Manufacturing' },
    { id: 17, title: 'Quality Inspection - Product Testing', description: 'Quality inspection and product testing', riskLevel: 'LOW', categories: ['Manufacturing'], icon: '✅', iconColor: 'text-blue-600', industry: 'Manufacturing' },
    { id: 18, title: 'Order Picking - Manual & Automated', description: 'Order picking and warehouse operations', riskLevel: 'MEDIUM', categories: ['Warehouse'], icon: '📋', iconColor: 'text-yellow-600', industry: 'Warehouse' },
    { id: 19, title: 'Packing & Shipping - Order Fulfillment', description: 'Packing and shipping operations', riskLevel: 'LOW', categories: ['Warehouse'], icon: '📦', iconColor: 'text-blue-600', industry: 'Warehouse' },
    { id: 20, title: 'Patient Care - General Nursing', description: 'General patient care and nursing activities', riskLevel: 'MEDIUM', categories: ['Healthcare', 'Popular'], icon: '❤️', iconColor: 'text-yellow-600', industry: 'Healthcare' },
    { id: 21, title: 'Office Ergonomics - Computer Work', description: 'Office work and computer ergonomics', riskLevel: 'LOW', categories: ['Office'], icon: 'ℹ️', iconColor: 'text-blue-600', industry: 'Office' },
    { id: 22, title: 'Food Preparation - Commercial Kitchen', description: 'Commercial kitchen food preparation', riskLevel: 'MEDIUM', categories: ['Food Service'], icon: '👨‍🍳', iconColor: 'text-yellow-600', industry: 'Food Service' },
    { id: 23, title: 'Preventive Maintenance - Equipment Servicing', description: 'Preventive maintenance and equipment servicing', riskLevel: 'MEDIUM', categories: ['Maintenance'], icon: '🔧', iconColor: 'text-yellow-600', industry: 'Maintenance' },
    { id: 24, title: 'General Laboratory Work - Research & Testing', description: 'Laboratory research and testing activities', riskLevel: 'MEDIUM', categories: ['Laboratory', 'Popular'], icon: '🧪', iconColor: 'text-yellow-600', industry: 'Laboratory' },
    // Add more templates to reach 500+
    ...Array.from({ length: 476 }, (_, i) => ({
      id: 25 + i,
      title: `Template ${25 + i}`,
      description: `Description for template ${25 + i}`,
      riskLevel: ['HIGH', 'MEDIUM', 'LOW'][Math.floor(Math.random() * 3)],
      categories: [['General'], ['Construction'], ['Manufacturing'], ['Warehouse'], ['Healthcare'], ['Office'], ['Food Service'], ['Maintenance'], ['Laboratory']][Math.floor(Math.random() * 9)],
      icon: ['🔥', '⚠️', '🔺', '🛡️', '📦', '💧', '⚡', '🚜', '⛏️', '🔧', '🏠', '🔨', '🏗️', '⚙️', '🔩', '✅', '📋', '❤️', 'ℹ️', '👨‍🍳', '🧪'][Math.floor(Math.random() * 21)],
      iconColor: ['text-red-600', 'text-yellow-600', 'text-blue-600'][Math.floor(Math.random() * 3)],
      industry: ['General', 'Construction', 'Manufacturing', 'Warehouse', 'Healthcare', 'Office', 'Food Service', 'Maintenance', 'Laboratory'][Math.floor(Math.random() * 9)]
    }))
  ]

  const industries = ['All Industries', 'General', 'Construction', 'Manufacturing', 'Warehouse', 'Healthcare', 'Office', 'Food Service', 'Maintenance', 'Laboratory']
  const categories = ['All Categories', 'General', 'Popular', 'Construction', 'Manufacturing', 'Warehouse', 'Healthcare', 'Office', 'Food Service', 'Maintenance', 'Laboratory']

  const getRiskLevelColor = (riskLevel) => {
    switch (riskLevel) {
      case 'HIGH': return 'bg-red-100 text-red-800 border-red-300'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'LOW': return 'bg-blue-100 text-blue-800 border-blue-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const toggleFavorite = (templateId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(templateId)) {
        newFavorites.delete(templateId)
      } else {
        newFavorites.add(templateId)
      }
      return newFavorites
    })
  }

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesIndustry = selectedIndustry === 'All Industries' || template.industry === selectedIndustry
    const matchesCategory = selectedCategory === 'All Categories' || template.categories.includes(selectedCategory)
    const matchesRiskLevel = selectedRiskLevel === 'All' || template.riskLevel === selectedRiskLevel
    return matchesSearch && matchesIndustry && matchesCategory && matchesRiskLevel
  })

  const templatesPerPage = 24
  const totalPages = Math.ceil(filteredTemplates.length / templatesPerPage)
  const startIndex = (currentPage - 1) * templatesPerPage
  const paginatedTemplates = filteredTemplates.slice(startIndex, startIndex + templatesPerPage)

  const handleUseTemplate = (template) => {
    setActiveNav('generator')
    // You could pass template data to the generator here
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm px-4 md:px-6 lg:px-8 py-3 md:py-4 lg:py-5 sticky top-0 z-50">
        <div className="flex items-center justify-between gap-4 max-w-[1920px] mx-auto">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {sidebarOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
            <div className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
              <span className="text-white font-bold text-lg md:text-xl lg:text-2xl">U</span>
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-sm sm:text-base md:text-lg lg:text-2xl xl:text-3xl font-bold text-gray-900 truncate">
                <span className="hidden sm:inline">Universal Smart Signage Generator</span>
                <span className="sm:hidden">Smart Signage</span>
              </h1>
              <p className="hidden sm:block text-xs md:text-sm lg:text-base text-gray-600 truncate">
                Professional EHS, Safety & Industrial Signage System
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 lg:gap-3 flex-wrap flex-shrink-0">
            <span className="px-3 md:px-4 lg:px-5 py-1.5 lg:py-2 bg-green-100 text-green-700 rounded-full text-xs md:text-sm lg:text-base font-medium whitespace-nowrap shadow-sm hover:shadow-md transition-shadow">
              Multi-Language
            </span>
            <span className="px-3 md:px-4 lg:px-5 py-1.5 lg:py-2 bg-purple-100 text-purple-700 rounded-full text-xs md:text-sm lg:text-base font-medium whitespace-nowrap shadow-sm hover:shadow-md transition-shadow">
              AI Powered
            </span>
            <span className="px-3 md:px-4 lg:px-5 py-1.5 lg:py-2 bg-blue-100 text-blue-700 rounded-full text-xs md:text-sm lg:text-base font-medium whitespace-nowrap shadow-sm hover:shadow-md transition-shadow">
              ISO 7010
            </span>
          </div>
        </div>
      </header>

      <div className="flex relative max-w-[1920px] mx-auto">
        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar - Same as Dashboard */}
        <aside
          className={`fixed md:static inset-y-0 left-0 z-50 md:z-auto w-64 lg:w-72 xl:w-80 bg-white md:bg-gray-50 min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-80px)] lg:min-h-[calc(100vh-88px)] p-4 lg:p-6 border-r border-gray-200 shadow-lg md:shadow-none transform transition-transform duration-300 ease-in-out overflow-y-auto ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
          <nav className="space-y-2 lg:space-y-3">
            {/* Dashboard */}
            <div
              className={`p-3 lg:p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                activeNav === 'dashboard'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30'
                  : 'text-gray-700 hover:bg-gray-200 hover:shadow-md'
              }`}
              onClick={() => {
                setActiveNav('dashboard')
                setSidebarOpen(false)
              }}
            >
              <div className="flex items-center gap-3 lg:gap-4">
                <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <div>
                  <div className="font-semibold text-sm lg:text-base">Dashboard</div>
                  <div className="text-xs lg:text-sm opacity-80">Overview & quick actions</div>
                </div>
              </div>
            </div>

            {/* CREATE SIGNAGE Section */}
            <div className="pt-4 lg:pt-6">
              <div className="text-xs lg:text-sm font-semibold text-gray-500 uppercase px-3 mb-3 lg:mb-4 tracking-wider">
                CREATE SIGNAGE
              </div>
              <div
                className={`p-3 lg:p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                  activeNav === 'generator'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30'
                    : 'text-gray-700 hover:bg-gray-200 hover:shadow-md'
                }`}
                onClick={() => {
                  setActiveNav('generator')
                  setSidebarOpen(false)
                }}
              >
                <div className="flex items-center gap-3 lg:gap-4">
                  <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="font-semibold text-sm lg:text-base">Signage Generator</span>
                </div>
                <div className="text-xs lg:text-sm opacity-80 mt-1 ml-8 lg:ml-10">
                  Create safety signage.
                </div>
              </div>
              <div
                className={`p-3 lg:p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                  activeNav === 'templates'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30'
                    : 'text-gray-700 hover:bg-gray-200 hover:shadow-md'
                }`}
                onClick={() => {
                  setActiveNav('templates')
                  setSidebarOpen(false)
                }}
              >
                <div className="flex items-center gap-3 lg:gap-4">
                  <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  <span className="font-semibold text-sm lg:text-base">Template Library</span>
                </div>
                <div className="text-xs lg:text-sm opacity-80 mt-1 ml-8 lg:ml-10">
                  500+ ready templates.
                </div>
              </div>
              <div
                className={`p-3 lg:p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                  activeNav === 'ai-generator'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30'
                    : 'text-gray-700 hover:bg-gray-200 hover:shadow-md'
                }`}
                onClick={() => {
                  setActiveNav('ai-generator')
                  setSidebarOpen(false)
                }}
              >
                <div className="flex items-center gap-3 lg:gap-4">
                  <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  <span className="font-semibold text-sm lg:text-base">AI Generator</span>
                  <span className="px-2 lg:px-2.5 py-0.5 lg:py-1 bg-purple-100 text-purple-700 rounded-md lg:rounded-lg text-xs lg:text-sm font-semibold shadow-sm">
                    NEW
                  </span>
                </div>
                <div className="text-xs lg:text-sm opacity-80 mt-1 ml-8 lg:ml-10">
                  Auto-create with AI.
                </div>
              </div>
            </div>

            {/* MANAGE PERSONNEL Section */}
            <div className="pt-4 lg:pt-6">
              <div className="text-xs lg:text-sm font-semibold text-gray-500 uppercase px-3 mb-3 lg:mb-4 tracking-wider">
                MANAGE PERSONNEL
              </div>
              <div
                className={`p-3 lg:p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                  activeNav === 'authorized'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30'
                    : 'text-gray-700 hover:bg-gray-200 hover:shadow-md'
                }`}
                onClick={() => {
                  setActiveNav('authorized')
                  setSidebarOpen(false)
                }}
              >
                <div className="flex items-center gap-3 lg:gap-4">
                  <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="font-semibold text-sm lg:text-base">Authorized Persons</span>
                </div>
                <div className="text-xs lg:text-sm opacity-80 mt-1 ml-8 lg:ml-10">
                  Manage personnel.
                </div>
              </div>
              <div
                className={`p-3 lg:p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                  activeNav === 'emergency'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30'
                    : 'text-gray-700 hover:bg-gray-200 hover:shadow-md'
                }`}
                onClick={() => {
                  setActiveNav('emergency')
                  setSidebarOpen(false)
                }}
              >
                <div className="flex items-center gap-3 lg:gap-4">
                  <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span className="font-semibold text-sm lg:text-base">Emergency Team</span>
                  <svg className="w-4 h-4 lg:w-5 lg:h-5 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <div className="text-xs lg:text-sm opacity-80 mt-1 ml-8 lg:ml-10">
                  Emergency response
                </div>
              </div>
            </div>

            {/* RESOURCES Section */}
            <div className="pt-4 lg:pt-6">
              <div className="text-xs lg:text-sm font-semibold text-gray-500 uppercase px-3 mb-3 lg:mb-4 tracking-wider">
                RESOURCES
              </div>
              
              {/* Blog & Tutorials */}
              <button 
                onClick={() => {
                  setActiveNav('blog')
                  setSidebarOpen(false)
                }}
                className={`w-full p-3 lg:p-4 rounded-xl transition-colors shadow-md hover:shadow-lg mb-3 ${
                  activeNav === 'blog'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <div className="flex items-center gap-3 lg:gap-4">
                  <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <div className="text-left">
                    <div className="font-semibold text-sm lg:text-base">Blog & Tutorials</div>
                    <div className="text-xs lg:text-sm opacity-90">Learn safety tips</div>
                  </div>
                </div>
              </button>

              {/* Admin Panel */}
              <div className="p-3 lg:p-4 rounded-xl cursor-pointer transition-all duration-200 text-gray-700 hover:bg-gray-200 hover:shadow-md">
                <div className="flex items-center gap-3 lg:gap-4">
                  <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <div className="font-semibold text-sm lg:text-base">Admin Panel</div>
                    <div className="text-xs lg:text-sm opacity-80">System settings</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pro Features Section */}
            <div className="pt-4 lg:pt-6">
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 lg:p-5">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  <h3 className="text-sm lg:text-base font-bold text-gray-900">Pro Features</h3>
                </div>
                <ul className="space-y-2">
                  {[
                    'AI-powered generation',
                    'Multi-language support',
                    'Company branding',
                    '500+ templates',
                    'High-res export'
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-gray-700">
                      <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-x-hidden">
          {/* Page Header */}
          <div className="mb-6 lg:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              Professional Template Library
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600">
              500+ Ready-to-Use Activity Signage Templates
            </p>
          </div>

          {/* Search and Filter Section */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md mb-6">
            {/* Search Bar and Dropdowns */}
            <div className="flex flex-col lg:flex-row gap-4 mb-4">
              <div className="flex-1 relative">
                <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search activities, hazards, procedures..."
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex gap-3">
                <select
                  value={selectedIndustry}
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                  className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  {industries.map(industry => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Risk Level Filter and View Toggle */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-gray-700">Risk Level:</span>
                {['All', 'High', 'Medium', 'Low'].map(level => (
                  <button
                    key={level}
                    onClick={() => setSelectedRiskLevel(level === 'All' ? 'All' : level.toUpperCase())}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedRiskLevel === (level === 'All' ? 'All' : level.toUpperCase())
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  Showing {paginatedTemplates.length} of {filteredTemplates.length} templates
                </span>
                <div className="flex gap-2 border-2 border-gray-300 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded transition-colors ${
                      viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded transition-colors ${
                      viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Template Grid */}
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6 mb-6'
            : 'space-y-4 mb-6'
          }>
            {paginatedTemplates.map(template => (
              <div
                key={template.id}
                className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden ${
                  viewMode === 'list' ? 'flex gap-4 p-4' : 'p-4'
                }`}
              >
                {viewMode === 'grid' ? (
                  <>
                    {/* Icon and Favorite */}
                    <div className="flex items-start justify-between mb-3">
                      <div className={`text-4xl ${template.iconColor}`}>
                        {template.icon}
                      </div>
                      <button
                        onClick={() => toggleFavorite(template.id)}
                        className="text-gray-400 hover:text-yellow-500 transition-colors"
                      >
                        <svg className={`w-5 h-5 ${favorites.has(template.id) ? 'fill-yellow-500 text-yellow-500' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </button>
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
                      {template.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {template.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold border ${getRiskLevelColor(template.riskLevel)}`}>
                        {template.riskLevel}
                      </span>
                      {template.categories.map(category => (
                        <span key={category} className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700 border border-gray-300">
                          {category}
                        </span>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUseTemplate(template)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Use Template
                      </button>
                      <button className="p-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className={`text-4xl ${template.iconColor} flex-shrink-0`}>
                      {template.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-lg text-gray-900">
                          {template.title}
                        </h3>
                        <button
                          onClick={() => toggleFavorite(template.id)}
                          className="text-gray-400 hover:text-yellow-500 transition-colors flex-shrink-0 ml-2"
                        >
                          <svg className={`w-5 h-5 ${favorites.has(template.id) ? 'fill-yellow-500 text-yellow-500' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {template.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className={`px-2 py-1 rounded text-xs font-semibold border ${getRiskLevelColor(template.riskLevel)}`}>
                          {template.riskLevel}
                        </span>
                        {template.categories.map(category => (
                          <span key={category} className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700 border border-gray-300">
                            {category}
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUseTemplate(template)}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Use Template
                        </button>
                        <button className="p-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Previous
              </button>
              <span className="text-gray-700 font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Next
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default TemplateLibrary

