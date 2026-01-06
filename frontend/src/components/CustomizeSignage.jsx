import { useState, useRef, useEffect, useCallback } from 'react'
import Sidebar from './Sidebar'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

const CustomizeSignage = ({ activeNav, setActiveNav, sidebarOpen, setSidebarOpen }) => {
  // ========== CORE STATE ==========
  const [backgroundImage, setBackgroundImage] = useState(null)
  const [elements, setElements] = useState([])
  const [selectedElement, setSelectedElement] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [isRotating, setIsRotating] = useState(false)
  const [resizeStartData, setResizeStartData] = useState({ size: 0, width: 0, height: 0, x: 0, y: 0, angle: 0 })
  const [resizeCorner, setResizeCorner] = useState(null)
  const [rotationStartData, setRotationStartData] = useState({ angle: 0, centerX: 0, centerY: 0 })
  
  // ========== DESIGN MODE ==========
  const [designMode, setDesignMode] = useState('free') // 'template' or 'free'
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  
  // ========== UNDO/REDO ==========
  const [history, setHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const maxHistorySize = 50
  
  // ========== PREVIEW & ZOOM ==========
  const [previewZoom, setPreviewZoom] = useState(100)
  const [showFullScreenPreview, setShowFullScreenPreview] = useState(false)
  const [showPrintPreview, setShowPrintPreview] = useState(false)
  
  // ========== GRID & SNAP ==========
  const [showGrid, setShowGrid] = useState(false)
  const [snapToGrid, setSnapToGrid] = useState(true)
  const [gridSize, setGridSize] = useState(10)
  
  // ========== SIGN SIZE & LAYOUT ==========
  const [signSize, setSignSize] = useState('A4')
  const [orientation, setOrientation] = useState('Portrait')
  const [customSize, setCustomSize] = useState({ width: 210, height: 297, unit: 'mm' })
  const [margins, setMargins] = useState({ top: 10, right: 10, bottom: 10, left: 10, unit: 'mm' })
  const [bleedSize, setBleedSize] = useState(3) // mm
  
  // ========== BACKGROUND & COLOR ==========
  const [backgroundSettings, setBackgroundSettings] = useState({
    type: 'solid', // 'solid', 'gradient', 'image'
    color: '#FFFFFF',
    gradient: { type: 'linear', angle: 0, colors: ['#FFFFFF', '#E5E7EB'], stops: [0, 100] },
    opacity: 100,
    highContrast: false
  })
  
  // ========== ISO 7010 & SAFETY ==========
  const [safetyCategory, setSafetyCategory] = useState('Mandatory')
  const [colorCompliance, setColorCompliance] = useState({ enabled: true, warnings: [] })
  const [showIsoLibrary, setShowIsoLibrary] = useState(false)
  
  // ========== BRANDING ==========
  const [companyBranding, setCompanyBranding] = useState({
    clientLogo: null,
    contractorLogo: null,
    clientLogoPosition: { x: 10, y: 10 },
    contractorLogoPosition: { x: 90, y: 10 },
    clientLogoSize: 80,
    contractorLogoSize: 80,
    clientLogoLocked: false,
    contractorLogoLocked: false,
    brandColors: []
  })
  
  // ========== AUTHORIZED PERSONS ==========
  const [authorizedPersonsMode, setAuthorizedPersonsMode] = useState(false)
  const [authorizedPersons, setAuthorizedPersons] = useState([])
  const [authorizedPersonsLayout, setAuthorizedPersonsLayout] = useState({
    gridColumns: 2,
    gridRows: 3,
    personsPerPage: 6,
    style: 'badge', // 'badge' or 'poster'
    showQR: true,
    frameStyle: 'rounded'
  })
  
  // ========== EXPORT SETTINGS ==========
  const [exportSettings, setExportSettings] = useState({
    format: 'PDF', // 'PDF', 'PNG', 'JPG'
    dpi: 300, // 72, 150, 300
    colorMode: 'RGB', // 'RGB', 'CMYK'
    includeBleed: true,
    watermark: false,
    weatherproof: false
  })
  
  // ========== IMAGE EDITING ==========
  const [imageEditing, setImageEditing] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    cropMode: false,
    cropArea: null,
    removeBackground: false
  })
  
  // ========== REFS ==========
  const fileInputRef = useRef(null)
  const iconInputRef = useRef(null)
  const imageInputRef = useRef(null)
  const canvasRef = useRef(null)
  const exportCanvasRef = useRef(null)
  
  // ========== CONSTANTS ==========
  const signSizes = {
    'A3': { width: 297, height: 420, portrait: { width: 297, height: 420 }, landscape: { width: 420, height: 297 } },
    'A4': { width: 210, height: 297, portrait: { width: 210, height: 297 }, landscape: { width: 297, height: 210 } },
    'A5': { width: 148, height: 210, portrait: { width: 148, height: 210 }, landscape: { width: 210, height: 148 } },
    'Custom': { width: customSize.width, height: customSize.height, portrait: { width: customSize.width, height: customSize.height }, landscape: { width: customSize.height, height: customSize.width } }
  }
  
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
  
  const iso7010IconLibrary = [
    { id: 'E001', name: 'Emergency Exit', category: 'Emergency', color: '#10B981', emoji: '🚪' },
    { id: 'E002', name: 'Emergency Exit (Left)', category: 'Emergency', color: '#10B981', emoji: '⬅️' },
    { id: 'E003', name: 'Emergency Exit (Right)', category: 'Emergency', color: '#10B981', emoji: '➡️' },
    { id: 'E004', name: 'First Aid', category: 'Emergency', color: '#10B981', emoji: '➕' },
    { id: 'E005', name: 'Emergency Telephone', category: 'Emergency', color: '#10B981', emoji: '📞' },
    { id: 'M001', name: 'Wear Eye Protection', category: 'Mandatory', color: '#0052CC', emoji: '👓' },
    { id: 'M002', name: 'Wear Hearing Protection', category: 'Mandatory', color: '#0052CC', emoji: '🎧' },
    { id: 'M003', name: 'Wear Respiratory Protection', category: 'Mandatory', color: '#0052CC', emoji: '😷' },
    { id: 'M004', name: 'Wear Safety Helmet', category: 'Mandatory', color: '#0052CC', emoji: '⛑️' },
    { id: 'M005', name: 'Wear Safety Footwear', category: 'Mandatory', color: '#0052CC', emoji: '👢' },
    { id: 'M006', name: 'Wear Protective Gloves', category: 'Mandatory', color: '#0052CC', emoji: '🧤' },
    { id: 'M007', name: 'Wear Protective Clothing', category: 'Mandatory', color: '#0052CC', emoji: '👔' },
    { id: 'P001', name: 'No Smoking', category: 'Prohibition', color: '#DC2626', emoji: '🚭' },
    { id: 'P002', name: 'No Open Flames', category: 'Prohibition', color: '#DC2626', emoji: '🔥' },
    { id: 'P003', name: 'No Entry', category: 'Prohibition', color: '#DC2626', emoji: '🚫' },
    { id: 'P004', name: 'No Unauthorized Access', category: 'Prohibition', color: '#DC2626', emoji: '🔒' },
    { id: 'W001', name: 'General Warning', category: 'Warning', color: '#F59E0B', emoji: '⚠️' },
    { id: 'W002', name: 'Electrical Hazard', category: 'Warning', color: '#F59E0B', emoji: '⚡' },
    { id: 'W003', name: 'Flammable Material', category: 'Warning', color: '#F59E0B', emoji: '🔥' },
    { id: 'W004', name: 'Toxic Material', category: 'Warning', color: '#F59E0B', emoji: '☠️' },
    { id: 'W005', name: 'Corrosive Material', category: 'Warning', color: '#F59E0B', emoji: '🧪' },
    { id: 'W006', name: 'Explosive Material', category: 'Warning', color: '#F59E0B', emoji: '💣' },
    { id: 'W007', name: 'Radiation Hazard', category: 'Warning', color: '#F59E0B', emoji: '☢️' },
    { id: 'W008', name: 'Biological Hazard', category: 'Warning', color: '#F59E0B', emoji: '🦠' },
    { id: 'W009', name: 'Laser Hazard', category: 'Warning', color: '#F59E0B', emoji: '🔴' },
    { id: 'W010', name: 'Magnetic Field', category: 'Warning', color: '#F59E0B', emoji: '🧲' }
  ]
  
  // ========== HELPER FUNCTIONS ==========
  const saveToHistory = useCallback(() => {
    const currentState = {
      elements: JSON.parse(JSON.stringify(elements)),
      backgroundImage,
      backgroundSettings: JSON.parse(JSON.stringify(backgroundSettings)),
      companyBranding: JSON.parse(JSON.stringify(companyBranding))
    }
    
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(currentState)
    
    if (newHistory.length > maxHistorySize) {
      newHistory.shift()
    } else {
      setHistoryIndex(newHistory.length - 1)
    }
    
    setHistory(newHistory)
  }, [elements, backgroundImage, backgroundSettings, companyBranding, history, historyIndex])
  
  const undo = () => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1]
      setElements(prevState.elements)
      setBackgroundImage(prevState.backgroundImage)
      setBackgroundSettings(prevState.backgroundSettings)
      setCompanyBranding(prevState.companyBranding)
      setHistoryIndex(historyIndex - 1)
    }
  }
  
  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1]
      setElements(nextState.elements)
      setBackgroundImage(nextState.backgroundImage)
      setBackgroundSettings(nextState.backgroundSettings)
      setCompanyBranding(nextState.companyBranding)
      setHistoryIndex(historyIndex + 1)
    }
  }
  
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
  
  const snapToGridValue = (value) => {
    if (!snapToGrid) return value
    return Math.round(value / gridSize) * gridSize
  }
  
  // ========== ELEMENT MANAGEMENT ==========
  const addElement = (element) => {
    const newElements = [...elements, element]
    setElements(newElements)
    setSelectedElement(element.id)
    saveToHistory()
  }
  
  const updateElement = (id, updates) => {
    setElements(elements.map(el =>
      el.id === id ? { ...el, ...updates } : el
    ))
  }
  
  const deleteElement = (id) => {
    setElements(elements.filter(el => el.id !== id))
    if (selectedElement === id) {
      setSelectedElement(null)
    }
    saveToHistory()
  }
  
  const duplicateElement = (id) => {
    const element = elements.find(el => el.id === id)
    if (element) {
      const newElement = {
        ...element,
        id: Date.now(),
        x: element.x + 5,
        y: element.y + 5
      }
      addElement(newElement)
    }
  }
  
  // ========== TEXT ELEMENT ==========
  const addTextElement = () => {
    const newElement = {
      type: 'text',
      content: 'Your Text Here',
      x: 50,
      y: 50,
      fontSize: 24,
      fontWeight: 'normal',
      color: '#000000',
      fontFamily: 'Arial',
      textAlign: 'center',
      lineHeight: 1.2,
      letterSpacing: 0,
      width: 200,
      height: 50,
      rotation: 0,
      opacity: 100,
      zIndex: elements.length,
      locked: false,
      autoFit: false,
      language: 'en',
      id: Date.now()
    }
    addElement(newElement)
  }
  
  // ========== IMAGE/ICON ELEMENT ==========
  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const img = new Image()
        img.onload = () => {
          const maxSize = 500
          let width = img.width
          let height = img.height
          
          if (width > maxSize || height > maxSize) {
            const scale = Math.min(maxSize / width, maxSize / height)
            width = width * scale
            height = height * scale
          }
          
          if (width < 20) {
            const scale = 20 / width
            width = 20
            height = height * scale
          }
          if (height < 20) {
            const scale = 20 / height
            height = 20
            width = width * scale
          }
          
          addElement({
            type: 'image',
            content: reader.result,
            x: 50,
            y: 50,
            width: Math.round(width),
            height: Math.round(height),
            size: Math.max(Math.round(width), Math.round(height)),
            rotation: 0,
            opacity: 100,
            brightness: 100,
            contrast: 100,
            saturation: 100,
            zIndex: elements.length,
            locked: false,
            shadow: { enabled: false, x: 0, y: 0, blur: 0, color: '#000000' },
            outline: { enabled: false, width: 0, color: '#000000' },
            id: Date.now()
          })
        }
        img.src = reader.result
      }
      reader.readAsDataURL(file)
    }
  }
  
  const addIsoIcon = (icon) => {
    addElement({
      type: 'iso-icon',
      iconId: icon.id,
      iconName: icon.name,
      category: icon.category,
      emoji: icon.emoji,
      x: 50,
      y: 50,
      width: 80,
      height: 80,
      size: 80,
      rotation: 0,
      opacity: 100,
      zIndex: elements.length,
      locked: false,
      id: Date.now()
    })
    setShowIsoLibrary(false)
  }
  
  // ========== MOUSE HANDLERS ==========
  const handleElementClick = (e, element) => {
    e.stopPropagation()
    if (!element.locked) {
      setSelectedElement(element.id)
    }
  }
  
  const handleMouseDown = (e, element) => {
    if (element.locked) return
    e.stopPropagation()
    setSelectedElement(element.id)
    setIsDragging(true)
  }
  
  const handleMouseMove = (e) => {
    if (isRotating && selectedElement) {
      const selectedEl = elements.find(el => el.id === selectedElement)
      if (!selectedEl) return
      
      const canvas = e.currentTarget.closest('.canvas-container')
      if (!canvas) return
      
      const rect = canvas.getBoundingClientRect()
      const centerX = rect.left + (rect.width * selectedEl.x / 100)
      const centerY = rect.top + (rect.height * selectedEl.y / 100)
      
      const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI)
      const deltaAngle = angle - rotationStartData.angle
      
      updateElement(selectedElement, {
        rotation: (selectedEl.rotation || 0) + deltaAngle
      })
      
      setRotationStartData({ ...rotationStartData, angle })
      return
    }
    
    if (isResizing && selectedElement) {
      const deltaX = e.clientX - resizeStartData.x
      const deltaY = e.clientY - resizeStartData.y
      const selectedEl = elements.find(el => el.id === selectedElement)
      if (!selectedEl) return
      
      const handle = resizeCorner
      const isCorner = ['top-left', 'top-right', 'bottom-left', 'bottom-right'].includes(handle)
      const isEdge = ['top', 'bottom', 'left', 'right'].includes(handle)
      
      if (selectedEl.type === 'text') {
        let newWidth = resizeStartData.width || 200
        let newHeight = resizeStartData.height || 50
        let newFontSize = selectedEl.fontSize || 24
        
        if (isCorner) {
          const aspectRatio = (resizeStartData.width || 200) / (resizeStartData.height || 50)
          let delta = 0
          
          if (handle === 'top-left') {
            delta = Math.abs(deltaX) > Math.abs(deltaY) ? -deltaX : -deltaY
          } else if (handle === 'top-right') {
            delta = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : -deltaY
          } else if (handle === 'bottom-left') {
            delta = Math.abs(deltaX) > Math.abs(deltaY) ? -deltaX : deltaY
          } else {
            delta = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY
          }
          
          const currentSize = Math.max(resizeStartData.width || 200, resizeStartData.height || 50)
          const newSize = Math.max(50, Math.min(1000, currentSize + delta))
          
          if (aspectRatio >= 1) {
            newWidth = newSize
            newHeight = newSize / aspectRatio
          } else {
            newHeight = newSize
            newWidth = newSize * aspectRatio
          }
          
          const sizeRatio = newSize / currentSize
          newFontSize = Math.max(12, Math.min(200, (resizeStartData.size || 24) * sizeRatio))
        } else if (isEdge) {
          if (handle === 'top' || handle === 'bottom') {
            const delta = handle === 'top' ? -deltaY : deltaY
            // Apply a scaling factor to make height changes more gradual (0.5 = half the mouse movement)
            const scaledDelta = delta * 0.5
            newHeight = Math.max(30, Math.min(500, (resizeStartData.height || 50) + scaledDelta))
            newWidth = resizeStartData.width || 200
            // Use a more gradual font size scaling (0.4 = 40% of height ratio for more normal scaling)
            const heightRatio = newHeight / (resizeStartData.height || 50)
            const fontSizeRatio = 1 + (heightRatio - 1) * 0.4
            newFontSize = Math.max(12, Math.min(200, (resizeStartData.size || 24) * fontSizeRatio))
          } else if (handle === 'left' || handle === 'right') {
            const delta = handle === 'left' ? -deltaX : deltaX
            newWidth = Math.max(50, Math.min(1000, (resizeStartData.width || 200) + delta))
            newHeight = resizeStartData.height || 50
          }
        }
        
        updateElement(selectedElement, {
          width: snapToGridValue(Math.round(newWidth)),
          height: snapToGridValue(Math.round(newHeight)),
          fontSize: Math.round(newFontSize)
        })
      } else if (selectedEl.type === 'image' || selectedEl.type === 'iso-icon' || selectedEl.type === 'emoji') {
        let newWidth = resizeStartData.width || resizeStartData.size || 80
        let newHeight = resizeStartData.height || resizeStartData.size || 80
        let newX = resizeStartData.elementX || selectedEl.x || 50
        let newY = resizeStartData.elementY || selectedEl.y || 50
        
        const canvas = e.currentTarget.closest('.canvas-container')
        const rect = canvas ? canvas.getBoundingClientRect() : null
        const canvasWidth = rect ? rect.width : (resizeStartData.canvasWidth || 800)
        const canvasHeight = rect ? rect.height : (resizeStartData.canvasHeight || 600)
        
        if (isCorner) {
          const aspectRatio = (resizeStartData.width || resizeStartData.size || 80) / (resizeStartData.height || resizeStartData.size || 80)
          let delta = 0
          
          if (handle === 'top-left') {
            delta = Math.abs(deltaX) > Math.abs(deltaY) ? -deltaX : -deltaY
            // Adjust position for top-left corner
            const widthDelta = Math.abs(deltaX) > Math.abs(deltaY) ? -deltaX : (-deltaY * aspectRatio)
            const heightDelta = Math.abs(deltaX) > Math.abs(deltaY) ? (-deltaX / aspectRatio) : -deltaY
            newX = resizeStartData.elementX + (widthDelta / canvasWidth) * 100
            newY = resizeStartData.elementY + (heightDelta / canvasHeight) * 100
          } else if (handle === 'top-right') {
            delta = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : -deltaY
            const heightDelta = Math.abs(deltaX) > Math.abs(deltaY) ? (deltaX / aspectRatio) : -deltaY
            newY = resizeStartData.elementY + (heightDelta / canvasHeight) * 100
          } else if (handle === 'bottom-left') {
            delta = Math.abs(deltaX) > Math.abs(deltaY) ? -deltaX : deltaY
            const widthDelta = Math.abs(deltaX) > Math.abs(deltaY) ? -deltaX : (deltaY * aspectRatio)
            newX = resizeStartData.elementX + (widthDelta / canvasWidth) * 100
          } else {
            delta = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY
            // bottom-right: no position adjustment needed
          }
          
          const currentSize = Math.max(resizeStartData.width || resizeStartData.size || 80, resizeStartData.height || resizeStartData.size || 80)
          const newSize = Math.max(20, Math.min(500, currentSize + delta))
          
          if (aspectRatio >= 1) {
            newWidth = newSize
            newHeight = newSize / aspectRatio
          } else {
            newHeight = newSize
            newWidth = newSize * aspectRatio
          }
        } else if (isEdge) {
          if (handle === 'top' || handle === 'bottom') {
            const delta = handle === 'top' ? -deltaY : deltaY
            const oldHeight = resizeStartData.height || resizeStartData.size || 80
            newHeight = Math.max(20, Math.min(500, oldHeight + delta))
            newWidth = resizeStartData.width || resizeStartData.size || 80
            // Adjust Y position when resizing from top (element is centered, so move by half the height change)
            if (handle === 'top' && canvasHeight > 0) {
              const heightChange = newHeight - oldHeight
              // When resizing from top: taller = center moves up (negative), shorter = center moves down (positive)
              newY = resizeStartData.elementY - (heightChange / 2 / canvasHeight) * 100
            }
          } else if (handle === 'left' || handle === 'right') {
            // Calculate delta based on handle direction
            const delta = handle === 'left' ? -deltaX : deltaX
            const oldWidth = resizeStartData.width || resizeStartData.size || 80
            // Update width directly with delta (deltaX is in screen pixels, width is in pixels)
            newWidth = Math.max(20, Math.min(500, oldWidth + delta))
            newHeight = resizeStartData.height || resizeStartData.size || 80
            // Adjust X position when resizing from left (element is centered, so move by half the width change)
            if (handle === 'left' && canvasWidth > 0) {
              const widthChange = newWidth - oldWidth
              // When resizing from left: wider = center moves left (negative), narrower = center moves right (positive)
              newX = resizeStartData.elementX - (widthChange / 2 / canvasWidth) * 100
            }
            // When resizing from right, center stays fixed (no X adjustment needed for center-anchored elements)
            // The width change is handled correctly by adding deltaX directly to oldWidth
          }
        }
        
        updateElement(selectedElement, {
          width: snapToGridValue(Math.round(newWidth)),
          height: snapToGridValue(Math.round(newHeight)),
          size: Math.max(Math.round(newWidth), Math.round(newHeight)),
          x: Math.max(0, Math.min(100, newX)),
          y: Math.max(0, Math.min(100, newY))
        })
      }
      return
    }
    
    if (!isDragging || !selectedElement) return
    
    const canvas = e.currentTarget.closest('.canvas-container')
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    let x = ((e.clientX - rect.left) / rect.width) * 100
    let y = ((e.clientY - rect.top) / rect.height) * 100
    
    if (snapToGrid) {
      x = Math.round(x / (gridSize / 10)) * (gridSize / 10)
      y = Math.round(y / (gridSize / 10)) * (gridSize / 10)
    }
    
    updateElement(selectedElement, {
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y))
    })
  }
  
  const handleMouseUp = () => {
    setIsDragging(false)
    setIsResizing(false)
    setIsRotating(false)
    setResizeCorner(null)
    setResizeStartData({ size: 0, width: 0, height: 0, x: 0, y: 0, angle: 0 })
    saveToHistory()
  }
  
  const handleResizeStart = (e, element, corner) => {
    e.preventDefault()
    e.stopPropagation()
    if (element.locked) return
    
    setIsResizing(true)
    setSelectedElement(element.id)
    setResizeCorner(corner)
    
    const canvas = e.currentTarget.closest('.canvas-container')
    const rect = canvas ? canvas.getBoundingClientRect() : null
    
    if (element.type === 'text') {
      const currentWidth = element.width || 200
      const currentHeight = element.height || 50
      
      setResizeStartData({
        size: element.fontSize || 24,
        width: currentWidth,
        height: currentHeight,
        x: e.clientX,
        y: e.clientY,
        elementX: element.x || 50,
        elementY: element.y || 50,
        canvasWidth: rect ? rect.width : 0
      })
    } else if (element.type === 'image' || element.type === 'iso-icon' || element.type === 'emoji') {
      const currentWidth = element.width || element.size || 80
      const currentHeight = element.height || element.size || 80
      
      setResizeStartData({
        size: element.size || Math.max(currentWidth, currentHeight),
        width: currentWidth,
        height: currentHeight,
        x: e.clientX,
        y: e.clientY,
        elementX: element.x || 50,
        elementY: element.y || 50,
        canvasWidth: rect ? rect.width : 0,
        canvasHeight: rect ? rect.height : 0
      })
    }
  }
  
  const handleRotationStart = (e, element) => {
    e.preventDefault()
    e.stopPropagation()
    if (element.locked) return
    
    setIsRotating(true)
    setSelectedElement(element.id)
    
    const canvas = e.currentTarget.closest('.canvas-container')
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const centerX = rect.left + (rect.width * element.x / 100)
    const centerY = rect.top + (rect.height * element.y / 100)
    
    const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI)
    
    setRotationStartData({
      angle,
      centerX,
      centerY
    })
  }
  
  const handleCanvasClick = () => {
    setSelectedElement(null)
  }
  
  // ========== EXPORT FUNCTIONS ==========
  const renderCanvasToImage = async (targetElement, dpi = 300, forPrint = false) => {
    try {
      // html2canvas uses 96 DPI as base resolution
      // For high-quality print/PDF, we need to scale up significantly
      // Scale = target DPI / 96 (base DPI of html2canvas)
      const baseDpi = 96
      const scale = dpi / baseDpi
      
      // For print/PDF, use higher scale (minimum 2x, up to 4x for 300+ DPI)
      const finalScale = forPrint ? Math.max(2, Math.min(scale, 4)) : Math.min(scale, 2)
      
      const options = {
        scale: finalScale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: backgroundSettings.type === 'solid' ? backgroundSettings.color : '#FFFFFF',
        width: targetElement.offsetWidth,
        height: targetElement.offsetHeight,
        logging: false,
        windowWidth: targetElement.scrollWidth,
        windowHeight: targetElement.scrollHeight,
        // Improve quality settings
        removeContainer: false,
        imageTimeout: 15000,
        onclone: (clonedDoc) => {
          // Hide resize handles and selection borders in the cloned document
          const clonedElement = clonedDoc.querySelector('.canvas-container')
          if (clonedElement) {
            // Remove any selection indicators
            const selectedElements = clonedElement.querySelectorAll('[style*="border"]')
            selectedElements.forEach(el => {
              if (el.style.border && el.style.border.includes('dashed')) {
                el.style.border = 'none'
              }
            })
            // Hide resize handles
            const handles = clonedElement.querySelectorAll('.resize-handle, .rotate-handle')
            handles.forEach(handle => {
              handle.style.display = 'none'
            })
          }
        }
      }
      
      const canvas = await html2canvas(targetElement, options)
      return canvas
    } catch (error) {
      console.error('Canvas rendering error:', error)
      throw error
    }
  }
  
  const exportToImage = async (format = 'PNG') => {
    try {
      if (!canvasRef.current) {
        alert('Canvas not found. Please try again.')
        return
      }
      
      // Show loading indicator
      const loadingMsg = document.createElement('div')
      loadingMsg.id = 'export-loading-msg'
      loadingMsg.textContent = 'Rendering high-quality image...'
      loadingMsg.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#000;color:#fff;padding:20px;border-radius:8px;z-index:10000;font-family:Arial,sans-serif;'
      document.body.appendChild(loadingMsg)
      
      try {
        const canvas = await renderCanvasToImage(canvasRef.current, exportSettings.dpi, true)
        
        const msg = document.getElementById('export-loading-msg')
        if (msg) document.body.removeChild(msg)
        
        // Convert to blob with high quality
        const quality = format === 'JPG' ? 0.95 : 1.0
      canvas.toBlob((blob) => {
          if (!blob) {
            alert('Failed to create image. Please try again.')
            return
          }
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `signage.${format.toLowerCase()}`
        a.click()
        URL.revokeObjectURL(url)
        }, `image/${format.toLowerCase()}`, quality)
      } catch (renderError) {
        const msg = document.getElementById('export-loading-msg')
        if (msg) document.body.removeChild(msg)
        throw renderError
      }
    } catch (error) {
      console.error('Export error:', error)
      const msg = document.getElementById('export-loading-msg')
      if (msg) document.body.removeChild(msg)
      alert('Export failed. Please try again.')
    }
  }
  
  const exportToPDF = async () => {
    try {
      if (!canvasRef.current) {
        alert('Canvas not found. Please try again.')
        return
      }
      
      // Show loading indicator
      const loadingMsg = document.createElement('div')
      loadingMsg.id = 'pdf-loading-msg'
      loadingMsg.textContent = 'Generating high-quality PDF...'
      loadingMsg.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#000;color:#fff;padding:20px;border-radius:8px;z-index:10000;font-family:Arial,sans-serif;'
      document.body.appendChild(loadingMsg)
      
      const size = signSizes[signSize][orientation.toLowerCase()]
      const dpi = exportSettings.dpi || 300
      
      // Render canvas to image at high resolution for PDF
      const canvas = await renderCanvasToImage(canvasRef.current, dpi, true)
      
      // Calculate PDF dimensions in mm (A4, A3, A5 or custom)
      const widthInMm = size.width
      const heightInMm = size.height
      
      // Create PDF (landscape if needed)
      const pdf = new jsPDF({
        orientation: orientation === 'Landscape' ? 'landscape' : 'portrait',
        unit: 'mm',
        format: signSize === 'Custom' ? [widthInMm, heightInMm] : signSize.toLowerCase(),
        compress: true
      })
      
      // Convert canvas to image data with high quality
      // Use PNG for best quality, or JPEG with high quality
      const imgData = canvas.toDataURL('image/png', 1.0)
      
      // Calculate dimensions to fit PDF page
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      
      // Calculate the actual pixel dimensions needed
      const pixelsPerMm = dpi / 25.4
      const imgWidthPx = widthInMm * pixelsPerMm
      const imgHeightPx = heightInMm * pixelsPerMm
      
      // Add image to PDF with proper dimensions
      // Use 'SLOW' compression for better quality
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'SLOW')
      
      const msg = document.getElementById('pdf-loading-msg')
      if (msg) document.body.removeChild(msg)
      
      // Download PDF
      pdf.save('signage.pdf')
    } catch (error) {
      console.error('PDF export error:', error)
      const msg = document.getElementById('pdf-loading-msg')
      if (msg) document.body.removeChild(msg)
      alert('PDF export failed. Please try again.')
    }
  }
  
  const handlePrint = async () => {
    try {
      if (!canvasRef.current) {
        alert('Canvas not found. Please try again.')
        return
      }
      
      // Show loading indicator
      const loadingMsg = document.createElement('div')
      loadingMsg.id = 'print-loading-msg'
      loadingMsg.textContent = 'Preparing high-quality print...'
      loadingMsg.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#000;color:#fff;padding:20px;border-radius:8px;z-index:10000;font-family:Arial,sans-serif;'
      document.body.appendChild(loadingMsg)
      
      // Create a new window for printing
      const printWindow = window.open('', '_blank')
      if (!printWindow) {
        const msg = document.getElementById('print-loading-msg')
        if (msg) document.body.removeChild(msg)
        alert('Please allow popups to print.')
        return
      }
      
      const size = signSizes[signSize][orientation.toLowerCase()]
      const dpi = 300 // High resolution for print
      
      // Render canvas to image at high resolution
      const canvas = await renderCanvasToImage(canvasRef.current, dpi, true)
      
      // Get high-quality image data
      const imgData = canvas.toDataURL('image/png', 1.0)
      
      // Calculate print dimensions
      const pixelsPerMm = dpi / 25.4
      const imgWidthPx = size.width * pixelsPerMm
      const imgHeightPx = size.height * pixelsPerMm
      
      const msg = document.getElementById('print-loading-msg')
      if (msg) document.body.removeChild(msg)
      
      // Create print HTML with high-resolution image
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Print Signage</title>
            <style>
              @page {
                size: ${size.width}mm ${size.height}mm;
                margin: 0;
              }
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              body {
                margin: 0;
                padding: 0;
                width: ${size.width}mm;
                height: ${size.height}mm;
                overflow: hidden;
              }
              img {
                width: 100%;
                height: 100%;
                object-fit: contain;
                display: block;
                image-rendering: -webkit-optimize-contrast;
                image-rendering: crisp-edges;
              }
            </style>
          </head>
          <body>
            <img src="${imgData}" alt="Signage" style="width: ${size.width}mm; height: ${size.height}mm;" />
            <script>
              window.onload = function() {
                // Small delay to ensure image is loaded
                setTimeout(function() {
                  window.print();
                  window.onafterprint = function() {
                    window.close();
                  };
                }, 250);
              };
            </script>
          </body>
        </html>
      `)
      printWindow.document.close()
    } catch (error) {
      console.error('Print error:', error)
      const msg = document.getElementById('print-loading-msg')
      if (msg) document.body.removeChild(msg)
      alert('Print failed. Please try again.')
    }
  }
  
  // ========== SAVE/LOAD SIGNAGES ==========
  const [savedSignages, setSavedSignages] = useState(() => {
    try {
      const saved = localStorage.getItem('customizedSignages')
      return saved ? JSON.parse(saved) : []
    } catch (error) {
      console.error('Error loading saved signages:', error)
      return []
    }
  })
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [saveName, setSaveName] = useState('')
  const [showLoadModal, setShowLoadModal] = useState(false)
  const [favoriteSignages, setFavoriteSignages] = useState(() => {
    try {
      const saved = localStorage.getItem('favoriteSignages')
      return saved ? JSON.parse(saved) : []
    } catch (error) {
      return []
    }
  })

  const saveSignage = () => {
    if (!saveName.trim()) {
      alert('Please enter a name for your signage')
      return
    }
    
    const signageData = {
      id: Date.now(),
      name: saveName.trim(),
      createdAt: new Date().toISOString(),
      elements: JSON.parse(JSON.stringify(elements)),
      backgroundImage,
      backgroundSettings: JSON.parse(JSON.stringify(backgroundSettings)),
      companyBranding: JSON.parse(JSON.stringify(companyBranding)),
      signSize,
      orientation,
      customSize,
      margins,
      exportSettings: JSON.parse(JSON.stringify(exportSettings))
    }
    
    const updated = [...savedSignages, signageData]
    setSavedSignages(updated)
    localStorage.setItem('customizedSignages', JSON.stringify(updated))
    setShowSaveModal(false)
    setSaveName('')
    alert('Signage saved successfully!')
  }

  const loadSignage = (signage) => {
    setElements(signage.elements || [])
    setBackgroundImage(signage.backgroundImage || null)
    setBackgroundSettings(signage.backgroundSettings || backgroundSettings)
    setCompanyBranding(signage.companyBranding || companyBranding)
    setSignSize(signage.signSize || 'A4')
    setOrientation(signage.orientation || 'Portrait')
    setCustomSize(signage.customSize || customSize)
    setMargins(signage.margins || margins)
    setExportSettings(signage.exportSettings || exportSettings)
    setShowLoadModal(false)
    saveToHistory()
  }

  const deleteSavedSignage = (id) => {
    const updated = savedSignages.filter(s => s.id !== id)
    setSavedSignages(updated)
    localStorage.setItem('customizedSignages', JSON.stringify(updated))
  }

  const toggleFavorite = (id) => {
    const isFavorite = favoriteSignages.includes(id)
    const updated = isFavorite 
      ? favoriteSignages.filter(fid => fid !== id)
      : [...favoriteSignages, id]
    setFavoriteSignages(updated)
    localStorage.setItem('favoriteSignages', JSON.stringify(updated))
  }

  // ========== LOAD AUTHORIZED PERSONS ==========
  useEffect(() => {
    try {
      const saved = localStorage.getItem('authorizedPersons')
      if (saved) {
        setAuthorizedPersons(JSON.parse(saved))
      }
    } catch (error) {
      console.error('Error loading authorized persons:', error)
    }
  }, [])
  
  // ========== KEYBOARD SHORTCUTS ==========
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault()
        redo()
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedElement) {
          e.preventDefault()
          deleteElement(selectedElement)
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault()
        if (selectedElement) {
          duplicateElement(selectedElement)
        }
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedElement, historyIndex, history])
  
  // ========== INITIALIZE HISTORY ==========
  useEffect(() => {
    if (history.length === 0) {
      saveToHistory()
    }
  }, [])
  
  const selectedEl = elements.find(el => el.id === selectedElement)
  const currentSize = signSizes[signSize][orientation.toLowerCase()]
  const canvasAspectRatio = currentSize.width / currentSize.height
  
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
                <span className="hidden sm:inline">Customize Signage</span>
                <span className="sm:hidden">Customize</span>
              </h1>
              <p className="hidden sm:block text-xs md:text-sm lg:text-base text-gray-600 truncate">
                Professional Signage Design & Customization
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 lg:gap-3 flex-wrap flex-shrink-0">
            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              title="Undo (Ctrl+Z)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
              Undo
            </button>
            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              title="Redo (Ctrl+Y)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
              </svg>
              Redo
            </button>
            <button
              onClick={() => setPreviewZoom(Math.max(25, previewZoom - 25))}
              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              Zoom Out
            </button>
            <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
              {previewZoom}%
            </span>
            <button
              onClick={() => setPreviewZoom(Math.min(200, previewZoom + 25))}
              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              Zoom In
            </button>
            <button
              onClick={() => setShowFullScreenPreview(true)}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Fullscreen
            </button>
            <button
              onClick={() => setShowSaveModal(true)}
              className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              Save
            </button>
            <button
              onClick={() => setShowLoadModal(true)}
              className="px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
            >
              Load
            </button>
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
        <main className="flex-1 p-4 sm:p-6 md:p-8 lg:p-10">
        

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Left Sidebar - Tools */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-[120px] space-y-4 lg:max-h-[calc(100vh-140px)] lg:overflow-y-auto lg:pb-4">
                {/* Design Tools */}
                <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Design Tools</h2>

                  {/* Add Text */}
                  <div className="mb-4">
                    <button
                      onClick={addTextElement}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                      Add Text
                    </button>
                  </div>

                  {/* Add Image */}
                  <div className="mb-4">
                    <button
                      onClick={() => imageInputRef.current?.click()}
                      className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Add Image
                    </button>
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>

                  {/* ISO 7010 Icons */}
                  <div className="mb-4">
                    <button
                      onClick={() => setShowIsoLibrary(!showIsoLibrary)}
                      className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                      ISO 7010 Icons
                    </button>
                    {showIsoLibrary && (
                      <div className="mt-2 p-3 bg-gray-50 rounded-lg max-h-64 overflow-y-auto">
                        <div className="grid grid-cols-2 gap-2">
                          {iso7010IconLibrary.map((icon) => (
                            <button
                              key={icon.id}
                              onClick={() => addIsoIcon(icon)}
                              className="p-2 text-lg hover:bg-gray-200 rounded-lg transition-colors text-center"
                              title={icon.name}
                            >
                              {icon.emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Authorized Persons Mode */}
                  <div className="mb-4">
                    <button
                      onClick={() => setAuthorizedPersonsMode(!authorizedPersonsMode)}
                      className={`w-full px-4 py-2 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2 ${
                        authorizedPersonsMode 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Authorized Persons ({authorizedPersons.length})
                    </button>
                    {authorizedPersonsMode && (
                      <div className="mt-2 p-3 bg-gray-50 rounded-lg space-y-2">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">Persons Per Page</label>
                          <select
                            value={authorizedPersonsLayout.personsPerPage}
                            onChange={(e) => setAuthorizedPersonsLayout({ ...authorizedPersonsLayout, personsPerPage: parseInt(e.target.value) })}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                          >
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="6">6</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">Style</label>
                          <select
                            value={authorizedPersonsLayout.style}
                            onChange={(e) => setAuthorizedPersonsLayout({ ...authorizedPersonsLayout, style: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                          >
                            <option value="badge">Badge</option>
                            <option value="poster">Poster</option>
                          </select>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="showQR"
                            checked={authorizedPersonsLayout.showQR}
                            onChange={(e) => setAuthorizedPersonsLayout({ ...authorizedPersonsLayout, showQR: e.target.checked })}
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                          <label htmlFor="showQR" className="text-xs text-gray-700">Show QR Code</label>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Element List */}
                  {elements.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">Elements ({elements.length})</h3>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {elements.map((el) => (
                          <div
                            key={el.id}
                            className={`p-2 rounded-lg cursor-pointer transition-colors flex items-center justify-between ${
                              selectedElement === el.id 
                                ? 'bg-blue-100 border-2 border-blue-500' 
                                : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                            onClick={() => setSelectedElement(el.id)}
                          >
                            <span className="text-xs font-medium text-gray-700 capitalize">
                              {el.type === 'emoji' ? 'Icon' : el.type === 'iso-icon' ? `ISO: ${el.iconName}` : el.type}
                            </span>
                            <div className="flex items-center gap-1">
                              {el.locked && (
                                <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  deleteElement(el.id)
                                }}
                                className="text-red-600 hover:text-red-800 text-xs font-bold"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Sign Size & Layout */}
                <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Size & Layout</h2>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Sign Size</label>
                    <select
                      value={signSize}
                      onChange={(e) => setSignSize(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="A3">A3</option>
                      <option value="A4">A4</option>
                      <option value="A5">A5</option>
                      <option value="Custom">Custom</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Orientation</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setOrientation('Portrait')}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          orientation === 'Portrait' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Portrait
                      </button>
                      <button
                        onClick={() => setOrientation('Landscape')}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          orientation === 'Landscape' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Landscape
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Grid & Snap</label>
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        id="showGrid"
                        checked={showGrid}
                        onChange={(e) => setShowGrid(e.target.checked)}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <label htmlFor="showGrid" className="text-sm text-gray-700">Show Grid</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="snapToGrid"
                        checked={snapToGrid}
                        onChange={(e) => setSnapToGrid(e.target.checked)}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <label htmlFor="snapToGrid" className="text-sm text-gray-700">Snap to Grid</label>
                    </div>
                    {snapToGrid && (
                      <div className="mt-2">
                        <label className="block text-xs text-gray-600 mb-1">Grid Size: {gridSize}px</label>
                        <input
                          type="range"
                          min="5"
                          max="50"
                          value={gridSize}
                          onChange={(e) => setGridSize(parseInt(e.target.value))}
                          className="w-full"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Background Settings */}
                <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Background</h2>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Background Type</label>
                    <select
                      value={backgroundSettings.type}
                      onChange={(e) => setBackgroundSettings({ ...backgroundSettings, type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="solid">Solid Color</option>
                      <option value="gradient">Gradient</option>
                      <option value="image">Image</option>
                    </select>
                  </div>

                  {backgroundSettings.type === 'solid' && (
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Color</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={backgroundSettings.color}
                          onChange={(e) => setBackgroundSettings({ ...backgroundSettings, color: e.target.value })}
                          className="w-12 h-10 rounded border border-gray-300"
                        />
                        <input
                          type="text"
                          value={backgroundSettings.color}
                          onChange={(e) => setBackgroundSettings({ ...backgroundSettings, color: e.target.value })}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                    </div>
                  )}

                  {backgroundSettings.type === 'image' && (
                    <div className="mb-4">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        Upload Background Image
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0]
                          if (file) {
                            const reader = new FileReader()
                            reader.onloadend = () => {
                              setBackgroundImage(reader.result)
                            }
                            reader.readAsDataURL(file)
                          }
                        }}
                        className="hidden"
                      />
                      {backgroundImage && (
                        <button
                          onClick={() => setBackgroundImage(null)}
                          className="w-full mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                        >
                          Remove Background
                        </button>
                      )}
                    </div>
                  )}

                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">ISO 7010 Color Preset</label>
                    <select
                      value={safetyCategory}
                      onChange={(e) => {
                        setSafetyCategory(e.target.value)
                        const preset = iso7010Colors[e.target.value]
                        if (preset) {
                          setBackgroundSettings({ ...backgroundSettings, color: preset.bg })
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      {Object.keys(iso7010Colors).map(key => (
                        <option key={key} value={key}>{iso7010Colors[key].name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="highContrast"
                      checked={backgroundSettings.highContrast}
                      onChange={(e) => setBackgroundSettings({ ...backgroundSettings, highContrast: e.target.checked })}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <label htmlFor="highContrast" className="text-sm font-semibold text-gray-700">High Contrast Mode</label>
                  </div>
                </div>

                {/* Element Properties */}
                {selectedEl && (
                  <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Properties</h2>

                    {selectedEl.type === 'text' && (
                      <>
                        <div className="mb-4">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Text</label>
                          <textarea
                            value={selectedEl.content}
                            onChange={(e) => updateElement(selectedEl.id, { content: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            rows="3"
                          />
                        </div>
                        
                        <div className="mb-4">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Font Family</label>
                          <select
                            value={selectedEl.fontFamily || 'Arial'}
                            onChange={(e) => updateElement(selectedEl.id, { fontFamily: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          >
                            {industrialFonts.map(font => (
                              <option key={font.name} value={font.family}>{font.name}</option>
                            ))}
                          </select>
                        </div>

                        <div className="mb-4">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Font Size: {selectedEl.fontSize || 24}px</label>
                          <input
                            type="range"
                            min="12"
                            max="200"
                            value={selectedEl.fontSize || 24}
                            onChange={(e) => updateElement(selectedEl.id, { fontSize: parseInt(e.target.value) })}
                            className="w-full"
                          />
                        </div>

                        <div className="mb-4">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Font Weight</label>
                          <select
                            value={selectedEl.fontWeight || 'normal'}
                            onChange={(e) => updateElement(selectedEl.id, { fontWeight: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          >
                            <option value="normal">Normal</option>
                            <option value="bold">Bold</option>
                            <option value="300">Light</option>
                            <option value="500">Medium</option>
                            <option value="700">Bold</option>
                          </select>
                        </div>

                        <div className="mb-4">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Text Alignment</label>
                          <div className="flex gap-2">
                            {['left', 'center', 'right'].map(align => (
                              <button
                                key={align}
                                onClick={() => updateElement(selectedEl.id, { textAlign: align })}
                                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                  (selectedEl.textAlign || 'center') === align
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                              >
                                {align.charAt(0).toUpperCase() + align.slice(1)}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="mb-4">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Color</label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={selectedEl.color || '#000000'}
                              onChange={(e) => updateElement(selectedEl.id, { color: e.target.value })}
                              className="w-12 h-10 rounded border border-gray-300"
                            />
                            <input
                              type="text"
                              value={selectedEl.color || '#000000'}
                              onChange={(e) => updateElement(selectedEl.id, { color: e.target.value })}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                          </div>
                        </div>

                        <div className="mb-4">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Line Spacing: {selectedEl.lineHeight || 1.2}</label>
                          <input
                            type="range"
                            min="0.8"
                            max="3"
                            step="0.1"
                            value={selectedEl.lineHeight || 1.2}
                            onChange={(e) => updateElement(selectedEl.id, { lineHeight: parseFloat(e.target.value) })}
                            className="w-full"
                          />
                        </div>

                        <div className="mb-4">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Letter Spacing: {selectedEl.letterSpacing || 0}px</label>
                          <input
                            type="range"
                            min="-5"
                            max="20"
                            value={selectedEl.letterSpacing || 0}
                            onChange={(e) => updateElement(selectedEl.id, { letterSpacing: parseInt(e.target.value) })}
                            className="w-full"
                          />
                        </div>

                        <div className="mb-4">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Language</label>
                          <select
                            value={selectedEl.language || 'en'}
                            onChange={(e) => updateElement(selectedEl.id, { language: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          >
                            <option value="en">English</option>
                            <option value="ar">Arabic</option>
                            <option value="es">Spanish</option>
                            <option value="fr">French</option>
                            <option value="de">German</option>
                          </select>
                        </div>

                        <div className="flex items-center gap-2 mb-4">
                          <input
                            type="checkbox"
                            id="autoFit"
                            checked={selectedEl.autoFit || false}
                            onChange={(e) => updateElement(selectedEl.id, { autoFit: e.target.checked })}
                            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <label htmlFor="autoFit" className="text-sm font-semibold text-gray-700">Auto Text Fit</label>
                        </div>
                      </>
                    )}

                    {(selectedEl.type === 'image' || selectedEl.type === 'iso-icon' || selectedEl.type === 'emoji') && (
                      <>
                        <div className="mb-4">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Size: {selectedEl.size || Math.max(selectedEl.width || 80, selectedEl.height || 80)}px
                          </label>
                          <input
                            type="range"
                            min="20"
                            max="500"
                            value={selectedEl.size || Math.max(selectedEl.width || 80, selectedEl.height || 80)}
                            onChange={(e) => {
                              const newSize = parseInt(e.target.value)
                              const currentWidth = selectedEl.width || selectedEl.size || 80
                              const currentHeight = selectedEl.height || selectedEl.size || 80
                              const aspectRatio = currentWidth / currentHeight
                              let newWidth = currentWidth
                              let newHeight = currentHeight
                              
                              if (currentWidth >= currentHeight) {
                                newWidth = newSize
                                newHeight = newSize / aspectRatio
                              } else {
                                newHeight = newSize
                                newWidth = newSize * aspectRatio
                              }
                              
                              updateElement(selectedEl.id, {
                                size: newSize,
                                width: Math.round(newWidth),
                                height: Math.round(newHeight)
                              })
                            }}
                            className="w-full"
                          />
                        </div>

                        <div className="mb-4">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Rotation: {selectedEl.rotation || 0}°</label>
                          <input
                            type="range"
                            min="-180"
                            max="180"
                            value={selectedEl.rotation || 0}
                            onChange={(e) => updateElement(selectedEl.id, { rotation: parseInt(e.target.value) })}
                            className="w-full"
                          />
                        </div>

                        <div className="mb-4">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Opacity: {selectedEl.opacity || 100}%</label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={selectedEl.opacity || 100}
                            onChange={(e) => updateElement(selectedEl.id, { opacity: parseInt(e.target.value) })}
                            className="w-full"
                          />
                        </div>

                        {selectedEl.type === 'image' && (
                          <>
                            <div className="mb-4">
                              <label className="block text-sm font-semibold text-gray-700 mb-2">Brightness: {selectedEl.brightness || 100}%</label>
                              <input
                                type="range"
                                min="0"
                                max="200"
                                value={selectedEl.brightness || 100}
                                onChange={(e) => updateElement(selectedEl.id, { brightness: parseInt(e.target.value) })}
                                className="w-full"
                              />
                            </div>

                            <div className="mb-4">
                              <label className="block text-sm font-semibold text-gray-700 mb-2">Contrast: {selectedEl.contrast || 100}%</label>
                              <input
                                type="range"
                                min="0"
                                max="200"
                                value={selectedEl.contrast || 100}
                                onChange={(e) => updateElement(selectedEl.id, { contrast: parseInt(e.target.value) })}
                                className="w-full"
                              />
                            </div>

                            <div className="mb-4">
                              <label className="block text-sm font-semibold text-gray-700 mb-2">Saturation: {selectedEl.saturation || 100}%</label>
                              <input
                                type="range"
                                min="0"
                                max="200"
                                value={selectedEl.saturation || 100}
                                onChange={(e) => updateElement(selectedEl.id, { saturation: parseInt(e.target.value) })}
                                className="w-full"
                              />
                            </div>
                          </>
                        )}
                      </>
                    )}

                    {/* Common Properties */}
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Z-Index (Layer)</label>
                      <input
                        type="number"
                        value={selectedEl.zIndex || 0}
                        onChange={(e) => updateElement(selectedEl.id, { zIndex: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      <input
                        type="checkbox"
                        id="locked"
                        checked={selectedEl.locked || false}
                        onChange={(e) => updateElement(selectedEl.id, { locked: e.target.checked })}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <label htmlFor="locked" className="text-sm font-semibold text-gray-700">Lock Position</label>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => duplicateElement(selectedEl.id)}
                        className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                      >
                        Duplicate
                      </button>
                      <button
                        onClick={() => deleteElement(selectedEl.id)}
                        className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}

                {/* Export Settings */}
                <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Export</h2>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Format</label>
                    <select
                      value={exportSettings.format}
                      onChange={(e) => setExportSettings({ ...exportSettings, format: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="PDF">PDF</option>
                      <option value="PNG">PNG</option>
                      <option value="JPG">JPG</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">DPI</label>
                    <select
                      value={exportSettings.dpi}
                      onChange={(e) => setExportSettings({ ...exportSettings, dpi: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="72">72 DPI (Web)</option>
                      <option value="150">150 DPI (Standard Print)</option>
                      <option value="300">300 DPI (High Quality Print)</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Color Mode</label>
                    <select
                      value={exportSettings.colorMode}
                      onChange={(e) => setExportSettings({ ...exportSettings, colorMode: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="RGB">RGB (Screen)</option>
                      <option value="CMYK">CMYK (Print)</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <input
                      type="checkbox"
                      id="includeBleed"
                      checked={exportSettings.includeBleed}
                      onChange={(e) => setExportSettings({ ...exportSettings, includeBleed: e.target.checked })}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <label htmlFor="includeBleed" className="text-sm font-semibold text-gray-700">Include Bleed</label>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <input
                      type="checkbox"
                      id="weatherproof"
                      checked={exportSettings.weatherproof}
                      onChange={(e) => setExportSettings({ ...exportSettings, weatherproof: e.target.checked })}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <label htmlFor="weatherproof" className="text-sm font-semibold text-gray-700">Weatherproof Mode</label>
                  </div>

                  <button
                    onClick={() => {
                      if (exportSettings.format === 'PDF') {
                        exportToPDF()
                      } else {
                        exportToImage(exportSettings.format)
                      }
                    }}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Export {exportSettings.format}
                  </button>
                </div>
              </div>
            </div>

            {/* Canvas Area */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowPrintPreview(true)}
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                    >
                      Print Preview
                    </button>
                  </div>
                </div>

                <div
                  ref={canvasRef}
                  className="canvas-container relative bg-white border-2 border-gray-300 rounded-lg overflow-hidden mx-auto"
                  style={{
                    aspectRatio: canvasAspectRatio,
                    width: `${Math.min(100, previewZoom)}%`,
                    minHeight: '500px',
                    backgroundImage: showGrid ? `repeating-linear-gradient(0deg, transparent, transparent ${gridSize - 1}px, rgba(0,0,0,0.1) ${gridSize - 1}px, rgba(0,0,0,0.1) ${gridSize}px), repeating-linear-gradient(90deg, transparent, transparent ${gridSize - 1}px, rgba(0,0,0,0.1) ${gridSize - 1}px, rgba(0,0,0,0.1) ${gridSize}px)` : 'none'
                  }}
                  onClick={handleCanvasClick}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                >
                  {/* Background */}
                  {backgroundSettings.type === 'solid' && (
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundColor: backgroundSettings.color,
                        opacity: backgroundSettings.opacity / 100
                      }}
                    />
                  )}
                  
                  {backgroundSettings.type === 'gradient' && (
                    <div
                      className="absolute inset-0"
                      style={{
                        background: `linear-gradient(${backgroundSettings.gradient.angle}deg, ${backgroundSettings.gradient.colors[0]}, ${backgroundSettings.gradient.colors[1]})`,
                        opacity: backgroundSettings.opacity / 100
                      }}
                    />
                  )}
                  
                  {backgroundImage && (
                    <img
                      src={backgroundImage}
                      alt="Background"
                      className="absolute inset-0 w-full h-full object-cover"
                      style={{ opacity: backgroundSettings.opacity / 100 }}
                    />
                  )}

                  {/* Authorized Persons Grid */}
                  {authorizedPersonsMode && authorizedPersons.length > 0 && (
                    <div className="absolute inset-0 p-8">
                      <div className={`grid gap-4 h-full ${
                        authorizedPersonsLayout.personsPerPage === 1 ? 'grid-cols-1' :
                        authorizedPersonsLayout.personsPerPage === 2 ? 'grid-cols-2' :
                        authorizedPersonsLayout.personsPerPage === 3 ? 'grid-cols-3' :
                        authorizedPersonsLayout.personsPerPage === 4 ? 'grid-cols-2 grid-rows-2' :
                        authorizedPersonsLayout.personsPerPage === 6 ? 'grid-cols-3 grid-rows-2' :
                        'grid-cols-3 grid-rows-2'
                      }`}>
                        {authorizedPersons.slice(0, authorizedPersonsLayout.personsPerPage).map((person) => (
                          <div
                            key={person.id}
                            className={`border-2 rounded-lg p-4 flex flex-col items-center justify-center ${
                              authorizedPersonsLayout.style === 'badge' ? 'bg-white' : 'bg-gray-50'
                            }`}
                            style={{
                              borderColor: iso7010Colors[person.signageCategory || 'Mandatory']?.bg || '#0052CC'
                            }}
                          >
                            {person.photoUrl && (
                              <img
                                src={person.photoUrl}
                                alt={person.name}
                                className={`mb-2 object-cover ${
                                  authorizedPersonsLayout.style === 'badge' ? 'w-24 h-24 rounded-full' : 'w-32 h-32 rounded-lg'
                                }`}
                              />
                            )}
                            <h3 className="font-bold text-lg text-center mb-1">{person.name}</h3>
                            {person.position && (
                              <p className="text-sm text-gray-600 text-center mb-1">{person.position}</p>
                            )}
                            {person.employeeId && (
                              <p className="text-xs text-gray-500 text-center">ID: {person.employeeId}</p>
                            )}
                            {authorizedPersonsLayout.showQR && person.qrCodeText && (
                              <div className="mt-2 p-2 bg-white rounded border">
                                <div className="text-xs text-center text-gray-600">QR Code</div>
                                <div className="w-16 h-16 bg-gray-200 mx-auto mt-1 flex items-center justify-center text-xs text-gray-500">
                                  QR
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Elements */}
                  {[...elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0)).map((element) => (
                    <div
                      key={element.id}
                      onClick={(e) => {
                        if (!e.target.classList.contains('resize-handle') && !e.target.classList.contains('rotate-handle')) {
                          handleElementClick(e, element)
                        }
                      }}
                      onMouseDown={(e) => {
                        if (!e.target.classList.contains('resize-handle') && !e.target.classList.contains('rotate-handle') && !element.locked) {
                          handleMouseDown(e, element)
                        }
                      }}
                      style={{
                        position: 'absolute',
                        left: `${element.x}%`,
                        top: `${element.y}%`,
                        transform: `translate(-50%, -50%) rotate(${element.rotation || 0}deg)`,
                        width: (element.type === 'image' || element.type === 'iso-icon' || element.type === 'emoji') 
                          ? `${element.width || element.size || 80}px` 
                          : (element.type === 'text' 
                            ? `${element.width || 200}px` 
                            : 'auto'),
                        height: (element.type === 'image' || element.type === 'iso-icon' || element.type === 'emoji') 
                          ? `${element.height || element.size || 80}px` 
                          : (element.type === 'text' 
                            ? `${element.height || 50}px` 
                            : 'auto'),
                        cursor: element.locked ? 'not-allowed' : (isResizing && selectedElement === element.id ? 'nwse-resize' : 'move'),
                        border: selectedElement === element.id ? '2px dashed #3B82F6' : 'none',
                        padding: selectedElement === element.id ? '4px' : '0',
                        zIndex: selectedElement === element.id ? 1000 : (element.zIndex || 100),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: (element.opacity || 100) / 100,
                        filter: element.type === 'image' ? `brightness(${(element.brightness || 100) / 100}) contrast(${(element.contrast || 100) / 100}) saturate(${(element.saturation || 100) / 100})` : 'none'
                      }}
                    >
                      {element.type === 'text' && (
                        <div
                          style={{
                            fontSize: `${element.fontSize || 24}px`,
                            color: element.color || '#000000',
                            fontFamily: element.fontFamily || 'Arial',
                            fontWeight: element.fontWeight || 'normal',
                            width: `${element.width || 200}px`,
                            height: `${element.height || 50}px`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: element.textAlign || 'center',
                            wordWrap: 'break-word',
                            overflow: 'hidden',
                            textAlign: element.textAlign || 'center',
                            userSelect: 'none',
                            lineHeight: element.lineHeight || 1.2,
                            letterSpacing: `${element.letterSpacing || 0}px`,
                            direction: element.language === 'ar' ? 'rtl' : 'ltr'
                          }}
                        >
                          {element.content}
                        </div>
                      )}
                      
                      {element.type === 'emoji' && (
                        <div style={{ 
                          fontSize: `${element.size || Math.max(element.width || 80, element.height || 80)}px`, 
                          userSelect: 'none',
                          width: `${element.width || element.size || 80}px`,
                          height: `${element.height || element.size || 80}px`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {element.content}
                        </div>
                      )}
                      
                      {element.type === 'iso-icon' && (
                        <div style={{
                          width: `${element.width || element.size || 80}px`,
                          height: `${element.height || element.size || 80}px`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: `${Math.min(element.width || 80, element.height || 80) * 0.8}px`,
                          backgroundColor: iso7010Colors[element.category]?.bg || '#0052CC',
                          borderRadius: '8px',
                          color: iso7010Colors[element.category]?.text || '#FFFFFF',
                          userSelect: 'none'
                        }}>
                          {element.emoji}
                        </div>
                      )}
                      
                      {element.type === 'image' && (
                        <img
                          src={element.content}
                          alt="Icon"
                          style={{
                            width: `${element.width || element.size || 80}px`,
                            height: `${element.height || element.size || 80}px`,
                            objectFit: 'fill',
                            userSelect: 'none',
                            pointerEvents: 'none',
                            display: 'block'
                          }}
                          draggable={false}
                        />
                      )}
                      
                      {/* Resize Handles */}
                      {selectedElement === element.id && !element.locked && (
                        <>
                          {/* Rotation Handle */}
                          <div
                            className="rotate-handle"
                            style={{
                              position: 'absolute',
                              top: '-30px',
                              left: '50%',
                              transform: 'translateX(-50%)',
                              width: '20px',
                              height: '20px',
                              backgroundColor: '#3B82F6',
                              border: '2px solid white',
                              borderRadius: '50%',
                              cursor: 'grab',
                              zIndex: 1001,
                              boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            onMouseDown={(e) => handleRotationStart(e, element)}
                          >
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          </div>
                          
                          {/* Corner and Edge Handles */}
                          {['top-left', 'top', 'top-right', 'right', 'bottom-right', 'bottom', 'bottom-left', 'left'].map(handle => (
                            <div
                              key={handle}
                              className="resize-handle"
                              style={{
                                position: 'absolute',
                                ...(handle === 'top-left' && { top: '-6px', left: '-6px' }),
                                ...(handle === 'top' && { top: '-6px', left: '50%', transform: 'translateX(-50%)' }),
                                ...(handle === 'top-right' && { top: '-6px', right: '-6px' }),
                                ...(handle === 'right' && { top: '50%', right: '-6px', transform: 'translateY(-50%)' }),
                                ...(handle === 'bottom-right' && { bottom: '-6px', right: '-6px' }),
                                ...(handle === 'bottom' && { bottom: '-6px', left: '50%', transform: 'translateX(-50%)' }),
                                ...(handle === 'bottom-left' && { bottom: '-6px', left: '-6px' }),
                                ...(handle === 'left' && { top: '50%', left: '-6px', transform: 'translateY(-50%)' }),
                                width: '12px',
                                height: '12px',
                                backgroundColor: '#3B82F6',
                                border: '1.5px solid white',
                                borderRadius: '50%',
                                cursor: ['top-left', 'bottom-right'].includes(handle) ? 'nwse-resize' : 
                                        ['top-right', 'bottom-left'].includes(handle) ? 'nesw-resize' :
                                        ['top', 'bottom'].includes(handle) ? 'ns-resize' : 'ew-resize',
                                zIndex: 1001,
                                boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                              }}
                              onMouseDown={(e) => handleResizeStart(e, element, handle)}
                            />
                          ))}
                        </>
                      )}
                    </div>
                  ))}

                  {elements.length === 0 && !backgroundImage && backgroundSettings.type === 'solid' && backgroundSettings.color === '#FFFFFF' && (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                      <div className="text-center">
                        <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-lg font-semibold">Start Creating</p>
                        <p className="text-sm">Add text, images, or ISO 7010 icons to begin</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex gap-4 flex-wrap">
                  <button
                    onClick={() => {
                      if (exportSettings.format === 'PDF') {
                        exportToPDF()
                      } else {
                        exportToImage(exportSettings.format)
                      }
                    }}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Export {exportSettings.format}
                  </button>
                  <button
                    onClick={() => {
                      setElements([])
                      setBackgroundImage(null)
                      setBackgroundSettings({ ...backgroundSettings, type: 'solid', color: '#FFFFFF' })
                      setSelectedElement(null)
                    }}
                    className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={handlePrint}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Print
                  </button>
                  <button
                    onClick={() => setShowPrintPreview(true)}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                  >
                    Print Preview
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Fullscreen Preview Modal */}
      {showFullScreenPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative w-full h-full flex items-center justify-center">
            <button
              onClick={() => setShowFullScreenPreview(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 text-2xl font-bold"
            >
              ×
            </button>
            <div
              className="canvas-container relative bg-white border-2 border-gray-300 rounded-lg overflow-auto max-w-full max-h-full"
              style={{
                aspectRatio: canvasAspectRatio,
                width: '90%',
                height: '90%'
              }}
            >
              {/* Same canvas content as main canvas */}
            </div>
          </div>
        </div>
      )}

      {/* Print Preview Modal */}
      {showPrintPreview && (
        <div className="fixed inset-0 bg-gray-100 z-50 p-8 overflow-auto">
          <div className="max-w-6xl mx-auto">
            <div className="mb-4 flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900">Print Preview</h2>
              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Print
                </button>
              <button
                onClick={() => setShowPrintPreview(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Close
              </button>
            </div>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg flex justify-center">
            <div
                className="canvas-container relative bg-white border-2 border-gray-300 rounded-lg overflow-hidden"
              style={{
                  aspectRatio: canvasAspectRatio,
                  width: `${Math.min(currentSize.width * 2, 800)}px`,
                  minHeight: '400px'
                }}
              >
                {/* Background */}
                {backgroundSettings.type === 'solid' && (
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundColor: backgroundSettings.color,
                      opacity: backgroundSettings.opacity / 100
                    }}
                  />
                )}
                
                {backgroundSettings.type === 'gradient' && (
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(${backgroundSettings.gradient.angle}deg, ${backgroundSettings.gradient.colors[0]}, ${backgroundSettings.gradient.colors[1]})`,
                      opacity: backgroundSettings.opacity / 100
                    }}
                  />
                )}
                
                {backgroundImage && (
                  <img
                    src={backgroundImage}
                    alt="Background"
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ opacity: backgroundSettings.opacity / 100 }}
                  />
                )}

                {/* Authorized Persons Grid */}
                {authorizedPersonsMode && authorizedPersons.length > 0 && (
                  <div className="absolute inset-0 p-8">
                    <div className={`grid gap-4 h-full ${
                      authorizedPersonsLayout.personsPerPage === 1 ? 'grid-cols-1' :
                      authorizedPersonsLayout.personsPerPage === 2 ? 'grid-cols-2' :
                      authorizedPersonsLayout.personsPerPage === 3 ? 'grid-cols-3' :
                      authorizedPersonsLayout.personsPerPage === 4 ? 'grid-cols-2 grid-rows-2' :
                      authorizedPersonsLayout.personsPerPage === 6 ? 'grid-cols-3 grid-rows-2' :
                      'grid-cols-3 grid-rows-2'
                    }`}>
                      {authorizedPersons.slice(0, authorizedPersonsLayout.personsPerPage).map((person) => (
                        <div
                          key={person.id}
                          className={`border-2 rounded-lg p-4 flex flex-col items-center justify-center ${
                            authorizedPersonsLayout.style === 'badge' ? 'bg-white' : 'bg-gray-50'
                          }`}
                          style={{
                            borderColor: iso7010Colors[person.signageCategory || 'Mandatory']?.bg || '#0052CC'
                          }}
                        >
                          {person.photoUrl && (
                            <img
                              src={person.photoUrl}
                              alt={person.name}
                              className={`mb-2 object-cover ${
                                authorizedPersonsLayout.style === 'badge' ? 'w-24 h-24 rounded-full' : 'w-32 h-32 rounded-lg'
                              }`}
                            />
                          )}
                          <h3 className="font-bold text-lg text-center mb-1">{person.name}</h3>
                          {person.position && (
                            <p className="text-sm text-gray-600 text-center mb-1">{person.position}</p>
                          )}
                          {person.employeeId && (
                            <p className="text-xs text-gray-500 text-center">ID: {person.employeeId}</p>
                          )}
                          {authorizedPersonsLayout.showQR && person.qrCodeText && (
                            <div className="mt-2 p-2 bg-white rounded border">
                              <div className="text-xs text-center text-gray-600">QR Code</div>
                              <div className="w-16 h-16 bg-gray-200 mx-auto mt-1 flex items-center justify-center text-xs text-gray-500">
                                QR
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Elements */}
                {[...elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0)).map((element) => (
                  <div
                    key={element.id}
                    style={{
                      position: 'absolute',
                      left: `${element.x}%`,
                      top: `${element.y}%`,
                      transform: `translate(-50%, -50%) rotate(${element.rotation || 0}deg)`,
                      width: (element.type === 'image' || element.type === 'iso-icon' || element.type === 'emoji') 
                        ? `${element.width || element.size || 80}px` 
                        : (element.type === 'text' 
                          ? `${element.width || 200}px` 
                          : 'auto'),
                      height: (element.type === 'image' || element.type === 'iso-icon' || element.type === 'emoji') 
                        ? `${element.height || element.size || 80}px` 
                        : (element.type === 'text' 
                          ? `${element.height || 50}px` 
                          : 'auto'),
                      zIndex: element.zIndex || 100,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: (element.opacity || 100) / 100,
                      filter: element.type === 'image' ? `brightness(${(element.brightness || 100) / 100}) contrast(${(element.contrast || 100) / 100}) saturate(${(element.saturation || 100) / 100})` : 'none'
                    }}
                  >
                    {element.type === 'text' && (
                      <div
                        style={{
                          fontSize: `${element.fontSize || 24}px`,
                          color: element.color || '#000000',
                          fontFamily: element.fontFamily || 'Arial',
                          fontWeight: element.fontWeight || 'normal',
                          width: `${element.width || 200}px`,
                          height: `${element.height || 50}px`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: element.textAlign || 'center',
                          wordWrap: 'break-word',
                          overflow: 'hidden',
                          textAlign: element.textAlign || 'center',
                          lineHeight: element.lineHeight || 1.2,
                          letterSpacing: `${element.letterSpacing || 0}px`,
                          direction: element.language === 'ar' ? 'rtl' : 'ltr'
                        }}
                      >
                        {element.content}
                      </div>
                    )}
                    
                    {element.type === 'emoji' && (
                      <div style={{ 
                        fontSize: `${element.size || Math.max(element.width || 80, element.height || 80)}px`, 
                        width: `${element.width || element.size || 80}px`,
                        height: `${element.height || element.size || 80}px`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {element.content}
                      </div>
                    )}
                    
                    {element.type === 'iso-icon' && (
                      <div style={{
                        width: `${element.width || element.size || 80}px`,
                        height: `${element.height || element.size || 80}px`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: `${Math.min(element.width || 80, element.height || 80) * 0.8}px`,
                        backgroundColor: iso7010Colors[element.category]?.bg || '#0052CC',
                        borderRadius: '8px',
                        color: iso7010Colors[element.category]?.text || '#FFFFFF'
                      }}>
                        {element.emoji}
                      </div>
                    )}
                    
                    {element.type === 'image' && (
                      <img
                        src={element.content}
                        alt="Icon"
                        style={{
                          width: `${element.width || element.size || 80}px`,
                          height: `${element.height || element.size || 80}px`,
                          objectFit: 'fill',
                          display: 'block'
                        }}
                        draggable={false}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Save Signage</h2>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Signage Name</label>
              <input
                type="text"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="Enter signage name..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    saveSignage()
                  } else if (e.key === 'Escape') {
                    setShowSaveModal(false)
                  }
                }}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={saveSignage}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setShowSaveModal(false)
                  setSaveName('')
                }}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Load Modal */}
      {showLoadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Load Saved Signage</h2>
            {savedSignages.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No saved signages yet. Save your first signage to get started!</p>
            ) : (
              <div className="space-y-2">
                {savedSignages
                  .sort((a, b) => {
                    const aFav = favoriteSignages.includes(a.id)
                    const bFav = favoriteSignages.includes(b.id)
                    if (aFav && !bFav) return -1
                    if (!aFav && bFav) return 1
                    return new Date(b.createdAt) - new Date(a.createdAt)
                  })
                  .map((signage) => (
                    <div
                      key={signage.id}
                      className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">{signage.name}</h3>
                            {favoriteSignages.includes(signage.id) && (
                              <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {new Date(signage.createdAt).toLocaleDateString()} • {signage.elements?.length || 0} elements
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleFavorite(signage.id)}
                            className="p-2 text-gray-400 hover:text-yellow-500 transition-colors"
                            title={favoriteSignages.includes(signage.id) ? 'Remove from favorites' : 'Add to favorites'}
                          >
                            <svg className="w-5 h-5" fill={favoriteSignages.includes(signage.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => loadSignage(signage)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                          >
                            Load
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this signage?')) {
                                deleteSavedSignage(signage.id)
                              }
                            }}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
            <div className="mt-4">
              <button
                onClick={() => setShowLoadModal(false)}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden canvas for export */}
      <canvas ref={exportCanvasRef} className="hidden" />
    </div>
  )
}

export default CustomizeSignage
