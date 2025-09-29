import express from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  order: z.number().int().min(0).optional()
});

const updateCategorySchema = createCategorySchema.partial();

// Get all categories
router.get('/', async (req, res) => {
  try {
    const { includeArticles = 'false' } = req.query;
    
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      include: {
        articles: includeArticles === 'true' ? {
          where: { isPublished: true },
          select: {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
            createdAt: true
          }
        } : false,
        _count: {
          select: {
            articles: { where: { isPublished: true } },
            feedbacks: true
          }
        }
      },
      orderBy: { order: 'asc' }
    });

    res.json({ categories });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get single category
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        articles: {
          where: { isPublished: true },
          select: {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
            createdAt: true,
            viewCount: true
          },
          orderBy: { order: 'asc' }
        },
        _count: {
          select: {
            articles: { where: { isPublished: true } },
            feedbacks: true
          }
        }
      }
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ category });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch category' });
  }
});

// Create category (admin only)
router.post('/', authenticateToken, requireRole(['SUPER_ADMIN', 'SUPPORT_AGENT']), async (req: AuthRequest, res) => {
  try {
    const data = createCategorySchema.parse(req.body);
    
    // Generate slug from name
    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const category = await prisma.category.create({
      data: {
        ...data,
        slug
      }
    });

    res.status(201).json({ category });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// Update category (admin only)
router.put('/:id', authenticateToken, requireRole(['SUPER_ADMIN', 'SUPPORT_AGENT']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const data = updateCategorySchema.parse(req.body);

    // If name is being updated, regenerate slug
    if (data.name) {
      (data as any).slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    const category = await prisma.category.update({
      where: { id },
      data
    });

    res.json({ category });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// Delete category (admin only)
router.delete('/:id', authenticateToken, requireRole(['SUPER_ADMIN']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Check if category has articles
    const articleCount = await prisma.article.count({
      where: { categoryId: id }
    });

    if (articleCount > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete category with articles. Please move or delete articles first.' 
      });
    }

    await prisma.category.delete({
      where: { id }
    });

    res.json({ message: 'Category deleted successfully' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// Toggle category status (admin only)
router.patch('/:id/toggle', authenticateToken, requireRole(['SUPER_ADMIN', 'SUPPORT_AGENT']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id }
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: { isActive: !category.isActive }
    });

    res.json({ category: updatedCategory });
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle category status' });
  }
});

export default router;
