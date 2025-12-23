import { useState, useRef } from 'react'

const CustomizeSignage = ({ activeNav, setActiveNav, sidebarOpen, setSidebarOpen }) => {
  const [backgroundImage, setBackgroundImage] = useState(null)
  const [elements, setElements] = useState([])
  const [selectedElement, setSelectedElement] = useState(null)
  const [iconLibrary, setIconLibrary] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
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
        addElement({
          type: 'icon',
          content: reader.result,
          x: 50,
          y: 50,
          size: 80,
          id: Date.now()
        })
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
      size: 80,
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
            <div className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
              <span className="text-white font-bold text-lg md:text-xl lg:text-2xl">U</span>
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-sm sm:text-base md:text-lg lg:text-2xl xl:text-3xl font-bold text-gray-900 truncate">
                <span className="hidden sm:inline">Customize Signage</span>
                <span className="sm:hidden">Customize</span>
              </h1>
              <p className="hidden sm:block text-xs md:text-sm lg:text-base text-gray-600 truncate">
                Create custom signage with images, icons, and text
              </p>
            </div>
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

        {/* Sidebar */}
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
              <div
                className={`p-3 lg:p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                  activeNav === 'customize-signage'
                    ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg shadow-green-500/30'
                    : 'text-gray-700 hover:bg-gray-200 hover:shadow-md'
                }`}
                onClick={() => {
                  setActiveNav('customize-signage')
                  setSidebarOpen(false)
                }}
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
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 lg:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Left Sidebar - Tools */}
            <div className="lg:col-span-1 space-y-4">
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
                          className={`p-2 rounded-lg cursor-pointer transition-colors ${
                            selectedElement === el.id ? 'bg-blue-100 border-2 border-blue-500' : 'bg-gray-100 hover:bg-gray-200'
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
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Font Size: {selectedEl.fontSize}px</label>
                        <input
                          type="range"
                          min="12"
                          max="120"
                          value={selectedEl.fontSize}
                          onChange={(e) => updateElement(selectedEl.id, { fontSize: parseInt(e.target.value) })}
                          className="w-full"
                        />
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
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Size: {selectedEl.size}px</label>
                      <input
                        type="range"
                        min="20"
                        max="200"
                        value={selectedEl.size}
                        onChange={(e) => updateElement(selectedEl.id, { size: parseInt(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>
              )}
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
                      onClick={(e) => handleElementClick(e, element)}
                      onMouseDown={(e) => handleMouseDown(e, element)}
                      style={{
                        position: 'absolute',
                        left: `${element.x}%`,
                        top: `${element.y}%`,
                        transform: 'translate(-50%, -50%)',
                        cursor: 'move',
                        border: selectedElement === element.id ? '2px dashed #3B82F6' : 'none',
                        padding: selectedElement === element.id ? '4px' : '0',
                        zIndex: selectedElement === element.id ? 1000 : 100
                      }}
                    >
                      {element.type === 'text' && (
                        <div
                          style={{
                            fontSize: `${element.fontSize}px`,
                            color: element.color,
                            fontFamily: element.fontFamily,
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {element.content}
                        </div>
                      )}
                      {element.type === 'emoji' && (
                        <div style={{ fontSize: `${element.size}px` }}>
                          {element.content}
                        </div>
                      )}
                      {element.type === 'icon' && (
                        <img
                          src={element.content}
                          alt="Icon"
                          style={{
                            width: `${element.size}px`,
                            height: `${element.size}px`,
                            objectFit: 'contain'
                          }}
                        />
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

