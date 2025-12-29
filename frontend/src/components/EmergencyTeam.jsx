import { useState, useRef } from 'react'
import Sidebar from './Sidebar'

const EmergencyTeam = ({ activeNav, setActiveNav, sidebarOpen, setSidebarOpen }) => {
  const [safetyCommittee, setSafetyCommittee] = useState([])
  const [clientLogo, setClientLogo] = useState(null)
  const [contractorLogo, setContractorLogo] = useState(null)
  const [textElements, setTextElements] = useState([])
  const [selectedTextElement, setSelectedTextElement] = useState(null)
  const [isTextMode, setIsTextMode] = useState(false)
  const [draggingText, setDraggingText] = useState(null)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const previewRef = useRef(null)

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
                              <div className="flex gap-2 mb-2">
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
                              <input
                                type="email"
                                placeholder="Email"
                                value={member.email || ''}
                                onChange={(e) => updateCommitteeMember(member.id, 'email', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              />
                            </div>
                          ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Side - Preview */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-md border-2 border-blue-500">
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-6">Preview</h2>
                
                <div 
                  ref={previewRef}
                  className="bg-white border-4 border-black rounded-lg overflow-hidden preview-container relative"
                  style={{
                    aspectRatio: '4/3',
                    minHeight: '500px',
                    maxHeight: '700px',
                    background: 'linear-gradient(to bottom, #f3f4f6, #ffffff)'
                  }}
                >
                  {/* Header Section */}
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 sm:p-6 text-white">
                    <div className="text-center mb-4">
                      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 uppercase">
                        Emergency Response Team
                      </h1>
                      <p className="text-sm sm:text-base opacity-90">
                        Safety Committee Members
                      </p>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-4 sm:p-6 flex-1 overflow-y-auto">
                    {safetyCommittee.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <svg className="w-24 h-24 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <p className="text-lg font-semibold">No members added yet</p>
                        <p className="text-sm">Add members to see them in the preview</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {safetyCommittee.map((member) => (
                          <div 
                            key={member.id} 
                            className="bg-white border-2 border-gray-200 rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow"
                          >
                            <div className="text-center">
                              {/* Photo */}
                              <div className="mb-3 flex justify-center">
                                {member.photo ? (
                                  <img 
                                    src={member.photo} 
                                    alt={member.name || 'Member'} 
                                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-blue-500 shadow-md"
                                  />
                                ) : (
                                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-200 border-4 border-gray-300 flex items-center justify-center">
                                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                              
                              {/* Name */}
                              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
                                {member.name || 'Unnamed Member'}
                              </h3>
                              
                              {/* Role */}
                              <div className="mb-2">
                                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                                  {member.role || 'No Role'}
                                </span>
                              </div>
                              
                              {/* Contact Info */}
                              <div className="space-y-1 text-sm text-gray-600">
                                {member.phone && (
                                  <div className="flex items-center justify-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    <span>{member.phone}</span>
                                  </div>
                                )}
                                {member.email && (
                                  <div className="flex items-center justify-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <span className="truncate max-w-[150px]">{member.email}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer Section */}
                  {safetyCommittee.length > 0 && (
                    <div className="bg-gray-800 text-white p-3 sm:p-4 text-center">
                      <p className="text-xs sm:text-sm">
                        Total Members: {safetyCommittee.length} | Emergency Response Team
                      </p>
                    </div>
                  )}
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

