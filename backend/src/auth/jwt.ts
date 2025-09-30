import jwt from 'jsonwebtoken'
import config from '../config'
import { User } from '@prisma/client'

export const generateToken = (user: User): string => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRES_IN }
  )
}

export const verifyToken = (token: string) => {
  return jwt.verify(token, config.JWT_SECRET)
}