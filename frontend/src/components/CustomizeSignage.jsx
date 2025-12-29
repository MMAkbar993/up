import { useState, useRef } from 'react'
import Sidebar from './Sidebar'

const CustomizeSignage = ({ activeNav, setActiveNav, sidebarOpen, setSidebarOpen }) => {
  const [backgroundImage, setBackgroundImage] = useState(null)
  const [elements, setElements] = useState([])
  const [selectedElement, setSelectedElement] = useState(null)
  const [iconLibrary, setIconLibrary] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeStartData, setResizeStartData] = useState({ size: 0, width: 0, height: 0, x: 0, y: 0 })
  const [resizeCorner, setResizeCorner] = useState(null) // 'top-left', 'top-right', 'bottom-left', 'bottom-right', 'top', 'right', 'bottom', 'left'
  const fileInputRef = useRef(null)
  const iconInputRef = useRef(null)

  const iconOptions = [
    '💧', '⚡', '🔥', '⚠️', '🚫', '✅', '📢', '🚨', '🔒', '👷',
    '🏗️', '⚙️', '🧪', '🔧', '📋', '📍', '🔴', '🟡', '🟢', '🔵'
  ]

  const handleBackgroundUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setBackgroundImage(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleIconUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const img = new Image()
        img.onload = () => {
          // Initialize with image dimensions, but cap at 500px max
          const maxSize = 500
          let width = img.width
          let height = img.height
          
          if (width > maxSize || height > maxSize) {
            const scale = Math.min(maxSize / width, maxSize / height)
            width = width * scale
            height = height * scale
          }
          
          // Ensure minimum size
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
            type: 'icon',
            content: reader.result,
            x: 50,
            y: 50,
            size: Math.max(Math.round(width), Math.round(height)), // For backward compatibility
            width: Math.round(width),
            height: Math.round(height),
            id: Date.now()
          })
        }
        img.src = reader.result
      }
      reader.readAsDataURL(file)
    }
  }

  const addElement = (element) => {
    setElements([...elements, element])
    setSelectedElement(element.id)
  }

  const addTextElement = () => {
    const newElement = {
      type: 'text',
      content: 'Your Text Here',
      x: 50,
      y: 50,
      fontSize: 24,
      color: '#000000',
      fontFamily: 'Arial',
      width: 200, // Initial width in pixels
      height: 50, // Initial height in pixels
      id: Date.now()
    }
    addElement(newElement)
  }

  const addIconElement = (icon) => {
    const newElement = {
      type: 'emoji',
      content: icon,
      x: 50,
      y: 50,
      size: 80, // For backward compatibility
      width: 80,
      height: 80,
      id: Date.now()
    }
    addElement(newElement)
    setIconLibrary(false)
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
  }

  const handleElementClick = (e, element) => {
    e.stopPropagation()
    setSelectedElement(element.id)
  }

  const handleMouseDown = (e, element) => {
    e.stopPropagation()
    setSelectedElement(element.id)
    setIsDragging(true)
  }

  const handleMouseMove = (e) => {
    if (isResizing && selectedElement) {
      const deltaX = e.clientX - resizeStartData.x
      const deltaY = e.clientY - resizeStartData.y

      const selectedEl = elements.find(el => el.id === selectedElement)
      if (!selectedEl) return

      const handle = resizeCorner
      const isCorner = ['top-left', 'top-right', 'bottom-left', 'bottom-right'].includes(handle)
      const isEdge = ['top', 'bottom', 'left', 'right'].includes(handle)

      if (selectedEl.type === 'text') {
        // Text resizing: use width and height for container, fontSize scales proportionally
        const handle = resizeCorner
        const isCorner = ['top-left', 'top-right', 'bottom-left', 'bottom-right'].includes(handle)
        const isEdge = ['top', 'bottom', 'left', 'right'].includes(handle)
        
        let newWidth = resizeStartData.width || 200
        let newHeight = resizeStartData.height || 50
        let newFontSize = selectedEl.fontSize || 24

        if (isCorner) {
          // Corner resizing: maintain aspect ratio, resize both dimensions
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
          
          // Scale fontSize proportionally based on average size change
          const sizeRatio = newSize / currentSize
          newFontSize = Math.max(12, Math.min(200, (selectedEl.fontSize || 24) * sizeRatio))
        } else if (isEdge) {
          // Edge resizing: resize only the perpendicular dimension
          if (handle === 'top' || handle === 'bottom') {
            const delta = handle === 'top' ? -deltaY : deltaY
            newHeight = Math.max(30, Math.min(500, (resizeStartData.height || 50) + delta))
            newWidth = resizeStartData.width || 200
            // Scale fontSize based on height change
            const heightRatio = newHeight / (resizeStartData.height || 50)
            newFontSize = Math.max(12, Math.min(200, (selectedEl.fontSize || 24) * heightRatio))
          } else if (handle === 'left' || handle === 'right') {
            const delta = handle === 'left' ? -deltaX : deltaX
            newWidth = Math.max(50, Math.min(1000, (resizeStartData.width || 200) + delta))
            newHeight = resizeStartData.height || 50
            // Keep fontSize the same for width-only changes, or scale slightly
            // For text, width changes usually don't affect fontSize as much
          }
        }

        updateElement(selectedElement, {
          width: Math.round(newWidth),
          height: Math.round(newHeight),
          fontSize: Math.round(newFontSize)
        })
      } else if (selectedEl.type === 'icon' || selectedEl.type === 'emoji') {
        // Icon/Image resizing: use width and height separately
        let newWidth = resizeStartData.width || resizeStartData.size || 80
        let newHeight = resizeStartData.height || resizeStartData.size || 80

        if (isCorner) {
          // Corner resizing: maintain aspect ratio, resize both dimensions
          const aspectRatio = (resizeStartData.width || resizeStartData.size || 80) / (resizeStartData.height || resizeStartData.size || 80)
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
          // Edge resizing: resize only the perpendicular dimension
          if (handle === 'top' || handle === 'bottom') {
            const delta = handle === 'top' ? -deltaY : deltaY
            newHeight = Math.max(20, Math.min(500, (resizeStartData.height || resizeStartData.size || 80) + delta))
            newWidth = resizeStartData.width || resizeStartData.size || 80
          } else if (handle === 'left' || handle === 'right') {
            const delta = handle === 'left' ? -deltaX : deltaX
            newWidth = Math.max(20, Math.min(500, (resizeStartData.width || resizeStartData.size || 80) + delta))
            newHeight = resizeStartData.height || resizeStartData.size || 80
          }
        }

        updateElement(selectedElement, {
          width: Math.round(newWidth),
          height: Math.round(newHeight),
          size: Math.max(Math.round(newWidth), Math.round(newHeight)) // For backward compatibility
        })
      }
      return
    }

    if (!isDragging || !selectedElement) return

    const canvas = e.currentTarget.closest('.canvas-container')
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    updateElement(selectedElement, {
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y))
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setIsResizing(false)
    setResizeCorner(null)
    setResizeStartData({ size: 0, width: 0, height: 0, x: 0, y: 0 })
  }

  const handleResizeStart = (e, element, corner) => {
    e.preventDefault()
    e.stopPropagation()
    setIsResizing(true)
    setSelectedElement(element.id)
    setResizeCorner(corner)

    if (element.type === 'text') {
      const currentWidth = element.width || 200
      const currentHeight = element.height || 50
      
      // Initialize width/height if not set
      if (!element.width || !element.height) {
        updateElement(element.id, {
          width: currentWidth,
          height: currentHeight
        })
      }
      
      setResizeStartData({
        size: element.fontSize || 24,
        width: currentWidth,
        height: currentHeight,
        x: e.clientX,
        y: e.clientY
      })
    } else if (element.type === 'icon' || element.type === 'emoji') {
      const currentWidth = element.width || element.size || 80
      const currentHeight = element.height || element.size || 80
      
      // Initialize width/height if not set
      if (!element.width || !element.height) {
        updateElement(element.id, {
          width: currentWidth,
          height: currentHeight
        })
      }
      
      setResizeStartData({
        size: element.size || Math.max(currentWidth, currentHeight),
        width: currentWidth,
        height: currentHeight,
        x: e.clientX,
        y: e.clientY
      })
    }
  }

  const handleCanvasClick = () => {
    setSelectedElement(null)
  }

  const selectedEl = elements.find(el => el.id === selectedElement)

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
        <main className="flex-1 p-4 sm:p-6 md:p-8 lg:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Left Sidebar - Tools */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-[120px] space-y-4 lg:max-h-[calc(100vh-140px)] lg:overflow-y-auto lg:pb-4">
              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Tools</h2>

                {/* Upload Background */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Background Image</label>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Upload Background
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleBackgroundUpload}
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

                {/* Add Icon */}
                <div className="mb-4">
                  <button
                    onClick={() => setIconLibrary(!iconLibrary)}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    Add Icon
                  </button>
                  <button
                    onClick={() => iconInputRef.current?.click()}
                    className="w-full mt-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium"
                  >
                    Upload Icon Image
                  </button>
                  <input
                    ref={iconInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleIconUpload}
                    className="hidden"
                  />
                  {iconLibrary && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg max-h-48 overflow-y-auto">
                      <div className="grid grid-cols-4 gap-2">
                        {iconOptions.map((icon, idx) => (
                          <button
                            key={idx}
                            onClick={() => addIconElement(icon)}
                            className="p-2 text-2xl hover:bg-gray-200 rounded-lg transition-colors"
                          >
                            {icon}
                          </button>
                        ))}
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
                          className={`p-2 rounded-lg cursor-pointer transition-colors ${selectedElement === el.id ? 'bg-blue-100 border-2 border-blue-500' : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                          onClick={() => setSelectedElement(el.id)}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-gray-700 capitalize">
                              {el.type === 'emoji' ? 'Icon' : el.type}
                            </span>
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
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Font Size</label>
                        <div className="flex gap-2 mb-2">
                          <select
                            value={selectedEl.fontSize}
                            onChange={(e) => updateElement(selectedEl.id, { fontSize: parseInt(e.target.value) })}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          >
                            {[8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 60, 72, 96, 120, 144, 200].map(size => (
                              <option key={size} value={size}>{size}pt</option>
                            ))}
                          </select>
                        </div>
                        <input
                          type="range"
                          min="12"
                          max="200"
                          value={selectedEl.fontSize}
                          onChange={(e) => updateElement(selectedEl.id, { fontSize: parseInt(e.target.value) })}
                          className="w-full"
                        />
                        <div className="text-xs text-gray-500 mt-1 text-center">{selectedEl.fontSize}px</div>
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Color</label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={selectedEl.color}
                            onChange={(e) => updateElement(selectedEl.id, { color: e.target.value })}
                            className="w-12 h-10 rounded border border-gray-300"
                          />
                          <input
                            type="text"
                            value={selectedEl.color}
                            onChange={(e) => updateElement(selectedEl.id, { color: e.target.value })}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {(selectedEl.type === 'icon' || selectedEl.type === 'emoji') && (
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Size: {selectedEl.size || Math.max(selectedEl.width || 80, selectedEl.height || 80)}px
                      </label>
                      <input
                        type="range"
                        min="20"
                        max="200"
                        value={selectedEl.size || Math.max(selectedEl.width || 80, selectedEl.height || 80)}
                        onChange={(e) => {
                          const newSize = parseInt(e.target.value)
                          const currentWidth = selectedEl.width || selectedEl.size || 80
                          const currentHeight = selectedEl.height || selectedEl.size || 80
                          const aspectRatio = currentWidth / currentHeight
                          let newWidth = currentWidth
                          let newHeight = currentHeight
                          
                          // Maintain aspect ratio when resizing via slider
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
                  )}
                </div>
              )}
              </div>
            </div>

            {/* Canvas Area */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md">
                <div
                  className="canvas-container relative bg-white border-2 border-gray-300 rounded-lg overflow-hidden"
                  style={{ aspectRatio: '4/3', minHeight: '500px' }}
                  onClick={handleCanvasClick}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                >
                  {backgroundImage && (
                    <img
                      src={backgroundImage}
                      alt="Background"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  )}

                  {elements.map((element) => (
                    <div
                      key={element.id}
                      onClick={(e) => {
                        if (!e.target.classList.contains('resize-handle')) {
                          handleElementClick(e, element)
                        }
                      }}
                      onMouseDown={(e) => {
                        if (!e.target.classList.contains('resize-handle')) {
                          handleMouseDown(e, element)
                        }
                      }}
                      style={{
                        position: 'absolute',
                        left: `${element.x}%`,
                        top: `${element.y}%`,
                        transform: 'translate(-50%, -50%)',
                        width: (element.type === 'icon' || element.type === 'emoji') 
                          ? `${element.width || element.size || 80}px` 
                          : (element.type === 'text' 
                            ? `${element.width || 200}px` 
                            : 'auto'),
                        height: (element.type === 'icon' || element.type === 'emoji') 
                          ? `${element.height || element.size || 80}px` 
                          : (element.type === 'text' 
                            ? `${element.height || 50}px` 
                            : 'auto'),
                        cursor: isResizing && selectedElement === element.id ? 'nwse-resize' : 'move',
                        border: selectedElement === element.id ? '2px dashed #3B82F6' : 'none',
                        padding: selectedElement === element.id ? '4px' : '0',
                        zIndex: selectedElement === element.id ? 1000 : 100,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {element.type === 'text' && (
                        <div
                          style={{
                            fontSize: `${element.fontSize || 24}px`,
                            color: element.color || '#000000',
                            fontFamily: element.fontFamily || 'Arial',
                            width: `${element.width || 200}px`,
                            height: `${element.height || 50}px`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            wordWrap: 'break-word',
                            overflow: 'hidden',
                            textAlign: 'center',
                            userSelect: 'none',
                            lineHeight: '1.2'
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
                      {element.type === 'icon' && (
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
                      {/* Resize Handles - All Four Corners and Edges */}
                      {selectedElement === element.id && (
                        <>
                          {/* Top Left Corner */}
                          <div
                            className="resize-handle"
                            style={{
                              position: 'absolute',
                              top: '-6px',
                              left: '-6px',
                              width: '12px',
                              height: '12px',
                              backgroundColor: '#3B82F6',
                              border: '1.5px solid white',
                              borderRadius: '50%',
                              cursor: 'nwse-resize',
                              zIndex: 1001,
                              boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                            }}
                            onMouseDown={(e) => handleResizeStart(e, element, 'top-left')}
                          />
                          {/* Top Edge */}
                          <div
                            className="resize-handle"
                            style={{
                              position: 'absolute',
                              top: '-6px',
                              left: '50%',
                              transform: 'translateX(-50%)',
                              width: '12px',
                              height: '12px',
                              backgroundColor: '#3B82F6',
                              border: '1.5px solid white',
                              borderRadius: '50%',
                              cursor: 'ns-resize',
                              zIndex: 1001,
                              boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                            }}
                            onMouseDown={(e) => handleResizeStart(e, element, 'top')}
                          />
                          {/* Top Right Corner */}
                          <div
                            className="resize-handle"
                            style={{
                              position: 'absolute',
                              top: '-6px',
                              right: '-6px',
                              width: '12px',
                              height: '12px',
                              backgroundColor: '#3B82F6',
                              border: '1.5px solid white',
                              borderRadius: '50%',
                              cursor: 'nesw-resize',
                              zIndex: 1001,
                              boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                            }}
                            onMouseDown={(e) => handleResizeStart(e, element, 'top-right')}
                          />
                          {/* Right Edge */}
                          <div
                            className="resize-handle"
                            style={{
                              position: 'absolute',
                              top: '50%',
                              right: '-6px',
                              transform: 'translateY(-50%)',
                              width: '12px',
                              height: '12px',
                              backgroundColor: '#3B82F6',
                              border: '1.5px solid white',
                              borderRadius: '50%',
                              cursor: 'ew-resize',
                              zIndex: 1001,
                              boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                            }}
                            onMouseDown={(e) => handleResizeStart(e, element, 'right')}
                          />
                          {/* Bottom Right Corner */}
                          <div
                            className="resize-handle"
                            style={{
                              position: 'absolute',
                              bottom: '-6px',
                              right: '-6px',
                              width: '12px',
                              height: '12px',
                              backgroundColor: '#3B82F6',
                              border: '1.5px solid white',
                              borderRadius: '50%',
                              cursor: 'nwse-resize',
                              zIndex: 1001,
                              boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                            }}
                            onMouseDown={(e) => handleResizeStart(e, element, 'bottom-right')}
                          />
                          {/* Bottom Edge */}
                          <div
                            className="resize-handle"
                            style={{
                              position: 'absolute',
                              bottom: '-6px',
                              left: '50%',
                              transform: 'translateX(-50%)',
                              width: '12px',
                              height: '12px',
                              backgroundColor: '#3B82F6',
                              border: '1.5px solid white',
                              borderRadius: '50%',
                              cursor: 'ns-resize',
                              zIndex: 1001,
                              boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                            }}
                            onMouseDown={(e) => handleResizeStart(e, element, 'bottom')}
                          />
                          {/* Bottom Left Corner */}
                          <div
                            className="resize-handle"
                            style={{
                              position: 'absolute',
                              bottom: '-6px',
                              left: '-6px',
                              width: '12px',
                              height: '12px',
                              backgroundColor: '#3B82F6',
                              border: '1.5px solid white',
                              borderRadius: '50%',
                              cursor: 'nesw-resize',
                              zIndex: 1001,
                              boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                            }}
                            onMouseDown={(e) => handleResizeStart(e, element, 'bottom-left')}
                          />
                          {/* Left Edge */}
                          <div
                            className="resize-handle"
                            style={{
                              position: 'absolute',
                              top: '50%',
                              left: '-6px',
                              transform: 'translateY(-50%)',
                              width: '12px',
                              height: '12px',
                              backgroundColor: '#3B82F6',
                              border: '1.5px solid white',
                              borderRadius: '50%',
                              cursor: 'ew-resize',
                              zIndex: 1001,
                              boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                            }}
                            onMouseDown={(e) => handleResizeStart(e, element, 'left')}
                          />
                        </>
                      )}
                    </div>
                  ))}

                  {elements.length === 0 && !backgroundImage && (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                      <div className="text-center">
                        <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-lg font-semibold">Start Creating</p>
                        <p className="text-sm">Upload a background, add text, or insert icons</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex gap-4">
                  <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                    Export Image
                  </button>
                  <button
                    onClick={() => {
                      setElements([])
                      setBackgroundImage(null)
                      setSelectedElement(null)
                    }}
                    className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default CustomizeSignage

