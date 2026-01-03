import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Clock, User, Heart, Share2, Search, Filter,
  ChevronRight, ArrowLeft, ArrowRight, Eye, Tag
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadBlogs();
  }, [currentPage, selectedCategory, searchTerm]);

  const loadBlogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 9,
        category: selectedCategory,
        search: searchTerm
      });

      const response = await fetch(`/api/blogs?${params}`);
      const data = await response.json();

      if (data.success) {
        setBlogs(data.data.blogs);
        setCategories(data.data.categories);
        setTotalPages(data.data.pagination.pages);
      }
    } catch (error) {
      console.error('Failed to load blogs:', error);
      toast.error('Failed to load blogs');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    setSearchTerm(e.target.search.value);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Legal': 'bg-blue-100 text-blue-800',
      'Business': 'bg-green-100 text-green-800',
      'Compliance': 'bg-purple-100 text-purple-800',
      'Technology': 'bg-orange-100 text-orange-800',
      'News': 'bg-red-100 text-red-800',
      'Guide': 'bg-indigo-100 text-indigo-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Legal Blog</h1>
              <p className="text-slate-600">Expert insights on Indian law and business</p>
            </div>
            
            <div className="flex items-center gap-4">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  name="search"
                  placeholder="Search articles..."
                  defaultValue={searchTerm}
                  className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                />
              </form>
              
              <button
                onClick={() => setSelectedCategory(selectedCategory === 'all' ? 'Legal' : 'all')}
                className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <Filter className="w-4 h-4" />
                <span>{selectedCategory === 'all' ? 'Show Categories' : 'All Categories'}</span>
              </button>
            </div>
          </div>

          {/* Category Filter */}
          {selectedCategory !== 'all' && (
            <div className="border-t border-slate-200 py-4">
              <div className="flex items-center gap-4 flex-wrap">
                <button
                  onClick={() => handleCategoryChange('all')}
                  className="px-4 py-2 rounded-lg font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  All Categories
                </button>
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => handleCategoryChange(category)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Blog Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {blogs.map((blog, index) => (
                <motion.article
                  key={blog._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all cursor-pointer overflow-hidden"
                  onClick={() => window.location.href = `/blog/${blog.slug}`}
                >
                  {/* Featured Image */}
                  {blog.featuredImage && (
                    <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-600 relative overflow-hidden">
                      <img
                        src={blog.featuredImage}
                        alt={blog.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                    </div>
                  )}

                  <div className="p-6">
                    {/* Category and Date */}
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(blog.category)}`}>
                        {blog.category}
                      </span>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(blog.publishedAt)}</span>
                      </div>
                    </div>

                    {/* Title and Excerpt */}
                    <h3 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2">
                      {blog.title}
                    </h3>
                    <p className="text-slate-600 mb-4 line-clamp-3">
                      {blog.excerpt}
                    </p>

                    {/* Tags */}
                    {blog.tags && blog.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {blog.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-medium"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{blog.readTime || 5} min read</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          <span>{blog.views}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button className="flex items-center gap-1 text-pink-600 hover:text-pink-700 transition-colors">
                          <Heart className="w-4 h-4" />
                          <span>{blog.likes || 0}</span>
                        </button>
                        
                        <button className="text-slate-600 hover:text-slate-700 transition-colors">
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-12">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
            
            <span className="px-4 py-2 bg-slate-100 rounded-lg font-medium">
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors flex items-center gap-2"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Blog;
