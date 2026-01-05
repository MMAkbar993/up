import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminSidebar from './AdminSidebar'
import AdminHeader from './AdminHeader'

const AdminTemplates = () => {
  const [activeNav, setActiveNav] = useState('templates')
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is authenticated
    const isAuthenticated = sessionStorage.getItem('adminAuthenticated')
    if (!isAuthenticated) {
      navigate('/admin/login')
    }
  }, [navigate])

  // Mock template data
  const templates = [
    {
      id: 1,
      title: 'Scaffolding Erection...',
      description: 'Scaffolding assembly in progress - Stay clear',
      tags: ['danger', 'high'],
      industry: 'construction'
    },
    {
      id: 2,
      title: 'Scaffolding Inspection...',
      description: 'All scaffolding must be inspected before use',
      tags: ['mandatory', 'high'],
      industry: 'construction'
    },
    {
      id: 3,
      title: 'Incomplete Scaffolding',
      description: 'Scaffolding under construction - Do not use',
      tags: ['warning', 'critical'],
      industry: 'construction'
    },
    {
      id: 4,
      title: 'Scaffolding Load Limit',
      description: 'Maximum load capacity warning',
      tags: ['warning', 'high'],
      industry: 'construction'
    },
    {
      id: 5,
      title: 'Scaffolding Access Point',
      description: 'Authorized access point only',
      tags: ['mandatory', 'medium'],
      industry: 'construction'
    },
    {
      id: 6,
      title: 'Deep Excavation Work',
      description: 'Deep excavation in progress - Cave-in hazard',
      tags: ['danger', 'critical'],
      industry: 'construction'
    },
    {
      id: 7,
      title: 'Trench Shoring Required',
      description: 'Trench shoring must be installed',
      tags: ['mandatory', 'critical'],
      industry: 'construction'
    },
    {
      id: 8,
      title: 'Excavation Edge...',
      description: 'Excavation edge - Fall hazard',
      tags: ['warning', 'high'],
      industry: 'construction'
    },
    {
      id: 9,
      title: 'Underground Utilities...',
      description: 'Underground utilities - Call before you dig',
      tags: ['danger', 'critical'],
      industry: 'construction'
    },
    {
      id: 10,
      title: 'Excavation Atmospher...',
      description: 'Atmosphere must be tested before entry',
      tags: ['mandatory', 'critical'],
      industry: 'construction'
    },
    {
      id: 11,
      title: 'Hot Work - Welding...',
      description: 'Welding operations in progress - Fire hazard',
      tags: ['danger', 'high'],
      industry: 'construction'
    },
    {
      id: 12,
      title: 'Welding Fumes Hazard',
      description: 'Hazardous welding fumes - Ventilation required',
      tags: ['warning', 'high'],
      industry: 'construction'
    }
  ]

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = 
      template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || template.industry === categoryFilter
    return matchesSearch && matchesCategory
  })

  const getTagColor = (tag) => {
    const colors = {
      danger: 'bg-red-100 text-red-800 border-red-300',
      high: 'bg-orange-100 text-orange-800 border-orange-300',
      warning: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      critical: 'bg-pink-100 text-pink-800 border-pink-300',
      mandatory: 'bg-blue-100 text-blue-800 border-blue-300',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-300'
    }
    return colors[tag] || 'bg-gray-100 text-gray-800 border-gray-300'
  }

  const handleEdit = (templateId) => {
    console.log('Edit template:', templateId)
    // Handle edit action
  }

  const handleDelete = (templateId) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      console.log('Delete template:', templateId)
      // Handle delete action
    }
  }

  const handleAddTemplate = () => {
    console.log('Add new template')
    // Handle add template action
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />

      <div className="flex max-w-[1920px] mx-auto">
        <AdminSidebar activeNav={activeNav} setActiveNav={setActiveNav} />

        <main className="flex-1 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Template Management</h1>
              <p className="text-gray-600">{filteredTemplates.length} of {templates.length} templates</p>
            </div>
            <button
              onClick={handleAddTemplate}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Template
            </button>
          </div>

          {/* Search and Filter */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or description..."
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <svg
                className="w-5 h-5 text-gray-400 absolute left-3 top-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Categories</option>
                <option value="construction">Construction</option>
                <option value="manufacturing">Manufacturing</option>
                <option value="warehouse">Warehouse</option>
                <option value="healthcare">Healthcare</option>
                <option value="office">Office</option>
              </select>
            </div>
          </div>

          {/* Template Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="bg-white rounded-xl border border-gray-200 shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-2">{template.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{template.description}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {template.tags.map((tag, index) => (
                    <span
                      key={index}
                      className={`px-2 py-1 text-xs font-semibold rounded border ${getTagColor(tag)}`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Industry */}
                <div className="text-sm text-gray-500 mb-4">
                  Industry: <span className="font-medium text-gray-700">{template.industry}</span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(template.id)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(template.id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No templates found matching your search criteria.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default AdminTemplates
