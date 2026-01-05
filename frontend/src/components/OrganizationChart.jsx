import { useState, useRef, useEffect, useCallback } from 'react'
import Sidebar from './Sidebar'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

const OrganizationChart = ({ activeNav, setActiveNav, sidebarOpen, setSidebarOpen }) => {
  const [orgMembers, setOrgMembers] = useState([])
  const [draggedMember, setDraggedMember] = useState(null)
  const [dragOverMember, setDragOverMember] = useState(null)
  const [memberPositions, setMemberPositions] = useState({})
  const [chartImage, setChartImage] = useState(null)
  const [chartStyle, setChartStyle] = useState('modern') // modern, classic, minimal, colorful, professional
  const [paperSize, setPaperSize] = useState('A4') // A4, A3, A5, Legal
  const [orientation, setOrientation] = useState('landscape') // portrait, landscape
  const chartContainerRef = useRef(null)
  const fileInputRef = useRef(null)

  // Initialize positions for new members
  useEffect(() => {
    orgMembers.forEach(member => {
      if (!memberPositions[member.id]) {
        setMemberPositions(prev => ({
          ...prev,
          [member.id]: {
            x: Math.random() * 300 + 100,
            y: Math.random() * 200 + 100
          }
        }))
      }
    })
  }, [orgMembers.length])

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
    setMemberPositions(prev => ({
      ...prev,
      [newMember.id]: {
        x: Math.random() * 300 + 100,
        y: Math.random() * 200 + 100
      }
    }))
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

  const handleChartImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setChartImage(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeChartImage = () => {
    setChartImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Paper size dimensions in pixels (at 96 DPI)
  const getPaperDimensions = () => {
    const dimensions = {
      A4: { width: 794, height: 1123 }, // Portrait
      A3: { width: 1123, height: 1587 },
      A5: { width: 559, height: 794 },
      Legal: { width: 816, height: 1344 }
    }
    
    const base = dimensions[paperSize]
    if (orientation === 'landscape') {
      return { width: base.height, height: base.width }
    }
    return base
  }

  // Paper size dimensions in mm for PDF
  const getPaperDimensionsMm = () => {
    const dimensions = {
      A4: { width: 210, height: 297 }, // Portrait in mm
      A3: { width: 297, height: 420 },
      A5: { width: 148, height: 210 },
      Legal: { width: 216, height: 356 }
    }
    
    const base = dimensions[paperSize]
    if (orientation === 'landscape') {
      return { width: base.height, height: base.width }
    }
    return base
  }

  // Render chart to canvas with high quality
  const renderChartToCanvas = async (dpi = 300, forPrint = false) => {
    try {
      if (!chartContainerRef.current) {
        throw new Error('Chart container not found')
      }

      // html2canvas uses 96 DPI as base resolution
      const baseDpi = 96
      const scale = dpi / baseDpi
      
      // For print/PDF, use higher scale (minimum 2x, up to 4x for 300+ DPI)
      const finalScale = forPrint ? Math.max(2, Math.min(scale, 4)) : Math.min(scale, 2)
      
      const options = {
        scale: finalScale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#f9fafb', // gray-50 background
        width: chartContainerRef.current.scrollWidth,
        height: chartContainerRef.current.scrollHeight,
        logging: false,
        windowWidth: chartContainerRef.current.scrollWidth,
        windowHeight: chartContainerRef.current.scrollHeight,
        removeContainer: false,
        imageTimeout: 15000,
        onclone: (clonedDoc) => {
          // Hide any UI elements that shouldn't be in export
          const clonedElement = clonedDoc.querySelector('[ref]') || clonedDoc.body
          if (clonedElement) {
            // Remove any hover effects or temporary elements
            const hoverElements = clonedElement.querySelectorAll('.opacity-0, .group-hover\\:opacity-100')
            hoverElements.forEach(el => {
              if (el.classList.contains('opacity-0')) {
                el.style.display = 'none'
              }
            })
          }
        }
      }
      
      const canvas = await html2canvas(chartContainerRef.current, options)
      return canvas
    } catch (error) {
      console.error('Canvas rendering error:', error)
      throw error
    }
  }

  // Download as PNG
  const handleDownloadPNG = async () => {
    try {
      if (!chartContainerRef.current) {
        alert('Chart not found. Please add some members first.')
        return
      }

      // Show loading indicator
      const loadingMsg = document.createElement('div')
      loadingMsg.id = 'png-loading-msg'
      loadingMsg.textContent = 'Generating high-quality PNG...'
      loadingMsg.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#000;color:#fff;padding:20px;border-radius:8px;z-index:10000;font-family:Arial,sans-serif;'
      document.body.appendChild(loadingMsg)

      try {
        const canvas = await renderChartToCanvas(300, true)
        
        const msg = document.getElementById('png-loading-msg')
        if (msg) document.body.removeChild(msg)
        
        // Convert to blob with high quality
        canvas.toBlob((blob) => {
          if (!blob) {
            alert('Failed to create image. Please try again.')
            return
          }
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `organization-chart-${paperSize}-${orientation}.png`
          a.click()
          URL.revokeObjectURL(url)
        }, 'image/png', 1.0)
      } catch (renderError) {
        const msg = document.getElementById('png-loading-msg')
        if (msg) document.body.removeChild(msg)
        throw renderError
      }
    } catch (error) {
      console.error('Download PNG error:', error)
      const msg = document.getElementById('png-loading-msg')
      if (msg) document.body.removeChild(msg)
      alert('Failed to download PNG. Please try again.')
    }
  }

  // Print chart
  const handlePrint = async () => {
    try {
      if (!chartContainerRef.current) {
        alert('Chart not found. Please add some members first.')
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

      const dimensions = getPaperDimensionsMm()
      const dpi = 300 // High resolution for print
      
      // Render chart to image at high resolution
      const canvas = await renderChartToCanvas(dpi, true)
      
      // Get high-quality image data
      const imgData = canvas.toDataURL('image/png', 1.0)
      
      const msg = document.getElementById('print-loading-msg')
      if (msg) document.body.removeChild(msg)
      
      // Create print HTML with high-resolution image
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Print Organization Chart</title>
            <style>
              @page {
                size: ${dimensions.width}mm ${dimensions.height}mm;
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
                width: ${dimensions.width}mm;
                height: ${dimensions.height}mm;
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
            <img src="${imgData}" alt="Organization Chart" style="width: ${dimensions.width}mm; height: ${dimensions.height}mm;" />
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

  // Download as PDF
  const handleDownloadPDF = async () => {
    try {
      if (!chartContainerRef.current) {
        alert('Chart not found. Please add some members first.')
        return
      }

      // Show loading indicator
      const loadingMsg = document.createElement('div')
      loadingMsg.id = 'pdf-loading-msg'
      loadingMsg.textContent = 'Generating high-quality PDF...'
      loadingMsg.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#000;color:#fff;padding:20px;border-radius:8px;z-index:10000;font-family:Arial,sans-serif;'
      document.body.appendChild(loadingMsg)

      const dimensions = getPaperDimensionsMm()
      const dpi = 300
      
      // Render chart to image at high resolution
      const canvas = await renderChartToCanvas(dpi, true)
      
      // Create PDF
      const pdf = new jsPDF({
        orientation: orientation === 'landscape' ? 'landscape' : 'portrait',
        unit: 'mm',
        format: paperSize === 'Legal' ? [dimensions.width, dimensions.height] : paperSize.toLowerCase(),
        compress: true
      })
      
      // Convert canvas to image data with high quality
      const imgData = canvas.toDataURL('image/png', 1.0)
      
      // Calculate dimensions to fit PDF page
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      
      // Add image to PDF with proper dimensions
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'SLOW')
      
      const msg = document.getElementById('pdf-loading-msg')
      if (msg) document.body.removeChild(msg)
      
      // Download PDF
      pdf.save(`organization-chart-${paperSize}-${orientation}.pdf`)
    } catch (error) {
      console.error('PDF export error:', error)
      const msg = document.getElementById('pdf-loading-msg')
      if (msg) document.body.removeChild(msg)
      alert('PDF export failed. Please try again.')
    }
  }

  // Get style classes based on selected style
  const getStyleClasses = (type) => {
    const styles = {
      modern: {
        card: 'bg-transparent border border-gray-300 rounded-lg shadow-md',
        border: 'border-gray-300',
        text: 'text-gray-900',
        role: 'text-white',
        avatar: 'bg-white border-2 border-white',
        avatarIcon: 'text-gray-600',
        headerBg: '#1e40af' // Dark blue for top section
      },
      classic: {
        card: 'bg-blue-600 border-2 rounded-lg shadow-md',
        border: 'border-blue-700',
        text: 'text-white',
        role: 'text-white',
        avatar: 'bg-gradient-to-br from-gray-400 to-gray-600 border-2 border-white',
        lineColor: '#3b82f6' // Blue lines for classic style
      },
      minimal: {
        card: 'bg-white border rounded shadow-sm',
        border: 'border-gray-300',
        text: 'text-gray-900',
        role: 'text-gray-600',
        avatar: 'bg-gray-200 border border-gray-400',
        lineColor: '#3b82f6' // Blue lines for minimal style
      },
      colorful: {
        card: 'bg-gradient-to-br from-purple-50 to-pink-50 border-2 rounded-2xl shadow-xl',
        border: 'border-purple-500',
        text: 'text-gray-900',
        role: 'text-purple-600',
        avatar: 'bg-gradient-to-br from-purple-400 to-pink-500 border-2 border-purple-500',
        lineColor: '#ec4899' // Vibrant pink for colorful style
      },
      professional: {
        card: 'bg-gray-800 border border-gray-700 rounded-lg shadow-md',
        border: 'border-gray-700',
        text: 'text-white',
        role: 'text-white',
        avatar: 'bg-gray-700 border-2 border-white',
        lineColor: '#9ca3af' // Light gray for professional style
      }
    }
    return styles[chartStyle] || styles.modern
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
    setMemberPositions(prev => {
      const newPos = { ...prev }
      delete newPos[id]
      return newPos
    })
  }

  // Drag and Drop Handlers
  const handleDragStart = (e, memberId) => {
    setDraggedMember(memberId)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', memberId)
  }

  const handleDragOver = (e, memberId) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (memberId !== draggedMember) {
      setDragOverMember(memberId)
    }
  }

  const handleDragLeave = () => {
    setDragOverMember(null)
  }

  const handleDrop = (e, targetMemberId) => {
    e.preventDefault()
    if (draggedMember && targetMemberId && draggedMember !== targetMemberId) {
      // Set the dragged member's parent to the target member
      updateMember(draggedMember, 'parentId', targetMemberId)

      // Auto-position: place child below parent
      const targetPos = memberPositions[targetMemberId]
      if (targetPos) {
        setMemberPositions(prev => ({
          ...prev,
          [draggedMember]: {
            x: targetPos.x,
            y: targetPos.y + 150
          }
        }))
      }
    }
    setDraggedMember(null)
    setDragOverMember(null)
  }

  const [isDraggingPosition, setIsDraggingPosition] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  const handleMemberMouseDown = (e, memberId) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON' || e.target.closest('label')) {
      return // Don't drag if clicking on input/button
    }

    const position = memberPositions[memberId] || { x: 100, y: 100 }
    const rect = e.currentTarget.getBoundingClientRect()
    const offsetX = e.clientX - rect.left
    const offsetY = e.clientY - rect.top

    setDraggedMember(memberId)
    setIsDraggingPosition(true)
    setDragOffset({ x: offsetX, y: offsetY })
  }

  const handleMouseMove = useCallback((e) => {
    if (!isDraggingPosition || !draggedMember || !chartContainerRef.current) return

    const container = chartContainerRef.current
    const rect = container.getBoundingClientRect()
    const x = e.clientX - rect.left - dragOffset.x
    const y = e.clientY - rect.top - dragOffset.y

    setMemberPositions(prev => ({
      ...prev,
      [draggedMember]: {
        x: Math.max(0, Math.min(x, rect.width - 220)), // Updated for new card width (max 220px)
        y: Math.max(0, Math.min(y, rect.height - 180)) // Updated for new card height (~180px)
      }
    }))
  }, [isDraggingPosition, draggedMember, dragOffset])

  const handleMouseUp = useCallback(() => {
    setIsDraggingPosition(false)
    setDraggedMember(null)
    setDragOverMember(null)
  }, [])

  useEffect(() => {
    if (isDraggingPosition) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDraggingPosition, handleMouseMove, handleMouseUp])

  // Get children of a member
  const getChildren = (memberId) => {
    return orgMembers.filter(m => m.parentId === memberId)
  }

  // Get parent of a member
  const getParent = (memberId) => {
    const member = orgMembers.find(m => m.id === memberId)
    if (member && member.parentId) {
      return orgMembers.find(m => m.id === member.parentId)
    }
    return null
  }

  // Get hierarchy level of a member (0 = top level, 1 = second level, 2 = third level, etc.)
  const getHierarchyLevel = (memberId) => {
    let level = 0
    let currentMember = orgMembers.find(m => m.id === memberId)
    
    while (currentMember && currentMember.parentId) {
      level++
      currentMember = orgMembers.find(m => m.id === currentMember.parentId)
    }
    
    return level
  }

  // Draw connection line between parent and child
  const drawConnection = (parentId, childId) => {
    const parent = memberPositions[parentId]
    const child = memberPositions[childId]
    if (!parent || !child) return null

    const styleClasses = getStyleClasses()
    const lineColor = styleClasses.lineColor

    // Card dimensions vary by style
    const cardWidth = 200 // Average of min 180px and max 220px
    // Modern style has shorter height due to horizontal layout, others are vertical
    const cardHeight = chartStyle === 'modern' ? 100 : 160 // Modern: ~100px, Others: ~160px
    const parentX = parent.x + (cardWidth / 2) // Center of card horizontally
    const parentY = parent.y + cardHeight // Bottom of card
    const childX = child.x + (cardWidth / 2) // Center of card horizontally
    const childY = child.y // Top of card

    const startX = parentX
    const startY = parentY
    const endX = childX
    const endY = childY
    const midY = startY + (endY - startY) / 2

    // Calculate bounding box for SVG
    const minX = Math.min(startX, endX) - 10
    const maxX = Math.max(startX, endX) + 10
    const minY = Math.min(startY, endY) - 10
    const maxY = Math.max(startY, endY) + 10

    return (
      <svg
        key={`line-${parentId}-${childId}`}
        className="absolute pointer-events-none z-0"
        style={{
          left: `${minX}px`,
          top: `${minY}px`,
          width: `${maxX - minX}px`,
          height: `${maxY - minY}px`
        }}
      >
        <path
          d={`M ${startX - minX} ${startY - minY} 
              L ${startX - minX} ${midY - minY}
              L ${endX - minX} ${midY - minY}
              L ${endX - minX} ${endY - minY}`}
          stroke={lineColor}
          strokeWidth="2"
          fill="none"
          markerEnd={`url(#arrowhead-${parentId}-${childId})`}
        />
        <defs>
          <marker
            id={`arrowhead-${parentId}-${childId}`}
            markerWidth="10"
            markerHeight="10"
            refX="5"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 10 3, 0 6" fill={lineColor} />
          </marker>
        </defs>
      </svg>
    )
  }

  // Draggable Member Card Component
  const DraggableMemberCard = ({ member }) => {
    const styleClasses = getStyleClasses()
    const position = memberPositions[member.id] || { x: 100, y: 100 }
    const isDragging = draggedMember === member.id
    const isDragOver = dragOverMember === member.id
    const hierarchyLevel = getHierarchyLevel(member.id)

    // Get minimal style colors based on hierarchy level
    const getMinimalCardStyle = () => {
      if (hierarchyLevel === 0) {
        // Top level - Red
        return {
          card: 'bg-red-600 border-2 rounded-lg shadow-sm',
          border: 'border-red-700',
          text: 'text-white',
          role: 'text-white',
          avatar: 'bg-white border-2 border-white',
          avatarIcon: 'text-white'
        }
      } else if (hierarchyLevel === 1) {
        // Second level - Light Blue
        return {
          card: 'bg-blue-500 border-2 rounded-lg shadow-sm',
          border: 'border-blue-600',
          text: 'text-white',
          role: 'text-white',
          avatar: 'bg-white border-2 border-white',
          avatarIcon: 'text-white'
        }
      } else {
        // Third level and below - Yellow
        return {
          card: 'bg-yellow-400 border-2 rounded-lg shadow-sm',
          border: 'border-yellow-500',
          text: 'text-gray-900',
          role: 'text-gray-900',
          avatar: 'bg-gray-900 border-2 border-gray-900',
          avatarIcon: 'text-gray-900'
        }
      }
    }

    // Get classic style colors based on hierarchy level
    const getClassicCardStyle = () => {
      if (hierarchyLevel === 0) {
        // Top level - Dark Blue
        return {
          card: 'bg-blue-800 border-2 rounded-lg shadow-md',
          border: 'border-blue-900',
          text: 'text-white',
          role: 'text-white',
          avatar: 'bg-white border-2 border-white',
          avatarIcon: 'text-gray-600'
        }
      } else if (hierarchyLevel === 1) {
        // Second level - Orange
        return {
          card: 'bg-orange-500 border-2 rounded-lg shadow-md',
          border: 'border-orange-600',
          text: 'text-white',
          role: 'text-white',
          avatar: 'bg-white border-2 border-white',
          avatarIcon: 'text-gray-600'
        }
      } else if (hierarchyLevel === 2 || hierarchyLevel === 3) {
        // Third and Fourth level - Blue
        return {
          card: 'bg-blue-500 border-2 rounded-lg shadow-md',
          border: 'border-blue-600',
          text: 'text-white',
          role: 'text-white',
          avatar: 'bg-white border-2 border-white',
          avatarIcon: 'text-gray-600'
        }
      } else {
        // Fifth level and below - Green
        return {
          card: 'bg-green-500 border-2 rounded-lg shadow-md',
          border: 'border-green-600',
          text: 'text-white',
          role: 'text-white',
          avatar: 'bg-white border-2 border-white',
          avatarIcon: 'text-gray-600'
        }
      }
    }

    // Get colorful style colors based on hierarchy level
    const getColorfulCardStyle = () => {
      if (hierarchyLevel === 0) {
        // Top level - Vibrant Red Gradient
        return {
          card: 'bg-transparent border-2 border-red-500 rounded-2xl shadow-none',
          border: 'border-red-500',
          text: 'text-gray-900',
          role: 'text-gray-900',
          avatar: 'bg-white',
          avatarIcon: 'text-gray-600',
          avatarBorderGradient: 'from-red-500 via-red-600 to-pink-600'
        }
      } else if (hierarchyLevel === 1) {
        // Second level - Vibrant Blue/Purple Gradient
        return {
          card: 'bg-transparent border-2 border-purple-500 rounded-2xl shadow-none',
          border: 'border-purple-500',
          text: 'text-gray-900',
          role: 'text-gray-900',
          avatar: 'bg-white',
          avatarIcon: 'text-gray-600',
          avatarBorderGradient: 'from-blue-500 via-purple-500 to-pink-500'
        }
      } else {
        // Third level and below - Vibrant Yellow/Orange Gradient
        return {
          card: 'bg-transparent border-2 border-orange-400 rounded-2xl shadow-none',
          border: 'border-orange-400',
          text: 'text-gray-900',
          role: 'text-gray-900',
          avatar: 'bg-white',
          avatarIcon: 'text-gray-600',
          avatarBorderGradient: 'from-yellow-400 via-orange-400 to-pink-400'
        }
      }
    }

    // Get professional style colors - uniform dark gray for all levels
    const getProfessionalCardStyle = () => {
      return {
        card: 'bg-black border border-gray-600 rounded-lg shadow-md',
        border: 'border-gray-600',
        text: 'text-white',
        role: 'text-white',
        avatar: 'bg-gray-700 border-2 border-white',
        avatarIcon: 'text-white',
        headerBg: '#64646F' // Background color for name and role section
      }
    }

    // Get the actual style classes to use
    const getCardStyle = () => {
      if (chartStyle === 'minimal') {
        return getMinimalCardStyle()
      }
      if (chartStyle === 'classic') {
        return getClassicCardStyle()
      }
      if (chartStyle === 'colorful') {
        return getColorfulCardStyle()
      }
      if (chartStyle === 'professional') {
        return getProfessionalCardStyle()
      }
      // Modern style or default
      return {
        card: styleClasses.card,
        border: styleClasses.border,
        text: styleClasses.text,
        role: styleClasses.role,
        avatar: styleClasses.avatar,
        avatarIcon: styleClasses.avatarIcon || 'text-white',
        headerBg: styleClasses.headerBg
      }
    }

    const cardStyle = getCardStyle()

    // Get ring color based on style - extract color from border class
    const getRingColor = () => {
      if (chartStyle === 'classic') {
        if (hierarchyLevel === 0) return 'ring-blue-400'
        if (hierarchyLevel === 1) return 'ring-orange-400'
        if (hierarchyLevel === 2 || hierarchyLevel === 3) return 'ring-blue-400'
        return 'ring-green-400'
      }
      if (chartStyle === 'minimal') {
        if (hierarchyLevel === 0) return 'ring-red-400'
        if (hierarchyLevel === 1) return 'ring-blue-400'
        return 'ring-yellow-400'
      }
      if (chartStyle === 'colorful') {
        if (hierarchyLevel === 0) return 'ring-red-400'
        if (hierarchyLevel === 1) return 'ring-purple-400'
        return 'ring-yellow-400'
      }
      if (chartStyle === 'professional') return 'ring-gray-400'
      return 'ring-blue-400' // modern
    }

    // Get button color based on style
    const getButtonColor = () => {
      if (chartStyle === 'classic') {
        if (hierarchyLevel === 0) return 'bg-blue-900 hover:bg-blue-950'
        if (hierarchyLevel === 1) return 'bg-orange-600 hover:bg-orange-700'
        if (hierarchyLevel === 2 || hierarchyLevel === 3) return 'bg-blue-600 hover:bg-blue-700'
        return 'bg-green-600 hover:bg-green-700'
      }
      if (chartStyle === 'minimal') {
        if (hierarchyLevel === 0) return 'bg-red-700 hover:bg-red-800'
        if (hierarchyLevel === 1) return 'bg-blue-600 hover:bg-blue-700'
        return 'bg-yellow-500 hover:bg-yellow-600'
      }
      if (chartStyle === 'colorful') {
        if (hierarchyLevel === 0) return 'bg-red-700 hover:bg-red-800'
        if (hierarchyLevel === 1) return 'bg-purple-700 hover:bg-purple-800'
        return 'bg-orange-500 hover:bg-orange-600'
      }
      if (chartStyle === 'professional') return 'bg-gray-600 hover:bg-gray-700'
      return 'bg-blue-600 hover:bg-blue-700' // modern
    }

    // Get drag over background color
    const getDragOverBg = () => {
      if (chartStyle === 'classic') {
        if (hierarchyLevel === 0) return 'bg-blue-900'
        if (hierarchyLevel === 1) return 'bg-orange-600'
        if (hierarchyLevel === 2 || hierarchyLevel === 3) return 'bg-blue-600'
        return 'bg-green-600'
      }
      if (chartStyle === 'minimal') {
        if (hierarchyLevel === 0) return 'bg-red-700'
        if (hierarchyLevel === 1) return 'bg-blue-600'
        return 'bg-yellow-500'
      }
      if (chartStyle === 'colorful') {
        return 'bg-transparent'
      }
      if (chartStyle === 'professional') return 'bg-gray-700'
      if (chartStyle === 'modern') return 'bg-blue-100'
      return 'bg-blue-50' // default
    }

    // Get drag over border color
    const getDragOverBorder = () => {
      if (chartStyle === 'classic') {
        if (hierarchyLevel === 0) return 'border-blue-950'
        if (hierarchyLevel === 1) return 'border-orange-700'
        if (hierarchyLevel === 2 || hierarchyLevel === 3) return 'border-blue-700'
        return 'border-green-700'
      }
      if (chartStyle === 'minimal') {
        if (hierarchyLevel === 0) return 'border-red-800'
        if (hierarchyLevel === 1) return 'border-blue-700'
        return 'border-yellow-600'
      }
      if (chartStyle === 'colorful') {
        if (hierarchyLevel === 0) return 'border-red-600'
        if (hierarchyLevel === 1) return 'border-purple-600'
        return 'border-orange-500'
      }
      if (chartStyle === 'professional') return 'border-gray-600'
      return 'border-blue-600' // modern
    }

    return (
      <div
        draggable
        onDragStart={(e) => handleDragStart(e, member.id)}
        onDragOver={(e) => handleDragOver(e, member.id)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, member.id)}
        onMouseDown={(e) => handleMemberMouseDown(e, member.id)}
        className={`absolute cursor-move z-10 transition-all ${isDragging ? 'opacity-70 scale-105 z-20' : ''
          } ${isDragOver ? `ring-4 ${getRingColor()} ring-offset-2 scale-105` : ''}`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: isDragging ? 'scale(1.05)' : isDragOver ? 'scale(1.05)' : 'scale(1)',
          userSelect: 'none'
        }}
      >
        <div className={`${cardStyle.card} flex flex-col items-center text-center min-w-[180px] max-w-[220px] ${isDragOver ? `${getDragOverBorder()} ${getDragOverBg()}` : cardStyle.border} relative group overflow-hidden rounded-lg shadow-md`}>
          {/* Modern Style - Two-tone Design */}
          {chartStyle === 'modern' && cardStyle.headerBg ? (
            <>
              {/* Top Section - Dark Blue with Role */}
              <div 
                className="w-full px-4 py-2.5 text-center"
                style={{ backgroundColor: cardStyle.headerBg }}
              >
                <div className={`font-bold ${cardStyle.role} text-sm uppercase leading-tight truncate`}>
                  {member.role || '[Designation]'}
                </div>
              </div>
              
              {/* Bottom Section - White with Avatar and Name (Horizontal Layout) */}
              <div className="w-full bg-white px-4 py-3 flex items-center gap-3">
                {/* Avatar - Left Side, Overlapping Top Section */}
                <div className="flex-shrink-0 relative -mt-6">
                  {member.photo ? (
                    <div className="relative">
                      <img
                        src={member.photo}
                        alt={member.name || 'Member'}
                        className="w-14 h-14 rounded-full object-cover border-2 border-white"
                      />
                      <label className={`absolute -bottom-1 -right-1 ${getButtonColor()} text-white rounded-full p-1 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity`}>
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
                          onClick={(e) => e.stopPropagation()}
                        />
                      </label>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          updateMember(member.id, 'photo', null)
                        }}
                        className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove photo"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <div className={`w-14 h-14 rounded-full ${cardStyle.avatar} flex items-center justify-center border-2 border-white`}>
                        <svg className={`w-8 h-8 ${cardStyle.avatarIcon}`} fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                      </div>
                      <label className={`absolute -bottom-1 -right-1 ${getButtonColor()} text-white rounded-full p-1 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity`} title="Add photo (optional)">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
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
                          onClick={(e) => e.stopPropagation()}
                        />
                      </label>
                    </div>
                  )}
                </div>
                
                {/* Name - Right Side */}
                <div className="flex-1 min-w-0 text-left">
                  <div className={`${cardStyle.text} text-sm font-medium leading-tight truncate`}>
                    {member.name || '[Name]'}
                  </div>
                </div>
              </div>
            </>
          ) : chartStyle === 'professional' && cardStyle.headerBg ? (
            <div 
              className="w-full px-4 py-3 text-center"
              style={{ backgroundColor: cardStyle.headerBg }}
            >
              <div className={`font-bold ${cardStyle.role} text-sm uppercase leading-tight mb-1 truncate`}>
                {member.role || '[Designation]'}
              </div>
              <div className={`${cardStyle.text} text-xs leading-tight truncate`}>
                {member.name || '[Name]'}
              </div>
            </div>
          ) : (
            <>
              {/* Photo or Generic Avatar - Top Center (Other Styles) */}
              <div className="flex-shrink-0 relative mb-3 p-4">
                {member.photo ? (
                  <div className="relative">
                    {/* Gradient Border Wrapper for Colorful Style */}
                    {chartStyle === 'colorful' && cardStyle.avatarBorderGradient ? (
                      <div className={`p-1 rounded-full bg-gradient-to-br ${cardStyle.avatarBorderGradient}`}>
                        <img
                          src={member.photo}
                          alt={member.name || 'Member'}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      </div>
                    ) : (
                      <img
                        src={member.photo}
                        alt={member.name || 'Member'}
                        className={`w-16 h-16 rounded-full object-cover border-2 ${
                          chartStyle === 'professional' || chartStyle === 'classic'
                            ? 'border-white' 
                            : chartStyle === 'minimal'
                              ? (hierarchyLevel >= 2 ? 'border-gray-900' : 'border-white') 
                              : cardStyle.border
                        }`}
                      />
                    )}
                    <label className={`absolute -bottom-1 -right-1 ${getButtonColor()} text-white rounded-full p-1 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity`}>
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
                        onClick={(e) => e.stopPropagation()}
                      />
                    </label>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        updateMember(member.id, 'photo', null)
                      }}
                      className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove photo"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    {/* Generic Avatar Icon */}
                    {chartStyle === 'colorful' && cardStyle.avatarBorderGradient ? (
                      <div className={`p-1 rounded-full bg-gradient-to-br ${cardStyle.avatarBorderGradient}`}>
                        <div className={`w-16 h-16 rounded-full ${cardStyle.avatar} flex items-center justify-center`}>
                          <svg className={`w-9 h-9 ${cardStyle.avatarIcon}`} fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                          </svg>
                        </div>
                      </div>
                    ) : (
                      <div className={`w-16 h-16 rounded-full ${cardStyle.avatar} flex items-center justify-center border-2 ${
                        chartStyle === 'professional' || chartStyle === 'classic'
                          ? 'border-white' 
                          : chartStyle === 'minimal'
                            ? (hierarchyLevel >= 2 ? 'border-gray-900' : 'border-white') 
                            : cardStyle.border
                      }`}>
                        <svg className={`w-9 h-9 ${cardStyle.avatarIcon}`} fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                      </div>
                    )}
                    <label className={`absolute -bottom-1 -right-1 ${getButtonColor()} text-white rounded-full p-1 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity`} title="Add photo (optional)">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
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
                        onClick={(e) => e.stopPropagation()}
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* Text Content - Below Photo (Other Styles) */}
              <div className="flex-1 w-full min-w-0 px-4">
                <div className={`font-bold ${cardStyle.role} text-sm uppercase leading-tight mb-1 truncate`}>
                  {member.role || '[Designation]'}
                </div>
                <div className={`${cardStyle.text} text-xs leading-tight mb-2 truncate`}>
                  {member.name || '[Name]'}
                </div>
              </div>
            </>
          )}

          {/* Photo or Generic Avatar - Below Name/Role (Professional Style) */}
          {chartStyle === 'professional' && (
            <div className="flex-shrink-0 relative mb-3 px-4 pt-4">
              {member.photo ? (
                <div className="relative">
                  <img
                    src={member.photo}
                    alt={member.name || 'Member'}
                    className="w-16 h-16 rounded-full object-cover border-2 border-white"
                  />
                  <label className={`absolute -bottom-1 -right-1 ${getButtonColor()} text-white rounded-full p-1 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity`}>
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
                      onClick={(e) => e.stopPropagation()}
                    />
                  </label>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      updateMember(member.id, 'photo', null)
                    }}
                    className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove photo"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <div className={`w-16 h-16 rounded-full ${cardStyle.avatar} flex items-center justify-center border-2 border-white`}>
                    <svg className={`w-9 h-9 ${cardStyle.avatarIcon}`} fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>
                  <label className={`absolute -bottom-1 -right-1 ${getButtonColor()} text-white rounded-full p-1 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity`} title="Add photo (optional)">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
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
                      onClick={(e) => e.stopPropagation()}
                    />
                  </label>
                </div>
              )}
            </div>
          )}
            {/* Show contact info for minimal, colorful, and professional styles */}
            {(chartStyle === 'minimal' || chartStyle === 'colorful' || chartStyle === 'professional') && (
              <div className={`w-full space-y-1.5 ${chartStyle === 'professional' ? 'px-4 pb-4 pt-2 border-t border-gray-600' : 'px-4 mt-2 pt-2 border-t border-opacity-20'}`}>
                {member.phone && (
                  <div className={`flex items-center gap-1.5 ${cardStyle.text} text-[10px] leading-tight truncate`}>
                    {chartStyle === 'professional' && (
                      <svg className="w-3 h-3 text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    )}
                    <span>{member.phone}</span>
                  </div>
                )}
                {member.email && (
                  <div className={`flex items-center gap-1.5 ${cardStyle.text} text-[10px] leading-tight truncate`}>
                    {chartStyle === 'professional' && (
                      <svg className="w-3 h-3 text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    )}
                    <span>{member.email}</span>
                  </div>
                )}
                {(!member.phone && !member.email) && (
                  <>
                    <div className={`${cardStyle.text} text-[10px] leading-tight truncate`}>
                      {member.phone || '[Phone]'}
                    </div>
                    <div className={`${cardStyle.text} text-[10px] leading-tight truncate`}>
                      {member.email || '[Email]'}
                    </div>
                  </>
                )}
              </div>
            )}

          {/* Remove Button - Hidden by default, shown on hover */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              removeMember(member.id)
            }}
            className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-700 transition-colors opacity-0 group-hover:opacity-100"
            title="Remove member"
          >
            ×
          </button>
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
            <div className="flex items-center justify-between mb-2">
              <div>
                <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 mb-2">
                  Organization Chart
                </h1>
                <p className="text-sm lg:text-base text-gray-600">
                  Create and manage your organizational hierarchy structure.
                </p>
              </div>
              <div className="flex gap-3 flex-wrap">
                <label className="px-4 lg:px-6 py-2 lg:py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors shadow-md hover:shadow-lg flex items-center gap-2 text-sm lg:text-base cursor-pointer">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Upload Chart Image
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleChartImageUpload}
                    className="hidden"
                  />
                </label>
                {chartImage && (
                  <button
                    onClick={removeChartImage}
                    className="px-4 lg:px-6 py-2 lg:py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors shadow-md hover:shadow-lg flex items-center gap-2 text-sm lg:text-base"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Remove Image
                  </button>
                )}
                <button 
                  onClick={handleDownloadPNG}
                  className="px-4 lg:px-6 py-2 lg:py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg flex items-center gap-2 text-sm lg:text-base"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download PNG
                </button>
                <button 
                  onClick={handleDownloadPDF}
                  className="px-4 lg:px-6 py-2 lg:py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors shadow-md hover:shadow-lg flex items-center gap-2 text-sm lg:text-base"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Download PDF
                </button>
                <button 
                  onClick={handlePrint}
                  className="px-4 lg:px-6 py-2 lg:py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors shadow-md hover:shadow-lg flex items-center gap-2 text-sm lg:text-base"
                >
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
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4">Member Management</h2>
                <p className="text-sm text-gray-600 mb-6">
                  Add members with <span className="font-semibold">name, designation, and contact number</span>. Photo is optional.
                </p>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Organization Members</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{orgMembers.length} members</span>
                      <button
                        onClick={addMember}
                        className="w-8 h-8 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                        title="Add new member"
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
                          {/* Photo Upload - Optional */}
                          <div className="mb-3 flex flex-col items-center">
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
                                  title="Remove photo"
                                >
                                  ×
                                </button>
                              </div>
                            ) : (
                              <div className="relative">
                                <div className={`w-16 h-16 rounded-full ${getStyleClasses().avatar} flex items-center justify-center`}>
                                  <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                  </svg>
                                </div>
                                <label className="absolute bottom-0 right-0 bg-gray-600 text-white rounded-full p-1 cursor-pointer hover:bg-gray-700" title="Add photo (optional)">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
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
                              </div>
                            )}
                            <p className="text-xs text-gray-500 mt-1">Photo (Optional)</p>
                          </div>
                          
                          {/* Required Fields */}
                          <div className="space-y-2">
                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-1">Name *</label>
                              <input
                                type="text"
                                placeholder="Enter name"
                                value={member.name}
                                onChange={(e) => updateMember(member.id, 'name', e.target.value)}
                                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-1">Designation *</label>
                              <input
                                type="text"
                                placeholder="Enter designation/role"
                                value={member.role}
                                onChange={(e) => updateMember(member.id, 'role', e.target.value)}
                                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-1">Contact Number *</label>
                              <input
                                type="tel"
                                placeholder="Enter contact number"
                                value={member.phone}
                                onChange={(e) => updateMember(member.id, 'phone', e.target.value)}
                                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-1">Email (Optional)</label>
                              <input
                                type="email"
                                placeholder="Enter email"
                                value={member.email}
                                onChange={(e) => updateMember(member.id, 'email', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-1">Reports To</label>
                              <select
                                value={member.parentId || ''}
                                onChange={(e) => updateMember(member.id, 'parentId', e.target.value || null)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
                              >
                                <option value="">No Parent (Top Level)</option>
                                {orgMembers.filter(m => m.id !== member.id).map(parent => (
                                  <option key={parent.id} value={parent.id}>
                                    {parent.name || parent.role || `Member ${parent.id}`}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <button
                              onClick={() => removeMember(member.id)}
                              className="w-full px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium transition-colors"
                            >
                              Remove Member
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
              {/* Chart Settings Panel */}
              <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-md border-2 border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Chart Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Style Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Chart Style</label>
                    <select
                      value={chartStyle}
                      onChange={(e) => setChartStyle(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
                    >
                      <option value="modern">Modern</option>
                      <option value="classic">Classic</option>
                      <option value="minimal">Minimal</option>
                      <option value="colorful">Colorful</option>
                      <option value="professional">Professional</option>
                    </select>
                  </div>

                  {/* Paper Size Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Paper Size</label>
                    <select
                      value={paperSize}
                      onChange={(e) => setPaperSize(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
                    >
                      <option value="A4">A4</option>
                      <option value="A3">A3</option>
                      <option value="A5">A5</option>
                      <option value="Legal">Legal</option>
                    </select>
                  </div>

                  {/* Orientation Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Orientation</label>
                    <select
                      value={orientation}
                      onChange={(e) => setOrientation(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
                    >
                      <option value="portrait">Portrait</option>
                      <option value="landscape">Landscape</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4 text-xs text-gray-500">
                  <p>Current size: {getPaperDimensions().width} × {getPaperDimensions().height} px ({paperSize} - {orientation})</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-md border-2 border-blue-500">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Organization Chart</h2>
                  <div className="text-sm text-gray-600">
                    <p className="mb-1">💡 Drag members to reposition</p>
                    <p>Drop one member on another to link them</p>
                  </div>
                </div>

                {orgMembers.length === 0 ? (
                  <div
                    ref={chartContainerRef}
                    className="relative bg-gray-50 rounded-lg overflow-auto mx-auto border-2 border-gray-300"
                    style={{
                      width: `${Math.min(getPaperDimensions().width, 1200)}px`,
                      height: `${Math.min(getPaperDimensions().height, 800)}px`,
                      maxWidth: '100%',
                      aspectRatio: `${getPaperDimensions().width} / ${getPaperDimensions().height}`
                    }}
                  >
                    {/* Background Organization Chart Image */}
                    {chartImage ? (
                      <div className="absolute inset-0 z-0">
                        <img
                          src={chartImage}
                          alt="Organization Chart Background"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="text-center py-12 absolute inset-0 flex flex-col items-center justify-center">
                        <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <p className="text-gray-500 text-lg mb-4">No organization members yet</p>
                        <p className="text-gray-400 text-sm">Add members to start building your organization chart</p>
                        <p className="text-gray-400 text-sm mt-2">Or upload an organization chart image above</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    ref={chartContainerRef}
                    className="relative bg-gray-50 rounded-lg overflow-auto mx-auto border-2 border-gray-300"
                    style={{
                      width: `${Math.min(getPaperDimensions().width, 1200)}px`,
                      height: `${Math.min(getPaperDimensions().height, 800)}px`,
                      maxWidth: '100%',
                      aspectRatio: `${getPaperDimensions().width} / ${getPaperDimensions().height}`
                    }}
                    onDragOver={(e) => {
                      e.preventDefault()
                      e.dataTransfer.dropEffect = 'move'
                    }}
                    onDrop={(e) => {
                      e.preventDefault()
                      setDraggedMember(null)
                      setDragOverMember(null)
                    }}
                  >
                    {/* Background Organization Chart Image */}
                    {chartImage && (
                      <div className="absolute inset-0 z-0">
                        <img
                          src={chartImage}
                          alt="Organization Chart Background"
                          className="w-full h-full object-contain"
                          style={{ opacity: 0.3 }}
                        />
                      </div>
                    )}

                    {/* Render all members as draggable cards */}
                    {orgMembers.map((member) => (
                      <DraggableMemberCard key={member.id} member={member} />
                    ))}

                    {/* Connection lines from parents to children */}
                    {orgMembers.map((member) => {
                      if (member.parentId) {
                        return drawConnection(member.parentId, member.id)
                      }
                      return null
                    })}
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

