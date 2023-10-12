import { Request, Response, Router } from 'express'
import {
  createUser,
  getUserById,
  validateAuthTokenMiddleware,
  validateUserIsAdminMiddleware,
} from '../database'

const router = Router()

router.get(
  '/',
  validateAuthTokenMiddleware,
  async (req: Request, res: Response) => {
    const userToken = req.user
    if (!userToken) {
      res.sendStatus(403)
      return
    }
    const user = await getUserById(userToken.userId)
    if (!user) {
      res.sendStatus(404)
      return
    }
    res.json(user)
  },
)

router.get(
  '/:userId',
  validateAuthTokenMiddleware,
  validateUserIsAdminMiddleware,
  async (req: Request, res: Response) => {
    const userId = req.params.userId
    const user = await getUserById(userId)
    if (!user) {
      res.sendStatus(404)
      return
    }
    res.json(user)
  },
)

router.post('/', async (req: Request, res: Response) => {
  const { userName, name, password } = req.body

  if (!userName || !password) {
    return res
      .status(400)
      .json({ error: 'userName, name and password,  are required' })
  }

  const { user, token } = await createUser({
    userName,
    name,
    password,
    admin: false,
  })

  res.status(201).json({ user, token })
})

export default router
