import { Request, Response, Router } from 'express'
import { loginUser } from '../database'

const router = Router()

router.post('/', async (req: Request, res: Response) => {
  const { userName, password } = req.body
  if (!userName || !password) {
    return res.status(400).json({ error: 'Username and password are required' })
  }
  const { user, token } = await loginUser(userName, password)
  res.json({ user, token })
})

export default router
