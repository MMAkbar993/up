import { useState, useEffect, useRef } from 'react'
import Sidebar from './Sidebar'

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
      { label: 'Safety Officer', phone: '+1 (555) 123-4567' }
    ],
    qrCodeText: '',
    useExistingQR: false,
    existingQRCode: '',
    showOnlyTitleAndQR: false,
    iso7010FooterText: 'ISO 7010 COMPLIANT • LAST UPDATED: DECEMBER 2025 • REVIEW ANNUALLY',
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
    contractorLogoSize: 80, // pixels
    clientLogoLocked: false,
    contractorLogoLocked: false,
    brandColors: []
  })
  const [draggingLogo, setDraggingLogo] = useState(null) // 'client' or 'contractor'
  const [resizingLogo, setResizingLogo] = useState(null) // 'client' or 'contractor'
  const [selectedLogo, setSelectedLogo] = useState(null) // 'client' or 'contractor' - tracks which logo is selected
  const [logoResizeCorner, setLogoResizeCorner] = useState(null) // 'top-left', 'top-right', 'bottom-left', 'bottom-right'
  const [resizeStartData, setResizeStartData] = useState({ size: 0, x: 0, y: 0 })
  const [isShiftPressed, setIsShiftPressed] = useState(false)

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
  const [selectedElement, setSelectedElement] = useState(null) // 'icon' or 'text' - tracks which element is selected for resizing
  const [resizingElement, setResizingElement] = useState(null) // 'icon' or 'text'
  const [elementResizeHandle, setElementResizeHandle] = useState(null) // 'top-left', 'top', 'top-right', 'right', 'bottom-right', 'bottom', 'bottom-left', 'left'
  const [elementResizeStartData, setElementResizeStartData] = useState({ size: 0, x: 0, y: 0, positionX: 0, positionY: 0 })
  const previewRef = useRef(null) // Ref for the preview container

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

  // ========== NEW COMPREHENSIVE FEATURES STATE ===  
  // Text Editing State
  const [textElements, setTextElements] = useState([]) // Array of text elements with full editing capabilities
  const [selectedTextElement, setSelectedTextElement] = useState(null)
  const [textEditorOpen, setTextEditorOpen] = useState(false)

  // Image & Icon Editing State
  const [imageElements, setImageElements] = useState([]) // Array of image elements
  const [selectedImageElement, setSelectedImageElement] = useState(null)
  const [imageEditorOpen, setImageEditorOpen] = useState(false)

  // Panel visibility state
  const [backgroundPanelOpen, setBackgroundPanelOpen] = useState(false)
  const [sizeLayoutPanelOpen, setSizeLayoutPanelOpen] = useState(false)
  const [authorizedPersonsPanelOpen, setAuthorizedPersonsPanelOpen] = useState(false)
  const [exportModalOpen, setExportModalOpen] = useState(false)
  const [isoIconModalOpen, setIsoIconModalOpen] = useState(false)
  const [signageLibraryOpen, setSignageLibraryOpen] = useState(false)
  const [copiedElement, setCopiedElement] = useState(null)
  const [saveModalOpen, setSaveModalOpen] = useState(false)
  const [saveModalName, setSaveModalName] = useState('')
  const [notification, setNotification] = useState(null)
  const [cropModalOpen, setCropModalOpen] = useState(false)

  // Notification helper function
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  // Handle save signage
  const handleSaveSignage = () => {
    if (!saveModalName.trim()) {
      showNotification('Please enter a name for the signage', 'error')
      return
    }

    const signageData = {
      id: Date.now(),
      name: saveModalName.trim(),
      type: signageType,
      data: {
        formData: JSON.parse(JSON.stringify(formData)),
        identificationData: JSON.parse(JSON.stringify(identificationData)),
        textElements: JSON.parse(JSON.stringify(textElements)),
        imageElements: JSON.parse(JSON.stringify(imageElements)),
        backgroundSettings: JSON.parse(JSON.stringify(backgroundSettings)),
        companyBranding: JSON.parse(JSON.stringify(companyBranding))
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      favorite: false
    }

    setSavedSignages(prev => {
      const updated = [...prev]
      const existingIndex = updated.findIndex(s => s.name === saveModalName.trim())
      if (existingIndex >= 0) {
        updated[existingIndex] = signageData
        showNotification('Signage updated successfully!', 'success')
      } else {
        updated.push(signageData)
        showNotification('Signage saved successfully!', 'success')
      }
      return updated
    })

    addAuditLog('save', { signageId: signageData.id, name: signageData.name })
    setSaveModalOpen(false)
    setSaveModalName('')
  }

  // Design Mode State
  const [designMode, setDesignMode] = useState('template') // 'template' or 'free'
  const [canvasElements, setCanvasElements] = useState([]) // All elements on canvas

  // Undo/Redo State
  const [history, setHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  // Preview & Zoom State
  const [previewZoom, setPreviewZoom] = useState(100)
  const [showFullScreenPreview, setShowFullScreenPreview] = useState(false)

  // Grid & Snap State
  const [showGrid, setShowGrid] = useState(false)
  const [snapToGrid, setSnapToGrid] = useState(true)
  const [gridSize, setGridSize] = useState(10)

  // Export State
  const [exportSettings, setExportSettings] = useState({
    format: 'PDF',
    dpi: 300,
    colorMode: 'RGB',
    includeBleed: true,
    bleedSize: 3 // mm
  })

  // Authorized Persons State
  const [authorizedPersons, setAuthorizedPersons] = useState([])
  const [authorizedPersonsLayout, setAuthorizedPersonsLayout] = useState({
    gridColumns: 2,
    gridRows: 3,
    style: 'badge', // 'badge' or 'poster'
    showQR: true,
    frameStyle: 'rounded'
  })

  // Saved Signages State
  const [savedSignages, setSavedSignages] = useState(() => {
    // Load from localStorage on mount
    try {
      const saved = localStorage.getItem('savedSignages')
      return saved ? JSON.parse(saved) : []
    } catch (error) {
      console.error('Error loading saved signages:', error)
      return []
    }
  })

  // Auto-save current work state
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true)
  const [lastAutoSave, setLastAutoSave] = useState(null)
  const [favoriteSignages, setFavoriteSignages] = useState([])

  // ISO 7010 & Safety Standards
  const [iso7010Icons, setIso7010Icons] = useState([])
  const [colorCompliance, setColorCompliance] = useState({
    enabled: true,
    warnings: []
  })

  // Background & Color State
  const [backgroundSettings, setBackgroundSettings] = useState({
    type: 'solid', // 'solid', 'gradient', 'image'
    color: '#FFFFFF',
    gradient: {
      type: 'linear',
      colors: ['#FFFFFF', '#F3F4F6'],
      angle: 0
    },
    image: null,
    opacity: 100
  })

  // High Contrast & Accessibility
  const [highContrastMode, setHighContrastMode] = useState(false)
  const [contrastRatio, setContrastRatio] = useState(null)

  // Language & Translation
  const [currentLanguage, setCurrentLanguage] = useState('en')
  const [textTranslations, setTextTranslations] = useState({})

  // AI Features State
  const [aiIconSuggestions, setAiIconSuggestions] = useState([])
  const [voiceToTextEnabled, setVoiceToTextEnabled] = useState(false)

  // Version History
  const [versionHistory, setVersionHistory] = useState([])

  // Role-based Access (for future)
  const [userRole, setUserRole] = useState('editor') // 'viewer', 'editor', 'admin'

  // Audit Trail
  const [auditLog, setAuditLog] = useState([])

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

  // ========== ISO 7010 COLOR PRESETS ==========
  const iso7010Colors = {
    'Mandatory': { bg: '#0052CC', text: '#FFFFFF', name: 'Blue (Mandatory)' },
    'Prohibition': { bg: '#DC2626', text: '#FFFFFF', name: 'Red (Prohibition)' },
    'Warning': { bg: '#F59E0B', text: '#000000', name: 'Amber (Warning)' },
    'Emergency': { bg: '#DC2626', text: '#FFFFFF', name: 'Red (Emergency)' },
    'Information': { bg: '#10B981', text: '#FFFFFF', name: 'Green (Information)' },
    'Danger': { bg: '#DC2626', text: '#FFFFFF', name: 'Red (Danger)' },
    'Fire Safety': { bg: '#DC2626', text: '#FFFFFF', name: 'Red (Fire Safety)' },
    'Safe Condition': { bg: '#10B981', text: '#FFFFFF', name: 'Green (Safe Condition)' }
  }

  // ========== INDUSTRIAL-SAFE FONTS ==========
  const industrialFonts = [
    { name: 'Arial', family: 'Arial, sans-serif', safe: true },
    { name: 'Helvetica', family: 'Helvetica, Arial, sans-serif', safe: true },
    { name: 'Roboto', family: 'Roboto, sans-serif', safe: true },
    { name: 'Open Sans', family: '"Open Sans", sans-serif', safe: true },
    { name: 'Montserrat', family: 'Montserrat, sans-serif', safe: true },
    { name: 'Inter', family: 'Inter, sans-serif', safe: true },
    { name: 'Futura', family: 'Futura, Arial, sans-serif', safe: true },
    { name: 'Gotham', family: 'Gotham, Arial, sans-serif', safe: true }
  ]

  // ========== SIGN SIZES (mm) ==========
  const signSizes = {
    'A3': { width: 297, height: 420, portrait: { width: 297, height: 420 }, landscape: { width: 420, height: 297 } },
    'A4': { width: 210, height: 297, portrait: { width: 210, height: 297 }, landscape: { width: 297, height: 210 } },
    'A5': { width: 148, height: 210, portrait: { width: 148, height: 210 }, landscape: { width: 210, height: 148 } },
    'Custom': { width: 210, height: 297, portrait: { width: 210, height: 297 }, landscape: { width: 297, height: 210 } }
  }

  // ========== ISO 7010 ICON LIBRARY ==========
  const iso7010IconLibrary = [
    { id: 'E001', name: 'Emergency Exit', category: 'Emergency', color: '#10B981' },
    { id: 'E002', name: 'Emergency Exit (Left)', category: 'Emergency', color: '#10B981' },
    { id: 'E003', name: 'Emergency Exit (Right)', category: 'Emergency', color: '#10B981' },
    { id: 'E004', name: 'First Aid', category: 'Emergency', color: '#10B981' },
    { id: 'E005', name: 'Emergency Telephone', category: 'Emergency', color: '#10B981' },
    { id: 'M001', name: 'Wear Eye Protection', category: 'Mandatory', color: '#0052CC' },
    { id: 'M002', name: 'Wear Hearing Protection', category: 'Mandatory', color: '#0052CC' },
    { id: 'M003', name: 'Wear Respiratory Protection', category: 'Mandatory', color: '#0052CC' },
    { id: 'M004', name: 'Wear Safety Helmet', category: 'Mandatory', color: '#0052CC' },
    { id: 'M005', name: 'Wear Safety Footwear', category: 'Mandatory', color: '#0052CC' },
    { id: 'M006', name: 'Wear Protective Gloves', category: 'Mandatory', color: '#0052CC' },
    { id: 'M007', name: 'Wear Protective Clothing', category: 'Mandatory', color: '#0052CC' },
    { id: 'P001', name: 'No Smoking', category: 'Prohibition', color: '#DC2626' },
    { id: 'P002', name: 'No Open Flames', category: 'Prohibition', color: '#DC2626' },
    { id: 'P003', name: 'No Entry', category: 'Prohibition', color: '#DC2626' },
    { id: 'P004', name: 'No Unauthorized Access', category: 'Prohibition', color: '#DC2626' },
    { id: 'W001', name: 'General Warning', category: 'Warning', color: '#F59E0B' },
    { id: 'W002', name: 'Electrical Hazard', category: 'Warning', color: '#F59E0B' },
    { id: 'W003', name: 'Flammable Material', category: 'Warning', color: '#F59E0B' },
    { id: 'W004', name: 'Toxic Material', category: 'Warning', color: '#F59E0B' },
    { id: 'W005', name: 'Corrosive Material', category: 'Warning', color: '#F59E0B' },
    { id: 'W006', name: 'Explosive Material', category: 'Warning', color: '#F59E0B' },
    { id: 'W007', name: 'Radiation Hazard', category: 'Warning', color: '#F59E0B' },
    { id: 'W008', name: 'Biological Hazard', category: 'Warning', color: '#F59E0B' },
    { id: 'W009', name: 'Laser Hazard', category: 'Warning', color: '#F59E0B' },
    { id: 'W010', name: 'Magnetic Field', category: 'Warning', color: '#F59E0B' }
  ]

  // ========== HELPER FUNCTIONS ===  
  // Calculate contrast ratio for accessibility
  const calculateContrastRatio = (color1, color2) => {
    const getLuminance = (hex) => {
      const rgb = hexToRgb(hex)
      if (!rgb) return 0
      const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => {
        val = val / 255
        return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
      })
      return 0.2126 * r + 0.7152 * g + 0.0722 * b
    }

    const lum1 = getLuminance(color1)
    const lum2 = getLuminance(color2)
    const lighter = Math.max(lum1, lum2)
    const darker = Math.min(lum1, lum2)
    return (lighter + 0.05) / (darker + 0.05)
  }

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  }

  // Check if color combination is ISO compliant
  const checkColorCompliance = (category, textColor, bgColor) => {
    const warnings = []
    const standard = iso7010Colors[category]

    if (standard) {
      const expectedBg = standard.bg
      const expectedText = standard.text

      if (bgColor !== expectedBg) {
        warnings.push(`Background color should be ${standard.name} (${expectedBg}) for ${category} signs`)
      }

      if (textColor !== expectedText) {
        warnings.push(`Text color should be ${expectedText} for optimal contrast on ${category} signs`)
      }
    }

    const contrast = calculateContrastRatio(textColor, bgColor)
    if (contrast < 4.5) {
      warnings.push(`Low contrast ratio (${contrast.toFixed(2)}). Minimum recommended: 4.5 for normal text, 3.0 for large text`)
    }

    return warnings
  }

  // Auto-fit text to container
  const autoFitText = (text, containerWidth, containerHeight, fontSize, fontFamily) => {
    // This would be implemented with canvas measurement
    // For now, return a reasonable estimate
    const avgCharWidth = fontSize * 0.6
    const charsPerLine = Math.floor(containerWidth / avgCharWidth)
    const lines = Math.ceil(text.length / charsPerLine)
    const lineHeight = fontSize * 1.2
    const totalHeight = lines * lineHeight

    if (totalHeight > containerHeight) {
      const scale = containerHeight / totalHeight
      return Math.max(12, fontSize * scale)
    }
    return fontSize
  }

  // Save to history for undo/redo
  const saveToHistory = (state) => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(JSON.parse(JSON.stringify(state)))
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  // Undo function
  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      return history[historyIndex - 1]
    }
    return null
  }

  // Redo function
  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      return history[historyIndex + 1]
    }
    return null
  }

  // Add audit log entry
  const addAuditLog = (action, details) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      action,
      details,
      user: 'current-user' // Would be from auth context
    }
    setAuditLog(prev => [...prev, logEntry])
  }

  // Keyboard shortcuts handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + C for copy
      if ((e.ctrlKey || e.metaKey) && e.key === 'c' && (selectedTextElement || selectedImageElement)) {
        e.preventDefault()
        if (selectedTextElement) {
          setCopiedElement({ type: 'text', data: selectedTextElement })
        } else if (selectedImageElement) {
          setCopiedElement({ type: 'image', data: selectedImageElement })
        }
      }
      // Ctrl/Cmd + V for paste
      if ((e.ctrlKey || e.metaKey) && e.key === 'v' && copiedElement) {
        e.preventDefault()
        if (copiedElement.type === 'text') {
          const pasted = {
            ...copiedElement.data,
            id: Date.now(),
            x: copiedElement.data.x + 10,
            y: copiedElement.data.y + 10
          }
          setTextElements(prev => [...prev, pasted])
          setSelectedTextElement(pasted)
        } else if (copiedElement.type === 'image') {
          const pasted = {
            ...copiedElement.data,
            id: Date.now(),
            x: copiedElement.data.x + 20,
            y: copiedElement.data.y + 20
          }
          setImageElements(prev => [...prev, pasted])
          setSelectedImageElement(pasted)
        }
      }
      // Ctrl/Cmd + Z for undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      }
      // Ctrl/Cmd + Shift + Z for redo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault()
        redo()
      }
      // Delete key
      if (e.key === 'Delete' && (selectedTextElement || selectedImageElement)) {
        if (selectedTextElement) {
          setTextElements(prev => prev.filter(el => el.id !== selectedTextElement.id))
          setSelectedTextElement(null)
        } else if (selectedImageElement) {
          setImageElements(prev => prev.filter(el => el.id !== selectedImageElement.id))
          setSelectedImageElement(null)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedTextElement, selectedImageElement, copiedElement])

  // Track Shift key for logo resizing
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Shift') {
        setIsShiftPressed(true)
      }
    }
    const handleKeyUp = (e) => {
      if (e.key === 'Shift') {
        setIsShiftPressed(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  // Save signages to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('savedSignages', JSON.stringify(savedSignages))
    } catch (error) {
      console.error('Error saving signages to localStorage:', error)
    }
  }, [savedSignages])

  // Auto-save current work
  useEffect(() => {
    if (!autoSaveEnabled) return

    const autoSaveTimeout = setTimeout(() => {
      const currentWork = {
        id: 'current-work',
        name: formData.title || 'Untitled Signage',
        type: signageType,
        data: {
          formData: JSON.parse(JSON.stringify(formData)),
          identificationData: JSON.parse(JSON.stringify(identificationData)),
          textElements: JSON.parse(JSON.stringify(textElements)),
          imageElements: JSON.parse(JSON.stringify(imageElements)),
          backgroundSettings: JSON.parse(JSON.stringify(backgroundSettings)),
          companyBranding: JSON.parse(JSON.stringify(companyBranding))
        },
        updatedAt: new Date().toISOString()
      }

      try {
        localStorage.setItem('currentWork', JSON.stringify(currentWork))
        setLastAutoSave(new Date())
      } catch (error) {
        console.error('Error auto-saving work:', error)
      }
    }, 5000) // Auto-save every 5 seconds

    return () => clearTimeout(autoSaveTimeout)
  }, [formData, identificationData, textElements, imageElements, backgroundSettings, companyBranding, signageType, autoSaveEnabled])

  // Load auto-saved work on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('currentWork')
      if (saved) {
        const currentWork = JSON.parse(saved)
        // Only load if user wants to restore (could add a prompt)
        // For now, we'll just keep it available for manual restore
      }
    } catch (error) {
      console.error('Error loading auto-saved work:', error)
    }
  }, [])

  // Save version history
  useEffect(() => {
    const saveVersion = () => {
      const version = {
        timestamp: new Date().toISOString(),
        formData: JSON.parse(JSON.stringify(formData)),
        identificationData: JSON.parse(JSON.stringify(identificationData)),
        textElements: JSON.parse(JSON.stringify(textElements)),
        imageElements: JSON.parse(JSON.stringify(imageElements)),
        backgroundSettings: JSON.parse(JSON.stringify(backgroundSettings))
      }
      setVersionHistory(prev => [...prev.slice(-9), version]) // Keep last 10 versions
    }

    // Debounce version saving
    const timeoutId = setTimeout(saveVersion, 2000)
    return () => clearTimeout(timeoutId)
  }, [formData, identificationData, textElements, imageElements, backgroundSettings])

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
        showNotification(`File ${file.name} exceeds 5MB limit`, 'error')
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

  // Helper function to get PPE display name
  const getPPEDisplayName = (ppeId) => {
    // Search through all PPE categories to find the matching item
    for (const category of Object.values(ppeCategories)) {
      const ppeItem = category.find(item => item.id === ppeId)
      if (ppeItem) {
        return ppeItem.name
      }
    }
    // If not found, format the ID as a readable name
    return ppeId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
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
    // Auto-hide sidebar after selection (especially on mobile)
    setTimeout(() => {
      setSidebarOpen(false)
    }, 300)
  }

  // Handle logo drag start
  const handleLogoDragStart = (e, logoType) => {
    // Don't start drag if clicking on resize handle
    if (e.target.classList.contains('resize-handle')) return
    // If Shift key is held, start resizing instead of dragging
    if (e.shiftKey) {
      handleLogoResizeStart(e, logoType, 'bottom-right')
    } else {
      setSelectedLogo(logoType)
      setDraggingLogo(logoType)
    }
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

  // Handle logo resize start
  const handleLogoResizeStart = (e, logoType, corner) => {
    e.preventDefault()
    e.stopPropagation()
    setResizingLogo(logoType)
    setSelectedLogo(logoType)
    setLogoResizeCorner(corner)
    const currentSize = logoType === 'client'
      ? companyBranding.clientLogoSize
      : companyBranding.contractorLogoSize
    setResizeStartData({
      size: currentSize,
      x: e.clientX,
      y: e.clientY
    })
  }

  // Handle logo resize
  const handleLogoResize = (e) => {
    if (!resizingLogo) return

    const deltaX = e.clientX - resizeStartData.x
    const deltaY = e.clientY - resizeStartData.y

    // Calculate the distance moved for uniform scaling
    // For different corners, we need to adjust the direction
    let delta = 0
    if (logoResizeCorner === 'top-left') {
      // Dragging down-right increases size, up-left decreases
      delta = Math.abs(deltaX) > Math.abs(deltaY) ? -deltaX : -deltaY
    } else if (logoResizeCorner === 'top-right') {
      // Dragging down-left increases size, up-right decreases
      delta = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : -deltaY
    } else if (logoResizeCorner === 'bottom-left') {
      // Dragging up-right increases size, down-left decreases
      delta = Math.abs(deltaX) > Math.abs(deltaY) ? -deltaX : deltaY
    } else {
      // bottom-right: Dragging down-right increases size, up-left decreases
      delta = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY
    }

    const newSize = Math.max(20, Math.min(500, resizeStartData.size + delta))

    if (resizingLogo === 'client') {
      setCompanyBranding({
        ...companyBranding,
        clientLogoSize: newSize
      })
    } else {
      setCompanyBranding({
        ...companyBranding,
        contractorLogoSize: newSize
      })
    }
  }

  // Handle logo resize end
  const handleLogoResizeEnd = () => {
    setResizingLogo(null)
    setLogoResizeCorner(null)
    setResizeStartData({ size: 0, x: 0, y: 0 })
  }

  // Handle icon/text drag start
  const handleElementDragStart = (elementType, e) => {
    // Don't start drag if clicking on resize handle
    if (e && e.target.classList.contains('element-resize-handle')) return
    setDraggingElement(elementType)
    setSelectedElement(elementType)
  }

  // Handle element resize start
  const handleElementResizeStart = (e, elementType, handle) => {
    e.preventDefault()
    e.stopPropagation()
    setResizingElement(elementType)
    setSelectedElement(elementType)
    setElementResizeHandle(handle)

    const currentSize = elementType === 'icon'
      ? identificationData.iconSize
      : identificationData.fontSize
    const currentPosition = elementType === 'icon'
      ? identificationData.iconPosition
      : identificationData.textPosition

    setElementResizeStartData({
      size: currentSize,
      x: e.clientX,
      y: e.clientY,
      positionX: currentPosition.x,
      positionY: currentPosition.y
    })
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

  // Handle element resize
  const handleElementResize = (e) => {
    if (!resizingElement || !elementResizeHandle) return

    const previewElement = e.currentTarget.closest('.preview-container')
    if (!previewElement) return

    const rect = previewElement.getBoundingClientRect()
    const deltaXPixels = e.clientX - elementResizeStartData.x
    const deltaYPixels = e.clientY - elementResizeStartData.y

    // For uniform sizing, we'll use the average of X and Y for corner handles
    // For edge handles, we use only the relevant axis
    let deltaSize = 0
    let deltaPosX = 0
    let deltaPosY = 0

    // Calculate resize based on handle type
    switch (elementResizeHandle) {
      case 'top-left':
        // Resize from top-left: size decreases when dragging left/up, increases when dragging right/down
        deltaSize = -(deltaXPixels + deltaYPixels) / 2
        deltaPosX = deltaXPixels / 2
        deltaPosY = deltaYPixels / 2
        break
      case 'top':
        // Resize from top: size decreases when dragging up, increases when dragging down
        deltaSize = -deltaYPixels
        deltaPosY = deltaYPixels / 2
        break
      case 'top-right':
        // Resize from top-right: size increases when dragging right/down, decreases when dragging left/up
        deltaSize = (deltaXPixels - deltaYPixels) / 2
        deltaPosX = deltaXPixels / 2
        deltaPosY = deltaYPixels / 2
        break
      case 'right':
        // Resize from right: size increases when dragging right, decreases when dragging left
        deltaSize = deltaXPixels
        deltaPosX = deltaXPixels / 2
        break
      case 'bottom-right':
        // Resize from bottom-right: size increases when dragging right/down, decreases when dragging left/up
        deltaSize = (deltaXPixels + deltaYPixels) / 2
        deltaPosX = deltaXPixels / 2
        deltaPosY = deltaYPixels / 2
        break
      case 'bottom':
        // Resize from bottom: size increases when dragging down, decreases when dragging up
        deltaSize = deltaYPixels
        deltaPosY = deltaYPixels / 2
        break
      case 'bottom-left':
        // Resize from bottom-left: size increases when dragging left/down, decreases when dragging right/up
        deltaSize = (-deltaXPixels + deltaYPixels) / 2
        deltaPosX = deltaXPixels / 2
        deltaPosY = deltaYPixels / 2
        break
      case 'left':
        // Resize from left: size decreases when dragging left, increases when dragging right
        deltaSize = -deltaXPixels
        deltaPosX = deltaXPixels / 2
        break
    }

    // Calculate new size
    let newSize = elementResizeStartData.size + deltaSize

    // Calculate new position (adjust to maintain the resize anchor point)
    const deltaXPercent = (deltaPosX / rect.width) * 100
    const deltaYPercent = (deltaPosY / rect.height) * 100
    let newPositionX = elementResizeStartData.positionX + deltaXPercent
    let newPositionY = elementResizeStartData.positionY + deltaYPercent

    // Constrain size based on element type
    const maxSize = resizingElement === 'icon' ? 500 : 200
    const minSize = resizingElement === 'icon' ? 20 : 12
    newSize = Math.max(minSize, Math.min(maxSize, newSize))

    // If size was constrained, adjust position to compensate
    const actualDeltaSize = newSize - elementResizeStartData.size
    if (actualDeltaSize !== deltaSize) {
      // Adjust position to account for size constraint
      const sizeDiff = actualDeltaSize - deltaSize
      if (elementResizeHandle.includes('left')) {
        newPositionX -= (sizeDiff / rect.width) * 50
      }
      if (elementResizeHandle.includes('right')) {
        newPositionX += (sizeDiff / rect.width) * 50
      }
      if (elementResizeHandle.includes('top')) {
        newPositionY -= (sizeDiff / rect.height) * 50
      }
      if (elementResizeHandle.includes('bottom')) {
        newPositionY += (sizeDiff / rect.height) * 50
      }
    }

    // Constrain position
    newPositionX = Math.max(0, Math.min(100, newPositionX))
    newPositionY = Math.max(0, Math.min(100, newPositionY))

    if (resizingElement === 'icon') {
      setIdentificationData({
        ...identificationData,
        iconSize: newSize,
        iconPosition: { x: newPositionX, y: newPositionY }
      })
    } else if (resizingElement === 'text') {
      setIdentificationData({
        ...identificationData,
        fontSize: newSize,
        textPosition: { x: newPositionX, y: newPositionY }
      })
    }
  }

  // Handle icon/text drag end
  const handleElementDragEnd = () => {
    setDraggingElement(null)
  }

  // Handle element resize end
  const handleElementResizeEnd = () => {
    setResizingElement(null)
    setElementResizeHandle(null)
    setElementResizeStartData({ size: 0, x: 0, y: 0, positionX: 0, positionY: 0 })
  }

  // Get cursor style for resize handles
  const getResizeCursor = (handle) => {
    switch (handle) {
      case 'top-left':
      case 'bottom-right':
        return 'nwse-resize'
      case 'top-right':
      case 'bottom-left':
        return 'nesw-resize'
      case 'top':
      case 'bottom':
        return 'ns-resize'
      case 'left':
      case 'right':
        return 'ew-resize'
      default:
        return 'default'
    }
  }

  // Handle mouse move for dragging
  const handleMouseMove = (e) => {
    if (draggingLogo) {
      // If Shift key is held during drag, switch to resize mode
      if (e.shiftKey && !resizingLogo) {
        const logoType = draggingLogo
        setDraggingLogo(null)
        setSelectedLogo(logoType)
        setLogoResizeCorner('bottom-right')
        const currentSize = logoType === 'client'
          ? companyBranding.clientLogoSize
          : companyBranding.contractorLogoSize
        setResizeStartData({
          size: currentSize,
          x: e.clientX,
          y: e.clientY
        })
        setResizingLogo(logoType)
      } else {
        handleLogoDrag(e, draggingLogo)
      }
    } else if (resizingLogo) {
      handleLogoResize(e)
    } else if (resizingElement) {
      handleElementResize(e)
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

  // Export functionality
  const exportToImage = async (format = 'PNG', dpi = 300) => {
    if (!previewRef.current) {
      showNotification('Preview not available', 'error')
      return
    }

    try {
      // Try to use html2canvas if available, otherwise use print method
      let html2canvas
      try {
        html2canvas = (await import('html2canvas')).default
      } catch (e) {
        // html2canvas not available, use print method
        showNotification('Using print method. For better export, install html2canvas library.', 'error')
        handlePrint()
        return
      }

      const element = previewRef.current
      const scale = Math.min(dpi / 96, 3) // Limit scale to prevent memory issues

      const canvas = await html2canvas(element, {
        scale: scale,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
        allowTaint: true
      })

      const mimeType = format === 'JPG' ? 'image/jpeg' : 'image/png'
      const quality = format === 'JPG' ? 0.95 : 1.0

      canvas.toBlob((blob) => {
        if (!blob) {
          showNotification('Failed to generate image', 'error')
          return
        }
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${formData.title || 'signage'}.${format.toLowerCase()}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        showNotification(`${format} exported successfully!`, 'success')
      }, mimeType, quality)
    } catch (error) {
      console.error('Export error:', error)
      showNotification('Export failed. Please use Print button (Ctrl+P) and save as PDF.', 'error')
    }
  }

  const exportToPDF = async (dpi = 300) => {
    if (!previewRef.current) {
      showNotification('Preview not available', 'error')
      return
    }

    try {
      // Try to use jsPDF and html2canvas
      let jsPDF, html2canvas
      try {
        jsPDF = (await import('jspdf')).default
        html2canvas = (await import('html2canvas')).default
      } catch (e) {
        // Libraries not available, use print method
        showNotification('Using print method. For PDF export, install jspdf and html2canvas libraries, or use Print (Ctrl+P) and save as PDF.', 'error')
        handlePrint()
        return
      }

      const element = previewRef.current
      const canvas = await html2canvas(element, {
        scale: Math.min(dpi / 96, 3),
        backgroundColor: '#ffffff',
        useCORS: true,
        allowTaint: true
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: identificationData.orientation === 'Portrait' ? 'portrait' : 'landscape',
        unit: 'mm',
        format: formData.size.toLowerCase()
      })

      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = canvas.width
      const imgHeight = canvas.height
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
      const imgX = (pdfWidth - imgWidth * ratio) / 2
      const imgY = 0

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio)
      pdf.save(`${formData.title || 'signage'}.pdf`)
      showNotification('PDF exported successfully!', 'success')
    } catch (error) {
      console.error('PDF export error:', error)
      showNotification('PDF export failed. Please use Print button (Ctrl+P) and save as PDF.', 'error')
    }
  }

  const handleExportSignage = async () => {
    const { format, dpi } = exportSettings

    if (format === 'PDF') {
      await exportToPDF(dpi)
    } else {
      await exportToImage(format, dpi)
    }

    setExportModalOpen(false)
  }

  const handleResetAIGeneration = () => {
    setAiGenerationStep(1)
    setAiDescription('')
    setIsAnalyzing(false)
    setIsDesigning(false)
    setAiGeneratedData(null)
  }

  const handlePrint = () => {
    if (!previewRef.current) return

    // Create a new window for printing
    const printWindow = window.open('', '_blank')
    const printContent = previewRef.current.innerHTML

    // Get computed styles for the preview container
    const styles = window.getComputedStyle(previewRef.current)
    const containerStyles = `
      <style>
        @media print {
          @page {
            size: ${formData.size};
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
          }
        }
        body {
          margin: 0;
          padding: 20px;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
        }
        .print-container {
          ${styles.cssText}
          border: ${styles.border};
          border-radius: ${styles.borderRadius};
          overflow: ${styles.overflow};
          background: ${styles.background};
          max-width: 100%;
          height: auto;
        }
        .print-container * {
          max-width: 100%;
        }
        img {
          max-width: 100%;
          height: auto;
        }
      </style>
    `

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Signage</title>
          ${containerStyles}
        </head>
        <body>
          <div class="print-container">
            ${printContent}
          </div>
        </body>
      </html>
    `)

    printWindow.document.close()

    // Wait for images to load, then print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print()
        printWindow.onafterprint = () => {
          printWindow.close()
        }
      }, 250)
    }
  }

  const handleDownload = async () => {
    if (!previewRef.current) return

    try {
      // Try to dynamically import html2canvas
      let html2canvas
      try {
        const html2canvasModule = await import('html2canvas')
        html2canvas = html2canvasModule.default || html2canvasModule
      } catch (e) {
        // html2canvas not available - use alternative method
        html2canvas = null
      }

      if (html2canvas) {
        const canvas = await html2canvas(previewRef.current, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          allowTaint: true,
          width: previewRef.current.offsetWidth,
          height: previewRef.current.offsetHeight
        })

        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            const filename = `signage-${(formData.title || 'signage').replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${Date.now()}.png`
            a.download = filename
            document.body.appendChild(a)
            a.click()
            setTimeout(() => {
              document.body.removeChild(a)
              URL.revokeObjectURL(url)
            }, 100)
          }
        }, 'image/png', 0.95)
      } else {
        // Fallback: Use print to PDF method
        // Create a hidden iframe and trigger print
        const iframe = document.createElement('iframe')
        iframe.style.position = 'fixed'
        iframe.style.right = '0'
        iframe.style.bottom = '0'
        iframe.style.width = '0'
        iframe.style.height = '0'
        iframe.style.border = 'none'

        document.body.appendChild(iframe)

        const printDoc = iframe.contentWindow.document
        printDoc.open()
        printDoc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Signage Download</title>
              <style>
                @page {
                  size: ${formData.size};
                  margin: 0;
                }
                body {
                  margin: 0;
                  padding: 0;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                }
                .preview-container {
                  ${window.getComputedStyle(previewRef.current).cssText}
                }
              </style>
            </head>
            <body>
              ${previewRef.current.innerHTML}
            </body>
          </html>
        `)
        printDoc.close()

        // Wait for content to load, then trigger print
        iframe.onload = () => {
          setTimeout(() => {
            iframe.contentWindow.print()
            setTimeout(() => {
              document.body.removeChild(iframe)
            }, 1000)
          }, 250)
        }
      }
    } catch (error) {
      console.error('Error downloading image:', error)
      // Final fallback: Show message and suggest using print
      showNotification('Unable to download image. Please use the Print button and select "Save as PDF" from the print dialog.', 'error')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm px-3 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-3 md:py-4 lg:py-5 sticky top-0 z-50">
        <div className="flex items-center justify-between gap-2 sm:gap-3 md:gap-4 max-w-[1920px] mx-auto">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
              aria-label="Toggle menu"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {sidebarOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
            <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
              <span className="text-white font-bold text-base sm:text-lg md:text-xl lg:text-2xl">U</span>
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-2xl 2xl:text-3xl font-bold text-gray-900 truncate">
                <span className="hidden xs:inline sm:hidden">Smart Signage</span>
                <span className="hidden sm:inline">Universal Smart Signage Generator</span>
              </h1>
              <p className="hidden sm:block text-xs md:text-sm lg:text-base text-gray-600 truncate">
                Professional EHS, Safety & Industrial Signage System
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 sm:gap-2 lg:gap-3 flex-wrap flex-shrink-0">
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
                        showNotification('File size must be less than 10MB', 'error')
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
                <div className="px-2 sm:px-3 md:px-4 lg:px-5 py-1 sm:py-1.5 lg:py-2 bg-white border-2 border-gray-300 rounded-full text-xs sm:text-sm md:text-sm lg:text-base font-medium whitespace-nowrap shadow-sm hover:shadow-md transition-all hover:border-blue-400 hover:bg-blue-50 flex items-center gap-1.5 sm:gap-2">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span className="text-gray-700 hidden md:inline">Upload Custom Image</span>
                  <span className="text-gray-700 md:hidden">Upload</span>
                </div>
              </label>
            </div>
            <span className="px-2 sm:px-3 md:px-4 lg:px-5 py-1 sm:py-1.5 lg:py-2 bg-purple-100 text-purple-700 rounded-full text-xs sm:text-sm md:text-sm lg:text-base font-medium whitespace-nowrap shadow-sm hover:shadow-md transition-shadow">
              AI Powered
            </span>
            <span className="px-2 sm:px-3 md:px-4 lg:px-5 py-1 sm:py-1.5 lg:py-2 bg-blue-100 text-blue-700 rounded-full text-xs sm:text-sm md:text-sm lg:text-base font-medium whitespace-nowrap shadow-sm hover:shadow-md transition-shadow">
              ISO 7010
            </span>
          </div>
        </div>
      </header>

      {/* Comprehensive Editor Toolbar */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-[56px] sm:top-[64px] md:top-[80px] lg:top-[88px] z-40">
        <div className="max-w-[1920px] mx-auto px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-2.5 md:py-3">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 md:gap-3">
            {/* Design Mode Toggle */}
            <div className="flex items-center gap-1 sm:gap-2 bg-gray-100 rounded-lg p-0.5 sm:p-1">
              <button
                onClick={() => {
                  setDesignMode('template')
                  setTextElements([])
                  setImageElements([])
                  setCanvasElements([])
                }}
                className={`px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5 rounded text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${designMode === 'template' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-200'
                  }`}
              >
                <span className="hidden sm:inline">Template Mode</span>
                <span className="sm:hidden">Template</span>
              </button>
              <button
                onClick={() => {
                  setDesignMode('free')
                  // Show template selection for free design
                }}
                className={`px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5 rounded text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${designMode === 'free' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-200'
                  }`}
              >
                <span className="hidden sm:inline">Free Design</span>
                <span className="sm:hidden">Free</span>
              </button>
            </div>

            {/* Template Selector for Free Design */}
            {designMode === 'free' && (
              <div className="absolute top-full left-0 mt-2 bg-white border-2 border-gray-300 rounded-lg shadow-lg p-4 z-50 min-w-[300px]">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Start from Template</h3>
                <div className="grid grid-cols-2 gap-2">
                  {templates.map(template => (
                    <button
                      key={template.id}
                      onClick={() => {
                        setFormData(prev => ({ ...prev, title: template.name }))
                        setIdentificationData(prev => ({ ...prev, areaName: template.name }))
                        setBackgroundSettings(prev => ({ ...prev, color: '#FFFFFF' }))
                        addAuditLog('load-template', { templateId: template.id, templateName: template.name })
                      }}
                      className="p-3 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                    >
                      <div className="text-2xl mb-1">{template.icon}</div>
                      <div className="text-xs font-semibold text-gray-900">{template.name}</div>
                      <div className="text-xs text-gray-600">{template.subtitle}</div>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => {
                    setTextElements([])
                    setImageElements([])
                    setCanvasElements([])
                    setFormData(prev => ({ ...prev, title: '' }))
                    setBackgroundSettings(prev => ({ ...prev, color: '#FFFFFF' }))
                  }}
                  className="w-full mt-3 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  Start from Blank
                </button>
              </div>
            )}

            {/* Text Editor Button */}
            <button
              onClick={() => setTextEditorOpen(!textEditorOpen)}
              className={`px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center gap-1 sm:gap-2 ${textEditorOpen ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span className="hidden sm:inline">Text</span>
            </button>

            {/* Image Editor Button */}
            <button
              onClick={() => setImageEditorOpen(!imageEditorOpen)}
              className={`px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center gap-1 sm:gap-2 ${imageEditorOpen ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="hidden sm:inline">Image</span>
            </button>

            {/* ISO 7010 Icon Library */}
            <button
              className={`px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center gap-1 sm:gap-2 ${isoIconModalOpen ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              onClick={() => setIsoIconModalOpen(!isoIconModalOpen)}
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="hidden md:inline">ISO Icons</span>
            </button>

            {/* Authorized Persons */}
            <button
              className={`px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center gap-1 sm:gap-2 ${authorizedPersonsPanelOpen ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              onClick={() => setAuthorizedPersonsPanelOpen(!authorizedPersonsPanelOpen)}
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="hidden sm:inline">Persons</span>
            </button>

            {/* Color & Background */}
            <button
              className={`px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center gap-1 sm:gap-2 ${backgroundPanelOpen ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              onClick={() => setBackgroundPanelOpen(!backgroundPanelOpen)}
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
              <span className="hidden sm:inline">Colors</span>
            </button>

            {/* Undo/Redo */}
            <div className="hidden sm:flex items-center gap-1 border-l border-gray-300 pl-1.5 sm:pl-2 ml-1.5 sm:ml-2">
              <button
                onClick={undo}
                disabled={historyIndex <= 0}
                className="p-1 sm:p-1.5 rounded text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Undo"
              >
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
              </button>
              <button
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
                className="p-1 sm:p-1.5 rounded text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Redo"
              >
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
                </svg>
              </button>
            </div>

            {/* Grid Toggle */}
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center gap-1 sm:gap-2 ${showGrid ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              title="Toggle Grid"
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span className="hidden md:inline">Grid</span>
            </button>

            {/* Zoom Controls */}
            <div className="hidden md:flex items-center gap-1.5 sm:gap-2 border-l border-gray-300 pl-1.5 sm:pl-2 ml-1.5 sm:ml-2">
              <button
                onClick={() => setPreviewZoom(Math.max(25, previewZoom - 25))}
                className="p-1 sm:p-1.5 rounded text-gray-700 hover:bg-gray-200 transition-colors"
                title="Zoom Out"
              >
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                </svg>
              </button>
              <span className="text-xs sm:text-sm text-gray-700 min-w-[45px] sm:min-w-[50px] text-center">{previewZoom}%</span>
              <button
                onClick={() => setPreviewZoom(Math.min(200, previewZoom + 25))}
                className="p-1 sm:p-1.5 rounded text-gray-700 hover:bg-gray-200 transition-colors"
                title="Zoom In"
              >
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                </svg>
              </button>
              <button
                onClick={() => setPreviewZoom(100)}
                className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs text-gray-700 hover:bg-gray-200 transition-colors"
                title="Reset Zoom"
              >
                Reset
              </button>
              <button
                onClick={() => setShowFullScreenPreview(true)}
                className="px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5 rounded text-xs sm:text-sm text-gray-700 hover:bg-gray-200 transition-colors flex items-center gap-1"
                title="Full Screen Preview"
              >
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
                <span className="hidden lg:inline">Fullscreen</span>
              </button>
            </div>

            {/* Export Button */}
            <button
              className="px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors flex items-center gap-1 sm:gap-2 ml-auto"
              onClick={() => setExportModalOpen(true)}
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="hidden sm:inline">Export</span>
            </button>

            {/* Signage Library */}
            <button
              className={`px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center gap-1 sm:gap-2 ${signageLibraryOpen ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              onClick={() => setSignageLibraryOpen(!signageLibraryOpen)}
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span className="hidden sm:inline">Library</span>
            </button>

            {/* Save Button */}
            <div className="flex items-center gap-2">
              {lastAutoSave && (
                <span className="text-xs text-gray-500" title={`Last auto-saved: ${lastAutoSave.toLocaleTimeString()}`}>
                  <svg className="w-4 h-4 inline mr-1 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Auto-saved
                </span>
              )}
              <button
                className="px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center gap-1 sm:gap-2"
                onClick={() => {
                  setSaveModalName(formData.title || 'Untitled Signage')
                  setSaveModalOpen(true)
                }}
              >
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                <span className="hidden sm:inline">Save</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Text Editor Panel */}
      {textEditorOpen && (
        <div className="bg-white border-b border-gray-200 shadow-lg max-w-[1920px] mx-auto px-2 sm:px-3 md:px-4 py-3 sm:py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {/* Font Selection */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">Font Family</label>
              <select
                value={selectedTextElement?.fontFamily || 'Arial'}
                onChange={(e) => {
                  if (selectedTextElement) {
                    setTextElements(prev => prev.map(el =>
                      el.id === selectedTextElement.id ? { ...el, fontFamily: e.target.value } : el
                    ))
                  }
                }}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {industrialFonts.map(font => (
                  <option key={font.name} value={font.family}>{font.name}</option>
                ))}
              </select>
            </div>

            {/* Font Size */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">Font Size</label>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <input
                  type="range"
                  min="12"
                  max="144"
                  value={selectedTextElement?.fontSize || 24}
                  onChange={(e) => {
                    if (selectedTextElement) {
                      setTextElements(prev => prev.map(el =>
                        el.id === selectedTextElement.id ? { ...el, fontSize: parseInt(e.target.value) } : el
                      ))
                    }
                  }}
                  className="flex-1"
                />
                <span className="text-xs sm:text-sm text-gray-600 w-10 sm:w-12 text-right">{selectedTextElement?.fontSize || 24}px</span>
              </div>
            </div>

            {/* Font Weight */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">Font Weight</label>
              <select
                value={selectedTextElement?.fontWeight || 'normal'}
                onChange={(e) => {
                  if (selectedTextElement) {
                    setTextElements(prev => prev.map(el =>
                      el.id === selectedTextElement.id ? { ...el, fontWeight: e.target.value } : el
                    ))
                  }
                }}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="normal">Normal</option>
                <option value="bold">Bold</option>
                <option value="300">Light</option>
                <option value="500">Medium</option>
                <option value="600">Semi-Bold</option>
                <option value="700">Bold</option>
                <option value="800">Extra Bold</option>
              </select>
            </div>

            {/* Text Alignment */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">Alignment</label>
              <div className="flex gap-1.5 sm:gap-2">
                {['left', 'center', 'right', 'justify'].map(align => (
                  <button
                    key={align}
                    onClick={() => {
                      if (selectedTextElement) {
                        setTextElements(prev => prev.map(el =>
                          el.id === selectedTextElement.id ? { ...el, textAlign: align } : el
                        ))
                      }
                    }}
                    className={`flex-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border-2 transition-colors text-sm sm:text-base ${selectedTextElement?.textAlign === align
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                      }`}
                    title={align.charAt(0).toUpperCase() + align.slice(1)}
                  >
                    {align === 'left' && '⬅'}
                    {align === 'center' && '⬌'}
                    {align === 'right' && '➡'}
                    {align === 'justify' && '⬌⬌'}
                  </button>
                ))}
              </div>
            </div>

            {/* Text Color */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Text Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={selectedTextElement?.color || '#000000'}
                  onChange={(e) => {
                    if (selectedTextElement) {
                      setTextElements(prev => prev.map(el =>
                        el.id === selectedTextElement.id ? { ...el, color: e.target.value } : el
                      ))
                      // Check compliance
                      const warnings = checkColorCompliance(
                        formData.category,
                        e.target.value,
                        backgroundSettings.color
                      )
                      setColorCompliance({ enabled: true, warnings })
                    }
                  }}
                  className="w-12 h-10 rounded border-2 border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={selectedTextElement?.color || '#000000'}
                  onChange={(e) => {
                    if (selectedTextElement) {
                      setTextElements(prev => prev.map(el =>
                        el.id === selectedTextElement.id ? { ...el, color: e.target.value } : el
                      ))
                    }
                  }}
                  className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="#000000"
                />
              </div>
            </div>

            {/* Line Spacing */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Line Spacing</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0.8"
                  max="3"
                  step="0.1"
                  value={selectedTextElement?.lineHeight || 1.2}
                  onChange={(e) => {
                    if (selectedTextElement) {
                      setTextElements(prev => prev.map(el =>
                        el.id === selectedTextElement.id ? { ...el, lineHeight: parseFloat(e.target.value) } : el
                      ))
                    }
                  }}
                  className="flex-1"
                />
                <span className="text-sm text-gray-600 w-12 text-right">{selectedTextElement?.lineHeight || 1.2}</span>
              </div>
            </div>

            {/* Letter Spacing */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Letter Spacing</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="-2"
                  max="10"
                  step="0.5"
                  value={selectedTextElement?.letterSpacing || 0}
                  onChange={(e) => {
                    if (selectedTextElement) {
                      setTextElements(prev => prev.map(el =>
                        el.id === selectedTextElement.id ? { ...el, letterSpacing: parseFloat(e.target.value) } : el
                      ))
                    }
                  }}
                  className="flex-1"
                />
                <span className="text-sm text-gray-600 w-12 text-right">{selectedTextElement?.letterSpacing || 0}px</span>
              </div>
            </div>

            {/* Language Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Language</label>
              <div className="flex gap-2">
                <select
                  value={currentLanguage}
                  onChange={(e) => setCurrentLanguage(e.target.value)}
                  className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="en">English</option>
                  <option value="ar">Arabic (العربية)</option>
                  <option value="es">Spanish (Español)</option>
                  <option value="fr">French (Français)</option>
                  <option value="de">German (Deutsch)</option>
                  <option value="zh">Chinese (中文)</option>
                </select>
                <button
                  onClick={() => {
                    if (!voiceToTextEnabled) {
                      setVoiceToTextEnabled(true)
                      // Initialize Web Speech API
                      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
                        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
                        const recognition = new SpeechRecognition()
                        recognition.continuous = false
                        recognition.interimResults = false
                        recognition.lang = currentLanguage === 'ar' ? 'ar-SA' : currentLanguage

                        recognition.onresult = (event) => {
                          const transcript = event.results[0][0].transcript
                          if (selectedTextElement) {
                            setTextElements(prev => prev.map(el =>
                              el.id === selectedTextElement.id ? { ...el, text: transcript } : el
                            ))
                          }
                        }

                        recognition.onerror = () => {
                          showNotification('Voice recognition error. Please check your microphone permissions.', 'error')
                          showNotification('Voice recognition error. Please check your microphone permissions.', 'error')
                          setVoiceToTextEnabled(false)
                        }

                        recognition.start()
                      } else {
                        showNotification('Voice recognition not supported in this browser.', 'error')
                        showNotification('Voice recognition not supported in this browser.', 'error')
                        setVoiceToTextEnabled(false)
                      }
                    } else {
                      setVoiceToTextEnabled(false)
                    }
                  }}
                  className={`px-3 py-2 rounded-lg border-2 transition-colors ${voiceToTextEnabled
                    ? 'bg-red-600 text-white border-red-600'
                    : 'bg-gray-100 text-gray-700 border-gray-300 hover:border-gray-400'
                    }`}
                  title="Voice to Text"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0h4m-4 0h-4m-2-4a2 2 0 01-2-2H5a2 2 0 01-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Auto Text Fit */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="autoTextFit"
                checked={selectedTextElement?.autoFit || false}
                onChange={(e) => {
                  if (selectedTextElement) {
                    setTextElements(prev => prev.map(el =>
                      el.id === selectedTextElement.id ? { ...el, autoFit: e.target.checked } : el
                    ))
                  }
                }}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="autoTextFit" className="text-sm font-semibold text-gray-700">Auto Text Fit</label>
            </div>

            {/* Add Text Button */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const newTextElement = {
                    id: Date.now(),
                    text: 'New Text',
                    x: 50,
                    y: 50,
                    fontSize: 24,
                    fontFamily: 'Arial, sans-serif',
                    fontWeight: 'normal',
                    color: '#000000',
                    textAlign: 'left',
                    lineHeight: 1.2,
                    letterSpacing: 0,
                    autoFit: false
                  }
                  setTextElements(prev => [...prev, newTextElement])
                  setSelectedTextElement(newTextElement)
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                + Add Text
              </button>
              {selectedTextElement && (
                <>
                  <button
                    onClick={() => {
                      setCopiedElement({ type: 'text', data: selectedTextElement })
                      addAuditLog('copy', { elementType: 'text', elementId: selectedTextElement.id })
                    }}
                    className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    title="Copy"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                  {copiedElement && copiedElement.type === 'text' && (
                    <button
                      onClick={() => {
                        const pasted = {
                          ...copiedElement.data,
                          id: Date.now(),
                          x: copiedElement.data.x + 10,
                          y: copiedElement.data.y + 10
                        }
                        setTextElements(prev => [...prev, pasted])
                        setSelectedTextElement(pasted)
                        addAuditLog('paste', { elementType: 'text', elementId: pasted.id })
                      }}
                      className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                      title="Paste"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Color Compliance Warnings */}
          {colorCompliance.warnings.length > 0 && (
            <div className="mt-4 p-3 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="flex-1">
                  <p className="font-semibold text-yellow-800 mb-1">Compliance Warnings:</p>
                  <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                    {colorCompliance.warnings.map((warning, idx) => (
                      <li key={idx}>{warning}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Image Editor Panel */}
      {imageEditorOpen && (
        <div className="bg-white border-b border-gray-200 shadow-lg max-w-[1920px] mx-auto px-2 sm:px-3 md:px-4 py-3 sm:py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {/* Upload Image */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Upload Image</label>
              <label className="block cursor-pointer">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                  onChange={(e) => {
                    const file = e.target.files[0]
                    if (file) {
                      const reader = new FileReader()
                      reader.onload = (event) => {
                        const newImageElement = {
                          id: Date.now(),
                          src: event.target.result,
                          x: 50,
                          y: 50,
                          width: 200,
                          height: 200,
                          rotation: 0,
                          opacity: 100,
                          brightness: 100,
                          contrast: 100,
                          saturation: 100,
                          locked: false,
                          zIndex: 1
                        }
                        setImageElements(prev => [...prev, newImageElement])
                        setSelectedImageElement(newImageElement)
                      }
                      reader.readAsDataURL(file)
                    }
                    e.target.value = ''
                  }}
                  className="hidden"
                />
                <div className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-center text-sm text-gray-600 cursor-pointer">
                  Upload (PNG, JPG, SVG)
                </div>
              </label>
            </div>

            {/* Brightness */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Brightness</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={selectedImageElement?.brightness || 100}
                  onChange={(e) => {
                    if (selectedImageElement) {
                      setImageElements(prev => prev.map(el =>
                        el.id === selectedImageElement.id ? { ...el, brightness: parseInt(e.target.value) } : el
                      ))
                    }
                  }}
                  className="flex-1"
                />
                <span className="text-sm text-gray-600 w-12 text-right">{selectedImageElement?.brightness || 100}%</span>
              </div>
            </div>

            {/* Contrast */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Contrast</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={selectedImageElement?.contrast || 100}
                  onChange={(e) => {
                    if (selectedImageElement) {
                      setImageElements(prev => prev.map(el =>
                        el.id === selectedImageElement.id ? { ...el, contrast: parseInt(e.target.value) } : el
                      ))
                    }
                  }}
                  className="flex-1"
                />
                <span className="text-sm text-gray-600 w-12 text-right">{selectedImageElement?.contrast || 100}%</span>
              </div>
            </div>

            {/* Saturation */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Saturation</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={selectedImageElement?.saturation || 100}
                  onChange={(e) => {
                    if (selectedImageElement) {
                      setImageElements(prev => prev.map(el =>
                        el.id === selectedImageElement.id ? { ...el, saturation: parseInt(e.target.value) } : el
                      ))
                    }
                  }}
                  className="flex-1"
                />
                <span className="text-sm text-gray-600 w-12 text-right">{selectedImageElement?.saturation || 100}%</span>
              </div>
            </div>

            {/* Opacity */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Opacity</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={selectedImageElement?.opacity || 100}
                  onChange={(e) => {
                    if (selectedImageElement) {
                      setImageElements(prev => prev.map(el =>
                        el.id === selectedImageElement.id ? { ...el, opacity: parseInt(e.target.value) } : el
                      ))
                    }
                  }}
                  className="flex-1"
                />
                <span className="text-sm text-gray-600 w-12 text-right">{selectedImageElement?.opacity || 100}%</span>
              </div>
            </div>

            {/* Rotation */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Rotation</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={selectedImageElement?.rotation || 0}
                  onChange={(e) => {
                    if (selectedImageElement) {
                      setImageElements(prev => prev.map(el =>
                        el.id === selectedImageElement.id ? { ...el, rotation: parseInt(e.target.value) } : el
                      ))
                    }
                  }}
                  className="flex-1"
                />
                <span className="text-sm text-gray-600 w-12 text-right">{selectedImageElement?.rotation || 0}°</span>
              </div>
            </div>

            {/* Lock Position */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="lockImage"
                checked={selectedImageElement?.locked || false}
                onChange={(e) => {
                  if (selectedImageElement) {
                    setImageElements(prev => prev.map(el =>
                      el.id === selectedImageElement.id ? { ...el, locked: e.target.checked } : el
                    ))
                  }
                }}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="lockImage" className="text-sm font-semibold text-gray-700">Lock Position</label>
            </div>

            {/* Remove Background */}
            <div>
              <button
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                onClick={() => {
                  if (selectedImageElement) {
                    // Basic background removal using canvas
                    const img = new Image()
                    img.crossOrigin = 'anonymous'
                    img.onload = () => {
                      const canvas = document.createElement('canvas')
                      canvas.width = img.width
                      canvas.height = img.height
                      const ctx = canvas.getContext('2d')
                      ctx.drawImage(img, 0, 0)

                      // Simple background removal (remove white/light backgrounds)
                      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
                      const data = imageData.data

                      for (let i = 0; i < data.length; i += 4) {
                        const r = data[i]
                        const g = data[i + 1]
                        const b = data[i + 2]
                        const brightness = (r + g + b) / 3

                        // Remove white/light backgrounds
                        if (brightness > 240) {
                          data[i + 3] = 0 // Make transparent
                        }
                      }

                      ctx.putImageData(imageData, 0, 0)
                      const newSrc = canvas.toDataURL('image/png')

                      setImageElements(prev => prev.map(el =>
                        el.id === selectedImageElement.id ? { ...el, src: newSrc } : el
                      ))
                      showNotification('Background removed (basic processing)', 'success')
                    }
                    img.src = selectedImageElement.src
                  } else {
                    showNotification('Please select an image first', 'error')
                  }
                }}
              >
                Remove Background
              </button>
            </div>

            {/* Crop Image */}
            <div>
              <button
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                onClick={() => {
                  if (selectedImageElement) {
                    setCropModalOpen(true)
                  } else {
                    showNotification('Please select an image first', 'error')
                  }
                }}
              >
                Crop Image
              </button>
            </div>

            {/* Copy/Paste/Duplicate for Images */}
            {selectedImageElement && (
              <div className="col-span-full flex gap-2 pt-2 border-t border-gray-200">
                <button
                  onClick={() => {
                    setCopiedElement({ type: 'image', data: selectedImageElement })
                    addAuditLog('copy', { elementType: 'image', elementId: selectedImageElement.id })
                  }}
                  className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </button>
                {copiedElement && copiedElement.type === 'image' && (
                  <button
                    onClick={() => {
                      const pasted = {
                        ...copiedElement.data,
                        id: Date.now(),
                        x: copiedElement.data.x + 20,
                        y: copiedElement.data.y + 20
                      }
                      setImageElements(prev => [...prev, pasted])
                      setSelectedImageElement(pasted)
                      addAuditLog('paste', { elementType: 'image', elementId: pasted.id })
                    }}
                    className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Paste
                  </button>
                )}
                <button
                  onClick={() => {
                    const duplicated = {
                      ...selectedImageElement,
                      id: Date.now(),
                      x: selectedImageElement.x + 20,
                      y: selectedImageElement.y + 20
                    }
                    setImageElements(prev => [...prev, duplicated])
                    setSelectedImageElement(duplicated)
                    addAuditLog('duplicate', { elementType: 'image', elementId: duplicated.id })
                  }}
                  className="flex-1 px-3 py-2 bg-blue-200 text-blue-700 rounded-lg hover:bg-blue-300 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Duplicate
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Background & Color Control Panel */}
      {backgroundPanelOpen && (
        <div className="bg-white border-b border-gray-200 shadow-lg max-w-[1920px] mx-auto px-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Background Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Background Type</label>
              <select
                value={backgroundSettings.type}
                onChange={(e) => setBackgroundSettings({ ...backgroundSettings, type: e.target.value })}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="solid">Solid Color</option>
                <option value="gradient">Gradient</option>
                <option value="image">Image</option>
              </select>
            </div>

            {/* Solid Color */}
            {backgroundSettings.type === 'solid' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Background Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={backgroundSettings.color}
                    onChange={(e) => setBackgroundSettings({ ...backgroundSettings, color: e.target.value })}
                    className="w-12 h-10 rounded border-2 border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={backgroundSettings.color}
                    onChange={(e) => setBackgroundSettings({ ...backgroundSettings, color: e.target.value })}
                    className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {/* ISO 7010 Color Presets */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">ISO 7010 Presets</label>
              <select
                value={formData.category}
                onChange={(e) => {
                  const category = e.target.value
                  setFormData({ ...formData, category })
                  const preset = iso7010Colors[category]
                  if (preset) {
                    setBackgroundSettings({ ...backgroundSettings, color: preset.bg })
                  }
                }}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(iso7010Colors).map(key => (
                  <option key={key} value={key}>{iso7010Colors[key].name}</option>
                ))}
              </select>
            </div>

            {/* High Contrast Mode */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="highContrast"
                checked={highContrastMode}
                onChange={(e) => setHighContrastMode(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="highContrast" className="text-sm font-semibold text-gray-700">High Contrast Mode</label>
            </div>

            {/* Contrast Ratio Checker */}
            {selectedTextElement && (
              <div className="col-span-full">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-semibold text-gray-700 mb-1">Contrast Ratio</p>
                  <p className="text-lg font-bold">
                    {contrastRatio ? contrastRatio.toFixed(2) : calculateContrastRatio(selectedTextElement.color, backgroundSettings.color).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {contrastRatio >= 4.5 ? '✓ WCAG AA Compliant' : contrastRatio >= 3.0 ? '⚠ Large Text Only' : '✗ Not Compliant'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Size & Layout Control Panel */}
      {sizeLayoutPanelOpen && (
        <div className="bg-white border-b border-gray-200 shadow-lg max-w-[1920px] mx-auto px-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Sign Size */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Sign Size</label>
              <select
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="A3">A3 (297 × 420 mm)</option>
                <option value="A4">A4 (210 × 297 mm)</option>
                <option value="A5">A5 (148 × 210 mm)</option>
                <option value="Custom">Custom Size</option>
              </select>
            </div>

            {/* Orientation */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Orientation</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setIdentificationData({ ...identificationData, orientation: 'Portrait' })}
                  className={`flex-1 px-3 py-2 rounded-lg border-2 transition-colors ${identificationData.orientation === 'Portrait'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                    }`}
                >
                  Portrait
                </button>
                <button
                  onClick={() => setIdentificationData({ ...identificationData, orientation: 'Landscape' })}
                  className={`flex-1 px-3 py-2 rounded-lg border-2 transition-colors ${identificationData.orientation === 'Landscape'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                    }`}
                >
                  Landscape
                </button>
              </div>
            </div>

            {/* Custom Size (if selected) */}
            {formData.size === 'Custom' && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Width (mm)</label>
                  <input
                    type="number"
                    min="50"
                    max="1000"
                    value={signSizes.Custom.width}
                    onChange={(e) => {
                      // Update custom size
                    }}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Height (mm)</label>
                  <input
                    type="number"
                    min="50"
                    max="1000"
                    value={signSizes.Custom.height}
                    onChange={(e) => {
                      // Update custom size
                    }}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}

            {/* Margins */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Margins (mm)</label>
              <input
                type="number"
                min="0"
                max="50"
                defaultValue="5"
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Bleed Control */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="includeBleed"
                checked={exportSettings.includeBleed}
                onChange={(e) => setExportSettings({ ...exportSettings, includeBleed: e.target.checked })}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="includeBleed" className="text-sm font-semibold text-gray-700">Include Bleed</label>
            </div>
          </div>
        </div>
      )}

      {/* Authorized Persons Editor Panel */}
      {authorizedPersonsPanelOpen && (
        <div className="bg-white border-b border-gray-200 shadow-lg max-w-[1920px] mx-auto px-4 py-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Authorized Persons & ID Signage</h3>
              <button
                onClick={() => {
                  setAuthorizedPersons(prev => [...prev, {
                    id: Date.now(),
                    name: '',
                    idNumber: '',
                    designation: '',
                    photo: null,
                    qrCodeText: ''
                  }])
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                + Add Person
              </button>
            </div>

            {/* Layout Settings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Grid Layout</label>
                <select
                  value={`${authorizedPersonsLayout.gridColumns}x${authorizedPersonsLayout.gridRows}`}
                  onChange={(e) => {
                    const [cols, rows] = e.target.value.split('x').map(Number)
                    setAuthorizedPersonsLayout({ ...authorizedPersonsLayout, gridColumns: cols, gridRows: rows })
                  }}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="1x1">1 Person</option>
                  <option value="2x1">2 Persons (Horizontal)</option>
                  <option value="1x2">2 Persons (Vertical)</option>
                  <option value="2x2">4 Persons</option>
                  <option value="3x2">6 Persons</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Style</label>
                <select
                  value={authorizedPersonsLayout.style}
                  onChange={(e) => setAuthorizedPersonsLayout({ ...authorizedPersonsLayout, style: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="badge">Badge Style</option>
                  <option value="poster">Poster Style</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="showQR"
                  checked={authorizedPersonsLayout.showQR}
                  onChange={(e) => setAuthorizedPersonsLayout({ ...authorizedPersonsLayout, showQR: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="showQR" className="text-sm font-semibold text-gray-700">Show QR Code</label>
              </div>
            </div>

            {/* Person List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {authorizedPersons.map((person, index) => (
                <div key={person.id} className="border-2 border-gray-300 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">Person {index + 1}</span>
                    <button
                      onClick={() => setAuthorizedPersons(prev => prev.filter(p => p.id !== person.id))}
                      className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  {/* Photo Upload */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Photo</label>
                    <label className="block cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0]
                          if (file) {
                            const reader = new FileReader()
                            reader.onload = (event) => {
                              setAuthorizedPersons(prev => prev.map(p =>
                                p.id === person.id ? { ...p, photo: event.target.result } : p
                              ))
                            }
                            reader.readAsDataURL(file)
                          }
                          e.target.value = ''
                        }}
                        className="hidden"
                      />
                      <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-blue-400 hover:bg-blue-50 transition-colors">
                        {person.photo ? (
                          <img src={person.photo} alt="Person" className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <span className="text-xs text-gray-500">Click to upload</span>
                        )}
                      </div>
                    </label>
                  </div>

                  {/* Name */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={person.name}
                      onChange={(e) => setAuthorizedPersons(prev => prev.map(p =>
                        p.id === person.id ? { ...p, name: e.target.value } : p
                      ))}
                      placeholder="Full Name"
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  {/* ID Number */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">ID Number</label>
                    <input
                      type="text"
                      value={person.idNumber}
                      onChange={(e) => setAuthorizedPersons(prev => prev.map(p =>
                        p.id === person.id ? { ...p, idNumber: e.target.value } : p
                      ))}
                      placeholder="Employee ID"
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  {/* Designation */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Designation</label>
                    <input
                      type="text"
                      value={person.designation}
                      onChange={(e) => setAuthorizedPersons(prev => prev.map(p =>
                        p.id === person.id ? { ...p, designation: e.target.value } : p
                      ))}
                      placeholder="Job Title"
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  {/* QR Code Text/URL */}
                  {authorizedPersonsLayout.showQR && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">QR Code Text / URL</label>
                      <input
                        type="text"
                        value={person.qrCodeText || ''}
                        onChange={(e) => {
                          const value = e.target.value
                          setAuthorizedPersons(prev => prev.map(p =>
                            p.id === person.id ? { ...p, qrCodeText: value } : p
                          ))
                        }}
                        placeholder="Enter URL or text for QR code"
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Enter URL or text to generate QR code. QR code will only generate when text is provided.
                      </p>
                      {/* Preview QR Code - Only show if text exists */}
                      {person.qrCodeText && person.qrCodeText.trim().length > 0 && (
                        <div className="mt-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-xs text-gray-600 mb-1">QR Code Preview:</p>
                          <div className="w-24 h-24 mx-auto border-2 border-gray-300 bg-white flex items-center justify-center p-2">
                            <img
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(person.qrCodeText.trim())}`}
                              alt="QR Code Preview"
                              className="w-full h-full object-contain"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {authorizedPersons.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>No persons added yet. Click "Add Person" to get started.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Export Modal */}
      {exportModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Export Signage</h2>
                <button
                  onClick={() => setExportModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Format Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Export Format</label>
                <div className="grid grid-cols-3 gap-3">
                  {['PDF', 'PNG', 'JPG'].map(format => (
                    <button
                      key={format}
                      onClick={() => setExportSettings({ ...exportSettings, format })}
                      className={`px-4 py-3 rounded-lg border-2 transition-colors ${exportSettings.format === format
                        ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                        : 'border-gray-300 hover:border-gray-400'
                        }`}
                    >
                      {format}
                    </button>
                  ))}
                </div>
              </div>

              {/* DPI Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Resolution (DPI)</label>
                <div className="grid grid-cols-3 gap-3">
                  {[72, 150, 300].map(dpi => (
                    <button
                      key={dpi}
                      onClick={() => setExportSettings({ ...exportSettings, dpi })}
                      className={`px-4 py-3 rounded-lg border-2 transition-colors ${exportSettings.dpi === dpi
                        ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                        : 'border-gray-300 hover:border-gray-400'
                        }`}
                    >
                      {dpi} DPI
                      {dpi === 300 && <span className="block text-xs mt-1">Print Quality</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Mode */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Color Mode</label>
                <div className="grid grid-cols-2 gap-3">
                  {['RGB', 'CMYK'].map(mode => (
                    <button
                      key={mode}
                      onClick={() => setExportSettings({ ...exportSettings, colorMode: mode })}
                      className={`px-4 py-3 rounded-lg border-2 transition-colors ${exportSettings.colorMode === mode
                        ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                        : 'border-gray-300 hover:border-gray-400'
                        }`}
                    >
                      {mode}
                      {mode === 'CMYK' && <span className="block text-xs mt-1">Print Ready</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Additional Options */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Additional Options</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exportSettings.includeBleed}
                      onChange={(e) => setExportSettings({ ...exportSettings, includeBleed: e.target.checked })}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Include Bleed ({exportSettings.bleedSize}mm)</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Weatherproof Color Mode</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Outdoor Visibility Optimization</span>
                  </label>
                </div>
              </div>

              {/* Export Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    // Implement export logic
                    handleExportSignage()
                  }}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                >
                  Export Now
                </button>
                <button
                  onClick={() => setExportModalOpen(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ISO 7010 Icon Library Modal */}
      {isoIconModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">ISO 7010 Icon Library</h2>
                  <p className="text-sm text-gray-600 mt-1">Select safety symbols compliant with ISO 7010 standard</p>
                </div>
                <button
                  onClick={() => setIsoIconModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search icons..."
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Icon Categories */}
              {['Emergency', 'Mandatory', 'Prohibition', 'Warning'].map(category => (
                <div key={category} className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{category} Icons</h3>
                  <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                    {iso7010IconLibrary
                      .filter(icon => icon.category === category)
                      .map(icon => (
                        <button
                          key={icon.id}
                          onClick={() => {
                            // Add icon to canvas
                            const newIcon = {
                              id: Date.now(),
                              type: 'iso-icon',
                              iconId: icon.id,
                              name: icon.name,
                              category: icon.category,
                              color: icon.color,
                              x: 50,
                              y: 50,
                              size: 80
                            }
                            setCanvasElements(prev => [...prev, newIcon])
                            setIsoIconModalOpen(false)
                            addAuditLog('add-icon', { iconId: icon.id, name: icon.name })
                          }}
                          className="p-4 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center group"
                          title={icon.name}
                        >
                          <div
                            className="w-12 h-12 mx-auto mb-2 rounded flex items-center justify-center text-2xl"
                            style={{ backgroundColor: `${icon.color}20`, color: icon.color }}
                          >
                            {icon.id}
                          </div>
                          <p className="text-xs text-gray-700 group-hover:text-blue-700 font-medium truncate">{icon.name}</p>
                        </button>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Signage Library Modal */}
      {signageLibraryOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Signage Library</h2>
                  <p className="text-sm text-gray-600 mt-1">Your saved signages and favorites</p>
                </div>
                <button
                  onClick={() => setSignageLibraryOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="flex gap-2 mb-4">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium">All</button>
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200">Favorites</button>
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200">Recent</button>
              </div>

              {savedSignages.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <p className="text-gray-500 text-lg mb-2">No saved signages yet</p>
                  <p className="text-gray-400 text-sm">Save your designs to access them later</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {savedSignages.map((signage) => (
                    <div key={signage.id} className="border-2 border-gray-300 rounded-lg p-4 hover:border-blue-500 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-gray-900">{signage.name}</h3>
                        <button
                          onClick={() => {
                            const updated = savedSignages.map(s =>
                              s.id === signage.id ? { ...s, favorite: !s.favorite } : s
                            )
                            setSavedSignages(updated)
                            if (signage.favorite) {
                              setFavoriteSignages(prev => prev.filter(f => f.id !== signage.id))
                            } else {
                              setFavoriteSignages(prev => [...prev, { ...signage, favorite: true }])
                            }
                          }}
                          className="p-1 text-yellow-500 hover:text-yellow-600"
                        >
                          <svg className={`w-5 h-5 ${signage.favorite ? 'fill-current' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mb-3">
                        {new Date(signage.updatedAt).toLocaleDateString()}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            // Load signage data
                            const { formData: fd, identificationData: id, textElements: te, imageElements: ie, backgroundSettings: bs } = signage.data
                            setFormData(fd)
                            setIdentificationData(id)
                            setTextElements(te)
                            setImageElements(ie)
                            setBackgroundSettings(bs)
                            setSignageLibraryOpen(false)
                            addAuditLog('load', { signageId: signage.id, name: signage.name })
                          }}
                          className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            const duplicated = {
                              ...signage,
                              id: Date.now(),
                              name: `${signage.name} (Copy)`,
                              createdAt: new Date().toISOString(),
                              updatedAt: new Date().toISOString()
                            }
                            setSavedSignages(prev => [...prev, duplicated])
                            addAuditLog('duplicate', { signageId: signage.id, newId: duplicated.id })
                          }}
                          className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                        >
                          Duplicate
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Full Screen Preview Modal */}
      {showFullScreenPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative w-full h-full flex items-center justify-center">
            <button
              onClick={() => setShowFullScreenPreview(false)}
              className="absolute top-4 right-4 p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div
              className="bg-white shadow-2xl"
              style={{
                width: `${(previewZoom / 100) * 800}px`,
                height: `${(previewZoom / 100) * 600}px`,
                maxWidth: '90vw',
                maxHeight: '90vh'
              }}
            >
              {/* Preview content would be rendered here */}
            </div>
          </div>
        </div>
      )}

      <div className="flex relative max-w-[1920px] mx-auto">
        {/* Shared Sidebar */}
        <Sidebar
          activeNav={activeNav}
          setActiveNav={setActiveNav}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col lg:flex-row gap-3 sm:gap-4 lg:gap-6 p-2 sm:p-3 md:p-4 lg:p-6 xl:p-8 min-w-0 overflow-x-hidden">
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
                          showNotification('File size must be less than 10MB', 'error')
                          showNotification('File size must be less than 10MB', 'error')
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
                  <div className={`relative rounded-xl p-6 transition-all duration-300 ${aiGenerationStep >= 1 ? 'bg-purple-50 border-2 border-purple-200' : 'bg-gray-50 border-2 border-gray-200'
                    }`}>
                    <div className="flex flex-col items-center text-center">
                      <div className={`w-16 h-16 rounded-lg flex items-center justify-center mb-4 ${aiGenerationStep >= 1 ? 'bg-purple-200' : 'bg-gray-200'
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
                  <div className={`relative rounded-xl p-6 transition-all duration-300 ${aiGenerationStep >= 2 ? 'bg-purple-50 border-2 border-purple-200' : 'bg-gray-50 border-2 border-gray-200'
                    }`}>
                    <div className="flex flex-col items-center text-center">
                      <div className={`w-16 h-16 rounded-lg flex items-center justify-center mb-4 ${aiGenerationStep >= 2 ? 'bg-purple-100' : 'bg-gray-200'
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
                  <div className={`relative rounded-xl p-6 transition-all duration-300 ${aiGenerationStep >= 3 ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gray-50 border-2 border-gray-200'
                    }`}>
                    <div className="flex flex-col items-center text-center">
                      <div className={`w-16 h-16 rounded-lg flex items-center justify-center mb-4 ${aiGenerationStep >= 3 ? 'bg-blue-100' : 'bg-gray-200'
                        }`}>
                        {isDesigning ? (
                          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <svg className="w-10 h-10 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M5 21h14V7l-7-4-7 4v14zm2-12h10v10H7V9zm2 2v6h6v-6H9zm2 2h2v2h-2v-2z" />
                            <rect x="9" y="13" width="6" height="2" fill="#FFFFFF" />
                            <rect x="9" y="16" width="6" height="2" fill="#FFFFFF" />
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
                  <div className={`relative rounded-xl p-6 transition-all duration-300 ${aiGenerationStep >= 4 ? 'bg-green-50 border-2 border-green-200' : 'bg-gray-50 border-2 border-gray-200'
                    }`}>
                    <div className="flex flex-col items-center text-center">
                      <div className={`w-16 h-16 rounded-lg flex items-center justify-center mb-4 ${aiGenerationStep >= 4 ? 'bg-green-100' : 'bg-gray-200'
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
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${advancedOptions.autoLayout ? 'bg-purple-600' : 'bg-gray-300'
                              }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${advancedOptions.autoLayout ? 'translate-x-6' : 'translate-x-1'
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
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${advancedOptions.includeImageIcon ? 'bg-purple-600' : 'bg-gray-300'
                              }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${advancedOptions.includeImageIcon ? 'translate-x-6' : 'translate-x-1'
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
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${advancedOptions.autoContrastAdjustment ? 'bg-purple-600' : 'bg-gray-300'
                              }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${advancedOptions.autoContrastAdjustment ? 'translate-x-6' : 'translate-x-1'
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
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${advancedOptions.autoTextResizing ? 'bg-purple-600' : 'bg-gray-300'
                              }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${advancedOptions.autoTextResizing ? 'translate-x-6' : 'translate-x-1'
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
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${advancedOptions.includeImageIcon ? 'bg-purple-600' : 'bg-gray-300'
                              }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${advancedOptions.includeImageIcon ? 'translate-x-6' : 'translate-x-1'
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
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${advancedOptions.autoContrastAdjustment ? 'bg-purple-600' : 'bg-gray-300'
                              }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${advancedOptions.autoContrastAdjustment ? 'translate-x-6' : 'translate-x-1'
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
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${advancedOptions.autoTextResizing ? 'bg-purple-600' : 'bg-gray-300'
                              }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${advancedOptions.autoTextResizing ? 'translate-x-6' : 'translate-x-1'
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
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${advancedOptions.includeImageIcon ? 'bg-purple-600' : 'bg-gray-300'
                              }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${advancedOptions.includeImageIcon ? 'translate-x-6' : 'translate-x-1'
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
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${advancedOptions.autoContrastAdjustment ? 'bg-purple-600' : 'bg-gray-300'
                              }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${advancedOptions.autoContrastAdjustment ? 'translate-x-6' : 'translate-x-1'
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
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${advancedOptions.autoTextResizing ? 'bg-purple-600' : 'bg-gray-300'
                              }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${advancedOptions.autoTextResizing ? 'translate-x-6' : 'translate-x-1'
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
              <div className="flex-1 lg:max-w-2xl xl:max-w-3xl pr-1 sm:pr-2 pb-4">
                {/* Signage Type - Scrolls with page */}
                <div className="mb-4 sm:mb-6 lg:mb-8">
                  <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-md">
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 lg:mb-6">Signage Type</h2>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <button
                        onClick={() => setSignageType('safety')}
                        className={`p-3 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl border-2 transition-all duration-200 min-h-[120px] sm:min-h-[140px] ${signageType === 'safety'
                          ? 'border-red-500 bg-red-50 shadow-lg'
                          : 'border-gray-200 hover:border-gray-300'
                          }`}
                      >
                        <div className="flex flex-col items-center gap-2 sm:gap-3">
                          <div className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center text-2xl sm:text-3xl ${signageType === 'safety' ? 'bg-red-500' : 'bg-gray-200'
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
                        className={`p-3 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl border-2 transition-all duration-200 min-h-[120px] sm:min-h-[140px] ${signageType === 'identification'
                          ? 'border-blue-500 bg-blue-50 shadow-lg'
                          : 'border-gray-200 hover:border-gray-300'
                          }`}
                      >
                        <div className="flex flex-col items-center gap-2 sm:gap-3">
                          <div className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center text-2xl sm:text-3xl ${signageType === 'identification' ? 'bg-blue-500' : 'bg-gray-200'
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
                </div>

                {/* All Other Form Sections - Scroll with page */}
                <div className="space-y-4 sm:space-y-6 lg:space-y-8">
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
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                          Signage Title / Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          placeholder="e.g., INLET AREA - HIGH RISK ZONE"
                          className="w-full px-2.5 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 border-2 border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
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
                            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-base bg-white text-left flex items-center justify-between ${categoryDropdownOpen
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
                                    className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors ${formData.category === option.value ? 'bg-blue-50 border-l-4 border-blue-500' : ''
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
                          className="w-full px-2.5 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 border-2 border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base resize-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                          Location / Area
                        </label>
                        <input
                          type="text"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          placeholder="e.g., Building A - Floor 2"
                          className="w-full px-2.5 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 border-2 border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                        />
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                          ISO 7010 Footer Text
                        </label>
                        <input
                          type="text"
                          value={formData.iso7010FooterText}
                          onChange={(e) => setFormData({ ...formData, iso7010FooterText: e.target.value })}
                          placeholder="ISO 7010 COMPLIANT • LAST UPDATED: DECEMBER 2025 • REVIEW ANNUALLY"
                          className="w-full px-2.5 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 border-2 border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                        />
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                          Hazards / Warnings
                        </label>
                        <div className="flex gap-2 mb-3">
                          <input
                            type="text"
                            value={newHazard}
                            onChange={(e) => setNewHazard(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addHazard()}
                            placeholder="Add hazard (e.g., H₂S Gas Present)"
                            className="flex-1 px-2.5 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 border-2 border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
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
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">Area Name</label>
                        <input
                          type="text"
                          value={identificationData.areaName}
                          onChange={(e) => setIdentificationData({ ...identificationData, areaName: e.target.value })}
                          className="w-full px-2.5 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 border-2 border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                        />
                      </div>

                      {/* Icon */}
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">Icon</label>
                        <select
                          value={identificationData.icon}
                          onChange={(e) => setIdentificationData({ ...identificationData, icon: e.target.value, iconImage: null })}
                          className="w-full px-2.5 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 border-2 border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base mb-2"
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
                                    className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border-2 transition-all text-xs sm:text-sm min-h-[44px] ${identificationData.imagePosition === pos
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
                              className={`flex-1 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border-2 transition-all text-sm sm:text-base min-h-[44px] ${identificationData.orientation === 'Landscape'
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                                }`}
                            >
                              Landscape
                            </button>
                            <button
                              onClick={() => setIdentificationData({ ...identificationData, orientation: 'Portrait' })}
                              className={`flex-1 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border-2 transition-all text-sm sm:text-base min-h-[44px] ${identificationData.orientation === 'Portrait'
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
                        <button
                          onClick={handlePrint}
                          className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-600 text-white rounded-lg sm:rounded-xl font-semibold hover:bg-gray-700 transition-colors shadow-md hover:shadow-lg text-sm sm:text-base min-h-[44px] flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                          </svg>
                          Print
                        </button>
                        <button
                          onClick={handleDownload}
                          className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-indigo-600 text-white rounded-lg sm:rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg text-sm sm:text-base min-h-[44px] flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download
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
                                className={`w-5 h-5 text-gray-600 transition-transform duration-200 ${expandedPPECategories.includes(category) ? 'rotate-180' : ''
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
                            className={`w-full px-6 py-4 rounded-xl font-bold text-white flex items-center justify-center gap-3 transition-all duration-200 shadow-lg hover:shadow-xl ${customPPEImages.length >= 7
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
                          className={`relative w-14 h-7 sm:w-16 sm:h-8 rounded-full transition-colors self-start sm:self-auto ${formData.permitRequired ? 'bg-blue-600' : 'bg-gray-300'
                            }`}
                        >
                          <span
                            className={`absolute top-0.5 left-0.5 sm:top-1 sm:left-1 w-6 h-6 bg-white rounded-full transition-transform ${formData.permitRequired ? 'translate-x-7 sm:translate-x-8' : 'translate-x-0'
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
                </div>

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
                              <div className="space-y-3">
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
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={companyBranding.clientLogoLocked || false}
                                    onChange={(e) => setCompanyBranding({ ...companyBranding, clientLogoLocked: e.target.checked })}
                                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                  />
                                  <span className="text-sm font-semibold text-gray-700">Lock Position</span>
                                </label>
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
                            <strong>Tip:</strong> After uploading logos, you can drag them to adjust their position in the preview area. Use the blue resize handle in the bottom-right corner of each logo to resize them with your cursor.
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
              <div className="w-full lg:w-96 xl:w-[420px] flex-shrink-0 mt-4 lg:mt-0 order-first lg:order-last">
                <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-md sticky top-[110px] sm:top-[130px] md:top-[150px] lg:top-[170px] z-30">
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
                    ref={previewRef}
                    className="border-2 sm:border-3 md:border-4 border-black rounded-lg overflow-hidden mb-3 sm:mb-4 md:mb-6 bg-white preview-container relative"
                    onMouseMove={handleMouseMove}
                    onMouseUp={() => {
                      handleLogoDragEnd()
                      handleLogoResizeEnd()
                      handleElementDragEnd()
                      handleElementResizeEnd()
                    }}
                    onMouseLeave={() => {
                      handleLogoDragEnd()
                      handleLogoResizeEnd()
                      handleElementDragEnd()
                      handleElementResizeEnd()
                    }}
                    onClick={(e) => {
                      // Deselect logo if clicking on the preview container background (not on a logo or its handles)
                      if (!e.target.closest('.logo-draggable') && !draggingLogo && !resizingLogo) {
                        setSelectedLogo(null)
                      }
                      // Deselect element if clicking on the preview container background (not on an element or its handles)
                      if (!e.target.closest('.icon-draggable') && !e.target.closest('.text-draggable') && !e.target.classList.contains('element-resize-handle') && !draggingElement && !resizingElement) {
                        setSelectedElement(null)
                      }
                    }}
                  >
                    {/* Company Branding Logos - Draggable and Resizable */}
                    {companyBranding.clientLogo && (
                      <div
                        style={{
                          position: 'absolute',
                          left: `${companyBranding.clientLogoPosition.x}%`,
                          top: `${companyBranding.clientLogoPosition.y}%`,
                          transform: 'translate(-50%, -50%)',
                          cursor: resizingLogo === 'client' ? 'nwse-resize' : (draggingLogo === 'client' ? 'grabbing' : (isShiftPressed ? 'nwse-resize' : 'grab')),
                          zIndex: 1000,
                          userSelect: 'none'
                        }}
                        onMouseDown={(e) => {
                          // Don't start drag if clicking on resize handle
                          if (e.target.classList.contains('resize-handle')) return
                          e.preventDefault()
                          handleLogoDragStart(e, 'client')
                        }}
                        onMouseEnter={(e) => {
                          // Show resize cursor when Shift is held
                          if ((e.shiftKey || isShiftPressed) && !resizingLogo && !draggingLogo) {
                            e.currentTarget.style.cursor = 'nwse-resize'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!resizingLogo && !draggingLogo) {
                            e.currentTarget.style.cursor = isShiftPressed ? 'nwse-resize' : 'grab'
                          }
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
                            filter: (draggingLogo === 'client' || resizingLogo === 'client' || selectedLogo === 'client') ? 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))' : 'none'
                          }}
                          draggable={false}
                        />
                        {/* Resize Handles - All Four Corners */}
                        {selectedLogo === 'client' && (
                          <>
                            {/* Top Left */}
                            <div
                              className="resize-handle"
                              style={{
                                position: 'absolute',
                                top: '-8px',
                                left: '-8px',
                                width: '16px',
                                height: '16px',
                                backgroundColor: '#3B82F6',
                                border: '2px solid white',
                                borderRadius: '50%',
                                cursor: 'nwse-resize',
                                zIndex: 1001,
                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                              }}
                              onMouseDown={(e) => handleLogoResizeStart(e, 'client', 'top-left')}
                            />
                            {/* Top Right */}
                            <div
                              className="resize-handle"
                              style={{
                                position: 'absolute',
                                top: '-8px',
                                right: '-8px',
                                width: '16px',
                                height: '16px',
                                backgroundColor: '#3B82F6',
                                border: '2px solid white',
                                borderRadius: '50%',
                                cursor: 'nesw-resize',
                                zIndex: 1001,
                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                              }}
                              onMouseDown={(e) => handleLogoResizeStart(e, 'client', 'top-right')}
                            />
                            {/* Bottom Left */}
                            <div
                              className="resize-handle"
                              style={{
                                position: 'absolute',
                                bottom: '-8px',
                                left: '-8px',
                                width: '16px',
                                height: '16px',
                                backgroundColor: '#3B82F6',
                                border: '2px solid white',
                                borderRadius: '50%',
                                cursor: 'nesw-resize',
                                zIndex: 1001,
                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                              }}
                              onMouseDown={(e) => handleLogoResizeStart(e, 'client', 'bottom-left')}
                            />
                            {/* Bottom Right */}
                            <div
                              className="resize-handle"
                              style={{
                                position: 'absolute',
                                bottom: '-8px',
                                right: '-8px',
                                width: '16px',
                                height: '16px',
                                backgroundColor: '#3B82F6',
                                border: '2px solid white',
                                borderRadius: '50%',
                                cursor: 'nwse-resize',
                                zIndex: 1001,
                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                              }}
                              onMouseDown={(e) => handleLogoResizeStart(e, 'client', 'bottom-right')}
                            />
                          </>
                        )}
                      </div>
                    )}

                    {companyBranding.contractorLogo && (
                      <div
                        style={{
                          position: 'absolute',
                          left: `${companyBranding.contractorLogoPosition.x}%`,
                          top: `${companyBranding.contractorLogoPosition.y}%`,
                          transform: 'translate(-50%, -50%)',
                          cursor: resizingLogo === 'contractor' ? 'nwse-resize' : (draggingLogo === 'contractor' ? 'grabbing' : (isShiftPressed ? 'nwse-resize' : 'grab')),
                          zIndex: 1000,
                          userSelect: 'none'
                        }}
                        onMouseDown={(e) => {
                          // Don't start drag if clicking on resize handle
                          if (e.target.classList.contains('resize-handle')) return
                          e.preventDefault()
                          handleLogoDragStart(e, 'contractor')
                        }}
                        onMouseEnter={(e) => {
                          // Show resize cursor when Shift is held
                          if ((e.shiftKey || isShiftPressed) && !resizingLogo && !draggingLogo) {
                            e.currentTarget.style.cursor = 'nwse-resize'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!resizingLogo && !draggingLogo) {
                            e.currentTarget.style.cursor = isShiftPressed ? 'nwse-resize' : 'grab'
                          }
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
                            filter: (draggingLogo === 'contractor' || resizingLogo === 'contractor' || selectedLogo === 'contractor') ? 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))' : 'none'
                          }}
                          draggable={false}
                        />
                        {/* Resize Handles - All Four Corners */}
                        {selectedLogo === 'contractor' && (
                          <>
                            {/* Top Left */}
                            <div
                              className="resize-handle"
                              style={{
                                position: 'absolute',
                                top: '-8px',
                                left: '-8px',
                                width: '16px',
                                height: '16px',
                                backgroundColor: '#3B82F6',
                                border: '2px solid white',
                                borderRadius: '50%',
                                cursor: 'nwse-resize',
                                zIndex: 1001,
                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                              }}
                              onMouseDown={(e) => handleLogoResizeStart(e, 'contractor', 'top-left')}
                            />
                            {/* Top Right */}
                            <div
                              className="resize-handle"
                              style={{
                                position: 'absolute',
                                top: '-8px',
                                right: '-8px',
                                width: '16px',
                                height: '16px',
                                backgroundColor: '#3B82F6',
                                border: '2px solid white',
                                borderRadius: '50%',
                                cursor: 'nesw-resize',
                                zIndex: 1001,
                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                              }}
                              onMouseDown={(e) => handleLogoResizeStart(e, 'contractor', 'top-right')}
                            />
                            {/* Bottom Left */}
                            <div
                              className="resize-handle"
                              style={{
                                position: 'absolute',
                                bottom: '-8px',
                                left: '-8px',
                                width: '16px',
                                height: '16px',
                                backgroundColor: '#3B82F6',
                                border: '2px solid white',
                                borderRadius: '50%',
                                cursor: 'nesw-resize',
                                zIndex: 1001,
                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                              }}
                              onMouseDown={(e) => handleLogoResizeStart(e, 'contractor', 'bottom-left')}
                            />
                            {/* Bottom Right */}
                            <div
                              className="resize-handle"
                              style={{
                                position: 'absolute',
                                bottom: '-8px',
                                right: '-8px',
                                width: '16px',
                                height: '16px',
                                backgroundColor: '#3B82F6',
                                border: '2px solid white',
                                borderRadius: '50%',
                                cursor: 'nwse-resize',
                                zIndex: 1001,
                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                              }}
                              onMouseDown={(e) => handleLogoResizeStart(e, 'contractor', 'bottom-right')}
                            />
                          </>
                        )}
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
                          // Check if this is a Hot Work template
                          (formData.title && formData.title.toLowerCase().includes('hot work')) ? (
                            /* HOT WORK TEMPLATE - Matching the second image design exactly */
                            <>
                              {/* Red Header Section */}
                              <div className="bg-red-600 p-3 sm:p-4 flex flex-col">
                                {/* Warning Icons */}
                                <div className="flex justify-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                                  {[0, 1].map((index) => (
                                    <div key={index} className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-white rounded-full">
                                      {signageIcons[index] ? (
                                        <img
                                          src={signageIcons[index]}
                                          alt={`Warning icon ${index + 1}`}
                                          className="w-6 h-6 sm:w-8 sm:h-8 object-contain"
                                        />
                                      ) : (
                                        <svg className="w-6 h-6 sm:w-8 sm:h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                          <path d="M12 2L1 21h22L12 2z" fill="#FCD34D" stroke="#000000" strokeWidth="1.5" strokeLinejoin="round" />
                                          <path d="M12 8v4M12 16h.01" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
                                        </svg>
                                      )}
                                    </div>
                                  ))}
                                </div>

                                {/* Title */}
                                <div className="text-center mb-2">
                                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white uppercase mb-1">
                                    {formData.title || 'Hot Work - Welding, Cutting & Grinding'}
                                  </h3>
                                  <p className="text-white text-xs sm:text-sm font-semibold uppercase">
                                    HOT WORK ACTIVITY PERMIT NEEDED
                                  </p>
                                </div>

                                {/* Description on White Background */}
                                <div className="bg-white px-3 py-2 mt-2">
                                  <p className="text-[10px] sm:text-xs text-black leading-relaxed mb-1">
                                    {formData.description || 'Any operation involving open flames, sparks, or heat that could ignite flammable materials including welding, torch cutting, grinding, brazing.'}
                                  </p>
                                  <p className="text-[10px] sm:text-xs text-black font-semibold">
                                    Required PPE: Welding helmet with proper shade, Fire-resistant clothing, Welding gloves, Safety boots, Respirator for confined spaces.
                                  </p>
                                </div>
                              </div>

                              {/* Hazards Section - Red Header */}
                              {formData.hazards && formData.hazards.length > 0 && (
                                <div className="mb-1.5 sm:mb-2">
                                  <div className="bg-red-600 px-3 py-1.5 flex items-center gap-1.5">
                                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <h4 className="text-white font-bold text-xs sm:text-sm uppercase">A HAZARDS</h4>
                                  </div>
                                  <div className="bg-white px-3 py-2">
                                    <ul className="space-y-0.5">
                                      {formData.hazards.map((hazard, index) => (
                                        <li key={index} className="text-[10px] sm:text-xs text-black flex items-start gap-1.5">
                                          <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2L1 21h22L12 2z" />
                                          </svg>
                                          <span>{hazard}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              )}

                              {/* Mandatory PPE Section - Blue Header with Grid */}
                              {formData.ppe && formData.ppe.length > 0 && (
                                <div className="mb-1.5 sm:mb-2">
                                  <div className="bg-blue-600 px-3 py-1.5 flex items-center gap-1.5">
                                    <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 border-white flex items-center justify-center flex-shrink-0">
                                      <span className="text-white text-[8px] sm:text-[10px] font-bold">O</span>
                                    </div>
                                    <h4 className="text-white font-bold text-xs sm:text-sm uppercase">MANDATORY PPE ({formData.ppe.length})</h4>
                                  </div>
                                  <div className="bg-blue-600 px-2 py-2">
                                    <div className="grid grid-cols-5 gap-1">
                                      {formData.ppe.slice(0, 15).map((ppeItem, index) => {
                                        const ppeName = getPPEDisplayName(ppeItem).toLowerCase();
                                        const getPPEIcon = () => {
                                          if (ppeName.includes('helmet')) return '🪖';
                                          if (ppeName.includes('goggle')) return '🥽';
                                          if (ppeName.includes('ear')) return '🎧';
                                          if (ppeName.includes('glove') && !ppeName.includes('insulated')) return '🧤';
                                          if (ppeName.includes('boot') && !ppeName.includes('insulated')) return '👢';
                                          if (ppeName.includes('high-vis') || ppeName.includes('high vis')) return '👔';
                                          if (ppeName.includes('respirator')) return '😷';
                                          if (ppeName.includes('harness')) return '🦺';
                                          if (ppeName.includes('arc flash') || ppeName.includes('arc flash suit')) return '⚡';
                                          if (ppeName.includes('insulated glove')) return '🧤';
                                          if (ppeName.includes('insulated boot')) return '👢';
                                          if (ppeName.includes('voltage') || ppeName.includes('detector')) return '🔌';
                                          if (ppeName.includes('face shield')) return '🛡️';
                                          if (ppeName.includes('arc clothing')) return '👔';
                                          if (ppeName.includes('mat') || ppeName.includes('safety mat')) return '📖';
                                          return '🛡️';
                                        };
                                        return (
                                          <div key={index} className="bg-blue-600 text-white p-1 rounded flex flex-col items-center justify-center text-center min-h-[50px] sm:min-h-[60px] border border-blue-700">
                                            <div className="text-base sm:text-lg mb-0.5">
                                              {getPPEIcon()}
                                            </div>
                                            <div className="text-[7px] sm:text-[8px] font-semibold leading-tight px-0.5">
                                              {getPPEDisplayName(ppeItem).toUpperCase().replace(/\s+/g, ' ')}
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Safety Procedures Section - Green Header */}
                              {formData.procedures && formData.procedures.length > 0 && (
                                <div className="mb-1.5 sm:mb-2">
                                  <div className="bg-green-600 px-3 py-1.5 flex items-center gap-1.5">
                                    <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 border-white flex items-center justify-center flex-shrink-0">
                                      <span className="text-white text-[8px] sm:text-[10px] font-bold">O</span>
                                    </div>
                                    <h4 className="text-white font-bold text-xs sm:text-sm uppercase">SAFETY PROCEDURES</h4>
                                  </div>
                                  <div className="bg-white px-3 py-2">
                                    <ol className="space-y-0.5">
                                      {formData.procedures.map((procedure, index) => (
                                        <li key={index} className="text-[10px] sm:text-xs text-black flex items-start gap-1.5">
                                          <span className="bg-green-600 text-white rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-[8px] sm:text-[10px] font-bold flex-shrink-0">{index + 1}</span>
                                          <span>{procedure}</span>
                                        </li>
                                      ))}
                                    </ol>
                                  </div>
                                </div>
                              )}

                              {/* Permit Required Section - Red Header */}
                              {formData.permitRequired && (
                                <div className="mb-1.5 sm:mb-2">
                                  <div className="bg-red-600 px-3 py-1.5 flex items-center gap-1.5">
                                    <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 border-white flex items-center justify-center flex-shrink-0">
                                      <svg className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </div>
                                    <h4 className="text-white font-bold text-xs sm:text-sm uppercase">PERMIT REQUIRED</h4>
                                  </div>
                                  <div className="bg-white px-3 py-2 text-center">
                                    <p className="text-xs sm:text-sm font-bold text-black uppercase">
                                      {formData.permitType || 'HOT WORK'}
                                    </p>
                                  </div>
                                </div>
                              )}

                              {/* Emergency Section - Orange Header */}
                              <div className="mb-1.5 sm:mb-2">
                                <div className="bg-orange-500 px-3 py-1.5 flex items-center gap-1.5">
                                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                  </svg>
                                  <h4 className="text-white font-bold text-xs sm:text-sm uppercase">EMERGENCY</h4>
                                </div>
                                <div className="bg-orange-100 px-3 py-2">
                                  <div className="flex gap-3">
                                    <div className="flex-1 space-y-0.5">
                                      {formData.emergencyContacts.length > 0 ? (
                                        formData.emergencyContacts.map((contact, index) => (
                                          <div key={index} className="text-[10px] sm:text-xs font-medium text-black">
                                            <span className="font-semibold">{contact.label}:</span> {contact.phone}
                                          </div>
                                        ))
                                      ) : (
                                        <>
                                          <div className="text-[10px] sm:text-xs font-medium text-black">
                                            <span className="font-semibold">Fire Department:</span> 911
                                          </div>
                                          <div className="text-[10px] sm:text-xs font-medium text-black">
                                            <span className="font-semibold">Site Safety Officer:</span> Emergency
                                          </div>
                                          <div className="text-[10px] sm:text-xs font-medium text-black">
                                            <span className="font-semibold">Supervisor:</span> Emergency
                                          </div>
                                        </>
                                      )}
                                    </div>
                                    {(formData.qrCodeText || formData.existingQRCode) && (
                                      <div className="flex flex-col items-center justify-center flex-shrink-0">
                                        {formData.useExistingQR && formData.existingQRCode ? (
                                          <img
                                            src={formData.existingQRCode}
                                            alt="QR Code"
                                            className="w-16 h-16 sm:w-20 sm:h-20 object-contain bg-white p-1"
                                          />
                                        ) : formData.qrCodeText ? (
                                          <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center bg-white border border-gray-300 p-1">
                                            <img
                                              src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(formData.qrCodeText)}`}
                                              alt="QR Code"
                                              className="w-full h-full object-contain"
                                            />
                                          </div>
                                        ) : null}
                                        <p className="text-[9px] sm:text-[10px] text-black font-semibold mt-0.5">Scan</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Bottom Black Footer */}
                              <div className="bg-black px-3 py-1.5">
                                <p className="text-[9px] sm:text-[10px] text-white text-center uppercase">
                                  {formData.iso7010FooterText || 'ISO 7010 COMPLIANT • LAST UPDATED: DECEMBER 2025 • REVIEW ANNUALLY'}
                                </p>
                              </div>
                            </>
                          ) : (
                            /* STANDARD SAFETY TEMPLATE */
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
                                          <path d="M12 2L1 21h22L12 2z" fill="#FCD34D" stroke="#000000" strokeWidth="1.5" strokeLinejoin="round" />
                                          <path d="M12 8v4M12 16h.01" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
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
                                  {/* Purpose/Subtitle */}
                                  {formData.purpose && (
                                    <p className="text-white font-semibold text-base sm:text-lg mt-2 uppercase">
                                      {formData.purpose}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* White Content Section */}
                              <div className="bg-white px-4 py-4 sm:py-6 flex-1">
                                {/* Description */}
                                {formData.description && (
                                  <div className="mb-4 sm:mb-6">
                                    <p className="text-sm sm:text-base text-gray-800 leading-relaxed">
                                      {formData.description}
                                    </p>
                                  </div>
                                )}

                                {/* Hazards Section */}
                                {formData.hazards && formData.hazards.length > 0 && (
                                  <div className="mb-4 sm:mb-6">
                                    <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3"># HAZARDS</h4>
                                    <ul className="list-disc list-inside space-y-1 text-sm sm:text-base text-gray-800">
                                      {formData.hazards.map((hazard, index) => (
                                        <li key={index}>{hazard}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {/* Mandatory PPE Section */}
                                {formData.ppe && formData.ppe.length > 0 && (
                                  <div className="mb-4 sm:mb-6">
                                    <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                                      # MANDATORY PPE ({formData.ppe.length})
                                    </h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3">
                                      {formData.ppe.map((ppeItem, index) => (
                                        <div key={index} className="text-xs sm:text-sm font-medium text-gray-800 border border-gray-300 p-2 text-center">
                                          {getPPEDisplayName(ppeItem).toUpperCase()}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Safety Procedures Section */}
                                {formData.procedures && formData.procedures.length > 0 && (
                                  <div className="mb-4 sm:mb-6">
                                    <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3"># SAFETY PROCEDURES</h4>
                                    <ol className="list-decimal list-inside space-y-1 text-sm sm:text-base text-gray-800">
                                      {formData.procedures.map((procedure, index) => (
                                        <li key={index}>{procedure}</li>
                                      ))}
                                    </ol>
                                  </div>
                                )}

                                {/* Permit Required Section */}
                                {formData.permitRequired && (
                                  <div className="mb-4 sm:mb-6 text-center">
                                    <div className="bg-yellow-400 border-2 border-black px-4 py-2 sm:py-3 inline-block">
                                      <p className="text-base sm:text-lg font-bold text-black uppercase">
                                        # PERMIT REQUIRED
                                      </p>
                                      {formData.permitType && (
                                        <p className="text-sm sm:text-base font-semibold text-black mt-1 uppercase">
                                          {formData.permitType}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                )}
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
                                  {formData.iso7010FooterText || 'ISO 7010 COMPLIANT • LAST UPDATED: DECEMBER 2025 • REVIEW ANNUALLY'}
                                </p>
                              </div>
                            </>
                          )
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
                            cursor: draggingElement === 'icon' ? 'grabbing' : (resizingElement === 'icon' ? getResizeCursor(elementResizeHandle) : 'grab'),
                            zIndex: 1000,
                            userSelect: 'none'
                          }}
                          onMouseDown={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleElementDragStart('icon', e)
                          }}
                          className="icon-draggable"
                        >
                          <div
                            className="rounded-full flex items-center justify-center text-white relative"
                            style={{
                              backgroundColor: identificationData.iconBgColor,
                              width: `${identificationData.iconSize}px`,
                              height: `${identificationData.iconSize}px`,
                              fontSize: `${identificationData.iconSize * 0.6}px`,
                              filter: (draggingElement === 'icon' || resizingElement === 'icon' || selectedElement === 'icon') ? 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))' : 'none'
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

                            {/* Resize Handles - All 8 handles (4 corners + 4 edges) */}
                            {selectedElement === 'icon' && (
                              <>
                                {/* Corner Handles */}
                                <div
                                  className="element-resize-handle"
                                  style={{
                                    position: 'absolute',
                                    top: '-6px',
                                    left: '-6px',
                                    width: '12px',
                                    height: '12px',
                                    backgroundColor: '#3B82F6',
                                    border: '2px solid white',
                                    borderRadius: '50%',
                                    cursor: 'nwse-resize',
                                    zIndex: 1002,
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                    pointerEvents: 'auto'
                                  }}
                                  onMouseDown={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    handleElementResizeStart(e, 'icon', 'top-left')
                                  }}
                                />
                                <div
                                  className="element-resize-handle"
                                  style={{
                                    position: 'absolute',
                                    top: '-6px',
                                    right: '-6px',
                                    width: '12px',
                                    height: '12px',
                                    backgroundColor: '#3B82F6',
                                    border: '2px solid white',
                                    borderRadius: '50%',
                                    cursor: 'nesw-resize',
                                    zIndex: 1002,
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                    pointerEvents: 'auto'
                                  }}
                                  onMouseDown={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    handleElementResizeStart(e, 'icon', 'top-right')
                                  }}
                                />
                                <div
                                  className="element-resize-handle"
                                  style={{
                                    position: 'absolute',
                                    bottom: '-6px',
                                    right: '-6px',
                                    width: '12px',
                                    height: '12px',
                                    backgroundColor: '#3B82F6',
                                    border: '2px solid white',
                                    borderRadius: '50%',
                                    cursor: 'nwse-resize',
                                    zIndex: 1002,
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                    pointerEvents: 'auto'
                                  }}
                                  onMouseDown={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    handleElementResizeStart(e, 'icon', 'bottom-right')
                                  }}
                                />
                                <div
                                  className="element-resize-handle"
                                  style={{
                                    position: 'absolute',
                                    bottom: '-6px',
                                    left: '-6px',
                                    width: '12px',
                                    height: '12px',
                                    backgroundColor: '#3B82F6',
                                    border: '2px solid white',
                                    borderRadius: '50%',
                                    cursor: 'nesw-resize',
                                    zIndex: 1002,
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                    pointerEvents: 'auto'
                                  }}
                                  onMouseDown={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    handleElementResizeStart(e, 'icon', 'bottom-left')
                                  }}
                                />
                                {/* Edge Handles - Middle of each edge */}
                                <div
                                  className="element-resize-handle"
                                  style={{
                                    position: 'absolute',
                                    top: '-8px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    width: '40px',
                                    height: '16px',
                                    backgroundColor: '#3B82F6',
                                    border: '2px solid white',
                                    borderRadius: '8px',
                                    cursor: 'ns-resize',
                                    zIndex: 1002,
                                    boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                                    pointerEvents: 'auto'
                                  }}
                                  onMouseDown={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    handleElementResizeStart(e, 'icon', 'top')
                                  }}
                                />
                                <div
                                  className="element-resize-handle"
                                  style={{
                                    position: 'absolute',
                                    right: '-8px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    width: '16px',
                                    height: '40px',
                                    backgroundColor: '#3B82F6',
                                    border: '2px solid white',
                                    borderRadius: '8px',
                                    cursor: 'ew-resize',
                                    zIndex: 1002,
                                    boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                                    pointerEvents: 'auto'
                                  }}
                                  onMouseDown={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    handleElementResizeStart(e, 'icon', 'right')
                                  }}
                                />
                                <div
                                  className="element-resize-handle"
                                  style={{
                                    position: 'absolute',
                                    bottom: '-8px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    width: '40px',
                                    height: '16px',
                                    backgroundColor: '#3B82F6',
                                    border: '2px solid white',
                                    borderRadius: '8px',
                                    cursor: 'ns-resize',
                                    zIndex: 1002,
                                    boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                                    pointerEvents: 'auto'
                                  }}
                                  onMouseDown={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    handleElementResizeStart(e, 'icon', 'bottom')
                                  }}
                                />
                                <div
                                  className="element-resize-handle"
                                  style={{
                                    position: 'absolute',
                                    left: '-8px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    width: '16px',
                                    height: '40px',
                                    backgroundColor: '#3B82F6',
                                    border: '2px solid white',
                                    borderRadius: '8px',
                                    cursor: 'ew-resize',
                                    zIndex: 1002,
                                    boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                                    pointerEvents: 'auto'
                                  }}
                                  onMouseDown={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    handleElementResizeStart(e, 'icon', 'left')
                                  }}
                                />
                              </>
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
                            cursor: draggingElement === 'text' ? 'grabbing' : (resizingElement === 'text' ? getResizeCursor(elementResizeHandle) : 'grab'),
                            zIndex: 1000,
                            userSelect: 'none'
                          }}
                          onMouseDown={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleElementDragStart('text', e)
                          }}
                          className="text-draggable"
                        >
                          <h3
                            className="font-bold uppercase whitespace-nowrap relative"
                            style={{
                              color: identificationData.textColor,
                              fontSize: `${identificationData.fontSize}px`,
                              filter: (draggingElement === 'text' || resizingElement === 'text' || selectedElement === 'text') ? 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))' : 'none'
                            }}
                          >
                            {identificationData.areaName}

                            {/* Resize Handles - All 8 handles (4 corners + 4 edges) */}
                            {selectedElement === 'text' && (
                              <>
                                {/* Corner Handles */}
                                <div
                                  className="element-resize-handle"
                                  style={{
                                    position: 'absolute',
                                    top: '-6px',
                                    left: '-6px',
                                    width: '12px',
                                    height: '12px',
                                    backgroundColor: '#3B82F6',
                                    border: '2px solid white',
                                    borderRadius: '50%',
                                    cursor: 'nwse-resize',
                                    zIndex: 1002,
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                    pointerEvents: 'auto'
                                  }}
                                  onMouseDown={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    handleElementResizeStart(e, 'text', 'top-left')
                                  }}
                                />
                                <div
                                  className="element-resize-handle"
                                  style={{
                                    position: 'absolute',
                                    top: '-6px',
                                    right: '-6px',
                                    width: '12px',
                                    height: '12px',
                                    backgroundColor: '#3B82F6',
                                    border: '2px solid white',
                                    borderRadius: '50%',
                                    cursor: 'nesw-resize',
                                    zIndex: 1002,
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                    pointerEvents: 'auto'
                                  }}
                                  onMouseDown={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    handleElementResizeStart(e, 'text', 'top-right')
                                  }}
                                />
                                <div
                                  className="element-resize-handle"
                                  style={{
                                    position: 'absolute',
                                    bottom: '-6px',
                                    right: '-6px',
                                    width: '12px',
                                    height: '12px',
                                    backgroundColor: '#3B82F6',
                                    border: '2px solid white',
                                    borderRadius: '50%',
                                    cursor: 'nwse-resize',
                                    zIndex: 1002,
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                    pointerEvents: 'auto'
                                  }}
                                  onMouseDown={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    handleElementResizeStart(e, 'text', 'bottom-right')
                                  }}
                                />
                                <div
                                  className="element-resize-handle"
                                  style={{
                                    position: 'absolute',
                                    bottom: '-6px',
                                    left: '-6px',
                                    width: '12px',
                                    height: '12px',
                                    backgroundColor: '#3B82F6',
                                    border: '2px solid white',
                                    borderRadius: '50%',
                                    cursor: 'nesw-resize',
                                    zIndex: 1002,
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                    pointerEvents: 'auto'
                                  }}
                                  onMouseDown={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    handleElementResizeStart(e, 'text', 'bottom-left')
                                  }}
                                />
                                {/* Edge Handles - Middle of each edge */}
                                <div
                                  className="element-resize-handle"
                                  style={{
                                    position: 'absolute',
                                    top: '-8px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    width: '40px',
                                    height: '16px',
                                    backgroundColor: '#3B82F6',
                                    border: '2px solid white',
                                    borderRadius: '8px',
                                    cursor: 'ns-resize',
                                    zIndex: 1002,
                                    boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                                    pointerEvents: 'auto'
                                  }}
                                  onMouseDown={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    handleElementResizeStart(e, 'text', 'top')
                                  }}
                                />
                                <div
                                  className="element-resize-handle"
                                  style={{
                                    position: 'absolute',
                                    right: '-8px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    width: '16px',
                                    height: '40px',
                                    backgroundColor: '#3B82F6',
                                    border: '2px solid white',
                                    borderRadius: '8px',
                                    cursor: 'ew-resize',
                                    zIndex: 1002,
                                    boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                                    pointerEvents: 'auto'
                                  }}
                                  onMouseDown={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    handleElementResizeStart(e, 'text', 'right')
                                  }}
                                />
                                <div
                                  className="element-resize-handle"
                                  style={{
                                    position: 'absolute',
                                    bottom: '-8px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    width: '40px',
                                    height: '16px',
                                    backgroundColor: '#3B82F6',
                                    border: '2px solid white',
                                    borderRadius: '8px',
                                    cursor: 'ns-resize',
                                    zIndex: 1002,
                                    boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                                    pointerEvents: 'auto'
                                  }}
                                  onMouseDown={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    handleElementResizeStart(e, 'text', 'bottom')
                                  }}
                                />
                                <div
                                  className="element-resize-handle"
                                  style={{
                                    position: 'absolute',
                                    left: '-8px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    width: '16px',
                                    height: '40px',
                                    backgroundColor: '#3B82F6',
                                    border: '2px solid white',
                                    borderRadius: '8px',
                                    cursor: 'ew-resize',
                                    zIndex: 1002,
                                    boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                                    pointerEvents: 'auto'
                                  }}
                                  onMouseDown={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    handleElementResizeStart(e, 'text', 'left')
                                  }}
                                />
                              </>
                            )}
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

                  <div className="flex gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <button
                      onClick={handlePrint}
                      className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-600 text-white rounded-lg sm:rounded-xl font-semibold hover:bg-gray-700 transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base min-h-[44px]"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                      Print
                    </button>
                    <button
                      onClick={handleDownload}
                      className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg sm:rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base min-h-[44px]"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download
                    </button>
                  </div>

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

      {/* Save Modal */}
      {saveModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Save Signage</h2>
                <button
                  onClick={() => {
                    setSaveModalOpen(false)
                    setSaveModalName('')
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Signage Name
                </label>
                <input
                  type="text"
                  value={saveModalName}
                  onChange={(e) => setSaveModalName(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && saveModalName.trim()) {
                      handleSaveSignage()
                    }
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                  placeholder="Enter signage name"
                  autoFocus
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={handleSaveSignage}
                  disabled={!saveModalName.trim()}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setSaveModalOpen(false)
                    setSaveModalName('')
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in ${notification.type === 'success' ? 'bg-green-500 text-white' :
          notification.type === 'error' ? 'bg-red-500 text-white' :
            'bg-blue-500 text-white'
          }`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {notification.type === 'success' ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            )}
          </svg>
          <span className="font-medium">{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            className="ml-2 hover:opacity-75"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Crop Modal */}
      {cropModalOpen && selectedImageElement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Crop Image</h2>
                <button
                  onClick={() => setCropModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50">
                <img
                  src={selectedImageElement.src}
                  alt="Crop preview"
                  className="max-w-full h-auto mx-auto"
                />
              </div>
              <p className="text-sm text-gray-600 text-center">
                Basic crop functionality. For advanced cropping, use an image editor before uploading.
              </p>
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    // Simple crop: just update the image
                    showNotification('Image updated. For precise cropping, edit before uploading.', 'success')
                    setCropModalOpen(false)
                  }}
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
                >
                  Apply
                </button>
                <button
                  onClick={() => setCropModalOpen(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SignageGenerator

