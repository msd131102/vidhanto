const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const { authenticate } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/blogs/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Get all published blogs (public)
router.get('/', async function(req, res) {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      search,
      sort = 'publishedAt',
      order = 'desc'
    } = req.query;

    const query = { status: 'published' };

    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }

    // Search functionality
    if (search) {
      query.$text = { $search: search };
    }

    const skip = (page - 1) * limit;

    const blogs = await Blog.find(query)
      .select('-comments')
      .sort({ [sort]: order === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Blog.countDocuments(query);

    // Get categories for filter
    const categories = await Blog.distinct('category', { status: 'published' });

    res.json({
      success: true,
      data: {
        blogs,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        },
        categories
      }
    });
  } catch (error) {
    console.error('Get blogs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blogs',
      error: error.message
    });
  }
});

// Get related blogs (must come before /:slug route)
router.get('/related/:slug', async function(req, res) {
  try {
    const { slug } = req.params;
    const { limit = 3 } = req.query;

    const blog = await Blog.findOne({ slug, status: 'published' });
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    const relatedBlogs = await Blog.find({
      _id: { $ne: blog._id },
      category: blog.category,
      status: 'published'
    })
    .select('title slug excerpt featuredImage readTime publishedAt')
    .limit(parseInt(limit))
    .sort({ publishedAt: -1 });

    res.json({
      success: true,
      data: { blogs: relatedBlogs }
    });
  } catch (error) {
    console.error('Get related blogs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch related blogs',
      error: error.message
    });
  }
});

// Admin routes (protected)
// Get all blogs (including drafts) - Admin only
router.get('/admin/all', authenticate, async function(req, res) {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      search
    } = req.query;

    const query = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const skip = (page - 1) * limit;

    const blogs = await Blog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Blog.countDocuments(query);

    res.json({
      success: true,
      data: {
        blogs,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get all blogs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blogs',
      error: error.message
    });
  }
});

// Create new blog - Admin only
router.post('/admin', authenticate, upload.single('featuredImage'), async function(req, res) {
  try {
    const blogData = {
      ...req.body,
      author: {
        name: req.user.name,
        email: req.user.email,
        bio: req.user.bio || '',
        avatar: req.user.avatar || ''
      }
    };

    // Add featured image if uploaded
    if (req.file) {
      blogData.featuredImage = `/uploads/blogs/${req.file.filename}`;
    }

    // Parse tags and categories
    if (req.body.tags) {
      blogData.tags = Array.isArray(req.body.tags) 
        ? req.body.tags 
        : req.body.tags.split(',').map(tag => tag.trim()).filter(Boolean);
    }

    const blog = new Blog(blogData);
    await blog.save();

    res.status(201).json({
      success: true,
      message: 'Blog created successfully',
      data: { blog }
    });
  } catch (error) {
    console.error('Create blog error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create blog',
      error: error.message
    });
  }
});

// Update blog - Admin only
router.put('/admin/:id', authenticate, upload.single('featuredImage'), async function(req, res) {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Add featured image if uploaded
    if (req.file) {
      updateData.featuredImage = `/uploads/blogs/${req.file.filename}`;
    }

    // Parse tags
    if (req.body.tags) {
      updateData.tags = Array.isArray(req.body.tags) 
        ? req.body.tags 
        : req.body.tags.split(',').map(tag => tag.trim()).filter(Boolean);
    }

    const blog = await Blog.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    res.json({
      success: true,
      message: 'Blog updated successfully',
      data: { blog }
    });
  } catch (error) {
    console.error('Update blog error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update blog',
      error: error.message
    });
  }
});

// Delete blog - Admin only
router.delete('/admin/:id', authenticate, async function(req, res) {
  try {
    const { id } = req.params;

    const blog = await Blog.findByIdAndDelete(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    res.json({
      success: true,
      message: 'Blog deleted successfully'
    });
  } catch (error) {
    console.error('Delete blog error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete blog',
      error: error.message
    });
  }
});

// Add comment to blog
router.post('/:slug/comments', authenticate, async function(req, res) {
  try {
    const { slug } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required'
      });
    }

    const blog = await Blog.findOne({ slug, status: 'published' });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    blog.comments.push({
      user: req.user._id,
      content: content.trim()
    });

    await blog.save();

    // Populate user info for response
    await blog.populate('comments.user', 'name email avatar');

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: { 
        comment: blog.comments[blog.comments.length - 1] 
      }
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add comment',
      error: error.message
    });
  }
});

// Like/unlike blog
router.post('/:slug/like', authenticate, async function(req, res) {
  try {
    const { slug } = req.params;

    const blog = await Blog.findOne({ slug, status: 'published' });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    await Blog.findByIdAndUpdate(blog._id, { $inc: { likes: 1 } });

    res.json({
      success: true,
      message: 'Blog liked successfully',
      data: { likes: blog.likes + 1 }
    });
  } catch (error) {
    console.error('Like blog error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to like blog',
      error: error.message
    });
  }
});

// Get blog statistics
router.get('/admin/stats', authenticate, async function(req, res) {
  try {
    const stats = await Blog.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$count' },
          published: {
            $sum: {
              $cond: [{ $eq: ['$_id', 'published'] }, '$count', 0]
            }
          },
          draft: {
            $sum: {
              $cond: [{ $eq: ['$_id', 'draft'] }, '$count', 0]
            }
          }
        }
      }
    ]);

    const categoryStats = await Blog.aggregate([
      { $match: { status: 'published' } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const totalViews = await Blog.aggregate([
      { $match: { status: 'published' } },
      {
        $group: {
          _id: null,
          totalViews: { $sum: '$views' },
          totalLikes: { $sum: '$likes' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || { total: 0, published: 0, draft: 0 },
        categories: categoryStats,
        engagement: totalViews[0] || { totalViews: 0, totalLikes: 0 }
      }
    });
  } catch (error) {
    console.error('Get blog stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blog statistics',
      error: error.message
    });
  }
});

// Get single blog by slug (public) - Must come after all specific routes
router.get('/:slug', async function(req, res) {
  try {
    const { slug } = req.params;

    const blog = await Blog.findOne({ 
      slug, 
      status: 'published' 
    }).populate('comments.user', 'name email');

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Increment views
    await Blog.findByIdAndUpdate(blog._id, { $inc: { views: 1 } });

    res.json({
      success: true,
      data: { blog }
    });
  } catch (error) {
    console.error('Get blog error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blog',
      error: error.message
    });
  }
});

module.exports = router;
