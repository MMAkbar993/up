import { useState } from 'react'

const SafetyCommittee = ({ activeNav, setActiveNav, sidebarOpen, setSidebarOpen }) => {
  const [safetyCommittee, setSafetyCommittee] = useState([])
  const [clientLogo, setClientLogo] = useState(null)
  const [contractorLogo, setContractorLogo] = useState(null)

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
    setSafetyCommittee(prev => prev.filter(member => member.id !== id))
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

        {/* Sidebar - Reuse from Dashboard */}
        <aside
          className={`fixed md:static inset-y-0 left-0 z-50 md:z-auto w-64 lg:w-72 xl:w-80 bg-white md:bg-gray-50 min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-80px)] lg:min-h-[calc(100vh-88px)] p-4 lg:p-6 border-r border-gray-200 shadow-lg md:shadow-none transform transition-transform duration-300 ease-in-out overflow-y-auto ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
          {/* Sidebar content would be here - simplified for now */}
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10 min-w-0">
          {/* Page Header */}
          <div className="mb-6 lg:mb-8">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 mb-2">
                  Safety Committee
                </h1>
                <p className="text-sm lg:text-base text-gray-600">
                  Manage safety committee members and create safety documentation.
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
                    <div className="space-y-2 max-h-96 overflow-y-auto">
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

export default SafetyCommittee

