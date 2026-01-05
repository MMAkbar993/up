import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminSidebar from './AdminSidebar'
import AdminHeader from './AdminHeader'

const AdminBlogManagement = () => {
  const [activeNav, setActiveNav] = useState('blog')
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is authenticated
    const isAuthenticated = sessionStorage.getItem('adminAuthenticated')
    if (!isAuthenticated) {
      navigate('/admin/login')
    }
  }, [navigate])

  // Mock statistics
  const stats = {
    totalPosts: 0,
    totalComments: 0,
    documentRequests: 0
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />

      <div className="flex max-w-[1920px] mx-auto">
        <AdminSidebar activeNav={activeNav} setActiveNav={setActiveNav} />

        <main className="flex-1 p-6 space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Posts */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{stats.totalPosts}</div>
              <div className="text-sm text-gray-600">Total Posts</div>
            </div>

            {/* Total Comments */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{stats.totalComments}</div>
              <div className="text-sm text-gray-600">Total Comments</div>
            </div>

            {/* Document Requests */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{stats.documentRequests}</div>
              <div className="text-sm text-gray-600">Document Requests</div>
            </div>
          </div>

          {/* Blog Posts Management Section */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-md p-6">
            <div className="flex items-center gap-3 mb-6">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h2 className="text-xl font-bold text-gray-900">Blog Posts Management</h2>
            </div>
            <div className="text-center py-12 text-gray-500">
              No blog posts yet
            </div>
          </div>

          {/* Document Requests Management Section */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-md p-6">
            <div className="flex items-center gap-3 mb-6">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h2 className="text-xl font-bold text-gray-900">Document Requests Management</h2>
            </div>
            <div className="text-center py-12 text-gray-500">
              No document requests yet
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminBlogManagement
