import { Request, Response } from 'express'
import { userService } from '../../services/global/user.service.js'
import { createUserSchema, updateUserSchema } from '../../validations/global/user.validation.js'

export class UserController {
  async createUser(req: Request, res: Response) {
    try {
      const validatedData = createUserSchema.parse(req.body)
      const user = await userService.createUser(validatedData)
      res.status(201).json({
        success: true,
        data: user
      })
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      })
    }
  }

  async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params
      const user = await userService.getUserById(parseInt(id))
      res.json({
        success: true,
        data: user
      })
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message
      })
    }
  }

  async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params
      const validatedData = updateUserSchema.parse(req.body)
      const user = await userService.updateUser(parseInt(id), validatedData)
      res.json({
        success: true,
        data: user
      })
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      })
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params
      const result = await userService.deleteUser(parseInt(id))
      res.json({
        success: true,
        data: result
      })
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      })
    }
  }

  async getAllUsers(req: Request, res: Response) {
    try {
      const { page, limit, search } = req.query
      const result = await userService.getAllUsers({
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 10,
        search: search as string
      })
      res.json({
        success: true,
        data: result
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      })
    }
  }
}

export const userController = new UserController()