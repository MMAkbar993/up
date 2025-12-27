import { useState } from 'react'
import Sidebar from './Sidebar'

const OrganizationChart = ({ activeNav, setActiveNav, sidebarOpen, setSidebarOpen }) => {
  const [orgMembers, setOrgMembers] = useState([])

  const addMember = () => {
    const newMember = {
      id: Date.now(),
      name: '',
      role: '',
      phone: '',
      email: '',
      parentId: null,
      photo: null
    }
    setOrgMembers([...orgMembers, newMember])
  }

  const handleMemberPhotoUpload = (memberId, file) => {
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        updateMember(memberId, 'photo', reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const updateMember = (id, field, value) => {
    setOrgMembers(prev => prev.map(member => 
      member.id === id ? { ...member, [field]: value } : member
    ))
  }

  const removeMember = (id) => {
    setOrgMembers(prev => {
      // Remove the member and also remove any parent references
      return prev.filter(member => member.id !== id).map(member => 
        member.parentId === id ? { ...member, parentId: null } : member
      )
    })
  }

  const buildOrgChart = () => {
    const rootMembers = orgMembers.filter(m => !m.parentId)
    const buildTree = (parentId) => {
      return orgMembers
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
                  Organization Chart
                </h1>
                <p className="text-sm lg:text-base text-gray-600">
                  Create and manage your organizational hierarchy structure.
                </p>
              </div>
              <div className="flex gap-3">
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
            {/* Left Sidebar - Member Management */}
            <div className="lg:col-span-1 space-y-6">
              {/* Settings Panel */}
              <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-md border-2 border-gray-200">
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-6">Member Management</h2>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Organization Members</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{orgMembers.length} members</span>
                      <button
                        onClick={addMember}
                        className="w-8 h-8 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  {orgMembers.length > 0 && (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {orgMembers.map((member) => (
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
                                  onClick={() => updateMember(member.id, 'photo', null)}
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
                            onChange={(e) => updateMember(member.id, 'name', e.target.value)}
                            className="w-full mb-2 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                          <input
                            type="text"
                            placeholder="Role"
                            value={member.role}
                            onChange={(e) => updateMember(member.id, 'role', e.target.value)}
                            className="w-full mb-2 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                          <div className="mb-2">
                            <select
                              value={member.parentId || ''}
                              onChange={(e) => updateMember(member.id, 'parentId', e.target.value || null)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            >
                              <option value="">No Parent (Top Level)</option>
                              {orgMembers.filter(m => m.id !== member.id).map(parent => (
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
                              onChange={(e) => updateMember(member.id, 'phone', e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                            <button
                              onClick={() => removeMember(member.id)}
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
              </div>
            </div>

            {/* Right Side - Organization Chart Preview */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-md border-2 border-blue-500">
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-6">Organization Chart</h2>
                
                {orgMembers.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="text-gray-500 text-lg mb-4">No organization members yet</p>
                    <p className="text-gray-400 text-sm">Add members to start building your organization chart</p>
                  </div>
                ) : orgChartData.length > 0 ? (
                  <div className="space-y-6 max-h-[600px] overflow-y-auto p-4 bg-gray-50 rounded-lg">
                    <OrgChartNode 
                      members={orgChartData} 
                      allMembers={orgMembers}
                      onUpdateMember={updateMember}
                      onRemoveMember={removeMember}
                      onSetParent={(childId, parentId) => {
                        updateMember(childId, 'parentId', parentId)
                      }}
                      onPhotoUpload={handleMemberPhotoUpload}
                    />
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No organization structure yet. Set parent relationships to build the chart.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default OrganizationChart

