import { useState } from 'react'
import Sidebar from './Sidebar'

const AuthorizedPersons = ({ activeNav, setActiveNav, sidebarOpen, setSidebarOpen }) => {
  const [persons, setPersons] = useState(() => {
    // Load from localStorage on mount
    try {
      const saved = localStorage.getItem('authorizedPersons')
      return saved ? JSON.parse(saved) : []
    } catch (error) {
      console.error('Error loading authorized persons:', error)
      return []
    }
  })
  const [selectedPersons, setSelectedPersons] = useState([])
  const [showSignage, setShowSignage] = useState(false)
  const [viewingPerson, setViewingPerson] = useState(null)
  const [multiPersonSignage, setMultiPersonSignage] = useState(false)
  const [pageBackgroundColor, setPageBackgroundColor] = useState('#FFFFFF')
  const [cardBackgroundColors, setCardBackgroundColors] = useState({}) // { personId: color }
  const [headerText, setHeaderText] = useState('AUTHORIZED PERSONNEL')
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false)
  const [editableTexts, setEditableTexts] = useState({}) // Store custom editable text for each person
  const [isEditingMode, setIsEditingMode] = useState(false)
  const [formData, setFormData] = useState({
    paperSize: 'A4',
    orientation: 'Landscape',
    signageCategory: 'Mandatory',
    photo: null,
    name: '',
    position: '',
    department: '',
    employeeId: '',
    email: '',
    phone: '',
    authorizationLevel: '',
    validFrom: '',
    validTo: '',
    notes: '',
    qrCodeText: ''
  })

  // Get category color
  const getCategoryColor = (category) => {
    const colorMap = {
      'Danger': '#DC2626',      // Red
      'Warning': '#F59E0B',     // Amber/Yellow
      'Mandatory': '#0052CC',   // Blue
      'Prohibition': '#DC2626', // Red
      'Emergency': '#EF4444',   // Red
      'Information': '#3B82F6'  // Blue
    }
    return colorMap[category] || '#0052CC'
  }

  // Helper function to determine if a color is dark
  const isDarkColor = (color) => {
    if (!color) return false
    // Convert hex to RGB
    const hex = color.replace('#', '')
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    return luminance < 0.5
  }

  // Get appropriate text color based on background
  const getTextColor = (backgroundColor) => {
    if (!backgroundColor) return 'text-gray-900'
    return isDarkColor(backgroundColor) ? 'text-white' : 'text-gray-900'
  }

  // Get appropriate secondary text color based on background
  const getSecondaryTextColor = (backgroundColor) => {
    if (!backgroundColor) return 'text-gray-700'
    return isDarkColor(backgroundColor) ? 'text-gray-200' : 'text-gray-700'
  }

  // Get category border color class
  const getCategoryBorderClass = (category) => {
    const classMap = {
      'Danger': 'border-red-600',
      'Warning': 'border-yellow-500',
      'Mandatory': 'border-blue-600',
      'Prohibition': 'border-red-600',
      'Emergency': 'border-red-500',
      'Information': 'border-blue-500'
    }
    return classMap[category] || 'border-blue-600'
  }

  // Get category button color class
  const getCategoryButtonClass = (category) => {
    const classMap = {
      'Danger': 'bg-red-600 hover:bg-red-700',
      'Warning': 'bg-yellow-500 hover:bg-yellow-600',
      'Mandatory': 'bg-blue-600 hover:bg-blue-700',
      'Prohibition': 'bg-red-600 hover:bg-red-700',
      'Emergency': 'bg-red-500 hover:bg-red-600',
      'Information': 'bg-blue-500 hover:bg-blue-600'
    }
    return classMap[category] || 'bg-blue-600 hover:bg-blue-700'
  }

  // Get category tag class
  const getCategoryTagClass = (category) => {
    const classMap = {
      'Danger': 'bg-red-600 text-white',
      'Warning': 'bg-yellow-500 text-gray-900',
      'Mandatory': 'bg-blue-600 text-white',
      'Prohibition': 'bg-red-600 text-white',
      'Emergency': 'bg-red-500 text-white',
      'Information': 'bg-blue-500 text-white'
    }
    return classMap[category] || 'bg-blue-600 text-white'
  }

  // Calculate grid layout based on person count
  const getGridLayout = (count) => {
    if (count === 1) return 'grid-cols-1'
    if (count === 2) return 'grid-cols-2'
    if (count === 3) return 'grid-cols-3'
    if (count === 4) return 'grid-cols-2 grid-rows-2'
    if (count >= 5) return 'grid-cols-3 grid-rows-2'
    return 'grid-cols-1'
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData(prev => ({
        ...prev,
        photo: file
      }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (formData.name && formData.photo) {
      const newPerson = {
        id: Date.now(),
        ...formData,
        photoUrl: URL.createObjectURL(formData.photo),
        qrCodeText: formData.qrCodeText && formData.qrCodeText.trim().length > 0 ? formData.qrCodeText.trim() : ''
      }
      const updatedPersons = [...persons, newPerson]
      setPersons(updatedPersons)
      // Save to localStorage for access from other components
      try {
        localStorage.setItem('authorizedPersons', JSON.stringify(updatedPersons))
      } catch (error) {
        console.error('Error saving authorized persons to localStorage:', error)
      }
      // Reset form
      setFormData({
        paperSize: 'A4',
        orientation: 'Landscape',
        signageCategory: 'Mandatory',
        photo: null,
        name: '',
        position: '',
        department: '',
        employeeId: '',
        email: '',
        phone: '',
        authorizationLevel: '',
        validFrom: '',
        validTo: '',
        notes: '',
        qrCodeText: ''
      })
    }
  }

  const deletePerson = (id) => {
    setPersons(prev => prev.filter(person => person.id !== id))
    setSelectedPersons(prev => prev.filter(pid => pid !== id))
    const newColors = { ...cardBackgroundColors }
    delete newColors[id]
    setCardBackgroundColors(newColors)
  }

  const toggleSelection = (id) => {
    setSelectedPersons(prev => {
      if (prev.includes(id)) {
        return prev.filter(pid => pid !== id)
      } else {
        if (prev.length >= 5) {
          alert('Maximum 5 persons can be selected for multi-person signage')
          return prev
        }
        return [...prev, id]
      }
    })
  }

  const handleViewSignage = (person) => {
    setViewingPerson(person)
    setMultiPersonSignage(false)
    setShowSignage(true)
  }

  const handleGenerateMultiPerson = () => {
    if (selectedPersons.length === 0) {
      alert('Please select at least one person')
      return
    }
    setViewingPerson(null)
    setMultiPersonSignage(true)
    setShowSignage(true)
  }

  const handlePrint = () => {
    window.print()
  }

  const getShiftDisplay = (shift) => {
    if (!shift) return ''
    if (shift.includes('1')) return '1st Shift'
    if (shift.includes('2')) return '2nd Shift'
    if (shift.includes('3')) return '3rd Shift'
    if (shift.includes('4')) return '4th Shift'
    return shift
  }

  const selectedPersonsList = persons.filter(p => selectedPersons.includes(p.id))

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm px-4 md:px-6 lg:px-8 py-3 md:py-4 lg:py-5 sticky top-0 z-50">
        <div className="flex items-center justify-between gap-4 max-w-[1920px] mx-auto">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
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
            <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 mb-2">
              Authorized Persons Management
            </h1>
            <p className="text-sm lg:text-base text-gray-600">
              Create professional paper signage for authorized personnel.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Left: Add New Person Form */}
            <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-md border-2 border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Add New Person</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
                {/* Paper Size */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Paper Size <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <select
                      value={formData.paperSize}
                      onChange={(e) => handleInputChange('paperSize', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                      required
                    >
                      <option value="A4">A4 (210 x 297 mm)</option>
                      <option value="A3">A3 (297 x 420 mm)</option>
                      <option value="A2">A2 (420 x 594 mm)</option>
                      <option value="Letter">Letter (8.5 x 11 in)</option>
                    </select>
                  </div>
                </div>

                {/* Orientation */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Orientation <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </div>
                    <select
                      value={formData.orientation}
                      onChange={(e) => handleInputChange('orientation', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                      required
                    >
                      <option value="Landscape">Landscape</option>
                      <option value="Portrait">Portrait</option>
                    </select>
                  </div>
                </div>

                {/* Signage Category */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Signage Category <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                      className="w-full pl-10 pr-10 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base text-left bg-white flex items-center gap-3"
                      style={{ borderColor: getCategoryColor(formData.signageCategory) }}
                    >
                      <div
                        className="w-5 h-5 rounded border-2 border-white shadow-sm flex-shrink-0"
                        style={{ backgroundColor: getCategoryColor(formData.signageCategory) }}
                      ></div>
                      <span className="flex-1">{formData.signageCategory}</span>
                      <svg className={`w-5 h-5 text-gray-400 transition-transform ${categoryDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {categoryDropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setCategoryDropdownOpen(false)}
                        ></div>
                        <div className="absolute z-20 w-full mt-1 bg-white border-2 border-gray-300 rounded-xl shadow-lg overflow-hidden">
                          {[
                            { value: 'Mandatory', label: 'Mandatory', color: '#0052CC' },
                            { value: 'Danger', label: 'Danger', color: '#DC2626' },
                            { value: 'Warning', label: 'Warning', color: '#F59E0B' },
                            { value: 'Prohibition', label: 'Prohibition', color: '#DC2626' },
                            { value: 'Emergency', label: 'Emergency', color: '#EF4444' },
                            { value: 'Information', label: 'Information', color: '#3B82F6' }
                          ].map((category) => (
                            <button
                              key={category.value}
                              type="button"
                              onClick={() => {
                                handleInputChange('signageCategory', category.value)
                                setCategoryDropdownOpen(false)
                              }}
                              className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left ${formData.signageCategory === category.value ? 'bg-blue-50' : ''
                                }`}
                            >
                              <div
                                className="w-5 h-5 rounded border-2 border-white shadow-sm flex-shrink-0"
                                style={{ backgroundColor: category.color }}
                              ></div>
                              <span className="flex-1 font-medium">{category.label}</span>
                              {formData.signageCategory === category.value && (
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Photo */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Photo <span className="text-red-500">*</span>
                  </label>
                  <div className="border-2 border-gray-300 rounded-xl p-6 text-center">
                    {formData.photo ? (
                      <div className="space-y-3">
                        <img
                          src={URL.createObjectURL(formData.photo)}
                          alt="Preview"
                          className="w-32 h-32 mx-auto object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => handleInputChange('photo', null)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Remove Photo
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-gray-700 font-medium">No photo</p>
                            <p className="text-sm text-gray-500 mt-1">Click to upload</p>
                          </div>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                          required
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                    required
                  />
                </div>

                {/* Position */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Position <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => handleInputChange('position', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                    required
                  />
                </div>

                {/* Department */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                    required
                  />
                </div>

                {/* Employee ID */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Employee ID
                  </label>
                  <input
                    type="text"
                    value={formData.employeeId}
                    onChange={(e) => handleInputChange('employeeId', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                    required
                  />
                </div>

                {/* Shift */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Shift
                  </label>
                  <select
                    value={formData.authorizationLevel}
                    onChange={(e) => handleInputChange('authorizationLevel', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                  >
                    <option value="">Select Level</option>
                    <option value="Shift 1">Shift 1</option>
                    <option value="Shift 2">Shift 2</option>
                    <option value="Shift 3">Shift 3</option>
                    <option value="Shift 4">Shift 4</option>
                  </select>
                </div>

                {/* Valid From */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Valid From
                  </label>
                  <input
                    type="date"
                    value={formData.validFrom}
                    onChange={(e) => handleInputChange('validFrom', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                  />
                </div>

                {/* Valid To */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Valid To
                  </label>
                  <input
                    type="date"
                    value={formData.validTo}
                    onChange={(e) => handleInputChange('validTo', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    rows="3"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base resize-none"
                  />
                </div>

                {/* QR Code Text */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    QR Code Text/URL (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.qrCodeText}
                    onChange={(e) => handleInputChange('qrCodeText', e.target.value)}
                    placeholder="Leave empty to auto-generate from name and ID"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter custom text or URL for QR code. If left empty, will use name and employee ID.
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold text-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  Add Person
                </button>
              </form>
            </div>

            {/* Right: Authorized Personnel List */}
            <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-md border-2 border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Authorized Personnel List</h2>
                <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                  {persons.length} {persons.length === 1 ? 'Person' : 'Persons'}
                </span>
              </div>

              {persons.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No authorized persons added yet.</h3>
                  <p className="text-sm text-gray-500">Add your first authorized person using the form.</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {persons.map((person) => {
                      const categoryColor = getCategoryColor(person.signageCategory)
                      const borderClass = getCategoryBorderClass(person.signageCategory)
                      const buttonClass = getCategoryButtonClass(person.signageCategory)
                      const tagClass = getCategoryTagClass(person.signageCategory)
                      const isSelected = selectedPersons.includes(person.id)

                      return (
                        <div
                          key={person.id}
                          className={`border-2 rounded-xl p-4 transition-all ${isSelected ? `${borderClass} shadow-lg` : 'border-gray-200'}`}
                        >
                          <div className="flex items-start gap-4">
                            {/* Checkbox */}
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelection(person.id)}
                              className="mt-2 w-5 h-5 rounded border-gray-300 cursor-pointer"
                            />

                            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                              <img
                                src={person.photoUrl}
                                alt={person.name}
                                className="w-full h-full object-cover"
                              />
                            </div>

                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-gray-900 text-lg mb-1">{person.name}</h3>
                              <p className="text-sm text-gray-600 mb-2">{person.position}</p>

                              {/* Category Tag */}
                              <div className="mb-2">
                                <span className={`px-2 py-1 rounded text-xs font-semibold ${tagClass}`}>
                                  {person.signageCategory}
                                </span>
                              </div>

                              <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-3">
                                <span>{person.department}</span>
                                {person.employeeId && <span>• ID: {person.employeeId}</span>}
                              </div>

                              {/* View Signage Button */}
                              <button
                                onClick={() => handleViewSignage(person)}
                                className={`${buttonClass} text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors`}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                View Signage
                              </button>
                            </div>

                            <button
                              onClick={() => deletePerson(person.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Multi-Person Signage Generation */}
                  {selectedPersons.length > 0 && (
                    <div className="border-t-2 border-gray-200 pt-6 mt-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-sm font-semibold text-gray-700">
                            {selectedPersons.length} {selectedPersons.length === 1 ? 'Person' : 'Persons'} Selected
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Select up to 5 persons to generate multi-person signage.
                          </p>
                        </div>
                        <button
                          onClick={handleGenerateMultiPerson}
                          disabled={selectedPersons.length === 0}
                          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Generate Multi-Person Signage
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Signage Preview Modal */}
      {showSignage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 print-modal-overlay">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col print-visible">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b-2 border-gray-200 no-print">
              <h2 className="text-2xl font-bold text-gray-900">
                {multiPersonSignage ? 'Multi-Person Signage Preview' : 'Signage Preview'}
              </h2>
              <div className="flex items-center gap-4">
                {/* Header Text Input */}
                <div className="flex items-center gap-2">
                  <label className="text-sm font-semibold text-gray-700">Header Text:</label>
                  <input
                    type="text"
                    value={headerText}
                    onChange={(e) => setHeaderText(e.target.value)}
                    placeholder="AUTHORIZED PERSONNEL"
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
                  />
                </div>
                {/* Background Color Picker */}
                <div className="flex items-center gap-2">
                  <label className="text-sm font-semibold text-gray-700">Page Background:</label>
                  <input
                    type="color"
                    value={pageBackgroundColor}
                    onChange={(e) => setPageBackgroundColor(e.target.value)}
                    className="w-12 h-10 rounded border-2 border-gray-300 cursor-pointer"
                  />
                </div>

                <button
                  onClick={handlePrint}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print
                </button>

                <button
                  onClick={() => setShowSignage(false)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Signage Preview */}
            <div className="flex-1 overflow-y-auto p-6 print:p-0 print-visible">
              <div
                className="mx-auto print:w-full print-visible"
                style={{
                  backgroundColor: pageBackgroundColor,
                  width: '210mm',
                  minHeight: '297mm',
                  padding: '20mm'
                }}
              >
                {multiPersonSignage ? (
                  /* Multi-Person Signage */
                  <div className="flex flex-col h-full">
                    {/* Header */}
                    <div
                      className="w-full py-4 px-6 rounded-t-lg mb-6"
                      style={{ backgroundColor: '#DC2626' }}
                    >
                      <h1 className="text-3xl font-bold text-white text-center uppercase">{headerText || 'AUTHORIZED PERSONNEL'}</h1>
                    </div>

                    {/* Grid of Persons */}
                    <div className={`grid ${getGridLayout(selectedPersonsList.length)} gap-6 flex-1`}>
                      {selectedPersonsList.map((person, index) => {
                        const categoryColor = getCategoryColor(person.signageCategory)
                        const cardBgColor = cardBackgroundColors[person.id] || '#FFFFFF'
                        const shift = getShiftDisplay(person.authorizationLevel)

                        return (
                          <div
                            key={person.id}
                            className="relative border-4 rounded-lg p-4 flex flex-col"
                            style={{
                              borderColor: categoryColor,
                              backgroundColor: cardBgColor,
                              borderWidth: '4px'
                            }}
                          >
                            {/* Person Number Badge */}
                            <div
                              className="absolute top-2 right-2 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg"
                              style={{ backgroundColor: categoryColor }}
                            >
                              {index + 1}
                            </div>

                            {/* Profile Photo */}
                            <div className="flex justify-center mb-4 mt-2">
                              <img
                                src={person.photoUrl}
                                alt={person.name}
                                className="w-32 h-32 rounded-full object-cover border-4"
                                style={{ borderColor: categoryColor }}
                              />
                            </div>

                            {/* Name */}
                            <h3 className={`text-center font-bold text-xl mb-3 ${getTextColor(cardBgColor)}`}>{person.name}</h3>

                            {/* ID */}
                            <div className="mb-2 flex items-center gap-2">
                              <span className={`font-semibold ${getSecondaryTextColor(cardBgColor)}`}>#</span>
                              <span className={getSecondaryTextColor(cardBgColor)}>ID: {person.employeeId || 'N/A'}</span>
                            </div>

                            {/* Role */}
                            <div className="mb-2 flex items-center gap-2">
                              <svg className={`w-5 h-5 ${isDarkColor(cardBgColor) ? 'text-gray-300' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              <span className={getSecondaryTextColor(cardBgColor)}>Role: <span style={{ color: categoryColor, fontWeight: 'bold' }}>{person.position}</span></span>
                            </div>

                            {/* Department */}
                            <div className="mb-3 flex items-center gap-2">
                              <svg className={`w-5 h-5 ${isDarkColor(cardBgColor) ? 'text-gray-300' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                              <span className={getSecondaryTextColor(cardBgColor)}>Dept: {person.department}</span>
                            </div>

                            {/* Shift */}
                            {shift && (
                              <div
                                className="mb-3 py-2 px-3 rounded flex items-center gap-2"
                                style={{ backgroundColor: categoryColor }}
                              >
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-white font-semibold">{shift}</span>
                              </div>
                            )}

                            {/* Contact Info */}
                            <div className="space-y-2 mb-3">
                              <div className="flex items-center gap-2 bg-yellow-50 py-1 px-2 rounded">
                                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <span className="text-sm text-gray-700">{person.phone}</span>
                              </div>
                              {person.email && (
                                <div className="flex items-center gap-2 bg-yellow-50 py-1 px-2 rounded">
                                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                  <span className="text-sm text-gray-700">{person.email}</span>
                                </div>
                              )}
                            </div>

                            {/* Notes */}
                            {person.notes && person.notes.trim().length > 0 && (
                              <div className="mb-3">
                                <div className="bg-gray-100 py-2 px-3 rounded">
                                  <div className="flex items-start gap-2">
                                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    <p className="text-xs text-gray-700 whitespace-pre-wrap break-words">{person.notes}</p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* QR Code */}
                            {person.qrCodeText && person.qrCodeText.trim().length > 0 && (
                              <div className="mt-auto flex justify-center pt-2">
                                <img
                                  src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(person.qrCodeText.trim())}`}
                                  alt="QR Code"
                                  className="w-20 h-20 border-2 border-gray-300 p-1 bg-white rounded"
                                />
                              </div>
                            )}

                            {/* Card Background Color Picker (for editing) */}
                            <div className="mt-2 flex items-center gap-2 no-print">
                              <label className="text-xs text-gray-600">Card BG:</label>
                              <input
                                type="color"
                                value={cardBgColor}
                                onChange={(e) => setCardBackgroundColors(prev => ({
                                  ...prev,
                                  [person.id]: e.target.value
                                }))}
                                className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Multi-Person Footer */}
                    <div className="mt-6 py-4 px-6 rounded" style={{ backgroundColor: '#1e3a8a' }}>
                      <div className="flex justify-between items-center text-white text-sm">
                        <span>ISO 7010 Compliant • EHS Safety</span>
                        <span>{selectedPersonsList.length} {selectedPersonsList.length === 1 ? 'Person' : 'Persons'}</span>
                      </div>
                    </div>
                  </div>
                ) : viewingPerson ? (
                  /* Single Person Signage */
                  <div className="relative border-4 rounded-lg p-6 flex flex-col h-full" style={{ borderColor: getCategoryColor(viewingPerson.signageCategory), backgroundColor: cardBackgroundColors[viewingPerson.id] || '#FFFFFF' }}>
                    {/* Header - Editable */}
                    <div
                      className={`w-full py-4 px-6 rounded-t-lg mb-6 ${isEditingMode ? 'outline-2 outline-dashed outline-blue-400' : ''}`}
                      style={{ backgroundColor: getCategoryColor(viewingPerson.signageCategory) }}
                    >
                      <h1
                        className="text-3xl font-bold text-white text-center uppercase"
                        contentEditable={isEditingMode}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => {
                          const personKey = `person_${viewingPerson.id}`
                          setEditableTexts(prev => ({
                            ...prev,
                            [`${personKey}_header`]: e.target.textContent || (headerText || 'AUTHORIZED PERSONNEL')
                          }))
                        }}
                        style={{ cursor: isEditingMode ? 'text' : 'default', minHeight: '48px' }}
                      >
                        {(() => {
                          const personKey = `person_${viewingPerson.id}`
                          return editableTexts[`${personKey}_header`] !== undefined
                            ? editableTexts[`${personKey}_header`]
                            : (headerText || 'AUTHORIZED PERSONNEL')
                        })()}
                      </h1>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center">
                      {/* Profile Photo */}
                      <div className="mb-6">
                        <img
                          src={viewingPerson.photoUrl}
                          alt={viewingPerson.name}
                          className="w-40 h-40 rounded-full object-cover border-4 mx-auto"
                          style={{ borderColor: getCategoryColor(viewingPerson.signageCategory) }}
                        />
                      </div>

                      {/* Name - Editable */}
                      {(() => {
                        const cardBgColor = cardBackgroundColors[viewingPerson.id] || '#FFFFFF'
                        const personKey = `person_${viewingPerson.id}`
                        const defaultName = viewingPerson.name
                        const customName = editableTexts[`${personKey}_name`] !== undefined ? editableTexts[`${personKey}_name`] : defaultName

                        return (
                          <>
                            <h2
                              className={`text-3xl font-bold mb-6 ${getTextColor(cardBgColor)} ${isEditingMode ? 'outline-2 outline-dashed outline-blue-400 p-2 rounded' : ''}`}
                              contentEditable={isEditingMode}
                              suppressContentEditableWarning={true}
                              onBlur={(e) => {
                                setEditableTexts(prev => ({
                                  ...prev,
                                  [`${personKey}_name`]: e.target.textContent || defaultName
                                }))
                              }}
                              style={{
                                minHeight: '48px',
                                cursor: isEditingMode ? 'text' : 'default'
                              }}
                            >
                              {customName}
                            </h2>

                            {/* Details - Editable */}
                            <div className="w-full space-y-3 mb-6">
                              <div className="flex items-center gap-3 bg-white py-2 px-4 rounded">
                                <span className="text-xl font-semibold">#</span>
                                <span
                                  className={`text-lg text-gray-700 flex-1 ${isEditingMode ? 'outline-2 outline-dashed outline-blue-400 p-1 rounded' : ''}`}
                                  contentEditable={isEditingMode}
                                  suppressContentEditableWarning={true}
                                  onBlur={(e) => {
                                    const text = e.target.textContent || `ID: ${viewingPerson.employeeId || 'N/A'}`
                                    setEditableTexts(prev => ({
                                      ...prev,
                                      [`${personKey}_id`]: text
                                    }))
                                  }}
                                  style={{ cursor: isEditingMode ? 'text' : 'default' }}
                                >
                                  {editableTexts[`${personKey}_id`] !== undefined ? editableTexts[`${personKey}_id`] : `ID: ${viewingPerson.employeeId || 'N/A'}`}
                                </span>
                              </div>

                              <div className="flex items-center gap-3 bg-white py-2 px-4 rounded">
                                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <span
                                  className={`text-lg text-gray-700 flex-1 ${isEditingMode ? 'outline-2 outline-dashed outline-blue-400 p-1 rounded' : ''}`}
                                  contentEditable={isEditingMode}
                                  suppressContentEditableWarning={true}
                                  onBlur={(e) => {
                                    const text = e.target.textContent || `Role: ${viewingPerson.position}`
                                    setEditableTexts(prev => ({
                                      ...prev,
                                      [`${personKey}_role`]: text
                                    }))
                                  }}
                                  style={{ cursor: isEditingMode ? 'text' : 'default' }}
                                >
                                  {editableTexts[`${personKey}_role`] !== undefined ? editableTexts[`${personKey}_role`] : `Role: ${viewingPerson.position}`}
                                </span>
                              </div>

                              <div className="flex items-center gap-3 bg-white py-2 px-4 rounded">
                                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                <span
                                  className={`text-lg text-gray-700 flex-1 ${isEditingMode ? 'outline-2 outline-dashed outline-blue-400 p-1 rounded' : ''}`}
                                  contentEditable={isEditingMode}
                                  suppressContentEditableWarning={true}
                                  onBlur={(e) => {
                                    const text = e.target.textContent || `Dept: ${viewingPerson.department}`
                                    setEditableTexts(prev => ({
                                      ...prev,
                                      [`${personKey}_dept`]: text
                                    }))
                                  }}
                                  style={{ cursor: isEditingMode ? 'text' : 'default' }}
                                >
                                  {editableTexts[`${personKey}_dept`] !== undefined ? editableTexts[`${personKey}_dept`] : `Dept: ${viewingPerson.department}`}
                                </span>
                              </div>
                            </div>
                          </>
                        )
                      })()}

                      {/* Shift - Editable */}
                      {viewingPerson.authorizationLevel && (
                        <div
                          className={`w-full py-3 px-4 rounded mb-6 flex items-center justify-center gap-3 ${isEditingMode ? 'outline-2 outline-dashed outline-blue-400' : ''}`}
                          style={{ backgroundColor: getCategoryColor(viewingPerson.signageCategory) }}
                        >
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span
                            className="text-xl text-white font-semibold flex-1 text-center"
                            contentEditable={isEditingMode}
                            suppressContentEditableWarning={true}
                            onBlur={(e) => {
                              const personKey = `person_${viewingPerson.id}`
                              const defaultShift = getShiftDisplay(viewingPerson.authorizationLevel)
                              setEditableTexts(prev => ({
                                ...prev,
                                [`${personKey}_shift`]: e.target.textContent || defaultShift
                              }))
                            }}
                            style={{ cursor: isEditingMode ? 'text' : 'default', minHeight: '28px' }}
                          >
                            {(() => {
                              const personKey = `person_${viewingPerson.id}`
                              const defaultShift = getShiftDisplay(viewingPerson.authorizationLevel)
                              return editableTexts[`${personKey}_shift`] !== undefined ? editableTexts[`${personKey}_shift`] : defaultShift
                            })()}
                          </span>
                        </div>
                      )}

                      {/* Contact Info - Editable */}
                      <div className="w-full space-y-2 mb-6">
                        <div className="flex items-center gap-3 bg-yellow-50 py-2 px-4 rounded">
                          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span
                            className={`text-lg text-gray-700 flex-1 ${isEditingMode ? 'outline-2 outline-dashed outline-blue-400 p-1 rounded' : ''}`}
                            contentEditable={isEditingMode}
                            suppressContentEditableWarning={true}
                            onBlur={(e) => {
                              const personKey = `person_${viewingPerson.id}`
                              setEditableTexts(prev => ({
                                ...prev,
                                [`${personKey}_phone`]: e.target.textContent || viewingPerson.phone
                              }))
                            }}
                            style={{ cursor: isEditingMode ? 'text' : 'default' }}
                          >
                            {(() => {
                              const personKey = `person_${viewingPerson.id}`
                              return editableTexts[`${personKey}_phone`] !== undefined ? editableTexts[`${personKey}_phone`] : viewingPerson.phone
                            })()}
                          </span>
                        </div>
                        {viewingPerson.email && (
                          <div className="flex items-center gap-3 bg-yellow-50 py-2 px-4 rounded">
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span className="text-lg text-gray-700">{viewingPerson.email}</span>
                          </div>
                        )}
                      </div>

                      {/* Notes - Editable */}
                      {viewingPerson.notes && viewingPerson.notes.trim().length > 0 && (
                        <div className="w-full mb-6">
                          <div className={`bg-gray-100 py-3 px-4 rounded ${isEditingMode ? 'outline-2 outline-dashed outline-blue-400' : ''}`}>
                            <div className="flex items-start gap-3">
                              <svg className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              <div className="flex-1">
                                <div className="text-xs font-semibold text-gray-600 mb-1">Notes:</div>
                                <p
                                  className={`text-sm text-gray-700 whitespace-pre-wrap break-words ${isEditingMode ? 'outline-2 outline-dashed outline-blue-400 p-1 rounded' : ''}`}
                                  contentEditable={isEditingMode}
                                  suppressContentEditableWarning={true}
                                  onBlur={(e) => {
                                    const personKey = `person_${viewingPerson.id}`
                                    setEditableTexts(prev => ({
                                      ...prev,
                                      [`${personKey}_notes`]: e.target.textContent || viewingPerson.notes
                                    }))
                                  }}
                                  style={{ cursor: isEditingMode ? 'text' : 'default', minHeight: '40px' }}
                                >
                                  {(() => {
                                    const personKey = `person_${viewingPerson.id}`
                                    return editableTexts[`${personKey}_notes`] !== undefined ? editableTexts[`${personKey}_notes`] : viewingPerson.notes
                                  })()}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* QR Code */}
                      {viewingPerson.qrCodeText && viewingPerson.qrCodeText.trim().length > 0 && (
                        <div className="mt-auto">
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(viewingPerson.qrCodeText.trim())}`}
                            alt="QR Code"
                            className="w-32 h-32 border-2 border-gray-300 p-2 bg-white rounded mx-auto"
                          />
                        </div>
                      )}

                      {/* Edit Mode Toggle and Card Background Color Picker */}
                      <div className="mt-4 space-y-3 no-print">
                        <div className="flex items-center justify-between gap-2">
                          <button
                            onClick={() => setIsEditingMode(!isEditingMode)}
                            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${isEditingMode
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                          >
                            {isEditingMode ? '✓ Edit Mode ON' : '✎ Enable Edit Mode'}
                          </button>
                          {isEditingMode && (
                            <button
                              onClick={() => {
                                // Reset all editable texts for this person
                                const personKey = `person_${viewingPerson.id}`
                                const keysToRemove = Object.keys(editableTexts).filter(key => key.startsWith(personKey))
                                const newEditableTexts = { ...editableTexts }
                                keysToRemove.forEach(key => delete newEditableTexts[key])
                                setEditableTexts(newEditableTexts)
                              }}
                              className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm"
                            >
                              Reset to Default
                            </button>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-gray-700 font-semibold">Card Background:</label>
                          <input
                            type="color"
                            value={cardBackgroundColors[viewingPerson.id] || '#FFFFFF'}
                            onChange={(e) => setCardBackgroundColors(prev => ({
                              ...prev,
                              [viewingPerson.id]: e.target.value
                            }))}
                            className="w-12 h-10 rounded border-2 border-gray-300 cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Footer - Editable */}
                    <div className={`mt-6 py-4 px-6 rounded-b-lg ${isEditingMode ? 'outline-2 outline-dashed outline-blue-400' : ''}`} style={{ backgroundColor: '#1e3a8a' }}>
                      <div className="flex justify-between items-center text-white text-sm">
                        <span
                          contentEditable={isEditingMode}
                          suppressContentEditableWarning={true}
                          onBlur={(e) => {
                            const personKey = `person_${viewingPerson.id}`
                            setEditableTexts(prev => ({
                              ...prev,
                              [`${personKey}_footer_left`]: e.target.textContent || 'ISO 7010 Compliant • EHS Safety'
                            }))
                          }}
                          style={{ cursor: isEditingMode ? 'text' : 'default', minHeight: '20px', flex: 1 }}
                        >
                          {(() => {
                            const personKey = `person_${viewingPerson.id}`
                            return editableTexts[`${personKey}_footer_left`] !== undefined ? editableTexts[`${personKey}_footer_left`] : 'ISO 7010 Compliant • EHS Safety'
                          })()}
                        </span>
                        <span
                          contentEditable={isEditingMode}
                          suppressContentEditableWarning={true}
                          onBlur={(e) => {
                            const personKey = `person_${viewingPerson.id}`
                            setEditableTexts(prev => ({
                              ...prev,
                              [`${personKey}_footer_right`]: e.target.textContent || '1 Person'
                            }))
                          }}
                          style={{ cursor: isEditingMode ? 'text' : 'default', minHeight: '20px' }}
                        >
                          {(() => {
                            const personKey = `person_${viewingPerson.id}`
                            return editableTexts[`${personKey}_footer_right`] !== undefined ? editableTexts[`${personKey}_footer_right`] : '1 Person'
                          })()}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print Styles */}
      <style>{`
        @media print {
          /* Hide everything by default */
          body * {
            visibility: hidden;
          }
          /* Hide modal overlay background but keep structure */
          .print-modal-overlay {
            visibility: hidden !important;
            position: static !important;
            background: transparent !important;
            opacity: 1 !important;
            padding: 0 !important;
          }
          /* Make print-visible content visible and properly positioned */
          .print-visible {
            visibility: visible !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            max-width: none !important;
            max-height: none !important;
            overflow: visible !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            z-index: 9999 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          /* Show all children of print-visible */
          .print-visible * {
            visibility: visible !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          /* Hide non-print elements */
          .no-print {
            display: none !important;
            visibility: hidden !important;
          }
          /* Print utility classes */
          .print\\:w-full {
            width: 100% !important;
          }
          .print\\:p-0 {
            padding: 0 !important;
          }
          /* Page settings */
          @page {
            margin: 0;
            size: A4;
          }
          html, body {
            width: 100%;
            height: auto;
            margin: 0;
            padding: 0;
            background: white;
          }
        }
      `}</style>
    </div>
  )
}

export default AuthorizedPersons

