import express from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import Fuse from 'fuse.js';

const router = express.Router();
const prisma = new PrismaClient();

// Validation schema
const searchSchema = z.object({
  query: z.string().min(1).max(100),
  limit: z.number().int().min(1).max(20).optional()
});

// Search articles for AI chat
router.post('/articles', async (req, res) => {
  try {
    const { query, limit = 5 } = searchSchema.parse(req.body);

    // Get all published articles
    const articles = await prisma.article.findMany({
      where: { isPublished: true },
      include: {
        category: {
          select: { name: true, color: true }
        }
      }
    });

    // Configure Fuse.js for fuzzy search
    const fuse = new Fuse(articles, {
      keys: [
        { name: 'title', weight: 0.4 },
        { name: 'content', weight: 0.3 },
        { name: 'excerpt', weight: 0.2 },
        { name: 'tags', weight: 0.1 }
      ],
      threshold: parseFloat(process.env.SEARCH_THRESHOLD || '0.3'),
      includeScore: true
    });

    const results = fuse.search(query).slice(0, limit);

    const score = (s?: number) => typeof s === 'number' ? s : 1;
    const toExcerpt = (content?: string | null, fallback?: string | null) => {
      const text = fallback || '';
      if (content && content.length > 0) return content.slice(0, 200) + (content.length > 200 ? '...' : '');
      if (text.length === 0) return '';
      return text.slice(0, 200) + (text.length > 200 ? '...' : '');
    };

    const searchResults = results.map(result => ({
      id: result.item.id,
      title: result.item.title,
      excerpt: toExcerpt(result.item.excerpt, result.item.content),
      slug: result.item.slug,
      url: `/docs/${result.item.slug}`,
      category: result.item.category,
      score: score(result.score),
      relevance: score(result.score) < 0.3 ? 'high' : score(result.score) < 0.6 ? 'medium' : 'low'
    }));

    res.json({ 
      results: searchResults,
      query,
      total: results.length
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(500).json({ error: 'Search failed' });
  }
});

// Search categories
router.post('/categories', async (req, res) => {
  try {
    const { query, limit = 10 } = searchSchema.parse(req.body);

    const categories = await prisma.category.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: {
            articles: { where: { isPublished: true } }
          }
        }
      }
    });

    const fuse = new Fuse(categories, {
      keys: [
        { name: 'name', weight: 0.6 },
        { name: 'description', weight: 0.4 }
      ],
      threshold: 0.4,
      includeScore: true
    });

    const results = fuse.search(query).slice(0, limit);

    const searchResults = results.map(result => ({
      id: result.item.id,
      name: result.item.name,
      description: result.item.description,
      slug: result.item.slug,
      icon: result.item.icon,
      color: result.item.color,
      articleCount: result.item._count.articles,
      score: result.score
    }));

    res.json({ 
      results: searchResults,
      query,
      total: results.length
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(500).json({ error: 'Search failed' });
  }
});

// Global search (articles + categories)
router.post('/global', async (req, res) => {
  try {
    const { query, limit = 10 } = searchSchema.parse(req.body);

    const [articles, categories] = await Promise.all([
      prisma.article.findMany({
        where: { isPublished: true },
        include: {
          category: {
            select: { name: true, color: true }
          }
        }
      }),
      prisma.category.findMany({
        where: { isActive: true },
        include: {
          _count: {
            select: {
              articles: { where: { isPublished: true } }
            }
          }
        }
      })
    ]);

    // Search articles
    const articleFuse = new Fuse(articles, {
      keys: [
        { name: 'title', weight: 0.4 },
        { name: 'content', weight: 0.3 },
        { name: 'excerpt', weight: 0.2 },
        { name: 'tags', weight: 0.1 }
      ],
      threshold: 0.4,
      includeScore: true
    });

    const articleResults = articleFuse.search(query).slice(0, Math.ceil(limit / 2));

    // Search categories
    const categoryFuse = new Fuse(categories, {
      keys: [
        { name: 'name', weight: 0.6 },
        { name: 'description', weight: 0.4 }
      ],
      threshold: 0.4,
      includeScore: true
    });

    const categoryResults = categoryFuse.search(query).slice(0, Math.floor(limit / 2));

    const results = {
      articles: articleResults.map(result => ({
        id: result.item.id,
        title: result.item.title,
        excerpt: result.item.excerpt || result.item.content.substring(0, 150) + '...',
        slug: result.item.slug,
        category: result.item.category,
        type: 'article',
        score: result.score
      })),
      categories: categoryResults.map(result => ({
        id: result.item.id,
        name: result.item.name,
        description: result.item.description,
        slug: result.item.slug,
        icon: result.item.icon,
        color: result.item.color,
        articleCount: result.item._count.articles,
        type: 'category',
        score: result.score
      }))
    };

    res.json({ 
      results,
      query,
      total: articleResults.length + categoryResults.length
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(500).json({ error: 'Search failed' });
  }
});

export default router;
