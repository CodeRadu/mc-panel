import { getClient } from '.'

interface Server {
  id?: number
  userId: number
  name: string
  description?: string | null
  wasRunning: boolean
  memoryAllocation: number
  volumeName: string
  crashes: number
  autosaveInterval: number
}

export async function createServer({
  userId,
  name,
  description,
  volumeName,
}: Server): Promise<Server> {
  const prisma = getClient()
  try {
    const server = await prisma.server.create({
      data: {
        userId: userId,
        name: name,
        description: description,
        volumeName: volumeName,
        autosaveInterval: 5,
        crashes: 0,
        memoryAllocation: 1024,
        wasRunning: false,
      },
    })
    return server
  } catch (error) {
    throw new Error('Error creating server:' + (error as Error).message)
  }
}
