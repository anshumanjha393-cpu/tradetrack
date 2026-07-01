import { Request, Response, NextFunction } from 'express'
import { AppError } from '../lib/errors'
import { logger } from '../lib/logger'
import { ZodError } from 'zod'

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ZodError) {
    logger.warn(`Validation Error on ${req.method} ${req.path}: ${JSON.stringify(err.issues)}`)
    return res.status(400).json({
      error: 'Validation failed',
      details: err.issues.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    })
  }

  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error(`AppError [${err.statusCode}] on ${req.method} ${req.path}: ${err.message}\nStack: ${err.stack}`)
    } else {
      logger.warn(`AppError [${err.statusCode}] on ${req.method} ${req.path}: ${err.message}`)
    }
    return res.status(err.statusCode).json({ error: err.message })
  }

  // Handle DB errors or standard errors
  logger.error(`Unhandled Exception on ${req.method} ${req.path}: ${err.message}\nStack: ${err.stack}`)
  return res.status(500).json({ error: 'Internal server error' })
}
