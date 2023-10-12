import { Request, Response, Router } from 'express'
import {
  deleteAuthTokenByUserId,
  getUserTokens,
  loginUser,
  validateAuthTokenMiddleware,
} from '../database'

const router = Router()

router.get(
  '/',
  validateAuthTokenMiddleware,
  async (req: Request, res: Response) => {
    const userToken = req.user
    if (!userToken) {
      res.sendStatus(401)
      return
    }
    const tokens = await getUserTokens(userToken.userId)
    res.json(tokens)
  },
)

router.post('/', async (req: Request, res: Response) => {
  const { userName, password } = req.body
  if (!userName || !password) {
    return res.status(400).json({ error: 'Username and password are required' })
  }
  const { user, token } = await loginUser(userName, password)
  res.json({ user, token })
})

router.delete(
  '/',
  validateAuthTokenMiddleware,
  async (req: Request, res: Response) => {
    const userToken = req.user
    if (!userToken) {
      res.sendStatus(401)
      return
    }
    await deleteAuthTokenByUserId(userToken.userId)
    res.sendStatus(204)
  },
)

export default router
