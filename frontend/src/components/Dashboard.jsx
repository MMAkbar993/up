import { useState } from 'react'
import SignageGenerator from './SignageGenerator'
import AIGenerator from './AIGenerator'
import AuthorizedPersons from './AuthorizedPersons'
import EmergencyTeam from './EmergencyTeam'
import Blog from './Blog'
import TemplateLibrary from './TemplateLibrary'
import CustomizeSignage from './CustomizeSignage'

const Dashboard = () => {
  const [activeNav, setActiveNav] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  // If Signage Generator is selected, show that component
  if (activeNav === 'generator') {
    return <SignageGenerator activeNav={activeNav} setActiveNav={setActiveNav} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
  }
  
  // If AI Generator is selected, show that component
  if (activeNav === 'ai-generator') {
    return <AIGenerator activeNav={activeNav} setActiveNav={setActiveNav} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
  }
  
  // If Authorized Persons is selected, show that component
  if (activeNav === 'authorized') {
    return <AuthorizedPersons activeNav={activeNav} setActiveNav={setActiveNav} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
  }
  
  // If Emergency Team is selected, show that component
  if (activeNav === 'emergency') {
    return <EmergencyTeam activeNav={activeNav} setActiveNav={setActiveNav} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
  }
  
  // If Blog is selected, show that component
  if (activeNav === 'blog') {
    return <Blog activeNav={activeNav} setActiveNav={setActiveNav} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
  }
  
  // If Template Library is selected, show that component
  if (activeNav === 'templates') {
    return <TemplateLibrary activeNav={activeNav} setActiveNav={setActiveNav} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
  }
  
  // If Customize Signage is selected, show that component
  if (activeNav === 'customize-signage') {
    return <CustomizeSignage activeNav={activeNav} setActiveNav={setActiveNav} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm px-4 md:px-6 lg:px-8 py-3 md:py-4 lg:py-5 sticky top-0 z-50">
        <div className="flex items-center justify-between gap-4 max-w-[1920px] mx-auto">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {sidebarOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
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

      <div className="flex relative w-full">
        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed md:static inset-y-0 left-0 z-50 md:z-auto w-64 lg:w-72 xl:w-80 bg-white md:bg-gray-50 min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-80px)] lg:min-h-[calc(100vh-88px)] p-4 lg:p-6 border-r border-gray-200 shadow-lg md:shadow-none transform transition-transform duration-300 ease-in-out overflow-y-auto flex-shrink-0 ${
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
                <svg
                  className="w-5 h-5 lg:w-6 lg:h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
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
                  <svg
                    className="w-5 h-5 lg:w-6 lg:h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
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
                  <svg
                    className="w-5 h-5 lg:w-6 lg:h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
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
                  <svg
                    className="w-5 h-5 lg:w-6 lg:h-6"
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
                  <span className="font-semibold text-sm lg:text-base">AI Generator</span>
                  <span className="px-2 lg:px-2.5 py-0.5 lg:py-1 bg-purple-100 text-purple-700 rounded-md lg:rounded-lg text-xs lg:text-sm font-semibold shadow-sm">
                    NEW
                  </span>
                </div>
                <div className="text-xs lg:text-sm opacity-80 mt-1 ml-8 lg:ml-10">
                  Auto-create with AI.
                </div>
              </div>
              <div
                className={`p-3 lg:p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                  activeNav === 'customize-signage'
                    ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg shadow-green-500/30'
                    : 'text-gray-700 hover:bg-gray-200 hover:shadow-md'
                }`}
                onClick={() => {
                  setActiveNav('customize-signage')
                  setSidebarOpen(false)
                }}
              >
                <div className="flex items-center gap-3 lg:gap-4">
                  <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span className="font-semibold text-sm lg:text-base">Customize Signage</span>
                </div>
                <div className="text-xs lg:text-sm opacity-80 mt-1 ml-8 lg:ml-10">
                  Upload, edit, and customize.
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
                  <svg
                    className="w-5 h-5 lg:w-6 lg:h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
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
                  <svg
                    className="w-5 h-5 lg:w-6 lg:h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <span className="font-semibold text-sm lg:text-base">Safety Team</span>
                  <svg
                    className="w-4 h-4 lg:w-5 lg:h-5 ml-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
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
        <main className="flex-1 p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 w-full min-w-0 max-w-[1920px] mx-auto">
          {/* Welcome Section */}
          <div className="mb-6 md:mb-8 lg:mb-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 lg:mb-4 leading-tight">
              Welcome to Universal Smart Signage Generator
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 max-w-3xl">
              Create professional ISO 7010-compliant safety signage in minutes.
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8 mb-6 md:mb-8 lg:mb-10">
            <div className="bg-white rounded-2xl border-2 border-blue-200 p-5 sm:p-6 lg:p-8 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4 lg:mb-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center shadow-sm">
                  <svg
                    className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
              </div>
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-2">0</div>
              <div className="text-sm sm:text-base lg:text-lg text-gray-600 font-medium">Total Signages</div>
            </div>

            <div className="bg-white rounded-2xl border-2 border-purple-200 p-5 sm:p-6 lg:p-8 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4 lg:mb-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center shadow-sm">
                  <svg
                    className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-2">0</div>
              <div className="text-sm sm:text-base lg:text-lg text-gray-600 font-medium">Uploaded Images</div>
            </div>

            <div className="bg-white rounded-2xl border-2 border-yellow-200 p-5 sm:p-6 lg:p-8 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4 lg:mb-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl flex items-center justify-center shadow-sm">
                  <svg
                    className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                </div>
              </div>
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-2">0</div>
              <div className="text-sm sm:text-base lg:text-lg text-gray-600 font-medium">Favorites</div>
            </div>

            <div className="bg-white rounded-2xl border-2 border-green-200 p-5 sm:p-6 lg:p-8 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4 lg:mb-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center shadow-sm">
                  <svg
                    className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
              </div>
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-2">0</div>
              <div className="text-sm sm:text-base lg:text-lg text-gray-600 font-medium">This Week</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-6 md:mb-8 lg:mb-10">
            <div className="flex items-center gap-2 lg:gap-3 mb-4 md:mb-6 lg:mb-8">
              <svg
                className="w-6 h-6 lg:w-7 lg:h-7 text-yellow-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">Quick Actions</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
              <button className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl p-5 sm:p-6 lg:p-8 text-left hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-2xl hover:-translate-y-1">
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-white/20 rounded-xl flex items-center justify-center mb-4 lg:mb-6 backdrop-blur-sm">
                  <svg
                    className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div className="font-bold text-lg sm:text-xl lg:text-2xl mb-2">
                  Create Safety Signage
                </div>
                <div className="text-sm sm:text-base lg:text-lg opacity-90">
                  Design professional safety signs.
                </div>
              </button>

              <button className="bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-2xl p-5 sm:p-6 lg:p-8 text-left hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-lg hover:shadow-2xl hover:-translate-y-1">
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-white/20 rounded-xl flex items-center justify-center mb-4 lg:mb-6 backdrop-blur-sm">
                  <svg
                    className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8"
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
                <div className="font-bold text-lg sm:text-xl lg:text-2xl mb-2">
                  AI Signage Generator
                </div>
                <div className="text-sm sm:text-base lg:text-lg opacity-90">
                  Auto-generate with AI.
                </div>
              </button>

              <button className="bg-gradient-to-br from-blue-800 to-blue-900 text-white rounded-2xl p-5 sm:p-6 lg:p-8 text-left hover:from-blue-900 hover:to-blue-950 transition-all duration-300 shadow-lg hover:shadow-2xl hover:-translate-y-1">
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-white/20 rounded-xl flex items-center justify-center mb-4 lg:mb-6 backdrop-blur-sm">
                  <svg
                    className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                </div>
                <div className="font-bold text-lg sm:text-xl lg:text-2xl mb-2">
                  Browse Templates
                </div>
                <div className="text-sm sm:text-base lg:text-lg opacity-90">
                  Choose from 500+ templates.
                </div>
              </button>

              <button className="bg-gradient-to-br from-green-600 to-green-700 text-white rounded-2xl p-5 sm:p-6 lg:p-8 text-left hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-2xl hover:-translate-y-1">
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-white/20 rounded-xl flex items-center justify-center mb-4 lg:mb-6 backdrop-blur-sm">
                  <svg
                    className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </div>
                <div className="font-bold text-lg sm:text-xl lg:text-2xl mb-2">Upload Image</div>
                <div className="text-sm sm:text-base lg:text-lg opacity-90">
                  Upload and edit photos.
                </div>
              </button>
            </div>
          </div>

          {/* Recent Signages */}
          <div className="mb-6 md:mb-8 lg:mb-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 md:mb-6 lg:mb-8">
              <div className="flex items-center gap-2 lg:gap-3">
                <svg
                  className="w-6 h-6 lg:w-7 lg:h-7 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">Recent Signages</h3>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-initial">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-full sm:w-64 lg:w-80 pl-10 pr-4 py-2.5 lg:py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm lg:text-base shadow-sm"
                  />
                  <svg
                    className="w-5 h-5 lg:w-6 lg:h-6 text-gray-400 absolute left-3 top-3 lg:top-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <button className="px-4 lg:px-6 py-2.5 lg:py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 flex items-center gap-2 whitespace-nowrap text-sm lg:text-base font-medium shadow-sm transition-all duration-200">
                  <svg
                    className="w-5 h-5 lg:w-6 lg:h-6 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                    />
                  </svg>
                  <span className="text-gray-700 hidden sm:inline">Filter</span>
                </button>
              </div>
            </div>
            <div className="bg-white border-2 border-dashed border-gray-300 rounded-2xl p-8 sm:p-12 md:p-16 lg:p-20 text-center shadow-sm">
              <div className="flex flex-col items-center justify-center">
                <svg
                  className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 text-gray-300 mb-6 lg:mb-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h4 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-700 mb-3 lg:mb-4">
                  No signages yet.
                </h4>
                <p className="text-base sm:text-lg lg:text-xl text-gray-500 mb-6 sm:mb-8 lg:mb-10 max-w-md">
                  Start creating professional safety signage now.
                </p>
                <button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 sm:px-8 lg:px-10 py-3 sm:py-3.5 lg:py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center gap-2 text-base sm:text-lg lg:text-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Create Your First Signage
                </button>
              </div>
            </div>
          </div>

          {/* New to Platform Section */}
          <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 rounded-2xl p-6 sm:p-8 lg:p-10 xl:p-12 text-white relative overflow-hidden shadow-2xl">
            <div className="relative z-10">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 lg:mb-4">New to the platform?</h3>
              <p className="text-base sm:text-lg lg:text-xl text-blue-100 mb-6 sm:mb-8 lg:mb-10 max-w-2xl">
                Learn how to create professional safety signage in just 3 easy steps.
              </p>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 lg:gap-6">
                <button className="bg-white text-blue-900 px-6 sm:px-8 lg:px-10 py-3 sm:py-3.5 lg:py-4 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-300 text-base sm:text-lg lg:text-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                  Watch Tutorial
                </button>
                <button className="bg-blue-700 text-white px-6 sm:px-8 lg:px-10 py-3 sm:py-3.5 lg:py-4 rounded-xl font-semibold hover:bg-blue-600 transition-all duration-300 text-base sm:text-lg lg:text-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                  View Documentation
                </button>
              </div>
            </div>
            <div className="absolute right-4 sm:right-8 lg:right-12 top-4 sm:top-8 lg:top-12 opacity-20">
              <svg
                className="w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36 lg:w-40 lg:h-40 text-white"
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
          </div>
        </main>
      </div>
    </div>
  )
}

export default Dashboard

