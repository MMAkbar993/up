import { useState } from 'react'

const SignageGenerator = ({ activeNav, setActiveNav, sidebarOpen, setSidebarOpen }) => {
  const [signageType, setSignageType] = useState('safety')
  const [formData, setFormData] = useState({
    title: '',
    purpose: '',
    category: 'Danger',
    description: '',
    location: '',
    hazards: [],
    ppe: [],
    procedures: [],
    permitRequired: false,
    emergencyContacts: [
      { label: 'Emergency', phone: '911' },
      { label: 'Safety Officer', phone: '+1 (555) 123-4567' }
    ],
    qrCodeText: '',
    size: 'A4',
    resolution: '300'
  })
  const [expandedPPECategories, setExpandedPPECategories] = useState(['General PPE'])
  const [newHazard, setNewHazard] = useState('')
  const [newProcedure, setNewProcedure] = useState('')
  const [newContact, setNewContact] = useState({ label: '', phone: '' })

  // Identification form data
  const [identificationData, setIdentificationData] = useState({
    areaName: 'INLET AREA',
    icon: 'Water/Liquid',
    backgroundColor: '#3B82F6',
    textColor: '#FFFFFF',
    iconBgColor: '#3B82F6',
    showHeader: true,
    headerText: 'AREA IDENTIFICATION',
    showFooter: true,
    footerText: 'Authorized Personnel Only',
    showImage: true,
    imagePosition: 'Background',
    imageOpacity: 30,
    fontSize: 48,
    iconSize: 80,
    showBorder: true,
    borderColor: '#FFFFFF',
    borderWidth: 4,
    orientation: 'Landscape'
  })

  const templates = [
    { id: 'inlet', name: 'INLET AREA', icon: '💧', color: 'bg-blue-500', subtitle: 'Water treatment facility entrance' },
    { id: 'panel', name: 'PANEL ROOM', icon: '⚡', color: 'bg-orange-500', subtitle: 'Electrical control panel area' },
    { id: 'generator', name: 'GENERATOR ROOM', icon: '🔌', color: 'bg-red-500', subtitle: 'Emergency generator facility' },
    { id: 'chemical', name: 'CHEMICAL STORE', icon: '🧪', color: 'bg-purple-500', subtitle: 'Chemical storage facility' },
    { id: 'control', name: 'CONTROL ROOM', icon: '📊', color: 'bg-green-500', subtitle: 'Central control and monitoring' },
    { id: 'workshop', name: 'WORKSHOP', icon: '🔧', color: 'bg-indigo-500', subtitle: 'Maintenance and repair area' }
  ]

  const iconOptions = [
    'Water/Liquid', 'Electrical', 'Fire', 'Chemical', 'Mechanical', 'Warning', 'Information', 'Location'
  ]

  const ppeCategories = {
    'General PPE': [
      { id: 'hard-hat', name: 'Hard Hat / Helmet', icon: '🪖' },
      { id: 'safety-glasses', name: 'Safety Glasses', icon: '🥽' },
      { id: 'ear-protection', name: 'Ear Protection', icon: '🎧' },
      { id: 'safety-gloves', name: 'Safety Gloves', icon: '🧤' },
      { id: 'safety-boots', name: 'Safety Boots', icon: '👢' },
      { id: 'hi-vis-vest', name: 'Hi-Vis Vest', icon: '🦺' },
      { id: 'respirator', name: 'Respirator Mask', icon: '😷' },
      { id: 'safety-harness', name: 'Safety Harness', icon: '🪢' }
    ],
    'Electrical Work PPE': [
      { id: 'arc-flash-suit', name: 'Arc Flash Suit', icon: '⚡' },
      { id: 'voltage-detector', name: 'Voltage Detector', icon: '⚡' },
      { id: 'face-shield-electrical', name: 'Face Shield (Electrical)', icon: '🛡️' },
      { id: 'electrical-safety-mat', name: 'Electrical Safety Mat', icon: '📐' },
      { id: 'insulated-gloves', name: 'Insulated Gloves', icon: '🧤' },
      { id: 'insulated-boots', name: 'Insulated Boots', icon: '👢' },
      { id: 'arc-rated-clothing', name: 'Arc-Rated Clothing', icon: '👔' }
    ],
    'Confined Space PPE': [
      { id: 'scba', name: 'SCBA (Self-Contained Breathing)', icon: '🫁' },
      { id: 'multi-gas-detector', name: 'Multi Gas Detector', icon: '📡' },
      { id: 'rescue-tripod', name: 'Rescue Tripod', icon: '🔺' },
      { id: 'ventilation-equipment', name: 'Ventilation Equipment', icon: '💨' },
      { id: 'full-body-harness', name: 'Full Body Harness', icon: '🪢' },
      { id: 'safety-apron', name: 'Safety Apron', icon: '👕' },
      { id: 'rescue-winch', name: 'Rescue Winch', icon: '⚙️' },
      { id: 'gas-monitor', name: 'Gas Monitor/Detector', icon: '📡' },
      { id: 'retrieval-system', name: 'Retrieval System', icon: '🔗' },
      { id: 'lifeline-rope', name: 'Lifeline/Rope', icon: '🪢' },
      { id: 'emergency-escape-respirator', name: 'Emergency Escape Respirator', icon: '😷' },
      { id: 'fire-extinguisher', name: 'Fire Extinguisher', icon: '🧯' },
      { id: 'emergency-light', name: 'Emergency Light', icon: '🔦' }
    ],
    'Chemical Work PPE': [
      { id: 'chemical-protective-suit', name: 'Chemical Protective Suit', icon: '🧪' },
      { id: 'chemical-goggles', name: 'Chemical Goggles', icon: '🥽' },
      { id: 'face-shield-chemical', name: 'Face Shield (Chemical)', icon: '🛡️' },
      { id: 'full-face-respirator', name: 'Full Face Respirator', icon: '😷' },
      { id: 'chemical-resistant-gloves', name: 'Chemical Resistant Gloves', icon: '🧤' },
      { id: 'acid-resistant-boots', name: 'Acid Resistant Boots', icon: '👢' },
      { id: 'chemical-apron', name: 'Chemical Apron', icon: '👕' }
    ],
    'Height Work PPE': [
      { id: 'fall-arrest-system', name: 'Fall Arrest System', icon: '⚓' },
      { id: 'anchor-point', name: 'Anchor Point', icon: '⚓' },
      { id: 'rescue-kit', name: 'Rescue Kit', icon: '📦' },
      { id: 'shock-absorber', name: 'Shock Absorber', icon: '🔧' },
      { id: 'harness-belt', name: 'Harness Belt', icon: '🪢' },
      { id: 'vertical-lifeline', name: 'Vertical Lifeline', icon: '🪢' },
      { id: 'self-retracting-lifeline', name: 'Self-Retracting Lifeline', icon: '🔗' },
      { id: 'safety-lanyard', name: 'Safety Lanyard', icon: '🔗' },
      { id: 'rope-grab-device', name: 'Rope Grab Device', icon: '🔗' },
      { id: 'positioning-belt', name: 'Positioning Belt', icon: '🪢' },
      { id: 'safety-harness-height', name: 'Safety Harness', icon: '🪢' },
      { id: 'double-lanyard', name: 'Double Lanyard', icon: '🔗' },
      { id: 'horizontal-lifeline', name: 'Horizontal Lifeline', icon: '🪢' }
    ],
    'Welding PPE': [
      { id: 'welding-helmet', name: 'Welding Helmet', icon: '🪖' },
      { id: 'welding-jacket', name: 'Welding Jacket', icon: '👔' },
      { id: 'leather-apron', name: 'Leather Apron', icon: '👕' },
      { id: 'leather-spats', name: 'Leather Spats', icon: '👢' },
      { id: 'welding-face-shield', name: 'Welding Face Shield', icon: '🛡️' },
      { id: 'welding-gloves', name: 'Welding Gloves', icon: '🧤' },
      { id: 'welding-screen', name: 'Welding Screen', icon: '🛡️' },
      { id: 'welding-respirator', name: 'Welding Respirator', icon: '😷' },
      { id: 'welding-goggles', name: 'Welding Goggles', icon: '🥽' }
    ],
    'Fire Safety PPE': [
      { id: 'fire-resistant-suit', name: 'Fire Resistant Suit', icon: '🔥' },
      { id: 'fire-helmet', name: 'Fire Helmet', icon: '🪖' },
      { id: 'fire-boots', name: 'Fire Boots', icon: '👢' },
      { id: 'fire-gloves', name: 'Fire Gloves', icon: '🧤' },
      { id: 'fire-hood', name: 'Fire Hood', icon: '🎭' },
      { id: 'fire-axe', name: 'Fire Axe', icon: '🪓' },
      { id: 'fire-extinguisher-ppe', name: 'Fire Extinguisher', icon: '🧯' }
    ],
    'Medical/Healthcare PPE': [
      { id: 'surgical-mask', name: 'Surgical Mask', icon: '😷' },
      { id: 'medical-gloves', name: 'Medical Gloves', icon: '🧤' },
      { id: 'face-shield-medical', name: 'Face Shield (Medical)', icon: '🛡️' },
      { id: 'medical-gown', name: 'Medical Gown', icon: '👕' },
      { id: 'scrubs', name: 'Scrubs', icon: '👔' },
      { id: 'shoe-covers', name: 'Shoe Covers', icon: '👢' },
      { id: 'hair-net', name: 'Hair Net', icon: '🎩' }
    ],
    'Heavy Machinery PPE': [
      { id: 'steel-toe-boots', name: 'Steel Toe Boots', icon: '👢' },
      { id: 'cut-resistant-gloves', name: 'Cut Resistant Gloves', icon: '🧤' },
      { id: 'bump-cap', name: 'Bump Cap', icon: '🪖' },
      { id: 'knee-pads', name: 'Knee Pads', icon: '🦵' },
      { id: 'back-support-belt', name: 'Back Support Belt', icon: '🪢' },
      { id: 'anti-vibration-gloves', name: 'Anti-Vibration Gloves', icon: '🧤' },
      { id: 'metatarsal-guards', name: 'Metatarsal Guards', icon: '🛡️' }
    ],
    'Food Safety PPE': [
      { id: 'food-safe-gloves', name: 'Food Safe Gloves', icon: '🧤' },
      { id: 'beard-net', name: 'Beard Net', icon: '🎩' },
      { id: 'white-coat', name: 'White Coat', icon: '👔' },
      { id: 'plastic-apron', name: 'Plastic Apron', icon: '👕' },
      { id: 'food-safe-hair-net', name: 'Food Safe Hair Net', icon: '🎩' }
    ],
    'Cold Work PPE': [
      { id: 'insulated-jacket', name: 'Insulated Jacket', icon: '🧥' },
      { id: 'thermal-gloves', name: 'Thermal Gloves', icon: '🧤' },
      { id: 'cold-weather-boots', name: 'Cold Weather Boots', icon: '👢' },
      { id: 'balaclava', name: 'Balaclava', icon: '🎭' }
    ],
    'Hot Work PPE': [
      { id: 'heat-resistant-gloves', name: 'Heat Resistant Gloves', icon: '🧤' },
      { id: 'cooling-vest', name: 'Cooling Vest', icon: '👔' },
      { id: 'heat-shield-face', name: 'Heat Shield Face', icon: '🛡️' },
      { id: 'aluminized-suit', name: 'Aluminized Suit', icon: '👔' }
    ],
    'Radiation PPE': [
      { id: 'lead-apron', name: 'Lead Apron', icon: '👕' },
      { id: 'dosimeter-badge', name: 'Dosimeter Badge', icon: '📛' },
      { id: 'radiation-badge', name: 'Radiation Badge', icon: '📛' },
      { id: 'lead-gloves', name: 'Lead Gloves', icon: '🧤' }
    ],
    'Noise Protection': [
      { id: 'ear-plugs', name: 'Ear Plugs', icon: '🎧' },
      { id: 'ear-muffs', name: 'Ear Muffs', icon: '🎧' },
      { id: 'noise-canceling-headset', name: 'Noise Canceling Headset', icon: '🎧' }
    ],
    'Eye Protection': [
      { id: 'safety-goggles', name: 'Safety Goggles', icon: '🥽' },
      { id: 'laser-safety-glasses', name: 'Laser Safety Glasses', icon: '🥽' },
      { id: 'tinted-safety-glasses', name: 'Tinted Safety Glasses', icon: '🥽' },
      { id: 'prescription-safety-glasses', name: 'Prescription Safety Glasses', icon: '🥽' }
    ],
    'Hand Protection': [
      { id: 'nitrile-gloves', name: 'Nitrile Gloves', icon: '🧤' },
      { id: 'latex-gloves', name: 'Latex Gloves', icon: '🧤' },
      { id: 'cotton-gloves', name: 'Cotton Gloves', icon: '🧤' },
      { id: 'leather-gloves', name: 'Leather Gloves', icon: '🧤' },
      { id: 'rubber-gloves', name: 'Rubber Gloves', icon: '🧤' }
    ],
    'Foot Protection': [
      { id: 'rubber-boots', name: 'Rubber Boots', icon: '👢' },
      { id: 'anti-static-boots', name: 'Anti-Static Boots', icon: '👢' },
      { id: 'wellington-boots', name: 'Wellington Boots', icon: '👢' }
    ],
    'Respiratory Protection': [
      { id: 'dust-mask', name: 'Dust Mask', icon: '😷' },
      { id: 'half-face-respirator', name: 'Half-Face Respirator', icon: '😷' },
      { id: 'powered-air-respirator', name: 'Powered Air Respirator', icon: '🫁' },
      { id: 'oxygen-supply-system', name: 'Oxygen Supply System', icon: '🫁' }
    ]
  }

  const ppeCategoryIcons = {
    'General PPE': '⚙️',
    'Electrical Work PPE': '⚡',
    'Confined Space PPE': '📦',
    'Chemical Work PPE': '🧪',
    'Height Work PPE': '🧗',
    'Welding PPE': '🔥',
    'Fire Safety PPE': '🚒',
    'Medical/Healthcare PPE': '🏥',
    'Heavy Machinery PPE': '⚙️',
    'Food Safety PPE': '🍽️',
    'Cold Work PPE': '❄️',
    'Hot Work PPE': '🌡️',
    'Radiation PPE': '☢️',
    'Noise Protection': '🔊',
    'Eye Protection': '👁️',
    'Hand Protection': '✋',
    'Foot Protection': '👞',
    'Respiratory Protection': '🫁'
  }

  const togglePPECategory = (category) => {
    setExpandedPPECategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  const togglePPE = (ppeId) => {
    setFormData(prev => ({
      ...prev,
      ppe: prev.ppe.includes(ppeId)
        ? prev.ppe.filter(id => id !== ppeId)
        : [...prev.ppe, ppeId]
    }))
  }

  const addHazard = () => {
    if (newHazard.trim()) {
      setFormData(prev => ({
        ...prev,
        hazards: [...prev.hazards, newHazard.trim()]
      }))
      setNewHazard('')
    }
  }

  const removeHazard = (index) => {
    setFormData(prev => ({
      ...prev,
      hazards: prev.hazards.filter((_, i) => i !== index)
    }))
  }

  const addProcedure = () => {
    if (newProcedure.trim()) {
      setFormData(prev => ({
        ...prev,
        procedures: [...prev.procedures, newProcedure.trim()]
      }))
      setNewProcedure('')
    }
  }

  const removeProcedure = (index) => {
    setFormData(prev => ({
      ...prev,
      procedures: prev.procedures.filter((_, i) => i !== index)
    }))
  }

  const addContact = () => {
    if (newContact.label.trim() && newContact.phone.trim()) {
      setFormData(prev => ({
        ...prev,
        emergencyContacts: [...prev.emergencyContacts, { ...newContact }]
      }))
      setNewContact({ label: '', phone: '' })
    }
  }

  const removeContact = (index) => {
    setFormData(prev => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts.filter((_, i) => i !== index)
    }))
  }

  const updateContact = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts.map((contact, i) =>
        i === index ? { ...contact, [field]: value } : contact
      )
    }))
  }

  const getCategoryColor = (category) => {
    const colors = {
      'Danger': 'bg-red-600',
      'Warning': 'bg-yellow-500',
      'Caution': 'bg-orange-500',
      'Notice': 'bg-blue-500',
      'Information': 'bg-green-500'
    }
    return colors[category] || 'bg-red-600'
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
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col lg:flex-row gap-4 lg:gap-6 p-4 sm:p-6 lg:p-8 min-w-0 overflow-x-hidden">
          {/* Form Section */}
          <div className="flex-1 lg:max-w-2xl xl:max-w-3xl space-y-6 lg:space-y-8 overflow-y-auto max-h-[calc(100vh-120px)] lg:max-h-[calc(100vh-140px)] pr-2">
            {/* Signage Type */}
            <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-md">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4 lg:mb-6">Signage Type</h2>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setSignageType('safety')}
                  className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                    signageType === 'safety'
                      ? 'border-red-500 bg-red-50 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl ${
                      signageType === 'safety' ? 'bg-red-500' : 'bg-gray-200'
                    }`}>
                      ⚠️
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-lg text-gray-900">Safety Signage</div>
                      <div className="text-sm text-gray-600 mt-1">Danger, Warning, etc.</div>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => setSignageType('identification')}
                  className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                    signageType === 'identification'
                      ? 'border-blue-500 bg-blue-50 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl ${
                      signageType === 'identification' ? 'bg-blue-500' : 'bg-gray-200'
                    }`}>
                      📍
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-lg text-gray-900">Identification</div>
                      <div className="text-sm text-gray-600 mt-1">Area labels</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Identification Templates */}
            {signageType === 'identification' && (
              <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-md">
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4 lg:mb-6">Colorful Templates</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-96 overflow-y-auto pr-2">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => {
                        setIdentificationData({
                          ...identificationData,
                          areaName: template.name,
                          icon: template.icon
                        })
                      }}
                      className={`${template.color} p-4 rounded-xl text-white hover:opacity-90 transition-opacity shadow-md hover:shadow-lg`}
                    >
                      <div className="text-3xl mb-2">{template.icon}</div>
                      <div className="font-bold text-sm mb-1">{template.name}</div>
                      <div className="text-xs opacity-90">{template.subtitle}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Signage Configuration - Safety */}
            {signageType === 'safety' && (
            <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-md space-y-6">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Signage Configuration</h2>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Signage Title / Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., INLET AREA - HIGH RISK ZONE"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Purpose / Description
                </label>
                <input
                  type="text"
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  placeholder="e.g., Confined Space Entry Control"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Signage Category / Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                >
                  <option value="Danger">Danger</option>
                  <option value="Warning">Warning</option>
                  <option value="Caution">Caution</option>
                  <option value="Notice">Notice</option>
                  <option value="Information">Information</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Additional Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter detailed description...."
                  rows="4"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Location / Area
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Building A - Floor 2"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Hazards / Warnings
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newHazard}
                    onChange={(e) => setNewHazard(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addHazard()}
                    placeholder="Add hazard (e.g., H₂S Gas Present)"
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                  />
                  <button
                    onClick={addHazard}
                    className="px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors shadow-md hover:shadow-lg"
                  >
                    +
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.hazards.map((hazard, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-800 rounded-lg text-sm font-medium"
                    >
                      {hazard}
                      <button
                        onClick={() => removeHazard(index)}
                        className="hover:text-red-900 font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
            )}

            {/* Customize Signage - Identification */}
            {signageType === 'identification' && (
              <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-md space-y-6">
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Customize Signage</h2>
                
                {/* Area Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Area Name</label>
                  <input
                    type="text"
                    value={identificationData.areaName}
                    onChange={(e) => setIdentificationData({ ...identificationData, areaName: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                  />
                </div>

                {/* Icon */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Icon</label>
                  <select
                    value={identificationData.icon}
                    onChange={(e) => setIdentificationData({ ...identificationData, icon: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                  >
                    {iconOptions.map((icon) => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                </div>

                {/* Color Pickers */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Background</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={identificationData.backgroundColor}
                        onChange={(e) => setIdentificationData({ ...identificationData, backgroundColor: e.target.value })}
                        className="w-12 h-12 rounded-lg border-2 border-gray-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={identificationData.backgroundColor}
                        onChange={(e) => setIdentificationData({ ...identificationData, backgroundColor: e.target.value })}
                        className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Text</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={identificationData.textColor}
                        onChange={(e) => setIdentificationData({ ...identificationData, textColor: e.target.value })}
                        className="w-12 h-12 rounded-lg border-2 border-gray-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={identificationData.textColor}
                        onChange={(e) => setIdentificationData({ ...identificationData, textColor: e.target.value })}
                        className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Icon BG</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={identificationData.iconBgColor}
                        onChange={(e) => setIdentificationData({ ...identificationData, iconBgColor: e.target.value })}
                        className="w-12 h-12 rounded-lg border-2 border-gray-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={identificationData.iconBgColor}
                        onChange={(e) => setIdentificationData({ ...identificationData, iconBgColor: e.target.value })}
                        className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Show Header */}
                <div>
                  <label className="flex items-center gap-3 mb-2">
                    <input
                      type="checkbox"
                      checked={identificationData.showHeader}
                      onChange={(e) => setIdentificationData({ ...identificationData, showHeader: e.target.checked })}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm font-semibold text-gray-700">Show Header</span>
                  </label>
                  {identificationData.showHeader && (
                    <input
                      type="text"
                      value={identificationData.headerText}
                      onChange={(e) => setIdentificationData({ ...identificationData, headerText: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base mt-2"
                    />
                  )}
                </div>

                {/* Show Footer */}
                <div>
                  <label className="flex items-center gap-3 mb-2">
                    <input
                      type="checkbox"
                      checked={identificationData.showFooter}
                      onChange={(e) => setIdentificationData({ ...identificationData, showFooter: e.target.checked })}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm font-semibold text-gray-700">Show Footer</span>
                  </label>
                  {identificationData.showFooter && (
                    <input
                      type="text"
                      value={identificationData.footerText}
                      onChange={(e) => setIdentificationData({ ...identificationData, footerText: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base mt-2"
                    />
                  )}
                </div>

                {/* Area Image */}
                <div>
                  <label className="flex items-center gap-3 mb-3">
                    <input
                      type="checkbox"
                      checked={identificationData.showImage}
                      onChange={(e) => setIdentificationData({ ...identificationData, showImage: e.target.checked })}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm font-semibold text-gray-700">Area Image</span>
                  </label>
                  {identificationData.showImage && (
                    <div className="space-y-4">
                      <div className="border-2 border-gray-300 rounded-xl p-4 bg-gray-50 min-h-[200px] flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-sm">Image Preview</p>
                          <p className="text-xs mt-1">Aerial view of water treatment tanks</p>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Image Position</label>
                        <div className="grid grid-cols-4 gap-2">
                          {['Top', 'Center', 'Bottom', 'Background'].map((pos) => (
                            <button
                              key={pos}
                              onClick={() => setIdentificationData({ ...identificationData, imagePosition: pos })}
                              className={`px-4 py-2 rounded-lg border-2 transition-all ${
                                identificationData.imagePosition === pos
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                              }`}
                            >
                              {pos}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Image Opacity: {identificationData.imageOpacity}%
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={identificationData.imageOpacity}
                          onChange={(e) => setIdentificationData({ ...identificationData, imageOpacity: parseInt(e.target.value) })}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Font and Icon Size */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Font: {identificationData.fontSize}px
                    </label>
                    <input
                      type="range"
                      min="24"
                      max="96"
                      value={identificationData.fontSize}
                      onChange={(e) => setIdentificationData({ ...identificationData, fontSize: parseInt(e.target.value) })}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Icon: {identificationData.iconSize}px
                    </label>
                    <input
                      type="range"
                      min="40"
                      max="120"
                      value={identificationData.iconSize}
                      onChange={(e) => setIdentificationData({ ...identificationData, iconSize: parseInt(e.target.value) })}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                {/* Position Controls */}
                <div>
                  <div className="flex items-center gap-4 mb-3">
                    <label className="flex items-center gap-2">
                      <input type="radio" name="position" defaultChecked className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-700">Icon</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="position" className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-700">Text</span>
                    </label>
                    <button className="ml-auto px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium">
                      Reset All
                    </button>
                  </div>
                  <p className="text-xs text-gray-600">Drag icon or text in preview to reposition.</p>
                </div>

                {/* Show Border */}
                <div>
                  <label className="flex items-center gap-3 mb-3">
                    <input
                      type="checkbox"
                      checked={identificationData.showBorder}
                      onChange={(e) => setIdentificationData({ ...identificationData, showBorder: e.target.checked })}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm font-semibold text-gray-700">Show Border</span>
                  </label>
                  {identificationData.showBorder && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Color</label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={identificationData.borderColor}
                            onChange={(e) => setIdentificationData({ ...identificationData, borderColor: e.target.value })}
                            className="w-12 h-12 rounded-lg border-2 border-gray-300 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={identificationData.borderColor}
                            onChange={(e) => setIdentificationData({ ...identificationData, borderColor: e.target.value })}
                            className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Width: {identificationData.borderWidth}px
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={identificationData.borderWidth}
                          onChange={(e) => setIdentificationData({ ...identificationData, borderWidth: parseInt(e.target.value) })}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Paper Size and Orientation */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Paper Size</label>
                    <select
                      value={formData.size}
                      onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                    >
                      <option value="A4">A4 (210 x 297 mm)</option>
                      <option value="A3">A3 (297 x 420 mm)</option>
                      <option value="A2">A2 (420 x 594 mm)</option>
                      <option value="Letter">Letter (8.5 x 11 in)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Orientation</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIdentificationData({ ...identificationData, orientation: 'Landscape' })}
                        className={`flex-1 px-4 py-3 rounded-xl border-2 transition-all ${
                          identificationData.orientation === 'Landscape'
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                        }`}
                      >
                        Landscape
                      </button>
                      <button
                        onClick={() => setIdentificationData({ ...identificationData, orientation: 'Portrait' })}
                        className={`flex-1 px-4 py-3 rounded-xl border-2 transition-all ${
                          identificationData.orientation === 'Portrait'
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                        }`}
                      >
                        Portrait
                      </button>
                    </div>
                  </div>
                </div>

                {/* Export Buttons */}
                <div className="flex gap-3">
                  <button className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors shadow-md hover:shadow-lg">
                    Export PNG
                  </button>
                  <button className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg">
                    Export PDF
                  </button>
                  <button className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition-colors shadow-md hover:shadow-lg">
                    Print
                  </button>
                </div>
              </div>
            )}

            {/* PPE Required - Only show for Safety */}
            {signageType === 'safety' && (
            <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-md">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
                  PPE Required (Multi-Select)
                </h2>
                <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                  {formData.ppe.length} Selected
                </span>
              </div>
              
              <div className="space-y-3">
                {Object.entries(ppeCategories).map(([category, items]) => (
                  <div key={category} className="border-2 border-gray-200 rounded-xl overflow-hidden bg-white">
                    <button
                      onClick={() => togglePPECategory(category)}
                      className="w-full px-4 py-3.5 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors rounded-t-xl"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{ppeCategoryIcons[category] || '⚙️'}</span>
                        <span className="font-semibold text-gray-900 text-base">
                          {category} ({items.length} items)
                        </span>
                      </div>
                      <svg
                        className={`w-5 h-5 text-gray-600 transition-transform duration-200 ${
                          expandedPPECategories.includes(category) ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {expandedPPECategories.includes(category) && (
                      <div className="p-4 grid grid-cols-2 gap-3 bg-white border-t-2 border-gray-100">
                        {items.map((item) => (
                          <label
                            key={item.id}
                            className="flex items-center gap-2.5 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-blue-300 transition-all duration-200 bg-white"
                          >
                            <input
                              type="checkbox"
                              checked={formData.ppe.includes(item.id)}
                              onChange={() => togglePPE(item.id)}
                              className="w-5 h-5 text-blue-600 rounded border-2 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 cursor-pointer flex-shrink-0"
                            />
                            <span className="text-xl flex-shrink-0">{item.icon}</span>
                            <span className="text-sm font-medium text-gray-700 flex-1 leading-tight">{item.name}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            )}

            {/* Safety Procedures - Only show for Safety */}
            {signageType === 'safety' && (
            <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-md">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4">Safety Procedures</h2>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newProcedure}
                  onChange={(e) => setNewProcedure(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addProcedure()}
                  placeholder="Add procedure (e.g., Gas test required)"
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                />
                <button
                  onClick={addProcedure}
                  className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors shadow-md hover:shadow-lg"
                >
                  +
                </button>
              </div>
              <div className="space-y-2">
                {formData.procedures.map((procedure, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between px-4 py-3 bg-green-50 border-2 border-green-200 rounded-lg"
                  >
                    <span className="text-gray-900 font-medium">{procedure}</span>
                    <button
                      onClick={() => removeProcedure(index)}
                      className="text-red-600 hover:text-red-800 font-bold text-xl"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
            )}

            {/* Permit Required - Only show for Safety */}
            {signageType === 'safety' && (
            <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-1">Permit Required</h2>
                  <p className="text-sm text-gray-600">Enable if a permit is needed for this area</p>
                </div>
                <button
                  onClick={() => setFormData({ ...formData, permitRequired: !formData.permitRequired })}
                  className={`relative w-16 h-8 rounded-full transition-colors ${
                    formData.permitRequired ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                      formData.permitRequired ? 'translate-x-8' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
            )}

            {/* Emergency Contacts - Only show for Safety */}
            {signageType === 'safety' && (
            <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-md space-y-4">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Emergency Contacts</h2>
              
              {formData.emergencyContacts.map((contact, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={contact.label}
                    onChange={(e) => updateContact(index, 'label', e.target.value)}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                    placeholder="Label"
                  />
                  <input
                    type="text"
                    value={contact.phone}
                    onChange={(e) => updateContact(index, 'phone', e.target.value)}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                    placeholder="Phone"
                  />
                  {formData.emergencyContacts.length > 2 && (
                    <button
                      onClick={() => removeContact(index)}
                      className="px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}

              <div className="border-t-2 border-gray-200 pt-4">
                <div className="text-sm font-semibold text-gray-700 mb-3">Add Contact:</div>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newContact.label}
                    onChange={(e) => setNewContact({ ...newContact, label: e.target.value })}
                    placeholder="Label (e.g. Fire Dept)"
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                  />
                  <input
                    type="text"
                    value={newContact.phone}
                    onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                    placeholder="Phone Number"
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                  />
                </div>
                <button
                  onClick={addContact}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                >
                  Add
                </button>
              </div>
            </div>
            )}

            {/* QR Code Text - Only show for Safety */}
            {signageType === 'safety' && (
            <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-md">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4">QR Code Text (Optional)</h2>
              <input
                type="text"
                value={formData.qrCodeText}
                onChange={(e) => setFormData({ ...formData, qrCodeText: e.target.value })}
                placeholder="URL or text for QR code"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
              />
            </div>
            )}

            {/* Size and Resolution - Only show for Safety */}
            {signageType === 'safety' && (
            <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-md grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Select Size</label>
                <select
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                >
                  <option value="A4">A4 (210x297 mm)</option>
                  <option value="A3">A3 (297x420 mm)</option>
                  <option value="A2">A2 (420x594 mm)</option>
                  <option value="Letter">Letter (8.5x11 in)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Resolution</label>
                <select
                  value={formData.resolution}
                  onChange={(e) => setFormData({ ...formData, resolution: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                >
                  <option value="300">Print Quality (300 DPI)</option>
                  <option value="150">Standard (150 DPI)</option>
                  <option value="72">Web Quality (72 DPI)</option>
                </select>
              </div>
            </div>
            )}

            {/* Action Buttons - Only show for Safety */}
            {signageType === 'safety' && (
            <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-md flex flex-col sm:flex-row gap-4">
              <button className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold text-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                Generate Signage
              </button>
              <button className="px-6 py-4 bg-blue-100 text-blue-700 rounded-xl font-semibold text-lg hover:bg-blue-200 transition-colors">
                Add Company Branding
              </button>
            </div>
            )}
          </div>

          {/* Live Preview Panel */}
          <div className="lg:w-96 xl:w-[420px] flex-shrink-0">
            <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-md sticky top-24 lg:top-28">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Live Preview</h2>
                <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold">
                  {signageType === 'identification' 
                    ? `${formData.size} • ${identificationData.orientation.toLowerCase()} • ${formData.resolution} DPI`
                    : `${formData.size} - ${formData.resolution}dpi`
                  }
                </span>
              </div>
              
              <div className="border-4 border-black rounded-lg overflow-hidden mb-6 bg-white">
                {signageType === 'safety' ? (
                  <div className={`${getCategoryColor(formData.category)} p-6 min-h-[400px] flex flex-col`}>
                    {/* Warning Icons */}
                    <div className="flex justify-center gap-4 mb-4">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl">
                        ⚠️
                      </div>
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl">
                        ⚠️
                      </div>
                    </div>
                    
                    {/* Title */}
                    <div className="text-center mb-4">
                      <h3 className="text-2xl lg:text-3xl font-bold text-white uppercase">
                        {formData.title || 'SIGNAGE TITLE'}
                      </h3>
                    </div>
                    
                    {/* Emergency Bar */}
                    {formData.emergencyContacts.length > 0 && (
                      <div className="bg-orange-500 px-4 py-2 mb-4 rounded">
                        <p className="text-white font-bold text-center text-lg">EMERGENCY</p>
                      </div>
                    )}
                    
                    {/* Emergency Contacts */}
                    <div className="space-y-2 mb-4 text-white">
                      {formData.emergencyContacts.map((contact, index) => (
                        <div key={index} className="text-center">
                          <span className="font-semibold">{contact.label}: {contact.phone}</span>
                        </div>
                      ))}
                    </div>
                    
                    {/* Footer */}
                    <div className="mt-auto bg-black px-4 py-2 rounded-b">
                      <p className="text-white text-xs text-center">
                        ISO 7010 COMPLIANT - LAST UPDATED: DECEMBER 2025 - REVIEW ANNUALLY
                      </p>
                    </div>
                  </div>
                ) : (
                  <div 
                    className="p-6 min-h-[400px] flex flex-col relative"
                    style={{ 
                      backgroundColor: identificationData.backgroundColor,
                      backgroundImage: identificationData.showImage && identificationData.imagePosition === 'Background' 
                        ? `linear-gradient(rgba(0,0,0,${(100 - identificationData.imageOpacity) / 100}), rgba(0,0,0,${(100 - identificationData.imageOpacity) / 100})), url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzM0ODVjYSIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjE1MCIgcj0iODAiIGZpbGw9IiM2M2I1ZjYiLz48Y2lyY2xlIGN4PSIzMDAiIGN5PSIxNTAiIHI9IjgwIiBmaWxsPSIjNjNiNWY2Ii8+PC9zdmc+')`
                        : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  >
                    {/* Header */}
                    {identificationData.showHeader && (
                      <div className="text-center mb-4">
                        <p className="text-black font-bold text-lg">{identificationData.headerText}</p>
                      </div>
                    )}
                    
                    {/* Icon */}
                    <div className="flex-1 flex items-center justify-center">
                      <div 
                        className="rounded-full flex items-center justify-center text-white"
                        style={{ 
                          backgroundColor: identificationData.iconBgColor,
                          width: `${identificationData.iconSize}px`,
                          height: `${identificationData.iconSize}px`,
                          fontSize: `${identificationData.iconSize * 0.6}px`
                        }}
                      >
                        💧
                      </div>
                    </div>
                    
                    {/* Area Name */}
                    <div className="text-center mb-4">
                      <h3 
                        className="font-bold uppercase"
                        style={{ 
                          color: identificationData.textColor,
                          fontSize: `${identificationData.fontSize}px`
                        }}
                      >
                        {identificationData.areaName}
                      </h3>
                    </div>
                    
                    {/* Footer */}
                    {identificationData.showFooter && (
                      <div className="text-center">
                        <p className="text-black font-medium text-sm">{identificationData.footerText}</p>
                      </div>
                    )}
                    
                    {/* Border */}
                    {identificationData.showBorder && (
                      <div 
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          border: `${identificationData.borderWidth}px solid ${identificationData.borderColor}`
                        }}
                      />
                    )}
                  </div>
                )}
              </div>
              
              <button className="w-full px-6 py-3 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2 mb-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print
              </button>
              
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl">
                <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-blue-800">
                  Signage is optimized to fit all content on a single {formData.size} page. All sections automatically scaled and limited to ensure professional print-ready output.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default SignageGenerator

