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
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403)
    }
    req.user = user as JwtPayload
    next()
  })
}

export async function getAuthTokenByUserId(userId: string) {
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

export async function deleteAuthTokenByUserId(userId: string) {
  const prisma = getClient()

  try {
    await prisma.authToken.deleteMany({
      where: { userId },
    })
  } catch (error) {
    throw new Error('Error deleting auth token')
  }
}

export async function deleteAuthTokenById(authTokenId: number) {
  const prisma = getClient()

  try {
    await prisma.authToken.delete({
      where: { id: authTokenId },
    })
  } catch (error) {
    throw new Error('Error deleting auth token')
  }
}
