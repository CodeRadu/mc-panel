import { PrismaClient } from '@prisma/client'

const client = new PrismaClient()

export function getClient(): PrismaClient {
  return client
}

export const connect = () => client.$connect()
export * from './user'
export * from './authToken'
export * from './server'
