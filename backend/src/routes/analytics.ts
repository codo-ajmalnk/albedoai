import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get dashboard analytics (admin only)
router.get('/dashboard', authenticateToken, requireRole(['SUPER_ADMIN', 'SUPPORT_AGENT']), async (req: AuthRequest, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period as string);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get basic counts
    const [
      totalFeedback,
      openFeedback,
      closedFeedback,
      totalArticles,
      totalCategories,
      recentFeedback
    ] = await Promise.all([
      prisma.feedback.count(),
      prisma.feedback.count({ where: { status: 'OPEN' } }),
      prisma.feedback.count({ where: { status: { in: ['CLOSED', 'RESOLVED'] } } }),
      prisma.article.count({ where: { isPublished: true } }),
      prisma.category.count({ where: { isActive: true } }),
      prisma.feedback.count({
        where: {
          createdAt: { gte: startDate }
        }
      })
    ]);

    // Get feedback by status
    const feedbackByStatus = await prisma.feedback.groupBy({
      by: ['status'],
      _count: { status: true }
    });

    // Get feedback by priority
    const feedbackByPriority = await prisma.feedback.groupBy({
      by: ['priority'],
      _count: { priority: true }
    });

    // Get feedback by category
    const feedbackByCategory = await prisma.feedback.groupBy({
      by: ['categoryId'],
      _count: { categoryId: true },
      where: {
        categoryId: { not: null }
      }
    });

    // Get category names for feedback by category
    const categoryIds = feedbackByCategory.map(item => item.categoryId).filter((id): id is string => id !== null);
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true, color: true }
    });

    const feedbackByCategoryWithNames = feedbackByCategory.map(item => {
      const category = categories.find(cat => cat.id === item.categoryId);
      return {
        categoryId: item.categoryId,
        categoryName: category?.name || 'Unknown',
        categoryColor: category?.color || '#6b7280',
        count: item._count.categoryId
      };
    });

    // Get recent activity
    const recentActivity = await prisma.feedback.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        category: {
          select: { name: true, color: true }
        }
      }
    });

    // Get response time analytics
    const feedbackWithReplies = await prisma.feedback.findMany({
      where: {
        replies: { some: {} }
      },
      include: {
        replies: {
          orderBy: { createdAt: 'asc' },
          take: 1
        }
      }
    });

    const responseTimes = feedbackWithReplies.map(feedback => {
      const firstReply = feedback.replies[0];
      if (firstReply) {
        return firstReply.createdAt.getTime() - feedback.createdAt.getTime();
      }
      return null;
    }).filter(Boolean) as number[];

    const avgResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
      : 0;

    res.json({
      overview: {
        totalFeedback,
        openFeedback,
        closedFeedback,
        totalArticles,
        totalCategories,
        recentFeedback,
        avgResponseTime: Math.round(avgResponseTime / (1000 * 60 * 60)) // Convert to hours
      },
      feedbackByStatus: feedbackByStatus.map(item => ({
        status: item.status,
        count: item._count.status
      })),
      feedbackByPriority: feedbackByPriority.map(item => ({
        priority: item.priority,
        count: item._count.priority
      })),
      feedbackByCategory: feedbackByCategoryWithNames,
      recentActivity: recentActivity.map(feedback => ({
        id: feedback.id,
        subject: feedback.subject,
        email: feedback.email,
        status: feedback.status,
        priority: feedback.priority,
        category: feedback.category,
        createdAt: feedback.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get article analytics
router.get('/articles', authenticateToken, requireRole(['SUPER_ADMIN', 'SUPPORT_AGENT']), async (req: AuthRequest, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period as string);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get most viewed articles
    const mostViewed = await prisma.article.findMany({
      where: { isPublished: true },
      orderBy: { viewCount: 'desc' },
      take: 10,
      include: {
        category: {
          select: { name: true, color: true }
        }
      }
    });

    // Get recently published articles
    const recentlyPublished = await prisma.article.findMany({
      where: {
        isPublished: true,
        createdAt: { gte: startDate }
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        category: {
          select: { name: true, color: true }
        }
      }
    });

    // Get articles by category
    const articlesByCategory = await prisma.article.groupBy({
      by: ['categoryId'],
      _count: { categoryId: true },
      where: { isPublished: true }
    });

    const categoryIds = articlesByCategory.map(item => item.categoryId);
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true, color: true }
    });

    const articlesByCategoryWithNames = articlesByCategory.map(item => {
      const category = categories.find(cat => cat.id === item.categoryId);
      return {
        categoryId: item.categoryId,
        categoryName: category?.name || 'Unknown',
        categoryColor: category?.color || '#6b7280',
        count: item._count.categoryId
      };
    });

    res.json({
      mostViewed: mostViewed.map(article => ({
        id: article.id,
        title: article.title,
        slug: article.slug,
        viewCount: article.viewCount,
        category: article.category,
        createdAt: article.createdAt
      })),
      recentlyPublished: recentlyPublished.map(article => ({
        id: article.id,
        title: article.title,
        slug: article.slug,
        viewCount: article.viewCount,
        category: article.category,
        createdAt: article.createdAt
      })),
      byCategory: articlesByCategoryWithNames
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch article analytics' });
  }
});

// Get feedback trends over time
router.get('/trends', authenticateToken, requireRole(['SUPER_ADMIN', 'SUPPORT_AGENT']), async (req: AuthRequest, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period as string);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get daily feedback counts
    const dailyFeedback = await prisma.$queryRaw`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM feedback 
      WHERE created_at >= ${startDate}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    // Get feedback by status over time
    const statusTrends = await prisma.$queryRaw`
      SELECT 
        DATE(created_at) as date,
        status,
        COUNT(*) as count
      FROM feedback 
      WHERE created_at >= ${startDate}
      GROUP BY DATE(created_at), status
      ORDER BY date ASC, status ASC
    `;

    res.json({
      dailyFeedback,
      statusTrends
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trends' });
  }
});

export default router;
