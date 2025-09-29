import express from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';
import { sendEmail } from '../services/email';

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const createFeedbackSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  subject: z.string().min(1).max(200),
  message: z.string().min(10).max(5000),
  categoryId: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional()
});

const updateFeedbackSchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'CLOSED', 'RESOLVED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional()
});

const createReplySchema = z.object({
  content: z.string().min(1).max(5000),
  isInternal: z.boolean().optional()
});

const createNoteSchema = z.object({
  content: z.string().min(1).max(1000)
});

// Submit feedback (public)
router.post('/submit', async (req, res) => {
  try {
    const data = createFeedbackSchema.parse(req.body);
    
    const feedback = await prisma.feedback.create({
      data: {
        ...data,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      },
      include: {
        category: {
          select: { id: true, name: true, color: true }
        }
      }
    });

    // Send acknowledgment email
    try {
      await sendEmail({
        to: feedback.email,
        subject: 'Support Request Received - Albedo',
        template: 'feedback-acknowledgment',
        data: {
          name: feedback.name || 'there',
          subject: feedback.subject,
          token: feedback.token,
          category: feedback.category?.name || 'General'
        }
      });
    } catch (emailError) {
      console.error('Failed to send acknowledgment email:', emailError);
    }

    res.status(201).json({ 
      feedback: {
        id: feedback.id,
        token: feedback.token,
        status: feedback.status
      }
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

// Get feedback by token (public)
router.get('/token/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    const feedback = await prisma.feedback.findUnique({
      where: { token },
      include: {
        category: {
          select: { id: true, name: true, color: true }
        },
        replies: {
          where: { isInternal: false },
          include: {
            user: {
              select: { name: true, email: true }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    res.json({ feedback });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

// Get all feedback (admin only)
router.get('/', authenticateToken, requireRole(['SUPER_ADMIN', 'SUPPORT_AGENT']), async (req: AuthRequest, res) => {
  try {
    const { 
      status, 
      priority, 
      categoryId,
      search,
      page = '1',
      limit = '20',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (categoryId) where.categoryId = categoryId;
    if (search) {
      where.OR = [
        { subject: { contains: search as string, mode: 'insensitive' } },
        { message: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const orderBy: any = {};
    orderBy[sortBy as string] = sortOrder;

    const [feedbacks, total] = await Promise.all([
      prisma.feedback.findMany({
        where,
        include: {
          category: {
            select: { id: true, name: true, color: true }
          },
          replies: {
            where: { isInternal: false },
            select: { id: true, createdAt: true }
          },
          _count: {
            select: { replies: true, notes: true }
          }
        },
        orderBy,
        skip,
        take: limitNum
      }),
      prisma.feedback.count({ where })
    ]);

    res.json({
      feedbacks,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

// Get single feedback (admin only)
router.get('/:id', authenticateToken, requireRole(['SUPER_ADMIN', 'SUPPORT_AGENT']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    
    const feedback = await prisma.feedback.findUnique({
      where: { id },
      include: {
        category: {
          select: { id: true, name: true, color: true }
        },
        replies: {
          include: {
            user: {
              select: { id: true, name: true, email: true, role: true }
            }
          },
          orderBy: { createdAt: 'asc' }
        },
        notes: {
          include: {
            user: {
              select: { id: true, name: true, email: true, role: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    res.json({ feedback });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

// Update feedback (admin only)
router.put('/:id', authenticateToken, requireRole(['SUPER_ADMIN', 'SUPPORT_AGENT']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const data = updateFeedbackSchema.parse(req.body);

    const feedback = await prisma.feedback.update({
      where: { id },
      data,
      include: {
        category: {
          select: { id: true, name: true, color: true }
        }
      }
    });

    res.json({ feedback });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Feedback not found' });
    }
    res.status(500).json({ error: 'Failed to update feedback' });
  }
});

// Add reply to feedback (admin only)
router.post('/:id/replies', authenticateToken, requireRole(['SUPER_ADMIN', 'SUPPORT_AGENT']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const data = createReplySchema.parse(req.body);

    const feedback = await prisma.feedback.findUnique({
      where: { id }
    });

    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    const reply = await prisma.feedbackReply.create({
      data: {
        ...data,
        feedbackId: id,
        userId: req.user!.id
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    });

    // Send email notification to user if reply is not internal
    if (!data.isInternal) {
      try {
        await sendEmail({
          to: feedback.email,
          subject: `Re: ${feedback.subject} - Albedo Support`,
          template: 'feedback-reply',
          data: {
            name: feedback.name || 'there',
            subject: feedback.subject,
            reply: data.content,
            token: feedback.token
          }
        });
      } catch (emailError) {
        console.error('Failed to send reply email:', emailError);
      }
    }

    res.status(201).json({ reply });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to add reply' });
  }
});

// Add internal note (admin only)
router.post('/:id/notes', authenticateToken, requireRole(['SUPER_ADMIN', 'SUPPORT_AGENT']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const data = createNoteSchema.parse(req.body);

    const feedback = await prisma.feedback.findUnique({
      where: { id }
    });

    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    const note = await prisma.internalNote.create({
      data: {
        ...data,
        feedbackId: id,
        userId: req.user!.id
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    });

    res.status(201).json({ note });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to add note' });
  }
});

// Delete feedback (admin only)
router.delete('/:id', authenticateToken, requireRole(['SUPER_ADMIN']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    await prisma.feedback.delete({
      where: { id }
    });

    res.json({ message: 'Feedback deleted successfully' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Feedback not found' });
    }
    res.status(500).json({ error: 'Failed to delete feedback' });
  }
});

export default router;
