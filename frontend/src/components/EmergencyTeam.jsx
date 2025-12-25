import { useState } from 'react'

const EmergencyTeam = ({ activeNav, setActiveNav, sidebarOpen, setSidebarOpen }) => {
  const [safetyCommittee, setSafetyCommittee] = useState([])
  const [clientLogo, setClientLogo] = useState(null)
  const [contractorLogo, setContractorLogo] = useState(null)
  const [showOrgChart, setShowOrgChart] = useState(false)

  const handleLogoUpload = (type, file) => {
    if (type === 'client') {
      setClientLogo(file)
    } else {
      setContractorLogo(file)
    }
  }

  const addCommitteeMember = () => {
    const newMember = {
      id: Date.now(),
      name: '',
      role: '',
      phone: '',
      email: '',
      parentId: null,
      photo: null
    }
    setSafetyCommittee([...safetyCommittee, newMember])
  }

  const handleMemberPhotoUpload = (memberId, file) => {
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        updateCommitteeMember(memberId, 'photo', reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const updateCommitteeMember = (id, field, value) => {
    setSafetyCommittee(prev => prev.map(member => 
      member.id === id ? { ...member, [field]: value } : member
    ))
  }

  const removeCommitteeMember = (id) => {
    setSafetyCommittee(prev => {
      // Remove the member and also remove any parent references
      return prev.filter(member => member.id !== id).map(member => 
        member.parentId === id ? { ...member, parentId: null } : member
      )
    })
  }

  const buildOrgChart = () => {
    const rootMembers = safetyCommittee.filter(m => !m.parentId)
    const buildTree = (parentId) => {
      return safetyCommittee
        .filter(m => m.parentId === parentId)
        .map(member => ({
          ...member,
          children: buildTree(member.id)
        }))
    }
    return rootMembers.map(root => ({
      ...root,
      children: buildTree(root.id)
    }))
  }

  const orgChartData = buildOrgChart()

  // Organization Chart Node Component
  const OrgChartNode = ({ members, allMembers, onUpdateMember, onRemoveMember, onSetParent, onPhotoUpload, level = 0 }) => {
    if (!members || members.length === 0) return null

    return (
      <div className="flex flex-col items-center w-full">
        {/* Current Level Members */}
        <div className="flex gap-6 items-start justify-center flex-wrap">
          {members.map((member) => (
            <div key={member.id} className="flex flex-col items-center relative">
              {/* Connecting Vertical Line from parent */}
              {level > 0 && (
                <div className="w-0.5 h-6 bg-blue-400 mb-2"></div>
              )}
              
              {/* Member Card */}
              <div className="bg-white border-2 border-blue-500 rounded-xl p-4 shadow-lg min-w-[200px] max-w-[220px]">
                <div className="text-center mb-3">
                  {/* Photo */}
                  <div className="mb-3 flex justify-center">
                    {member.photo ? (
                      <div className="relative">
                        <img 
                          src={member.photo} 
                          alt={member.name || 'Member'} 
                          className="w-20 h-20 rounded-full object-cover border-2 border-blue-500"
                        />
                        <label className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-1 cursor-pointer hover:bg-blue-700">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files[0]) {
                                onPhotoUpload(member.id, e.target.files[0])
                              }
                              e.target.value = ''
                            }}
                            className="hidden"
                          />
                        </label>
                      </div>
                    ) : (
                      <label className="cursor-pointer">
                        <div className="w-20 h-20 rounded-full bg-gray-200 border-2 border-dashed border-gray-400 flex items-center justify-center hover:border-blue-500 hover:bg-gray-100 transition-colors">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files[0]) {
                              onPhotoUpload(member.id, e.target.files[0])
                            }
                            e.target.value = ''
                          }}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  <div className="font-bold text-gray-900 text-base mb-1">
                    {member.name || 'Unnamed Member'}
                  </div>
                  <div className="text-sm text-blue-600 font-medium mb-1">
                    {member.role || 'No Role'}
                  </div>
                  {member.phone && (
                    <div className="text-xs text-gray-500">{member.phone}</div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <select
                    value={member.parentId || ''}
                    onChange={(e) => onSetParent(member.id, e.target.value || null)}
                    className="text-xs px-2 py-1.5 border border-gray-300 rounded-lg bg-gray-50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value="">Change Parent</option>
                    {allMembers.filter(m => m.id !== member.id).map(parent => (
                      <option key={parent.id} value={parent.id}>
                        {parent.name || parent.role || 'Member'}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => onRemoveMember(member.id)}
                    className="px-2 py-1 bg-red-600 text-white rounded-lg text-xs hover:bg-red-700 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>

              {/* Connecting Line to Children */}
              {member.children && member.children.length > 0 && (
                <div className="w-0.5 h-6 bg-blue-400 mt-2"></div>
              )}

              {/* Children Level - Recursive */}
              {member.children && member.children.length > 0 && (
                <div className="mt-2 pt-2">
                  <OrgChartNode
                    members={member.children}
                    allMembers={allMembers}
                    onUpdateMember={onUpdateMember}
                    onRemoveMember={onRemoveMember}
                    onSetParent={onSetParent}
                    onPhotoUpload={onPhotoUpload}
                    level={level + 1}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  const roles = [
    { name: 'HSE Department', color: 'bg-blue-600' },
    { name: 'Warden', color: 'bg-blue-400' },
    { name: 'Firefighter', color: 'bg-red-600' },
    { name: 'First Aid', color: 'bg-yellow-500' },
    { name: 'Emergency Response Team', color: 'bg-gray-600' }
  ]

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

        {/* Sidebar */}
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
        <main className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10 min-w-0">
          {/* Page Header */}
          <div className="mb-6 lg:mb-8">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 mb-2">
                  Emergency Response Team
                </h1>
                <p className="text-sm lg:text-base text-gray-600">
                  Create emergency response plans and team signage.
                </p>
              </div>
              <div className="flex gap-3">
                <button className="px-4 lg:px-6 py-2 lg:py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg flex items-center gap-2 text-sm lg:text-base">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download PDF
                </button>
                <button className="px-4 lg:px-6 py-2 lg:py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg flex items-center gap-2 text-sm lg:text-base">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download PNG
                </button>
                <button className="px-4 lg:px-6 py-2 lg:py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg flex items-center gap-2 text-sm lg:text-base">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Left Sidebar - Settings */}
            <div className="lg:col-span-1 space-y-6">
              {/* Settings Panel */}
              <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-md border-2 border-gray-200">
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-6">Settings</h2>

                {/* Safety Committee */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Safety Committee</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{safetyCommittee.length} members</span>
                      <button
                        onClick={() => setShowOrgChart(!showOrgChart)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          showOrgChart 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {showOrgChart ? 'List View' : 'Org Chart'}
                      </button>
                      <button
                        onClick={addCommitteeMember}
                        className="w-8 h-8 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  {safetyCommittee.length > 0 && (
                    <>
                      {showOrgChart ? (
                        /* Organization Chart View */
                        <div className="space-y-6 max-h-96 overflow-y-auto p-4 bg-gray-50 rounded-lg">
                          {orgChartData.length > 0 ? (
                            <OrgChartNode 
                              members={orgChartData} 
                              allMembers={safetyCommittee}
                              onUpdateMember={updateCommitteeMember}
                              onRemoveMember={removeCommitteeMember}
                              onSetParent={(childId, parentId) => {
                                updateCommitteeMember(childId, 'parentId', parentId)
                              }}
                              onPhotoUpload={handleMemberPhotoUpload}
                            />
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              <p>No organization structure yet. Set parent relationships to build the chart.</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        /* List View */
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {safetyCommittee.map((member) => (
                            <div key={member.id} className="p-3 border-2 border-gray-200 rounded-lg">
                              {/* Photo Upload */}
                              <div className="mb-3 flex justify-center">
                                {member.photo ? (
                                  <div className="relative">
                                    <img 
                                      src={member.photo} 
                                      alt={member.name || 'Member'} 
                                      className="w-16 h-16 rounded-full object-cover border-2 border-blue-500"
                                    />
                                    <label className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-1 cursor-pointer hover:bg-blue-700">
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                      </svg>
                                      <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                          if (e.target.files[0]) {
                                            handleMemberPhotoUpload(member.id, e.target.files[0])
                                          }
                                          e.target.value = ''
                                        }}
                                        className="hidden"
                                      />
                                    </label>
                                    <button
                                      onClick={() => updateCommitteeMember(member.id, 'photo', null)}
                                      className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-700"
                                    >
                                      ×
                                    </button>
                                  </div>
                                ) : (
                                  <label className="cursor-pointer">
                                    <div className="w-16 h-16 rounded-full bg-gray-200 border-2 border-dashed border-gray-400 flex items-center justify-center hover:border-blue-500 hover:bg-gray-100 transition-colors">
                                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                      </svg>
                                    </div>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => {
                                        if (e.target.files[0]) {
                                          handleMemberPhotoUpload(member.id, e.target.files[0])
                                        }
                                        e.target.value = ''
                                      }}
                                      className="hidden"
                                    />
                                  </label>
                                )}
                              </div>
                              <input
                                type="text"
                                placeholder="Name"
                                value={member.name}
                                onChange={(e) => updateCommitteeMember(member.id, 'name', e.target.value)}
                                className="w-full mb-2 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              />
                              <input
                                type="text"
                                placeholder="Role"
                                value={member.role}
                                onChange={(e) => updateCommitteeMember(member.id, 'role', e.target.value)}
                                className="w-full mb-2 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              />
                              <div className="mb-2">
                                <select
                                  value={member.parentId || ''}
                                  onChange={(e) => updateCommitteeMember(member.id, 'parentId', e.target.value || null)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                >
                                  <option value="">No Parent (Top Level)</option>
                                  {safetyCommittee.filter(m => m.id !== member.id).map(parent => (
                                    <option key={parent.id} value={parent.id}>
                                      {parent.name || parent.role || `Member ${parent.id}`}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="flex gap-2">
                                <input
                                  type="tel"
                                  placeholder="Phone"
                                  value={member.phone}
                                  onChange={(e) => updateCommitteeMember(member.id, 'phone', e.target.value)}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                />
                                <button
                                  onClick={() => removeCommitteeMember(member.id)}
                                  className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right Side - Preview & Member Forms */}
            <div className="lg:col-span-2 space-y-6">
              {/* Company Logos */}
              <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-md border-2 border-gray-200">
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4">Company Logos</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                    <label className="cursor-pointer">
                      {clientLogo ? (
                        <div>
                          <img src={URL.createObjectURL(clientLogo)} alt="Client Logo" className="w-full h-32 object-contain mb-2" />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setClientLogo(null)
                            }}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div>
                          <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <p className="text-gray-700 font-medium mb-2">Client Logo</p>
                          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                            Upload
                          </button>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleLogoUpload('client', e.target.files[0])}
                            className="hidden"
                          />
                        </div>
                      )}
                    </label>
                  </div>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                    <label className="cursor-pointer">
                      {contractorLogo ? (
                        <div>
                          <img src={URL.createObjectURL(contractorLogo)} alt="Contractor Logo" className="w-full h-32 object-contain mb-2" />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setContractorLogo(null)
                            }}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div>
                          <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <p className="text-gray-700 font-medium mb-2">Contractor Logo</p>
                          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                            Upload
                          </button>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleLogoUpload('contractor', e.target.files[0])}
                            className="hidden"
                          />
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              </div>

              {/* Document Preview */}
              <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-md border-2 border-red-500">
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-6">Preview & Member Forms</h2>
                
                <div className="space-y-6">
                  {/* Title */}
                  <div>
                    <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Safety Team</h3>
                    <p className="text-base lg:text-lg text-gray-700">
                      Why Run an Electricity Safety? 1.Fire prevention 2.Fire safety 3.Firefighting and what to do in case of a fire
                    </p>
                  </div>

                  {/* How do fires start? */}
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-4">How do fires start?</h4>
                    <div className="space-y-3 mb-4">
                      <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                        <div className="font-semibold text-gray-900 mb-1">Heat</div>
                        <div className="text-sm text-gray-700">an ignition source e.g. electrical fault, naked flame, weld torch or hot embers</div>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-orange-500">
                        <div className="font-semibold text-gray-900 mb-1">Fuel</div>
                        <div className="text-sm text-gray-700">something that will burn e.g. dry timber, chemical, plastics, paper or cardboard</div>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-green-500">
                        <div className="font-semibold text-gray-900 mb-1">Oxygen</div>
                        <div className="text-sm text-gray-700">found in the atmosphere</div>
                      </div>
                    </div>
                    <div className="p-4 bg-yellow-100 border-2 border-yellow-300 rounded-lg">
                      <p className="text-sm text-gray-900 font-medium">
                        If you remove one of these from the triangle, fire will be prevented.
                      </p>
                    </div>
                  </div>

                  {/* Fire Prevention */}
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-4">Fire Prevention</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-700">
                      <li>Use proper sealed containers for flammable liquids</li>
                      <li>Ensure all electrical equipment is in good working order and is not overloaded</li>
                      <li>Secure electrical equipment or appliance is not faulty and are currently certified</li>
                      <li>Do not smoke in areas where smoking is prohibited</li>
                      <li>Apply 'hot work' permits and ensure compliance</li>
                    </ul>
                  </div>

                  {/* Fire Safety */}
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-4">Fire Safety</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-700">
                      <li>Ensure escape routes are clear</li>
                      <li>You still smoke</li>
                      <li>Know where your extinguishers are located and how to use them</li>
                      <li>Know your assembly point</li>
                    </ul>
                  </div>

                  {/* Firefighting and What To Do */}
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-4">Firefighting and What To Do In The Case of a Fire</h4>
                    <div className="flex flex-wrap gap-3 mb-4">
                      {roles.map((role, index) => (
                        <div
                          key={index}
                          className={`${role.color} text-white px-4 py-2 rounded-lg font-semibold text-sm lg:text-base`}
                        >
                          {role.name}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Safety Committee */}
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-4">Safety Committee (Firefighting)</h4>
                    {safetyCommittee.length === 0 ? (
                      <p className="text-gray-600 italic">Add safety committee members</p>
                    ) : (
                      <div className="space-y-3">
                        {safetyCommittee.map((member) => (
                          <div key={member.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-3">
                            {member.photo && (
                              <img 
                                src={member.photo} 
                                alt={member.name || 'Member'} 
                                className="w-12 h-12 rounded-full object-cover border-2 border-blue-500 flex-shrink-0"
                              />
                            )}
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900">{member.name || 'Unnamed Member'}</div>
                              {member.role && <div className="text-sm text-gray-600">{member.role}</div>}
                              {member.phone && <div className="text-sm text-gray-600">Phone: {member.phone}</div>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default EmergencyTeam

