import { getClient } from '.'
import { Request, Response, NextFunction } from 'express'
import jwt, { JwtPayload } from 'jsonwebtoken'

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || ''

export async function validateAuthTokenMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const token = req.headers.authorization
  if (!token) {
    return res.sendStatus(401)
  }
  const prisma = getClient()
  const foundToken = await prisma.authToken.findUnique({
    where: { token },
  })
  if (!foundToken) {
    return res.sendStatus(401)
  }
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(401)
    }
    req.user = user as JwtPayload
    next()
  })
}

export async function getAuthTokenByUserId(userId: number) {
  const prisma = getClient()

  try {
    const authToken = await prisma.authToken.findFirst({
      where: { userId },
    })
    return authToken
  } catch (error) {
    throw new Error('Error retrieving auth token')
  }
}

export async function deleteAuthTokenByUserId(userId: number) {
  const prisma = getClient()

  try {
    await prisma.authToken.deleteMany({
      where: { userId },
    })
  } catch (error) {
    throw new Error('Error deleting auth token')
  }
}

export async function deleteAuthTokenById(authToken: string) {
  const prisma = getClient()

  try {
    await prisma.authToken.delete({
      where: { token: authToken },
    })
  } catch (error) {
    throw new Error('Error deleting auth token')
  }
}

export async function getUserTokens(userId: number) {
  const prisma = getClient()

  try {
    const tokens = await prisma.authToken.findMany({
      where: { userId },
    })
    return tokens
  } catch (error) {
    throw new Error('Error fetching auth tokens')
  }
}
