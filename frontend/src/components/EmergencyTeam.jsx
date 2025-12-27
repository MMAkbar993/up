import { useState } from 'react'
import Sidebar from './Sidebar'

const EmergencyTeam = ({ activeNav, setActiveNav, sidebarOpen, setSidebarOpen }) => {
  const [safetyCommittee, setSafetyCommittee] = useState([])
  const [organizationChart, setOrganizationChart] = useState([]) // Separate state for Organization Chart
  const [clientLogo, setClientLogo] = useState(null)
  const [contractorLogo, setContractorLogo] = useState(null)
  const [textElements, setTextElements] = useState([])
  const [selectedTextElement, setSelectedTextElement] = useState(null)
  const [isTextMode, setIsTextMode] = useState(false)
  const [draggingText, setDraggingText] = useState(null)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

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

  // Organization Chart functions
  const addOrgChartMember = () => {
    const newMember = {
      id: Date.now(),
      name: '',
      role: '',
      phone: '',
      email: '',
      parentId: null,
      photo: null
    }
    setOrganizationChart([...organizationChart, newMember])
  }

  const handleOrgChartPhotoUpload = (memberId, file) => {
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        updateOrgChartMember(memberId, 'photo', reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const updateOrgChartMember = (id, field, value) => {
    setOrganizationChart(prev => prev.map(member => 
      member.id === id ? { ...member, [field]: value } : member
    ))
  }

  const removeOrgChartMember = (id) => {
    setOrganizationChart(prev => {
      // Remove the member and also remove any parent references
      return prev.filter(member => member.id !== id).map(member => 
        member.parentId === id ? { ...member, parentId: null } : member
      )
    })
  }

  const buildOrgChart = () => {
    const rootMembers = organizationChart.filter(m => !m.parentId)
    const buildTree = (parentId) => {
      return organizationChart
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

  // Organization Chart Node Component (for Organization Chart only)
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
    { name: 'First Aid', color: 'bg-yellow-500' }
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
        {/* Shared Sidebar */}
        <Sidebar 
          activeNav={activeNav}
          setActiveNav={setActiveNav}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

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

                {/* Text Editing Controls */}
                {selectedTextElement && (
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Edit Text</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Font Size</label>
                        <input
                          type="range"
                          min="10"
                          max="72"
                          value={selectedTextElement.fontSize || 16}
                          onChange={(e) => {
                            setTextElements(prev => prev.map(el => 
                              el.id === selectedTextElement.id 
                                ? { ...el, fontSize: parseInt(e.target.value) } 
                                : el
                            ))
                            setSelectedTextElement({ ...selectedTextElement, fontSize: parseInt(e.target.value) })
                          }}
                          className="w-full"
                        />
                        <span className="text-xs text-gray-600">{selectedTextElement.fontSize || 16}px</span>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Text Color</label>
                        <input
                          type="color"
                          value={selectedTextElement.color || '#000000'}
                          onChange={(e) => {
                            setTextElements(prev => prev.map(el => 
                              el.id === selectedTextElement.id 
                                ? { ...el, color: e.target.value } 
                                : el
                            ))
                            setSelectedTextElement({ ...selectedTextElement, color: e.target.value })
                          }}
                          className="w-full h-10 rounded-lg border-2 border-gray-300"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Font Weight</label>
                        <select
                          value={selectedTextElement.fontWeight || 'normal'}
                          onChange={(e) => {
                            setTextElements(prev => prev.map(el => 
                              el.id === selectedTextElement.id 
                                ? { ...el, fontWeight: e.target.value } 
                                : el
                            ))
                            setSelectedTextElement({ ...selectedTextElement, fontWeight: e.target.value })
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        >
                          <option value="normal">Normal</option>
                          <option value="bold">Bold</option>
                          <option value="lighter">Light</option>
                        </select>
                      </div>
                      <button
                        onClick={() => {
                          setTextElements(prev => prev.filter(el => el.id !== selectedTextElement.id))
                          setSelectedTextElement(null)
                        }}
                        className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold text-sm"
                      >
                        Delete Text
                      </button>
                    </div>
                  </div>
                )}

                {/* Safety Committee Section */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Safety Committee</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{safetyCommittee.length} members</span>
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
                </div>

                {/* Organization Chart Section - Separated */}
                <div className="mt-6 pt-6 border-t-2 border-gray-300">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Organization Chart</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{organizationChart.length} members</span>
                      <button
                        onClick={addOrgChartMember}
                        className="w-8 h-8 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  {organizationChart.length > 0 ? (
                    <div className="space-y-6 max-h-96 overflow-y-auto p-4 bg-gray-50 rounded-lg">
                      {orgChartData.length > 0 ? (
                        <OrgChartNode 
                          members={orgChartData} 
                          allMembers={organizationChart}
                          onUpdateMember={updateOrgChartMember}
                          onRemoveMember={removeOrgChartMember}
                          onSetParent={(childId, parentId) => {
                            updateOrgChartMember(childId, 'parentId', parentId)
                          }}
                          onPhotoUpload={handleOrgChartPhotoUpload}
                        />
                      ) : (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {organizationChart.map((member) => (
                            <div key={member.id} className="p-3 border-2 border-gray-200 rounded-lg">
                              {/* Photo Upload */}
                              <div className="mb-3 flex justify-center">
                                {member.photo ? (
                                  <div className="relative">
                                    <img 
                                      src={member.photo} 
                                      alt={member.name || 'Member'} 
                                      className="w-16 h-16 rounded-full object-cover border-2 border-green-500"
                                    />
                                    <label className="absolute bottom-0 right-0 bg-green-600 text-white rounded-full p-1 cursor-pointer hover:bg-green-700">
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                      </svg>
                                      <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                          if (e.target.files[0]) {
                                            handleOrgChartPhotoUpload(member.id, e.target.files[0])
                                          }
                                          e.target.value = ''
                                        }}
                                        className="hidden"
                                      />
                                    </label>
                                    <button
                                      onClick={() => updateOrgChartMember(member.id, 'photo', null)}
                                      className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-700"
                                    >
                                      ×
                                    </button>
                                  </div>
                                ) : (
                                  <label className="cursor-pointer">
                                    <div className="w-16 h-16 rounded-full bg-gray-200 border-2 border-dashed border-gray-400 flex items-center justify-center hover:border-green-500 hover:bg-gray-100 transition-colors">
                                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                      </svg>
                                    </div>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => {
                                        if (e.target.files[0]) {
                                          handleOrgChartPhotoUpload(member.id, e.target.files[0])
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
                                onChange={(e) => updateOrgChartMember(member.id, 'name', e.target.value)}
                                className="w-full mb-2 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              />
                              <input
                                type="text"
                                placeholder="Role"
                                value={member.role}
                                onChange={(e) => updateOrgChartMember(member.id, 'role', e.target.value)}
                                className="w-full mb-2 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              />
                              <div className="mb-2">
                                <select
                                  value={member.parentId || ''}
                                  onChange={(e) => updateOrgChartMember(member.id, 'parentId', e.target.value || null)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                >
                                  <option value="">No Parent (Top Level)</option>
                                  {organizationChart.filter(m => m.id !== member.id).map(parent => (
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
                                  onChange={(e) => updateOrgChartMember(member.id, 'phone', e.target.value)}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                />
                                <button
                                  onClick={() => removeOrgChartMember(member.id)}
                                  className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                      <p>No organization chart members yet. Click + to add members.</p>
                    </div>
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
              <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-md border-2 border-red-500 relative">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Preview & Member Forms</h2>
                  <button
                    onClick={() => setIsTextMode(!isTextMode)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                      isTextMode 
                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {isTextMode ? '✓ Text Mode ON' : '✎ Add Text'}
                  </button>
                </div>
                
                <div 
                  className="space-y-6 relative"
                  onClick={(e) => {
                    if (isTextMode && e.target === e.currentTarget && !draggingText) {
                      const rect = e.currentTarget.getBoundingClientRect()
                      const x = ((e.clientX - rect.left) / rect.width) * 100
                      const y = ((e.clientY - rect.top) / rect.height) * 100
                      
                      const newTextElement = {
                        id: Date.now(),
                        text: 'Click to edit',
                        x: Math.max(0, Math.min(100, x)),
                        y: Math.max(0, Math.min(100, y)),
                        fontSize: 16,
                        color: '#000000',
                        fontWeight: 'normal'
                      }
                      setTextElements([...textElements, newTextElement])
                      setSelectedTextElement(newTextElement)
                    }
                  }}
                  onMouseMove={(e) => {
                    if (draggingText) {
                      const rect = e.currentTarget.getBoundingClientRect()
                      const x = ((e.clientX - rect.left) / rect.width) * 100
                      const y = ((e.clientY - rect.top) / rect.height) * 100
                      
                      setTextElements(prev => prev.map(el => 
                        el.id === draggingText 
                          ? { ...el, x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) } 
                          : el
                      ))
                      if (selectedTextElement?.id === draggingText) {
                        setSelectedTextElement(prev => ({
                          ...prev,
                          x: Math.max(0, Math.min(100, x)),
                          y: Math.max(0, Math.min(100, y))
                        }))
                      }
                    }
                  }}
                  onMouseUp={() => {
                    setDraggingText(null)
                  }}
                  onMouseLeave={() => {
                    setDraggingText(null)
                  }}
                  style={{ 
                    minHeight: '400px',
                    cursor: isTextMode ? 'crosshair' : 'default'
                  }}
                >
                  {/* Text Elements */}
                  {textElements.map((element) => (
                    <div
                      key={element.id}
                      style={{
                        position: 'absolute',
                        left: `${element.x}%`,
                        top: `${element.y}%`,
                        transform: 'translate(-50%, -50%)',
                        fontSize: `${element.fontSize}px`,
                        color: element.color,
                        fontWeight: element.fontWeight,
                        cursor: draggingText === element.id ? 'grabbing' : (selectedTextElement?.id === element.id ? 'text' : 'grab'),
                        zIndex: selectedTextElement?.id === element.id ? 1000 : 100,
                        outline: selectedTextElement?.id === element.id ? '2px dashed blue' : 'none',
                        padding: selectedTextElement?.id === element.id ? '4px' : '0',
                        minWidth: '50px',
                        backgroundColor: selectedTextElement?.id === element.id ? 'rgba(255, 255, 255, 0.9)' : 'transparent',
                        userSelect: 'none'
                      }}
                      onMouseDown={(e) => {
                        if (e.target === e.currentTarget || e.target.parentElement === e.currentTarget) {
                          e.stopPropagation()
                          if (!isTextMode) {
                            setSelectedTextElement(element)
                            setDraggingText(element.id)
                            const rect = e.currentTarget.closest('.space-y-6').getBoundingClientRect()
                            setDragStart({
                              x: e.clientX - (rect.left + (rect.width * element.x / 100)),
                              y: e.clientY - (rect.top + (rect.height * element.y / 100))
                            })
                          } else {
                            setSelectedTextElement(element)
                          }
                        }
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (!draggingText) {
                          setSelectedTextElement(element)
                        }
                      }}
                      contentEditable={selectedTextElement?.id === element.id && !draggingText}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => {
                        if (selectedTextElement?.id === element.id) {
                          setTextElements(prev => prev.map(el => 
                            el.id === element.id ? { ...el, text: e.target.textContent || 'Click to edit' } : el
                          ))
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Delete' && (e.ctrlKey || e.metaKey)) {
                          setTextElements(prev => prev.filter(el => el.id !== element.id))
                          setSelectedTextElement(null)
                        }
                      }}
                    >
                      {element.text}
                    </div>
                  ))}
                  
                  {/* Click hint when in text mode */}
                  {isTextMode && textElements.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="bg-blue-100 border-2 border-blue-400 rounded-lg p-4 text-center">
                        <p className="text-blue-700 font-semibold">Click anywhere to add text</p>
                      </div>
                    </div>
                  )}
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

                  {/* Organization Chart - Separated */}
                  <div className="mt-6 pt-6 border-t-2 border-gray-300">
                    <h4 className="text-xl font-bold text-gray-900 mb-4">Organization Chart</h4>
                    {organizationChart.length === 0 ? (
                      <p className="text-gray-600 italic">Add organization chart members</p>
                    ) : (
                      <div className="space-y-4">
                        {orgChartData.length > 0 ? (
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <OrgChartNode 
                              members={orgChartData} 
                              allMembers={organizationChart}
                              onUpdateMember={updateOrgChartMember}
                              onRemoveMember={removeOrgChartMember}
                              onSetParent={(childId, parentId) => {
                                updateOrgChartMember(childId, 'parentId', parentId)
                              }}
                              onPhotoUpload={handleOrgChartPhotoUpload}
                            />
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {organizationChart.map((member) => (
                              <div key={member.id} className="p-3 bg-green-50 rounded-lg border border-green-200 flex items-center gap-3">
                                {member.photo && (
                                  <img 
                                    src={member.photo} 
                                    alt={member.name || 'Member'} 
                                    className="w-12 h-12 rounded-full object-cover border-2 border-green-500 flex-shrink-0"
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

