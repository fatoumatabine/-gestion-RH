import { Request, Response } from 'express'
import { paymentService } from '../../services/global/payment.service.js'
import { createPaymentSchema, updatePaymentSchema } from '../../validations/global/payment.validation.js'

export class PaymentController {
  async createPayment(req: Request, res: Response) {
    try {
      const validatedData = createPaymentSchema.parse(req.body)
      const payment = await paymentService.createPayment(validatedData)
      res.status(201).json({
        success: true,
        data: payment
      })
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      })
    }
  }

  async getPaymentById(req: Request, res: Response) {
    try {
      const { id } = req.params
      const payment = await paymentService.getPaymentById(parseInt(id))
      res.json({
        success: true,
        data: payment
      })
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message
      })
    }
  }

  async updatePayment(req: Request, res: Response) {
    try {
      const { id } = req.params
      const validatedData = updatePaymentSchema.parse(req.body)
      const payment = await paymentService.updatePayment(parseInt(id), validatedData)
      res.json({
        success: true,
        data: payment
      })
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      })
    }
  }

  async deletePayment(req: Request, res: Response) {
    try {
      const { id } = req.params
      const result = await paymentService.deletePayment(parseInt(id))
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

  async getAllPayments(req: Request, res: Response) {
    try {
      const {
        page,
        limit,
        search,
        status,
        employeeId,
        startDate,
        endDate
      } = req.query

      const result = await paymentService.getAllPayments({
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 10,
        search: search as string,
        status: status as string,
        employeeId: employeeId ? parseInt(employeeId as string) : undefined,
        startDate: startDate as string,
        endDate: endDate as string
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

  async getPaymentStats(req: Request, res: Response) {
    try {
      const { startDate, endDate } = req.query
      const stats = await paymentService.getPaymentStats({
        startDate: startDate as string,
        endDate: endDate as string
      })

      res.json({
        success: true,
        data: stats
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      })
    }
  }
}

export const paymentController = new PaymentController()