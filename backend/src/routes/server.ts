import { Request, Response, Router } from 'express'
import { validateAuthTokenMiddleware } from '../database/authToken'
import { startServer, createVolume } from '../docker'
import { createServer, getServerById, getUserById } from '../database'
import { lowerCase } from 'lodash'

const router = Router()

router.post(
  '/',
  validateAuthTokenMiddleware,
  async (req: Request, res: Response) => {
    const { name, description, userId } = req.body
    if (!name || !userId || !req.user) {
      return res.status(400).json({ error: 'name and userId, are required' })
    }

    const userById = await getUserById(userId)
    const userByToken = await getUserById(req.user.userId)
    if (userById?.id != userByToken?.id && userByToken?.admin == false) {
      return res.sendStatus(401)
    }

    const volumeName = lowerCase(name).replace(/ /g, '_')
    const volume = await createVolume(`mc-server-${volumeName}`)
    const server = await createServer({
      name,
      description,
      userId: Number(userId),
      autosaveInterval: 5,
      crashes: 0,
      memoryAllocation: 1024,
      wasRunning: false,
      volumeName: `mc-server-${volumeName}`,
    })
    res.json(server)
  },
)

router.put('/:id/start', validateAuthTokenMiddleware, async (req, res) => {
  const { id } = req.params
  const server = await getServerById(Number(id))
  if (!server) {
    return res.status(404).json({ error: 'server not found' })
  }
  startServer(Number(id), server.memoryAllocation, server.volumeName)
  res.json({ status: 'ok' })
})

export default router
