import express from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const createArticleSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  excerpt: z.string().optional(),
  tags: z.array(z.string()).optional(),
  categoryId: z.string(),
  isPublished: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  order: z.number().int().min(0).optional()
});

const updateArticleSchema = createArticleSchema.partial();

// Get all articles
router.get('/', async (req, res) => {
  try {
    const { 
      categoryId, 
      published = 'true', 
      featured, 
      search,
      page = '1',
      limit = '10'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    
    if (categoryId) where.categoryId = categoryId;
    if (published === 'true') where.isPublished = true;
    if (featured === 'true') where.isFeatured = true;
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { content: { contains: search as string, mode: 'insensitive' } },
        { tags: { has: search as string } }
      ];
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        include: {
          category: {
            select: { id: true, name: true, slug: true, color: true }
          }
        },
        orderBy: [
          { isFeatured: 'desc' },
          { order: 'asc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limitNum
      }),
      prisma.article.count({ where })
    ]);

    res.json({
      articles,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

// Get single article
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        category: {
          select: { id: true, name: true, slug: true, color: true }
        }
      }
    });

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Increment view count
    await prisma.article.update({
      where: { id },
      data: { viewCount: { increment: 1 } }
    });

    res.json({ article });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch article' });
  }
});

// Get article by slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    const article = await prisma.article.findUnique({
      where: { slug },
      include: {
        category: {
          select: { id: true, name: true, slug: true, color: true }
        }
      }
    });

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Increment view count
    await prisma.article.update({
      where: { slug },
      data: { viewCount: { increment: 1 } }
    });

    res.json({ article });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch article' });
  }
});

// Create article (admin only)
router.post('/', authenticateToken, requireRole(['SUPER_ADMIN', 'SUPPORT_AGENT']), async (req: AuthRequest, res) => {
  try {
    const data = createArticleSchema.parse(req.body);
    
    // Generate slug from title
    const slug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId }
    });

    if (!category) {
      return res.status(400).json({ error: 'Category not found' });
    }

    const article = await prisma.article.create({
      data: {
        ...data,
        slug
      },
      include: {
        category: {
          select: { id: true, name: true, slug: true, color: true }
        }
      }
    });

    res.status(201).json({ article });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to create article' });
  }
});

// Update article (admin only)
router.put('/:id', authenticateToken, requireRole(['SUPER_ADMIN', 'SUPPORT_AGENT']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const data = updateArticleSchema.parse(req.body);

    // If title is being updated, regenerate slug
    if (data.title) {
      (data as any).slug = data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    const article = await prisma.article.update({
      where: { id },
      data,
      include: {
        category: {
          select: { id: true, name: true, slug: true, color: true }
        }
      }
    });

    res.json({ article });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Article not found' });
    }
    res.status(500).json({ error: 'Failed to update article' });
  }
});

// Delete article (admin only)
router.delete('/:id', authenticateToken, requireRole(['SUPER_ADMIN', 'SUPPORT_AGENT']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    await prisma.article.delete({
      where: { id }
    });

    res.json({ message: 'Article deleted successfully' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Article not found' });
    }
    res.status(500).json({ error: 'Failed to delete article' });
  }
});

// Toggle article status (admin only)
router.patch('/:id/toggle-publish', authenticateToken, requireRole(['SUPER_ADMIN', 'SUPPORT_AGENT']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const article = await prisma.article.findUnique({
      where: { id }
    });

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const updatedArticle = await prisma.article.update({
      where: { id },
      data: { isPublished: !article.isPublished },
      include: {
        category: {
          select: { id: true, name: true, slug: true, color: true }
        }
      }
    });

    res.json({ article: updatedArticle });
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle article status' });
  }
});

// Toggle featured status (admin only)
router.patch('/:id/toggle-featured', authenticateToken, requireRole(['SUPER_ADMIN', 'SUPPORT_AGENT']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const article = await prisma.article.findUnique({
      where: { id }
    });

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const updatedArticle = await prisma.article.update({
      where: { id },
      data: { isFeatured: !article.isFeatured },
      include: {
        category: {
          select: { id: true, name: true, slug: true, color: true }
        }
      }
    });

    res.json({ article: updatedArticle });
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle featured status' });
  }
});

export default router;
