import { getClient } from '.'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { NextFunction, Request, Response } from 'express'

const JWT_SECRET = process.env.JWT_SECRET || ''

export async function validateUserIsAdminMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userToken = req.user
  if (!userToken) {
    res.sendStatus(401)
    return
  }
  const user = await getUserById(userToken.userId)
  if (user?.admin == false) {
    res.sendStatus(403)
    return
  }
  next()
}

export async function createUser(userData: {
  userName: string
  name: string
  password: string
  admin: boolean
}) {
  const prisma = getClient()
  const passwordHash = await bcrypt.hash(userData.password, 10)

  try {
    const user = await prisma.user.create({
      data: {
        userName: userData.userName,
        name: userData.name,
        admin: userData.admin,
        passwordHash: passwordHash,
      },
    })

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' })

    await prisma.authToken.create({
      data: {
        token,
        userId: user.id,
      },
    })

    return { user, token }
  } catch (error) {
    throw new Error('Error creating user')
  }
}

export async function loginUser(username: string, passwordHash: string) {
  const prisma = getClient()

  try {
    // Find the user by username
    const user = await prisma.user.findUnique({
      where: { userName: username },
    })

    if (!user) {
      throw new Error('User not found')
    }

    const isPasswordValid = await bcrypt.compare(
      passwordHash,
      user.passwordHash,
    )

    if (!isPasswordValid) {
      throw new Error('Invalid password')
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' })

    await prisma.authToken.create({
      data: {
        token,
        userId: user.id,
      },
    })

    // Successful login
    return { user, token }
  } catch (error) {
    throw new Error('Login failed: ' + (error as Error).message)
  }
}

export async function getUserById(userId: string) {
  const prisma = getClient()
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })
    return user
  } catch (error) {
    throw new Error('Error retrieving user data')
  }
}

export async function getAllUsers() {
  const prisma = getClient()
  try {
    const users = await prisma.user.findMany()
    return users
  } catch (error) {
    throw new Error('Error retrieving user data')
  }
}

export async function getUserServers(userId: string) {
  const prisma = getClient()
  try {
    const servers = await prisma.user
      .findUnique({
        where: { id: userId },
      })
      .servers()
    return servers
  } catch (error) {
    throw new Error('Error retrieving user servers')
  }
}
