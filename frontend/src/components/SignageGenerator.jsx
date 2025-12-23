import { useState, useEffect } from 'react'

const SignageGenerator = ({ activeNav, setActiveNav, sidebarOpen, setSidebarOpen }) => {
  const [signageType, setSignageType] = useState('safety')
  const [formData, setFormData] = useState({
    title: '',
    purpose: '',
    category: 'Mandatory',
    description: '',
    location: '',
    hazards: [],
    ppe: [],
    procedures: [],
    permitRequired: false,
    permitType: '',
    emergencyContacts: [
      { label: 'Emergency', phone: '911' },
      { label: 'Safety Officer', phone: '+1 (555) 123-4567' }
    ],
    qrCodeText: '',
    useExistingQR: false,
    existingQRCode: '',
    showOnlyTitleAndQR: false,
    size: 'A4',
    resolution: '300'
  })
  const [expandedPPECategories, setExpandedPPECategories] = useState(['General PPE'])
  const [newHazard, setNewHazard] = useState('')
  const [newProcedure, setNewProcedure] = useState('')
  const [newContact, setNewContact] = useState({ label: '', phone: '' })
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false)
  const [customPPEImages, setCustomPPEImages] = useState([])
  const [signageIcons, setSignageIcons] = useState([null, null]) // Two icon slots
  const [signageBackgroundImage, setSignageBackgroundImage] = useState(null)
  const [showBrandingModal, setShowBrandingModal] = useState(false)
  const [companyBranding, setCompanyBranding] = useState({
    clientLogo: null,
    contractorLogo: null,
    clientLogoPosition: { x: 10, y: 10 }, // percentage
    contractorLogoPosition: { x: 90, y: 10 }, // percentage
    clientLogoSize: 80, // pixels
    contractorLogoSize: 80 // pixels
  })
  const [draggingLogo, setDraggingLogo] = useState(null) // 'client' or 'contractor'

  // Identification form data
  const [identificationData, setIdentificationData] = useState({
    areaName: 'INLET AREA',
    icon: 'Water/Liquid',
    iconImage: null, // For uploaded icon image
    backgroundColor: '#3B82F6',
    textColor: '#FFFFFF',
    iconBgColor: '#3B82F6',
    showHeader: true,
    headerText: 'AREA IDENTIFICATION',
    showFooter: true,
    footerText: 'Authorized Personnel Only',
    showImage: true,
    backgroundImage: null, // For uploaded background image
    imagePosition: 'Background',
    imageOpacity: 30,
    fontSize: 48,
    iconSize: 80,
    iconPosition: { x: 50, y: 50 }, // Position in percentage
    textPosition: { x: 50, y: 70 }, // Position in percentage
    showBorder: true,
    borderColor: '#FFFFFF',
    borderWidth: 4,
    orientation: 'Landscape'
  })
  const [draggingElement, setDraggingElement] = useState(null) // 'icon' or 'text'

  // AI Generation workflow state
  const [aiGenerationStep, setAiGenerationStep] = useState(1) // 1: Describe, 2: Analyze, 3: Design, 4: Export
  const [aiDescription, setAiDescription] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isDesigning, setIsDesigning] = useState(false)
  const [aiGeneratedData, setAiGeneratedData] = useState(null)
  
  // Advanced Options state
  const [advancedOptions, setAdvancedOptions] = useState({
    autoLayout: true,
    includeImageIcon: true,
    autoContrastAdjustment: true,
    autoTextResizing: true
  })
  
  // Manual controls state
  const [manualContrast, setManualContrast] = useState(100) // 0-200
  const [manualTextSize, setManualTextSize] = useState(24) // 12-72
  const [aiSelectedIcons, setAiSelectedIcons] = useState([null, null]) // Two icon slots for AI generation
  const [uploadedCustomImage, setUploadedCustomImage] = useState(null) // For custom image upload

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

  const getIconEmoji = (iconType) => {
    const iconMap = {
      'Water/Liquid': '💧',
      'Electrical': '⚡',
      'Fire': '🔥',
      'Chemical': '🧪',
      'Mechanical': '⚙️',
      'Warning': '⚠️',
      'Information': 'ℹ️',
      'Location': '📍'
    }
    return iconMap[iconType] || '💧'
  }

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

  const handlePPEImageUpload = (e) => {
    const files = Array.from(e.target.files)
    const maxFiles = 7 - customPPEImages.length
    const filesToAdd = files.slice(0, maxFiles)
    
    filesToAdd.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`File ${file.name} exceeds 5MB limit`)
        return
      }
      
      const reader = new FileReader()
      reader.onload = (event) => {
        setCustomPPEImages(prev => [...prev, {
          id: Date.now() + Math.random(),
          image: event.target.result,
          name: '',
          file: file
        }])
      }
      reader.readAsDataURL(file)
    })
    
    e.target.value = ''
  }

  const updatePPEImageName = (id, name) => {
    setCustomPPEImages(prev => prev.map(img => 
      img.id === id ? { ...img, name } : img
    ))
  }

  const removePPEImage = (id) => {
    setCustomPPEImages(prev => prev.filter(img => img.id !== id))
  }

  const getCategoryColor = (category) => {
    const colors = {
      'Mandatory': 'bg-blue-600',
      'Prohibition': 'bg-red-600',
      'Warning': 'bg-yellow-500',
      'Emergency': 'bg-red-600',
      'Information': 'bg-green-500',
      'Danger': 'bg-red-600',
      'Caution': 'bg-orange-500',
      'Notice': 'bg-blue-500',
      'Chemical Safety': 'bg-orange-500',
      'Electrical Safety': 'bg-yellow-500',
      'STP / Wastewater': 'bg-blue-500',
      'Traffic / Road': 'bg-red-600',
      'Informational': 'bg-green-500',
      'Custom Color': 'bg-gray-500'
    }
    return colors[category] || 'bg-red-600'
  }

  const getCategoryColorSquare = (category) => {
    const colors = {
      'Mandatory': '#0052CC', // Blue for Mandatory (ISO 7010)
      'Prohibition': '#DC2626', // Red for Prohibition (ISO 7010)
      'Warning': '#F59E0B', // Yellow/Amber for Warning (ISO 7010)
      'Emergency': '#DC2626', // Red for Emergency (ISO 7010)
      'Information': '#10B981', // Green for Information (ISO 7010)
      'Danger': '#DC2626',
      'Caution': '#F97316',
      'Notice': '#3B82F6',
      'Chemical Safety': '#F97316',
      'Electrical Safety': '#EAB308',
      'STP / Wastewater': '#3B82F6',
      'Traffic / Road': '#DC2626',
      'Informational': '#10B981',
      'Custom Color': '#6B7280'
    }
    return colors[category] || '#DC2626'
  }

  const categoryOptions = [
    { value: 'Mandatory', label: 'Mandatory', color: '#0052CC' }, // Blue - ISO 7010
    { value: 'Prohibition', label: 'Prohibition', color: '#DC2626' }, // Red - ISO 7010
    { value: 'Warning', label: 'Warning', color: '#F59E0B' }, // Amber - ISO 7010
    { value: 'Emergency', label: 'Emergency', color: '#DC2626' }, // Red - ISO 7010
    { value: 'Information', label: 'Information', color: '#10B981' }, // Green - ISO 7010
    { value: 'Danger', label: 'Danger', color: '#DC2626' },
    { value: 'Chemical Safety', label: 'Chemical Safety', color: '#F97316' },
    { value: 'Electrical Safety', label: 'Electrical Safety', color: '#EAB308' },
    { value: 'STP / Wastewater', label: 'STP / Wastewater', color: '#3B82F6' },
    { value: 'Traffic / Road', label: 'Traffic / Road', color: '#DC2626' },
    { value: 'Informational', label: 'Informational', color: '#10B981' },
    { value: 'Custom Color', label: 'Custom Color', color: '#6B7280' }
  ]

  // Helper function to handle navigation with delayed sidebar close
  const handleNavigation = (navItem) => {
    setActiveNav(navItem)
    // Close sidebar after 3 seconds
    setTimeout(() => {
      setSidebarOpen(false)
    }, 3000)
  }

  // Handle logo drag start
  const handleLogoDragStart = (logoType) => {
    setDraggingLogo(logoType)
  }

  // Handle logo drag
  const handleLogoDrag = (e, logoType) => {
    if (!draggingLogo) return
    
    const previewElement = e.currentTarget.closest('.preview-container')
    if (!previewElement) return
    
    const rect = previewElement.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    
    // Constrain to preview bounds
    const constrainedX = Math.max(0, Math.min(100, x))
    const constrainedY = Math.max(0, Math.min(100, y))
    
    if (logoType === 'client') {
      setCompanyBranding({
        ...companyBranding,
        clientLogoPosition: { x: constrainedX, y: constrainedY }
      })
    } else {
      setCompanyBranding({
        ...companyBranding,
        contractorLogoPosition: { x: constrainedX, y: constrainedY }
      })
    }
  }

  // Handle logo drag end
  const handleLogoDragEnd = () => {
    setDraggingLogo(null)
  }

  // Handle icon/text drag start
  const handleElementDragStart = (elementType) => {
    setDraggingElement(elementType)
  }

  // Handle icon/text drag
  const handleElementDrag = (e, elementType) => {
    if (!draggingElement) return
    
    const previewElement = e.currentTarget.closest('.preview-container')
    if (!previewElement) return
    
    const rect = previewElement.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    
    // Constrain to preview bounds
    const constrainedX = Math.max(0, Math.min(100, x))
    const constrainedY = Math.max(0, Math.min(100, y))
    
    if (elementType === 'icon') {
      setIdentificationData({
        ...identificationData,
        iconPosition: { x: constrainedX, y: constrainedY }
      })
    } else if (elementType === 'text') {
      setIdentificationData({
        ...identificationData,
        textPosition: { x: constrainedX, y: constrainedY }
      })
    }
  }

  // Handle icon/text drag end
  const handleElementDragEnd = () => {
    setDraggingElement(null)
  }

  // Handle mouse move for dragging
  const handleMouseMove = (e) => {
    if (draggingLogo) {
      handleLogoDrag(e, draggingLogo)
    }
    if (draggingElement) {
      handleElementDrag(e, draggingElement)
    }
  }

  // Handle icon image upload
  const handleIconImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setIdentificationData({
          ...identificationData,
          iconImage: reader.result
        })
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle background image upload
  const handleBackgroundImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setIdentificationData({
          ...identificationData,
          backgroundImage: reader.result
        })
      }
      reader.readAsDataURL(file)
    }
  }

  // Real-time AI generation function
  const generateSignageFromDescription = (description) => {
    if (!description.trim()) return null
    
    // Parse description to extract information
    const lowerDesc = description.toLowerCase()
    let category = 'Danger'
    let title = description.split(',')[0].trim() || 'AI Generated Signage'
    const hazards = []
    const ppe = []
    
    // Determine category based on keywords
    if (lowerDesc.includes('warning') || lowerDesc.includes('caution')) {
      category = 'Warning'
    } else if (lowerDesc.includes('notice') || lowerDesc.includes('information')) {
      category = 'Notice'
    } else if (lowerDesc.includes('danger')) {
      category = 'Danger'
    }
    
    // Extract PPE requirements
    if (lowerDesc.includes('hard hat') || lowerDesc.includes('helmet')) ppe.push('hard-hat')
    if (lowerDesc.includes('safety glasses') || lowerDesc.includes('goggles')) ppe.push('safety-glasses')
    if (lowerDesc.includes('gloves')) ppe.push('safety-gloves')
    if (lowerDesc.includes('boots') || lowerDesc.includes('safety boots')) ppe.push('safety-boots')
    if (lowerDesc.includes('vest') || lowerDesc.includes('hi-vis')) ppe.push('hi-vis-vest')
    if (lowerDesc.includes('respirator') || lowerDesc.includes('mask')) ppe.push('respirator')
    
    // Extract hazards
    if (lowerDesc.includes('electrical') || lowerDesc.includes('electric')) hazards.push('Electrical Hazard')
    if (lowerDesc.includes('chemical')) hazards.push('Chemical Hazard')
    if (lowerDesc.includes('fire')) hazards.push('Fire Hazard')
    if (lowerDesc.includes('height') || lowerDesc.includes('fall')) hazards.push('Fall Hazard')
    
    // Auto-generate title if needed
    if (title.length < 5) {
      if (lowerDesc.includes('panel')) title = 'ELECTRICAL PANEL AREA'
      else if (lowerDesc.includes('chemical')) title = 'CHEMICAL STORAGE AREA'
      else if (lowerDesc.includes('mechanical')) title = 'MECHANICAL ROOM'
      else title = 'RESTRICTED AREA'
    }
    
    return {
      title: title.toUpperCase(),
      category,
      description,
      hazards,
      ppe,
      procedures: []
    }
  }

  // Real-time update when description changes
  useEffect(() => {
    if (aiDescription.trim() && aiGenerationStep >= 2) {
      const generatedData = generateSignageFromDescription(aiDescription)
      if (generatedData) {
        setAiGeneratedData(generatedData)
        // Apply to form in real-time
        setFormData(prev => ({
          ...prev,
          title: generatedData.title,
          description: generatedData.description,
          category: generatedData.category,
          hazards: generatedData.hazards,
          ppe: generatedData.ppe
        }))
      }
    }
  }, [aiDescription, aiGenerationStep])

  // Apply contrast and text size adjustments in real-time when in step 3 or 4
  useEffect(() => {
    if (aiGenerationStep >= 3 && !advancedOptions.autoContrastAdjustment) {
      // Manual contrast adjustment would be applied via CSS filters in preview
      // This is handled in the preview rendering
    }
    if (aiGenerationStep >= 3 && !advancedOptions.autoTextResizing) {
      // Manual text size would be applied via CSS in preview
      // This is handled in the preview rendering
    }
  }, [manualContrast, manualTextSize, advancedOptions, aiGenerationStep])

  // AI Generation workflow handlers
  const handleAIDescriptionSubmit = () => {
    if (aiDescription.trim()) {
      setAiGenerationStep(2)
      setIsAnalyzing(true)
      // Simulate AI analysis
      setTimeout(() => {
        setIsAnalyzing(false)
        setAiGenerationStep(3)
        setIsDesigning(true)
        // Generate data immediately
        const generatedData = generateSignageFromDescription(aiDescription)
        if (generatedData) {
          setAiGeneratedData(generatedData)
          // Apply generated data to form
          setFormData(prev => ({
            ...prev,
            title: generatedData.title,
            description: generatedData.description,
            category: generatedData.category,
            hazards: generatedData.hazards,
            ppe: generatedData.ppe
          }))
        }
        // Simulate design generation
        setTimeout(() => {
          setIsDesigning(false)
          setAiGenerationStep(4)
        }, 2000)
      }, 2000)
    }
  }

  const handleExportSignage = () => {
    // Trigger download functionality
    const canvas = document.createElement('canvas')
    canvas.width = 1200
    canvas.height = 1600
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#000000'
    ctx.font = '48px Arial'
    ctx.fillText('Signage Export', 100, 200)
    
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'signage.png'
      a.click()
      URL.revokeObjectURL(url)
    })
  }

  const handleResetAIGeneration = () => {
    setAiGenerationStep(1)
    setAiDescription('')
    setIsAnalyzing(false)
    setIsDesigning(false)
    setAiGeneratedData(null)
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
            {/* Upload Custom Image Component */}
            <div className="relative">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={(e) => {
                    const file = e.target.files[0]
                    if (file) {
                      if (file.size > 10 * 1024 * 1024) {
                        alert('File size must be less than 10MB')
                        return
                      }
                      const reader = new FileReader()
                      reader.onload = (event) => {
                        setUploadedCustomImage(event.target.result)
                      }
                      reader.readAsDataURL(file)
                    }
                    e.target.value = ''
                  }}
                  className="hidden"
                />
                <div className="px-3 md:px-4 lg:px-5 py-1.5 lg:py-2 bg-white border-2 border-gray-300 rounded-full text-xs md:text-sm lg:text-base font-medium whitespace-nowrap shadow-sm hover:shadow-md transition-all hover:border-blue-400 hover:bg-blue-50 flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span className="text-gray-700">Upload Custom Image</span>
                </div>
              </label>
            </div>
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
              onClick={() => handleNavigation('dashboard')}
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
                onClick={() => handleNavigation('generator')}
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
                onClick={() => handleNavigation('templates')}
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
                onClick={() => handleNavigation('ai-generator')}
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
              <div
                className={`p-3 lg:p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                  activeNav === 'customize-signage'
                    ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg shadow-green-500/30'
                    : 'text-gray-700 hover:bg-gray-200 hover:shadow-md'
                }`}
                onClick={() => handleNavigation('customize-signage')}
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
                onClick={() => handleNavigation('authorized')}
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
                onClick={() => handleNavigation('emergency')}
              >
                <div className="flex items-center gap-3 lg:gap-4">
                  <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span className="font-semibold text-sm lg:text-base">Safety Team</span>
                  <svg className="w-4 h-4 lg:w-5 lg:h-5 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
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
                onClick={() => handleNavigation('blog')}
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

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col lg:flex-row gap-4 lg:gap-6 p-3 sm:p-4 md:p-6 lg:p-8 min-w-0 overflow-x-hidden">
          {activeNav === 'ai-generator' ? (
            /* AI Generator Section */
            <div className="flex-1 w-full max-w-6xl mx-auto space-y-6 sm:space-y-8">
              {/* Title */}
              <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-md">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">AI Generation</h1>
                <p className="text-gray-600 text-sm sm:text-base">Create professional signage automatically with AI</p>
              </div>

              {/* Upload Custom Image Component */}
              <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-md">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Upload Custom Image</h2>
                <label className="cursor-pointer block">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={(e) => {
                      const file = e.target.files[0]
                      if (file) {
                        if (file.size > 10 * 1024 * 1024) {
                          alert('File size must be less than 10MB')
                          return
                        }
                        const reader = new FileReader()
                        reader.onload = (event) => {
                          setUploadedCustomImage(event.target.result)
                        }
                        reader.readAsDataURL(file)
                      }
                      e.target.value = ''
                    }}
                    className="hidden"
                  />
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 sm:p-12 text-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-200">
                    {uploadedCustomImage ? (
                      <div className="space-y-4">
                        <img 
                          src={uploadedCustomImage} 
                          alt="Uploaded custom image" 
                          className="max-w-full max-h-64 mx-auto rounded-lg object-contain"
                        />
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setUploadedCustomImage(null)
                          }}
                          className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                        >
                          Remove Image
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-center mb-4">
                          <svg className="w-16 h-16 sm:w-20 sm:h-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                        </div>
                        <p className="text-gray-700 font-medium text-base sm:text-lg mb-2">Click to upload</p>
                        <p className="text-gray-500 text-sm sm:text-base">PNG, JPG up to 10MB</p>
                      </>
                    )}
                  </div>
                </label>
              </div>

              {/* 4-Step Process */}
              <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-md">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
                  {/* Step 1: Describe */}
                  <div className={`relative rounded-xl p-6 transition-all duration-300 ${
                    aiGenerationStep >= 1 ? 'bg-purple-50 border-2 border-purple-200' : 'bg-gray-50 border-2 border-gray-200'
                  }`}>
                    <div className="flex flex-col items-center text-center">
                      <div className={`w-16 h-16 rounded-lg flex items-center justify-center mb-4 ${
                        aiGenerationStep >= 1 ? 'bg-purple-200' : 'bg-gray-200'
                      }`}>
                        <span className="text-3xl font-black text-black">T</span>
                      </div>
                      <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-2">Describe</h3>
                      <p className="text-xs sm:text-sm text-gray-600">Tell AI what you need</p>
                      {aiGenerationStep > 1 && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Step 2: AI Analyzes */}
                  <div className={`relative rounded-xl p-6 transition-all duration-300 ${
                    aiGenerationStep >= 2 ? 'bg-purple-50 border-2 border-purple-200' : 'bg-gray-50 border-2 border-gray-200'
                  }`}>
                    <div className="flex flex-col items-center text-center">
                      <div className={`w-16 h-16 rounded-lg flex items-center justify-center mb-4 ${
                        aiGenerationStep >= 2 ? 'bg-purple-100' : 'bg-gray-200'
                      }`}>
                        {isAnalyzing ? (
                          <svg className="w-8 h-8 text-orange-500 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        ) : (
                          <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        )}
                      </div>
                      <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-2">AI Analyzes</h3>
                      <p className="text-xs sm:text-sm text-gray-600">Understands requirements</p>
                      {aiGenerationStep > 2 && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Step 3: Auto-Design */}
                  <div className={`relative rounded-xl p-6 transition-all duration-300 ${
                    aiGenerationStep >= 3 ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gray-50 border-2 border-gray-200'
                  }`}>
                    <div className="flex flex-col items-center text-center">
                      <div className={`w-16 h-16 rounded-lg flex items-center justify-center mb-4 ${
                        aiGenerationStep >= 3 ? 'bg-blue-100' : 'bg-gray-200'
                      }`}>
                        {isDesigning ? (
                          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <svg className="w-10 h-10 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M5 21h14V7l-7-4-7 4v14zm2-12h10v10H7V9zm2 2v6h6v-6H9zm2 2h2v2h-2v-2z"/>
                            <rect x="9" y="13" width="6" height="2" fill="#FFFFFF"/>
                            <rect x="9" y="16" width="6" height="2" fill="#FFFFFF"/>
                          </svg>
                        )}
                      </div>
                      <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-2">Auto-Design</h3>
                      <p className="text-xs sm:text-sm text-gray-600">Generates layout & content</p>
                      {aiGenerationStep > 3 && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Step 4: Export */}
                  <div className={`relative rounded-xl p-6 transition-all duration-300 ${
                    aiGenerationStep >= 4 ? 'bg-green-50 border-2 border-green-200' : 'bg-gray-50 border-2 border-gray-200'
                  }`}>
                    <div className="flex flex-col items-center text-center">
                      <div className={`w-16 h-16 rounded-lg flex items-center justify-center mb-4 ${
                        aiGenerationStep >= 4 ? 'bg-green-100' : 'bg-gray-200'
                      }`}>
                        <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </div>
                      <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-2">Export</h3>
                      <p className="text-xs sm:text-sm text-gray-600">Download ready signage</p>
                    </div>
                  </div>
                </div>

                {/* Step Content */}
                {aiGenerationStep === 1 && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Describe your signage requirements
                      </label>
                      <textarea
                        value={aiDescription}
                        onChange={(e) => setAiDescription(e.target.value)}
                        placeholder="e.g., Danger sign for electrical panel area, requires hard hat and safety glasses, located in Building A"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm sm:text-base min-h-[120px]"
                        rows="4"
                      />
                      <p className="mt-2 text-xs sm:text-sm text-gray-500">
                        Be specific about the type, location, required PPE, and any special requirements
                      </p>
                    </div>

                    {/* Advanced Options */}
                    <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Advanced Options</h3>
                      <div className="space-y-4">
                        {/* Auto Layout */}
                        <div className="flex items-center justify-between p-4 bg-white rounded-lg border-2 border-gray-200">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                              </svg>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">Auto Layout</h4>
                              <p className="text-sm text-gray-600">AI optimizes layout automatically</p>
                            </div>
                          </div>
                          <button
                            onClick={() => setAdvancedOptions(prev => ({ ...prev, autoLayout: !prev.autoLayout }))}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              advancedOptions.autoLayout ? 'bg-purple-600' : 'bg-gray-300'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                advancedOptions.autoLayout ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>

                        {/* Include Image/Icon */}
                        <div className="flex items-center justify-between p-4 bg-white rounded-lg border-2 border-gray-200">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">Include Image/Icon</h4>
                              <p className="text-sm text-gray-600">Add relevant safety icons</p>
                            </div>
                          </div>
                          <button
                            onClick={() => setAdvancedOptions(prev => ({ ...prev, includeImageIcon: !prev.includeImageIcon }))}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              advancedOptions.includeImageIcon ? 'bg-purple-600' : 'bg-gray-300'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                advancedOptions.includeImageIcon ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>

                        {/* Icon Upload when enabled */}
                        {advancedOptions.includeImageIcon && (
                          <div className="ml-16 space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <label className="block text-sm font-semibold text-gray-700">Upload Safety Icons</label>
                            <div className="grid grid-cols-2 gap-3">
                              {[0, 1].map((index) => (
                                <div key={index} className="space-y-2">
                                  <label className="block text-xs text-gray-600">Icon #{index + 1}</label>
                                  {aiSelectedIcons[index] ? (
                                    <div className="flex items-center gap-2">
                                      <img src={aiSelectedIcons[index]} alt={`Icon ${index + 1}`} className="w-12 h-12 object-contain border border-gray-300 rounded" />
                                      <button
                                        onClick={() => {
                                          const newIcons = [...aiSelectedIcons]
                                          newIcons[index] = null
                                          setAiSelectedIcons(newIcons)
                                        }}
                                        className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200"
                                      >
                                        Remove
                                      </button>
                                    </div>
                                  ) : (
                                    <label className="cursor-pointer">
                                      <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                          const file = e.target.files[0]
                                          if (file) {
                                            const reader = new FileReader()
                                            reader.onload = (event) => {
                                              const newIcons = [...aiSelectedIcons]
                                              newIcons[index] = event.target.result
                                              setAiSelectedIcons(newIcons)
                                              // Apply to form in real-time
                                              const newFormIcons = [...signageIcons]
                                              newFormIcons[index] = event.target.result
                                              setSignageIcons(newFormIcons)
                                            }
                                            reader.readAsDataURL(file)
                                          }
                                          e.target.value = ''
                                        }}
                                        className="hidden"
                                      />
                                      <div className="px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-center text-xs text-gray-600">
                                        Upload Icon
                                      </div>
                                    </label>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Auto Contrast Adjustment */}
                        <div className="flex items-center justify-between p-4 bg-white rounded-lg border-2 border-gray-200">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                              </svg>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">Auto Contrast Adjustment</h4>
                              <p className="text-sm text-gray-600">Optimize for readability</p>
                            </div>
                          </div>
                          <button
                            onClick={() => setAdvancedOptions(prev => ({ ...prev, autoContrastAdjustment: !prev.autoContrastAdjustment }))}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              advancedOptions.autoContrastAdjustment ? 'bg-purple-600' : 'bg-gray-300'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                advancedOptions.autoContrastAdjustment ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>

                        {/* Manual Contrast Control */}
                        <div className="ml-16 space-y-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-semibold text-gray-700">Manual Contrast</label>
                            <span className="text-sm text-gray-600">{manualContrast}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="200"
                            value={manualContrast}
                            onChange={(e) => setManualContrast(parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                          />
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Low</span>
                            <span>Normal</span>
                            <span>High</span>
                          </div>
                        </div>

                        {/* Auto Text Resizing */}
                        <div className="flex items-center justify-between p-4 bg-white rounded-lg border-2 border-gray-200">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <span className="text-2xl font-black text-blue-600">T</span>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">Auto Text Resizing</h4>
                              <p className="text-sm text-gray-600">Fit text to available space</p>
                            </div>
                          </div>
                          <button
                            onClick={() => setAdvancedOptions(prev => ({ ...prev, autoTextResizing: !prev.autoTextResizing }))}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              advancedOptions.autoTextResizing ? 'bg-purple-600' : 'bg-gray-300'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                advancedOptions.autoTextResizing ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>

                        {/* Manual Text Size Control */}
                        <div className="ml-16 space-y-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-semibold text-gray-700">Manual Text Size</label>
                            <span className="text-sm text-gray-600">{manualTextSize}px</span>
                          </div>
                          <input
                            type="range"
                            min="12"
                            max="72"
                            value={manualTextSize}
                            onChange={(e) => setManualTextSize(parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                          />
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Small</span>
                            <span>Medium</span>
                            <span>Large</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleAIDescriptionSubmit}
                      disabled={!aiDescription.trim()}
                      className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Start AI Generation
                    </button>
                  </div>
                )}

                {aiGenerationStep === 2 && (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mb-4"></div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">AI is analyzing your requirements...</h3>
                    <p className="text-gray-600">Understanding your signage needs</p>
                  </div>
                )}

                {aiGenerationStep === 3 && (
                  <div className="space-y-6">
                    <div className="text-center py-4">
                      <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mb-4"></div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Generating your signage design...</h3>
                      <p className="text-gray-600">Creating layout and content - Adjust settings below in real-time</p>
                    </div>

                    {/* Advanced Options for Step 3 - Real-time adjustments */}
                    <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Real-time Adjustments</h3>
                      <div className="space-y-4">
                        {/* Include Image/Icon */}
                        <div className="flex items-center justify-between p-4 bg-white rounded-lg border-2 border-gray-200">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">Include Image/Icon</h4>
                              <p className="text-sm text-gray-600">Add relevant safety icons</p>
                            </div>
                          </div>
                          <button
                            onClick={() => setAdvancedOptions(prev => ({ ...prev, includeImageIcon: !prev.includeImageIcon }))}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              advancedOptions.includeImageIcon ? 'bg-purple-600' : 'bg-gray-300'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                advancedOptions.includeImageIcon ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>

                        {/* Icon Upload when enabled */}
                        {advancedOptions.includeImageIcon && (
                          <div className="ml-16 space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <label className="block text-sm font-semibold text-gray-700">Upload Safety Icons</label>
                            <div className="grid grid-cols-2 gap-3">
                              {[0, 1].map((index) => (
                                <div key={index} className="space-y-2">
                                  <label className="block text-xs text-gray-600">Icon #{index + 1}</label>
                                  {aiSelectedIcons[index] ? (
                                    <div className="flex items-center gap-2">
                                      <img src={aiSelectedIcons[index]} alt={`Icon ${index + 1}`} className="w-12 h-12 object-contain border border-gray-300 rounded" />
                                      <button
                                        onClick={() => {
                                          const newIcons = [...aiSelectedIcons]
                                          newIcons[index] = null
                                          setAiSelectedIcons(newIcons)
                                          const newFormIcons = [...signageIcons]
                                          newFormIcons[index] = null
                                          setSignageIcons(newFormIcons)
                                        }}
                                        className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200"
                                      >
                                        Remove
                                      </button>
                                    </div>
                                  ) : (
                                    <label className="cursor-pointer">
                                      <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                          const file = e.target.files[0]
                                          if (file) {
                                            const reader = new FileReader()
                                            reader.onload = (event) => {
                                              const newIcons = [...aiSelectedIcons]
                                              newIcons[index] = event.target.result
                                              setAiSelectedIcons(newIcons)
                                              const newFormIcons = [...signageIcons]
                                              newFormIcons[index] = event.target.result
                                              setSignageIcons(newFormIcons)
                                            }
                                            reader.readAsDataURL(file)
                                          }
                                          e.target.value = ''
                                        }}
                                        className="hidden"
                                      />
                                      <div className="px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-center text-xs text-gray-600">
                                        Upload Icon
                                      </div>
                                    </label>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Auto Contrast Adjustment */}
                        <div className="flex items-center justify-between p-4 bg-white rounded-lg border-2 border-gray-200">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                              </svg>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">Auto Contrast Adjustment</h4>
                              <p className="text-sm text-gray-600">Optimize for readability</p>
                            </div>
                          </div>
                          <button
                            onClick={() => setAdvancedOptions(prev => ({ ...prev, autoContrastAdjustment: !prev.autoContrastAdjustment }))}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              advancedOptions.autoContrastAdjustment ? 'bg-purple-600' : 'bg-gray-300'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                advancedOptions.autoContrastAdjustment ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>

                        {/* Manual Contrast Control */}
                        <div className="ml-16 space-y-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-semibold text-gray-700">Manual Contrast</label>
                            <span className="text-sm text-gray-600">{manualContrast}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="200"
                            value={manualContrast}
                            onChange={(e) => setManualContrast(parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                          />
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Low</span>
                            <span>Normal</span>
                            <span>High</span>
                          </div>
                        </div>

                        {/* Auto Text Resizing */}
                        <div className="flex items-center justify-between p-4 bg-white rounded-lg border-2 border-gray-200">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <span className="text-2xl font-black text-blue-600">T</span>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">Auto Text Resizing</h4>
                              <p className="text-sm text-gray-600">Fit text to available space</p>
                            </div>
                          </div>
                          <button
                            onClick={() => setAdvancedOptions(prev => ({ ...prev, autoTextResizing: !prev.autoTextResizing }))}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              advancedOptions.autoTextResizing ? 'bg-purple-600' : 'bg-gray-300'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                advancedOptions.autoTextResizing ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>

                        {/* Manual Text Size Control */}
                        <div className="ml-16 space-y-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-semibold text-gray-700">Manual Text Size</label>
                            <span className="text-sm text-gray-600">{manualTextSize}px</span>
                          </div>
                          <input
                            type="range"
                            min="12"
                            max="72"
                            value={manualTextSize}
                            onChange={(e) => setManualTextSize(parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                          />
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Small</span>
                            <span>Medium</span>
                            <span>Large</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {aiGenerationStep === 4 && (
                  <div className="space-y-6">
                    <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 text-center">
                      <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Signage Generated Successfully!</h3>
                      <p className="text-gray-600 mb-6">Your signage has been created. Fine-tune settings below if needed.</p>
                    </div>

                    {/* Advanced Options for Step 4 - Final adjustments */}
                    <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Final Adjustments</h3>
                      <div className="space-y-4">
                        {/* Include Image/Icon */}
                        <div className="flex items-center justify-between p-4 bg-white rounded-lg border-2 border-gray-200">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">Include Image/Icon</h4>
                              <p className="text-sm text-gray-600">Add relevant safety icons</p>
                            </div>
                          </div>
                          <button
                            onClick={() => setAdvancedOptions(prev => ({ ...prev, includeImageIcon: !prev.includeImageIcon }))}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              advancedOptions.includeImageIcon ? 'bg-purple-600' : 'bg-gray-300'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                advancedOptions.includeImageIcon ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>

                        {/* Icon Upload when enabled */}
                        {advancedOptions.includeImageIcon && (
                          <div className="ml-16 space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <label className="block text-sm font-semibold text-gray-700">Upload Safety Icons</label>
                            <div className="grid grid-cols-2 gap-3">
                              {[0, 1].map((index) => (
                                <div key={index} className="space-y-2">
                                  <label className="block text-xs text-gray-600">Icon #{index + 1}</label>
                                  {aiSelectedIcons[index] ? (
                                    <div className="flex items-center gap-2">
                                      <img src={aiSelectedIcons[index]} alt={`Icon ${index + 1}`} className="w-12 h-12 object-contain border border-gray-300 rounded" />
                                      <button
                                        onClick={() => {
                                          const newIcons = [...aiSelectedIcons]
                                          newIcons[index] = null
                                          setAiSelectedIcons(newIcons)
                                          const newFormIcons = [...signageIcons]
                                          newFormIcons[index] = null
                                          setSignageIcons(newFormIcons)
                                        }}
                                        className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200"
                                      >
                                        Remove
                                      </button>
                                    </div>
                                  ) : (
                                    <label className="cursor-pointer">
                                      <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                          const file = e.target.files[0]
                                          if (file) {
                                            const reader = new FileReader()
                                            reader.onload = (event) => {
                                              const newIcons = [...aiSelectedIcons]
                                              newIcons[index] = event.target.result
                                              setAiSelectedIcons(newIcons)
                                              const newFormIcons = [...signageIcons]
                                              newFormIcons[index] = event.target.result
                                              setSignageIcons(newFormIcons)
                                            }
                                            reader.readAsDataURL(file)
                                          }
                                          e.target.value = ''
                                        }}
                                        className="hidden"
                                      />
                                      <div className="px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-center text-xs text-gray-600">
                                        Upload Icon
                                      </div>
                                    </label>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Auto Contrast Adjustment */}
                        <div className="flex items-center justify-between p-4 bg-white rounded-lg border-2 border-gray-200">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                              </svg>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">Auto Contrast Adjustment</h4>
                              <p className="text-sm text-gray-600">Optimize for readability</p>
                            </div>
                          </div>
                          <button
                            onClick={() => setAdvancedOptions(prev => ({ ...prev, autoContrastAdjustment: !prev.autoContrastAdjustment }))}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              advancedOptions.autoContrastAdjustment ? 'bg-purple-600' : 'bg-gray-300'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                advancedOptions.autoContrastAdjustment ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>

                        {/* Manual Contrast Control */}
                        <div className="ml-16 space-y-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-semibold text-gray-700">Manual Contrast</label>
                            <span className="text-sm text-gray-600">{manualContrast}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="200"
                            value={manualContrast}
                            onChange={(e) => setManualContrast(parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                          />
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Low</span>
                            <span>Normal</span>
                            <span>High</span>
                          </div>
                        </div>

                        {/* Auto Text Resizing */}
                        <div className="flex items-center justify-between p-4 bg-white rounded-lg border-2 border-gray-200">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <span className="text-2xl font-black text-blue-600">T</span>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">Auto Text Resizing</h4>
                              <p className="text-sm text-gray-600">Fit text to available space</p>
                            </div>
                          </div>
                          <button
                            onClick={() => setAdvancedOptions(prev => ({ ...prev, autoTextResizing: !prev.autoTextResizing }))}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              advancedOptions.autoTextResizing ? 'bg-purple-600' : 'bg-gray-300'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                advancedOptions.autoTextResizing ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>

                        {/* Manual Text Size Control */}
                        <div className="ml-16 space-y-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-semibold text-gray-700">Manual Text Size</label>
                            <span className="text-sm text-gray-600">{manualTextSize}px</span>
                          </div>
                          <input
                            type="range"
                            min="12"
                            max="72"
                            value={manualTextSize}
                            onChange={(e) => setManualTextSize(parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                          />
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Small</span>
                            <span>Medium</span>
                            <span>Large</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <button
                        onClick={handleExportSignage}
                        className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download Ready Signage
                      </button>
                      <button
                        onClick={() => {
                          handleNavigation('generator')
                          setActiveNav('generator')
                        }}
                        className="px-6 py-3 bg-blue-100 text-blue-700 rounded-xl font-semibold hover:bg-blue-200 transition-colors"
                      >
                        Edit in Generator
                      </button>
                      <button
                        onClick={handleResetAIGeneration}
                        className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                      >
                        Create Another
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Form Section */}
              <div className="flex-1 lg:max-w-2xl xl:max-w-3xl space-y-4 sm:space-y-6 lg:space-y-8 pr-1 sm:pr-2 pb-4">
                {/* Signage Type */}
                <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-md">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 lg:mb-6">Signage Type</h2>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <button
                  onClick={() => setSignageType('safety')}
                  className={`p-3 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl border-2 transition-all duration-200 min-h-[120px] sm:min-h-[140px] ${
                    signageType === 'safety'
                      ? 'border-red-500 bg-red-50 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2 sm:gap-3">
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center text-2xl sm:text-3xl ${
                      signageType === 'safety' ? 'bg-red-500' : 'bg-gray-200'
                    }`}>
                      ⚠️
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-sm sm:text-base lg:text-lg text-gray-900">Safety Signage</div>
                      <div className="text-xs sm:text-sm text-gray-600 mt-1">Danger, Warning, etc.</div>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => setSignageType('identification')}
                  className={`p-3 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl border-2 transition-all duration-200 min-h-[120px] sm:min-h-[140px] ${
                    signageType === 'identification'
                      ? 'border-blue-500 bg-blue-50 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2 sm:gap-3">
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center text-2xl sm:text-3xl ${
                      signageType === 'identification' ? 'bg-blue-500' : 'bg-gray-200'
                    }`}>
                      📍
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-sm sm:text-base lg:text-lg text-gray-900">Identification</div>
                      <div className="text-xs sm:text-sm text-gray-600 mt-1">Area labels</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Identification Templates */}
            {signageType === 'identification' && (
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-md">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 lg:mb-6">Colorful Templates</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 max-h-96 overflow-y-auto pr-1 sm:pr-2">
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
                      className={`${template.color} p-3 sm:p-4 rounded-lg sm:rounded-xl text-white hover:opacity-90 transition-opacity shadow-md hover:shadow-lg min-h-[100px] sm:min-h-[120px]`}
                    >
                      <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">{template.icon}</div>
                      <div className="font-bold text-xs sm:text-sm mb-1">{template.name}</div>
                      <div className="text-[10px] sm:text-xs opacity-90 line-clamp-2">{template.subtitle}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Signage Configuration - Safety */}
            {signageType === 'safety' && (
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-md space-y-4 sm:space-y-6">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Signage Configuration</h2>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Signage Title / Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., INLET AREA - HIGH RISK ZONE"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                />
              </div>

              {/* Custom Icons and Background */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Warning Icons (Optional)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[0, 1].map((index) => (
                      <div key={index} className="space-y-2">
                        <label className="block text-xs text-gray-600 mb-1">
                          Icon #{index + 1}
                        </label>
                        <div className="flex items-center gap-2">
                          {signageIcons[index] ? (
                            <div className="flex-1 flex items-center gap-2 p-2 border-2 border-gray-300 rounded-lg bg-gray-50">
                              <img 
                                src={signageIcons[index]} 
                                alt={`Icon ${index + 1}`}
                                className="w-10 h-10 object-contain"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const newIcons = [...signageIcons]
                                  newIcons[index] = null
                                  setSignageIcons(newIcons)
                                }}
                                className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200"
                              >
                                Remove
                              </button>
                            </div>
                          ) : (
                            <label className="flex-1 cursor-pointer">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files[0]
                                  if (file) {
                                    const reader = new FileReader()
                                    reader.onload = (event) => {
                                      const newIcons = [...signageIcons]
                                      newIcons[index] = event.target.result
                                      setSignageIcons(newIcons)
                                    }
                                    reader.readAsDataURL(file)
                                  }
                                  e.target.value = ''
                                }}
                                className="hidden"
                              />
                              <div className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-center text-sm text-gray-600">
                                Upload Icon
                              </div>
                            </label>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Background Image (Optional)
                  </label>
                  {signageBackgroundImage ? (
                    <div className="space-y-2">
                      <div className="relative border-2 border-gray-300 rounded-lg overflow-hidden">
                        <img 
                          src={signageBackgroundImage} 
                          alt="Background"
                          className="w-full h-32 object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setSignageBackgroundImage(null)}
                          className="absolute top-2 right-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="block cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0]
                          if (file) {
                            const reader = new FileReader()
                            reader.onload = (event) => {
                              setSignageBackgroundImage(event.target.result)
                            }
                            reader.readAsDataURL(file)
                          }
                          e.target.value = ''
                        }}
                        className="hidden"
                      />
                      <div className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-center text-sm text-gray-600">
                        Upload Background Image
                      </div>
                    </label>
                  )}
                </div>
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
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-base bg-white text-left flex items-center justify-between ${
                      categoryDropdownOpen 
                        ? 'border-blue-500 focus:border-blue-500' 
                        : 'border-gray-300 focus:border-blue-500'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-5 h-5 flex-shrink-0 rounded border border-gray-300"
                        style={{ backgroundColor: getCategoryColorSquare(formData.category) }}
                      />
                      <span>{formData.category}</span>
                    </div>
                    <svg 
                      className={`w-5 h-5 text-gray-500 transition-transform ${categoryDropdownOpen ? 'rotate-180' : ''}`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {categoryDropdownOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setCategoryDropdownOpen(false)}
                      />
                      <div className="absolute z-20 w-full mt-1 bg-white border-2 border-gray-300 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                        {categoryOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, category: option.value })
                              setCategoryDropdownOpen(false)
                            }}
                            className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                              formData.category === option.value ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                            }`}
                          >
                            <div 
                              className="w-5 h-5 flex-shrink-0 rounded border border-gray-300"
                              style={{ backgroundColor: option.color }}
                            />
                            <span className={formData.category === option.value ? 'font-semibold text-blue-700' : 'text-gray-700'}>
                              {option.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
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
                    className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                  />
                  <button
                    onClick={addHazard}
                    className="px-4 sm:px-6 py-2.5 sm:py-3 bg-red-600 text-white rounded-lg sm:rounded-xl font-semibold hover:bg-red-700 transition-colors shadow-md hover:shadow-lg min-w-[44px] min-h-[44px] text-lg sm:text-xl"
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
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-md space-y-4 sm:space-y-6">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Customize Signage</h2>
                
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
                    onChange={(e) => setIdentificationData({ ...identificationData, icon: e.target.value, iconImage: null })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base mb-2"
                  >
                    {iconOptions.map((icon) => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                  <div className="mb-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Or Upload Icon Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleIconImageUpload}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                    {identificationData.iconImage && (
                      <div className="mt-2 flex items-center gap-2">
                        <img 
                          src={identificationData.iconImage} 
                          alt="Icon preview" 
                          className="w-12 h-12 rounded-full object-cover border-2 border-gray-300"
                        />
                        <button
                          onClick={() => setIdentificationData({ ...identificationData, iconImage: null })}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Color Pickers */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Background Color</label>
                    <div className="space-y-2">
                      <div 
                        className="w-full h-16 rounded-lg border-2 border-gray-300 shadow-sm cursor-pointer relative overflow-hidden group"
                        onClick={() => document.getElementById('bg-color-picker').click()}
                        style={{ backgroundColor: identificationData.backgroundColor }}
                      >
                        <input
                          id="bg-color-picker"
                          type="color"
                          value={identificationData.backgroundColor}
                          onChange={(e) => setIdentificationData({ ...identificationData, backgroundColor: e.target.value })}
                          className="absolute opacity-0 w-full h-full cursor-pointer"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-semibold px-3 py-1.5 rounded bg-white/95 backdrop-blur-sm text-gray-800 border border-gray-200 shadow-sm">
                            {identificationData.backgroundColor.toUpperCase()}
                          </span>
                        </div>
                        <div className="absolute bottom-1 right-1 text-white/80 text-xs font-medium bg-black/30 px-2 py-0.5 rounded">
                          Click to change
                        </div>
                      </div>
                      <input
                        type="text"
                        value={identificationData.backgroundColor}
                        onChange={(e) => setIdentificationData({ ...identificationData, backgroundColor: e.target.value })}
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-xs sm:text-sm bg-white text-center font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Text Color (All Text)</label>
                    <div className="space-y-2">
                      <div 
                        className="w-full h-16 rounded-lg border-2 border-gray-300 shadow-sm cursor-pointer relative overflow-hidden group"
                        onClick={() => document.getElementById('text-color-picker').click()}
                        style={{ backgroundColor: identificationData.textColor }}
                      >
                        <input
                          id="text-color-picker"
                          type="color"
                          value={identificationData.textColor}
                          onChange={(e) => setIdentificationData({ ...identificationData, textColor: e.target.value })}
                          className="absolute opacity-0 w-full h-full cursor-pointer"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-semibold px-3 py-1.5 rounded bg-white/95 backdrop-blur-sm text-gray-800 border border-gray-200 shadow-sm">
                            {identificationData.textColor.toUpperCase()}
                          </span>
                        </div>
                        <div className="absolute bottom-1 right-1 text-white/80 text-xs font-medium bg-black/30 px-2 py-0.5 rounded">
                          Click to change
                        </div>
                      </div>
                      <input
                        type="text"
                        value={identificationData.textColor}
                        onChange={(e) => setIdentificationData({ ...identificationData, textColor: e.target.value })}
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-xs sm:text-sm bg-white text-center font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Icon Background Color</label>
                    <div className="space-y-2">
                      <div 
                        className="w-full h-16 rounded-lg border-2 border-gray-300 shadow-sm cursor-pointer relative overflow-hidden group"
                        onClick={() => document.getElementById('icon-bg-color-picker').click()}
                        style={{ backgroundColor: identificationData.iconBgColor }}
                      >
                        <input
                          id="icon-bg-color-picker"
                          type="color"
                          value={identificationData.iconBgColor}
                          onChange={(e) => setIdentificationData({ ...identificationData, iconBgColor: e.target.value })}
                          className="absolute opacity-0 w-full h-full cursor-pointer"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-semibold px-3 py-1.5 rounded bg-white/95 backdrop-blur-sm text-gray-800 border border-gray-200 shadow-sm">
                            {identificationData.iconBgColor.toUpperCase()}
                          </span>
                        </div>
                        <div className="absolute bottom-1 right-1 text-white/80 text-xs font-medium bg-black/30 px-2 py-0.5 rounded">
                          Click to change
                        </div>
                      </div>
                      <input
                        type="text"
                        value={identificationData.iconBgColor}
                        onChange={(e) => setIdentificationData({ ...identificationData, iconBgColor: e.target.value })}
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-xs sm:text-sm bg-white text-center font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="#000000"
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

                {/* Area Image / Background Image */}
                <div>
                  <label className="flex items-center gap-3 mb-3">
                    <input
                      type="checkbox"
                      checked={identificationData.showImage}
                      onChange={(e) => setIdentificationData({ ...identificationData, showImage: e.target.checked })}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm font-semibold text-gray-700">Background Image</span>
                  </label>
                  {identificationData.showImage && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Upload Background Image</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleBackgroundImageUpload}
                          className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                        {identificationData.backgroundImage && (
                          <div className="mt-2">
                            <img 
                              src={identificationData.backgroundImage} 
                              alt="Background preview" 
                              className="w-full rounded-lg border-2 border-gray-300 max-h-[200px] object-cover"
                            />
                            <button
                              onClick={() => setIdentificationData({ ...identificationData, backgroundImage: null })}
                              className="mt-2 px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                            >
                              Remove Background
                            </button>
                          </div>
                        )}
                        {!identificationData.backgroundImage && (
                          <div className="border-2 border-gray-300 rounded-xl p-4 bg-gray-50 min-h-[200px] flex items-center justify-center mt-2">
                            <div className="text-center text-gray-500">
                              <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <p className="text-sm">No background image uploaded</p>
                              <p className="text-xs mt-1">Upload an image to use as background</p>
                            </div>
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Image Position</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {['Top', 'Center', 'Bottom', 'Background'].map((pos) => (
                            <button
                              key={pos}
                              onClick={() => setIdentificationData({ ...identificationData, imagePosition: pos })}
                              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border-2 transition-all text-xs sm:text-sm min-h-[44px] ${
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    <span className="text-sm font-semibold text-gray-700">Drag to Reposition:</span>
                    <span className="text-xs text-gray-600">Click and drag the icon or text in the preview to move them</span>
                    <button 
                      onClick={() => setIdentificationData({
                        ...identificationData,
                        iconPosition: { x: 50, y: 50 },
                        textPosition: { x: 50, y: 70 }
                      })}
                      className="ml-auto px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium"
                    >
                      Reset Positions
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-gray-600">Icon Position:</span>
                      <span className="ml-2 font-mono text-gray-800">
                        X: {identificationData.iconPosition.x.toFixed(1)}%, Y: {identificationData.iconPosition.y.toFixed(1)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Text Position:</span>
                      <span className="ml-2 font-mono text-gray-800">
                        X: {identificationData.textPosition.x.toFixed(1)}%, Y: {identificationData.textPosition.y.toFixed(1)}%
                      </span>
                    </div>
                  </div>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Paper Size</label>
                    <select
                      value={formData.size}
                      onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
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
                        className={`flex-1 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border-2 transition-all text-sm sm:text-base min-h-[44px] ${
                          identificationData.orientation === 'Landscape'
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                        }`}
                      >
                        Landscape
                      </button>
                      <button
                        onClick={() => setIdentificationData({ ...identificationData, orientation: 'Portrait' })}
                        className={`flex-1 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border-2 transition-all text-sm sm:text-base min-h-[44px] ${
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
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <button className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-green-600 text-white rounded-lg sm:rounded-xl font-semibold hover:bg-green-700 transition-colors shadow-md hover:shadow-lg text-sm sm:text-base min-h-[44px]">
                    Export PNG
                  </button>
                  <button className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg sm:rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg text-sm sm:text-base min-h-[44px]">
                    Export PDF
                  </button>
                  <button className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-600 text-white rounded-lg sm:rounded-xl font-semibold hover:bg-gray-700 transition-colors shadow-md hover:shadow-lg text-sm sm:text-base min-h-[44px]">
                    Print
                  </button>
                </div>
              </div>
            )}

            {/* PPE Required - Only show for Safety */}
            {signageType === 'safety' && (
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                  PPE Required (Multi-Select)
                </h2>
                <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-100 text-blue-700 rounded-full text-xs sm:text-sm font-semibold self-start sm:self-auto">
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
                      <div className="p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 bg-white border-t-2 border-gray-100">
                        {items.map((item) => (
                          <label
                            key={item.id}
                            className="flex items-center gap-2 sm:gap-2.5 p-2.5 sm:p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-blue-300 transition-all duration-200 bg-white min-h-[44px]"
                          >
                            <input
                              type="checkbox"
                              checked={formData.ppe.includes(item.id)}
                              onChange={() => togglePPE(item.id)}
                              className="w-5 h-5 text-blue-600 rounded border-2 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 cursor-pointer flex-shrink-0"
                            />
                            <span className="text-lg sm:text-xl flex-shrink-0">{item.icon}</span>
                            <span className="text-xs sm:text-sm font-medium text-gray-700 flex-1 leading-tight">{item.name}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            )}

            {/* Upload Custom PPE Images - Only show for Safety */}
            {signageType === 'safety' && (
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-4 sm:mb-6">
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                      Upload Custom PPE Images
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Add your own PPE images (up to 7 images, max 5MB each).
                    </p>
                  </div>
                </div>
                <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-purple-100 text-purple-700 rounded-full text-xs sm:text-sm font-semibold self-start sm:self-auto">
                  {customPPEImages.length}/7
                </span>
              </div>

              {/* Upload Button */}
              <div className="mb-6">
                <label className="block">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePPEImageUpload}
                    disabled={customPPEImages.length >= 7}
                    className="hidden"
                    id="ppe-image-upload"
                  />
                  <button
                    type="button"
                    onClick={() => document.getElementById('ppe-image-upload')?.click()}
                    disabled={customPPEImages.length >= 7}
                    className={`w-full px-6 py-4 rounded-xl font-bold text-white flex items-center justify-center gap-3 transition-all duration-200 shadow-lg hover:shadow-xl ${
                      customPPEImages.length >= 7
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-purple-600 hover:bg-purple-700'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Browse & Upload PPE Images
                  </button>
                </label>
              </div>

              {/* Uploaded Images */}
              {customPPEImages.length > 0 && (
                <div className="space-y-4 mb-6">
                  {customPPEImages.map((ppeImage, index) => (
                    <div key={ppeImage.id} className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
                      <div className="flex flex-col sm:flex-row gap-4">
                        {/* Image Preview */}
                        <div className="flex-shrink-0">
                          <div className="w-32 h-32 sm:w-40 sm:h-40 border-2 border-white rounded-lg overflow-hidden bg-white shadow-md">
                            <img 
                              src={ppeImage.image} 
                              alt={`PPE ${index + 1}`}
                              className="w-full h-full object-contain"
                            />
                          </div>
                        </div>
                        
                        {/* Name Input */}
                        <div className="flex-1">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            PPE Name #{index + 1}
                          </label>
                          <input
                            type="text"
                            value={ppeImage.name}
                            onChange={(e) => updatePPEImageName(ppeImage.id, e.target.value)}
                            placeholder="e.g., Safety Goggles, Fire Blanket"
                            className="w-full px-4 py-3 border-2 border-purple-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-base"
                          />
                          <p className="text-xs text-gray-600 mt-2">
                            This name will appear below the PPE icon.
                          </p>
                          <button
                            type="button"
                            onClick={() => removePPEImage(ppeImage.id)}
                            className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                          >
                            Remove Image
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Informational Note */}
              <div className="bg-purple-50 rounded-xl p-4 border-2 border-purple-200">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-700">
                    These custom PPE images will appear in your signage along with the standard PPE icons selected above.
                  </p>
                </div>
              </div>
            </div>
            )}

            {/* Safety Procedures - Only show for Safety */}
            {signageType === 'safety' && (
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-md">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Safety Procedures</h2>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newProcedure}
                  onChange={(e) => setNewProcedure(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addProcedure()}
                  placeholder="Add procedure (e.g., Gas test required)"
                  className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                />
                <button
                  onClick={addProcedure}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 bg-green-600 text-white rounded-lg sm:rounded-xl font-semibold hover:bg-green-700 transition-colors shadow-md hover:shadow-lg min-w-[44px] min-h-[44px] text-lg sm:text-xl"
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
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4">
                <div>
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-1">Permit Required</h2>
                  <p className="text-xs sm:text-sm text-gray-600">Enable if a permit is needed for this area</p>
                </div>
                <button
                  onClick={() => setFormData({ ...formData, permitRequired: !formData.permitRequired })}
                  className={`relative w-14 h-7 sm:w-16 sm:h-8 rounded-full transition-colors self-start sm:self-auto ${
                    formData.permitRequired ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 sm:top-1 sm:left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                      formData.permitRequired ? 'translate-x-7 sm:translate-x-8' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              
              {/* Permit Type Input - Shows when permit is required */}
              {formData.permitRequired && (
                <div className="mt-4 pt-4 border-t-2 border-gray-200">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Permit Type <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.permitType}
                    onChange={(e) => setFormData({ ...formData, permitType: e.target.value })}
                    placeholder="e.g., Hot Work Permit, Confined Space Entry Permit, Electrical Work Permit"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                  />
                  <p className="text-xs text-gray-600 mt-2">
                    Specify the type of permit required for this area.
                  </p>
                </div>
              )}
            </div>
            )}

            {/* Emergency Contacts - Only show for Safety */}
            {signageType === 'safety' && (
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-md space-y-3 sm:space-y-4">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Emergency Contacts</h2>
              
              {formData.emergencyContacts.map((contact, index) => (
                <div key={index} className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={contact.label}
                    onChange={(e) => updateContact(index, 'label', e.target.value)}
                    className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                    placeholder="Label"
                  />
                  <input
                    type="text"
                    value={contact.phone}
                    onChange={(e) => updateContact(index, 'phone', e.target.value)}
                    className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                    placeholder="Phone"
                  />
                  {formData.emergencyContacts.length > 2 && (
                    <button
                      onClick={() => removeContact(index)}
                      className="px-4 py-2.5 sm:py-3 bg-red-600 text-white rounded-lg sm:rounded-xl hover:bg-red-700 transition-colors min-h-[44px] text-lg sm:text-xl"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}

              <div className="border-t-2 border-gray-200 pt-4">
                <div className="text-sm font-semibold text-gray-700 mb-3">Add Contact:</div>
                <div className="flex flex-col sm:flex-row gap-2 mb-2">
                  <input
                    type="text"
                    value={newContact.label}
                    onChange={(e) => setNewContact({ ...newContact, label: e.target.value })}
                    placeholder="Label (e.g. Fire Dept)"
                    className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                  />
                  <input
                    type="text"
                    value={newContact.phone}
                    onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                    placeholder="Phone Number"
                    className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                  />
                </div>
                <button
                  onClick={addContact}
                  className="w-full px-4 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg sm:rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg text-sm sm:text-base min-h-[44px]"
                >
                  Add
                </button>
              </div>
            </div>
            )}

            {/* QR Code - Only show for Safety */}
            {signageType === 'safety' && (
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-md space-y-4">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">QR Code (Optional)</h2>
              
              {/* QR Code Type Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">QR Code Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="qrCodeType"
                      checked={!formData.useExistingQR}
                      onChange={() => setFormData({ ...formData, useExistingQR: false })}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">Generate New QR Code</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="qrCodeType"
                      checked={formData.useExistingQR}
                      onChange={() => setFormData({ ...formData, useExistingQR: true })}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">Use Existing QR Code</span>
                  </label>
                </div>
              </div>

              {/* New QR Code Input */}
              {!formData.useExistingQR && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    QR Code Text / URL
                  </label>
                  <input
                    type="text"
                    value={formData.qrCodeText}
                    onChange={(e) => setFormData({ ...formData, qrCodeText: e.target.value })}
                    placeholder="Enter URL or text to generate QR code"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                  />
                  <p className="text-xs text-gray-600 mt-2">
                    Enter a URL or text that will be encoded in the QR code.
                  </p>
                </div>
              )}

              {/* Existing QR Code Upload */}
              {formData.useExistingQR && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Upload Existing QR Code Image
                  </label>
                  {formData.existingQRCode ? (
                    <div className="space-y-2">
                      <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50">
                        <img 
                          src={formData.existingQRCode} 
                          alt="Existing QR Code"
                          className="w-32 h-32 mx-auto object-contain"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, existingQRCode: '' })}
                        className="w-full px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                      >
                        Remove QR Code
                      </button>
                    </div>
                  ) : (
                    <label className="block cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0]
                          if (file) {
                            const reader = new FileReader()
                            reader.onload = (event) => {
                              setFormData({ ...formData, existingQRCode: event.target.result })
                            }
                            reader.readAsDataURL(file)
                          }
                          e.target.value = ''
                        }}
                        className="hidden"
                      />
                      <div className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-center text-sm text-gray-600">
                        Click to upload QR code image
                      </div>
                    </label>
                  )}
                </div>
              )}

              {/* Show Only Title and QR Code Option */}
              <div className="pt-4 border-t-2 border-gray-200">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.showOnlyTitleAndQR}
                    onChange={(e) => setFormData({ ...formData, showOnlyTitleAndQR: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-sm font-semibold text-gray-700 block">Show Only Title and QR Code</span>
                    <span className="text-xs text-gray-600">Display only the title and QR code on the paper (no other sections)</span>
                  </div>
                </label>
              </div>
            </div>
            )}

            {/* Size and Resolution - Only show for Safety */}
            {signageType === 'safety' && (
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-md grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Select Size</label>
                <select
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
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
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
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
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-md flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button className="flex-1 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg sm:rounded-xl font-bold text-sm sm:text-base lg:text-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 min-h-[44px] sm:min-h-[52px]">
                Generate Signage
              </button>
              <button 
                onClick={() => setShowBrandingModal(true)}
                className="px-4 sm:px-6 py-3 sm:py-4 bg-blue-100 text-blue-700 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base lg:text-lg hover:bg-blue-200 transition-colors min-h-[44px] sm:min-h-[52px]"
              >
                Add Company Branding
              </button>
            </div>
            )}

            {/* Company Branding Modal */}
            {showBrandingModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="sticky top-0 bg-white border-b-2 border-gray-200 p-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">Company Branding</h2>
                    <button
                      onClick={() => setShowBrandingModal(false)}
                      className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                      ×
                    </button>
                  </div>
                  
                  <div className="p-6 space-y-6">
                    {/* Client Logo */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Client Logo</h3>
                      {companyBranding.clientLogo ? (
                        <div className="space-y-3">
                          <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50">
                            <img 
                              src={companyBranding.clientLogo} 
                              alt="Client Logo"
                              className="h-24 mx-auto object-contain"
                            />
                          </div>
                          <div className="flex gap-2">
                            <label className="flex-1 cursor-pointer">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files[0]
                                  if (file) {
                                    const reader = new FileReader()
                                    reader.onload = (event) => {
                                      setCompanyBranding({ ...companyBranding, clientLogo: event.target.result })
                                    }
                                    reader.readAsDataURL(file)
                                  }
                                  e.target.value = ''
                                }}
                                className="hidden"
                              />
                              <div className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-center text-sm font-medium">
                                Change Logo
                              </div>
                            </label>
                            <button
                              onClick={() => setCompanyBranding({ ...companyBranding, clientLogo: null })}
                              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                            >
                              Remove
                            </button>
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Logo Size: {companyBranding.clientLogoSize}px
                            </label>
                            <input
                              type="range"
                              min="40"
                              max="200"
                              value={companyBranding.clientLogoSize}
                              onChange={(e) => setCompanyBranding({ ...companyBranding, clientLogoSize: parseInt(e.target.value) })}
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                          </div>
                        </div>
                      ) : (
                        <label className="block cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files[0]
                              if (file) {
                                const reader = new FileReader()
                                reader.onload = (event) => {
                                  setCompanyBranding({ ...companyBranding, clientLogo: event.target.result })
                                }
                                reader.readAsDataURL(file)
                              }
                              e.target.value = ''
                            }}
                            className="hidden"
                          />
                          <div className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-center text-sm text-gray-600">
                            Upload Client Logo
                          </div>
                        </label>
                      )}
                    </div>

                    {/* Contractor Logo */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Contractor Logo</h3>
                      {companyBranding.contractorLogo ? (
                        <div className="space-y-3">
                          <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50">
                            <img 
                              src={companyBranding.contractorLogo} 
                              alt="Contractor Logo"
                              className="h-24 mx-auto object-contain"
                            />
                          </div>
                          <div className="flex gap-2">
                            <label className="flex-1 cursor-pointer">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files[0]
                                  if (file) {
                                    const reader = new FileReader()
                                    reader.onload = (event) => {
                                      setCompanyBranding({ ...companyBranding, contractorLogo: event.target.result })
                                    }
                                    reader.readAsDataURL(file)
                                  }
                                  e.target.value = ''
                                }}
                                className="hidden"
                              />
                              <div className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-center text-sm font-medium">
                                Change Logo
                              </div>
                            </label>
                            <button
                              onClick={() => setCompanyBranding({ ...companyBranding, contractorLogo: null })}
                              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                            >
                              Remove
                            </button>
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Logo Size: {companyBranding.contractorLogoSize}px
                            </label>
                            <input
                              type="range"
                              min="40"
                              max="200"
                              value={companyBranding.contractorLogoSize}
                              onChange={(e) => setCompanyBranding({ ...companyBranding, contractorLogoSize: parseInt(e.target.value) })}
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                          </div>
                        </div>
                      ) : (
                        <label className="block cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files[0]
                              if (file) {
                                const reader = new FileReader()
                                reader.onload = (event) => {
                                  setCompanyBranding({ ...companyBranding, contractorLogo: event.target.result })
                                }
                                reader.readAsDataURL(file)
                              }
                              e.target.value = ''
                            }}
                            className="hidden"
                          />
                          <div className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-center text-sm text-gray-600">
                            Upload Contractor Logo
                          </div>
                        </label>
                      )}
                    </div>

                    {/* Instructions */}
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-gray-700">
                        <strong>Tip:</strong> After uploading logos, you can drag them to adjust their position in the preview area. Click and drag the logos to move them around.
                      </p>
                    </div>

                    {/* Close Button */}
                    <div className="flex justify-end">
                      <button
                        onClick={() => setShowBrandingModal(false)}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Live Preview Panel */}
          <div className="w-full lg:w-96 xl:w-[420px] flex-shrink-0 mt-4 lg:mt-0">
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-md sticky top-20 sm:top-24 lg:top-28">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Live Preview</h2>
                <span className="px-2 sm:px-3 py-1 sm:py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs sm:text-sm font-semibold self-start sm:self-auto">
                  {signageType === 'identification' 
                    ? `${formData.size} • ${identificationData.orientation.toLowerCase()} • ${formData.resolution} DPI`
                    : `${formData.size} - ${formData.resolution}dpi`
                  }
                </span>
              </div>
              
              <div 
                className="border-2 sm:border-4 border-black rounded-lg overflow-hidden mb-4 sm:mb-6 bg-white preview-container relative"
                onMouseMove={handleMouseMove}
                onMouseUp={() => {
                  handleLogoDragEnd()
                  handleElementDragEnd()
                }}
                onMouseLeave={() => {
                  handleLogoDragEnd()
                  handleElementDragEnd()
                }}
              >
                {/* Company Branding Logos - Draggable */}
                {companyBranding.clientLogo && (
                  <div
                    style={{
                      position: 'absolute',
                      left: `${companyBranding.clientLogoPosition.x}%`,
                      top: `${companyBranding.clientLogoPosition.y}%`,
                      transform: 'translate(-50%, -50%)',
                      cursor: draggingLogo === 'client' ? 'grabbing' : 'grab',
                      zIndex: 1000,
                      userSelect: 'none'
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      handleLogoDragStart('client')
                    }}
                    className="logo-draggable"
                  >
                    <img 
                      src={companyBranding.clientLogo} 
                      alt="Client Logo"
                      style={{
                        width: `${companyBranding.clientLogoSize}px`,
                        height: 'auto',
                        pointerEvents: 'none',
                        filter: draggingLogo === 'client' ? 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))' : 'none'
                      }}
                      draggable={false}
                    />
                  </div>
                )}
                
                {companyBranding.contractorLogo && (
                  <div
                    style={{
                      position: 'absolute',
                      left: `${companyBranding.contractorLogoPosition.x}%`,
                      top: `${companyBranding.contractorLogoPosition.y}%`,
                      transform: 'translate(-50%, -50%)',
                      cursor: draggingLogo === 'contractor' ? 'grabbing' : 'grab',
                      zIndex: 1000,
                      userSelect: 'none'
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      handleLogoDragStart('contractor')
                    }}
                    className="logo-draggable"
                  >
                    <img 
                      src={companyBranding.contractorLogo} 
                      alt="Contractor Logo"
                      style={{
                        width: `${companyBranding.contractorLogoSize}px`,
                        height: 'auto',
                        pointerEvents: 'none',
                        filter: draggingLogo === 'contractor' ? 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))' : 'none'
                      }}
                      draggable={false}
                    />
                  </div>
                )}

                {signageType === 'safety' ? (
                  <div className="flex flex-col min-h-[300px] sm:min-h-[400px]">
                    {/* Show Only Title and QR Code Mode */}
                    {formData.showOnlyTitleAndQR ? (
                      <div className="flex flex-col items-center justify-center p-6 sm:p-8 min-h-[300px] sm:min-h-[400px] relative">
                        {/* Title */}
                        <div className="mb-6 sm:mb-8 text-center">
                          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 uppercase">
                            {formData.title || 'SIGNAGE TITLE'}
                          </h3>
                        </div>
                        
                        {/* QR Code */}
                        {(formData.qrCodeText || formData.existingQRCode) && (
                          <div className="flex items-center justify-center">
                            {formData.useExistingQR && formData.existingQRCode ? (
                              <img 
                                src={formData.existingQRCode} 
                                alt="QR Code"
                                className="w-48 h-48 sm:w-64 sm:h-64 object-contain border-2 border-gray-300 p-2 bg-white"
                              />
                            ) : formData.qrCodeText ? (
                              <div className="w-48 h-48 sm:w-64 sm:h-64 border-2 border-gray-300 bg-white flex items-center justify-center p-4">
                                <img 
                                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(formData.qrCodeText)}`}
                                  alt="QR Code"
                                  className="w-full h-full object-contain"
                                />
                              </div>
                            ) : null}
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        {/* Top Red Section */}
                        <div 
                          className={`${getCategoryColor(formData.category)} p-4 sm:p-6 flex flex-col relative`}
                          style={{
                            backgroundImage: signageBackgroundImage 
                              ? `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${signageBackgroundImage})` 
                              : 'none',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                          }}
                        >
                          {/* Warning Icons */}
                          <div className="flex justify-center gap-4 mb-4">
                            {[0, 1].map((index) => (
                              <div key={index} className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center bg-white rounded-full border-2 border-black">
                                {signageIcons[index] ? (
                                  <img 
                                    src={signageIcons[index]} 
                                    alt={`Warning icon ${index + 1}`}
                                    className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                                  />
                                ) : (
                                  <svg className="w-8 h-8 sm:w-10 sm:h-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 2L1 21h22L12 2z" fill="#FCD34D" stroke="#000000" strokeWidth="1.5" strokeLinejoin="round"/>
                                    <path d="M12 8v4M12 16h.01" stroke="#000000" strokeWidth="2" strokeLinecap="round"/>
                                  </svg>
                                )}
                              </div>
                            ))}
                          </div>
                          
                          {/* Title */}
                          <div className="text-center">
                            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white uppercase">
                              {formData.title || 'SIGNAGE TITLE'}
                            </h3>
                          </div>
                        </div>
                        
                        {/* Orange Emergency Section */}
                        {formData.emergencyContacts.length > 0 && (
                          <div className="bg-orange-500 px-4 py-2 sm:py-3 flex items-center justify-center gap-2">
                            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <p className="text-white font-bold text-base sm:text-lg uppercase">EMERGENCY</p>
                          </div>
                        )}
                        
                        {/* Light Beige Contact Information Section */}
                        {formData.emergencyContacts.length > 0 && (
                          <div className="bg-amber-50 px-4 py-3 sm:py-4 flex-1">
                            <div className="space-y-1 sm:space-y-2">
                              {formData.emergencyContacts.map((contact, index) => (
                                <div key={index} className="text-sm sm:text-base font-medium text-black">
                                  {contact.label}: {contact.phone}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* QR Code Section */}
                        {(formData.qrCodeText || formData.existingQRCode) && (
                          <div className="bg-white px-4 py-4 sm:py-6 flex items-center justify-center border-t-2 border-gray-200">
                            {formData.useExistingQR && formData.existingQRCode ? (
                              <img 
                                src={formData.existingQRCode} 
                                alt="QR Code"
                                className="w-32 h-32 sm:w-40 sm:h-40 object-contain"
                              />
                            ) : formData.qrCodeText ? (
                              <div className="w-32 h-32 sm:w-40 sm:h-40 flex items-center justify-center bg-white border-2 border-gray-300 p-2">
                                <img 
                                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(formData.qrCodeText)}`}
                                  alt="QR Code"
                                  className="w-full h-full object-contain"
                                />
                              </div>
                            ) : null}
                          </div>
                        )}
                        
                        {/* Bottom Black Compliance Section */}
                        <div className="bg-black px-4 py-2 sm:py-3">
                          <p className="text-white text-xs sm:text-sm text-center uppercase">
                            ISO 7010 COMPLIANT • LAST UPDATED: DECEMBER 2025 • REVIEW ANNUALLY
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div 
                    className="p-6 min-h-[400px] flex flex-col relative"
                    style={{ 
                      backgroundColor: identificationData.backgroundColor,
                      backgroundImage: identificationData.showImage && identificationData.imagePosition === 'Background' 
                        ? (identificationData.backgroundImage 
                          ? `linear-gradient(rgba(0,0,0,${(100 - identificationData.imageOpacity) / 100}), rgba(0,0,0,${(100 - identificationData.imageOpacity) / 100})), url('${identificationData.backgroundImage}')`
                          : `linear-gradient(rgba(0,0,0,${(100 - identificationData.imageOpacity) / 100}), rgba(0,0,0,${(100 - identificationData.imageOpacity) / 100})), url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzM0ODVjYSIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjE1MCIgcj0iODAiIGZpbGw9IiM2M2I1ZjYiLz48Y2lyY2xlIGN4PSIzMDAiIGN5PSIxNTAiIHI9IjgwIiBmaWxsPSIjNjNiNWY2Ii8+PC9zdmc+')`)
                        : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  >
                    {/* Header */}
                    {identificationData.showHeader && (
                      <div className="text-center mb-4">
                        <p 
                          className="font-bold text-lg"
                          style={{ color: identificationData.textColor }}
                        >
                          {identificationData.headerText}
                        </p>
                      </div>
                    )}
                    
                    {/* Draggable Icon */}
                    <div 
                      style={{
                        position: 'absolute',
                        left: `${identificationData.iconPosition.x}%`,
                        top: `${identificationData.iconPosition.y}%`,
                        transform: 'translate(-50%, -50%)',
                        cursor: draggingElement === 'icon' ? 'grabbing' : 'grab',
                        zIndex: 1000,
                        userSelect: 'none'
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleElementDragStart('icon')
                      }}
                      className="icon-draggable"
                    >
                      <div 
                        className="rounded-full flex items-center justify-center text-white"
                        style={{ 
                          backgroundColor: identificationData.iconBgColor,
                          width: `${identificationData.iconSize}px`,
                          height: `${identificationData.iconSize}px`,
                          fontSize: `${identificationData.iconSize * 0.6}px`,
                          filter: draggingElement === 'icon' ? 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))' : 'none'
                        }}
                      >
                        {identificationData.iconImage ? (
                          <img 
                            src={identificationData.iconImage} 
                            alt="Icon" 
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'contain',
                              borderRadius: '50%'
                            }}
                            draggable={false}
                          />
                        ) : (
                          getIconEmoji(identificationData.icon)
                        )}
                      </div>
                    </div>
                    
                    {/* Draggable Area Name */}
                    <div 
                      style={{
                        position: 'absolute',
                        left: `${identificationData.textPosition.x}%`,
                        top: `${identificationData.textPosition.y}%`,
                        transform: 'translate(-50%, -50%)',
                        cursor: draggingElement === 'text' ? 'grabbing' : 'grab',
                        zIndex: 1000,
                        userSelect: 'none'
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleElementDragStart('text')
                      }}
                      className="text-draggable"
                    >
                      <h3 
                        className="font-bold uppercase whitespace-nowrap"
                        style={{ 
                          color: identificationData.textColor,
                          fontSize: `${identificationData.fontSize}px`,
                          filter: draggingElement === 'text' ? 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))' : 'none'
                        }}
                      >
                        {identificationData.areaName}
                      </h3>
                    </div>
                    
                    {/* Footer */}
                    {identificationData.showFooter && (
                      <div className="text-center absolute bottom-0 left-0 right-0 pb-4">
                        <p 
                          className="font-medium text-sm"
                          style={{ color: identificationData.textColor }}
                        >
                          {identificationData.footerText}
                        </p>
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
              
              <button className="w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-600 text-white rounded-lg sm:rounded-xl font-semibold hover:bg-gray-700 transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2 mb-3 sm:mb-4 text-sm sm:text-base min-h-[44px]">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print
              </button>
              
              <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-blue-50 rounded-lg sm:rounded-xl">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs sm:text-sm text-blue-800 leading-relaxed">
                  Signage is optimized to fit all content on a single {formData.size} page. All sections automatically scaled and limited to ensure professional print-ready output.
                </p>
              </div>
            </div>
          </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}

export default SignageGenerator

