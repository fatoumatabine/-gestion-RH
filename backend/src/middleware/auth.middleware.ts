import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../auth/jwt'
import { AppError } from './error.handler'
import prisma from '../database/prisma.client'

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number
        email: string
        role: string
      }
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
      throw new AppError('Veuillez vous authentifier', 401)
    }

    const decoded = verifyToken(token) as any

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true }
    })

    if (!user) {
      throw new AppError('Utilisateur non trouvé', 401)
    }

    req.user = user
    next()
  } catch (error) {
    next(new AppError('Token invalide', 401))
  }
}