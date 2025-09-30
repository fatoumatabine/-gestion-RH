import express from 'express';
import { Router } from 'express';
import { prisma } from '../database/prisma.client.js';
import { auth } from '../middleware/auth.js';
import { roleMiddleware } from '../middleware/role.middleware.js';

const router = Router();

// Get all notifications for the current user
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const notifications = await prisma.notification.findMany({
      where: {
        userId: userId
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20
    });

    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des notifications' });
  }
});

// Mark notification as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    const notificationId = parseInt(req.params.id);
    const userId = req.user.id;

    await prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId: userId
      },
      data: {
        isRead: true
      }
    });

    res.json({ message: 'Notification marquée comme lue' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la notification' });
  }
});

// Mark all notifications as read
router.put('/read-all', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    await prisma.notification.updateMany({
      where: {
        userId: userId,
        isRead: false
      },
      data: {
        isRead: true
      }
    });

    res.json({ message: 'Toutes les notifications ont été marquées comme lues' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour des notifications' });
  }
});

// Get unread notifications count
router.get('/unread-count', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const count = await prisma.notification.count({
      where: {
        userId: userId,
        isRead: false
      }
    });

    res.json({ count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération du compteur' });
  }
});

// Create a new notification (admin only)
router.post('/', auth, roleMiddleware(['ADMIN', 'SUPERADMIN']), async (req, res) => {
  try {
    const { title, message, type, category, userId, link, metadata } = req.body;

    const notification = await prisma.notification.create({
      data: {
        title,
        message,
        type: type || 'info',
        category: category || 'system',
        userId: userId || req.user.id,
        link,
        metadata,
        isRead: false
      }
    });

    res.status(201).json({ message: 'Notification créée', notification });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ message: 'Erreur lors de la création de la notification' });
  }
});

export default router;