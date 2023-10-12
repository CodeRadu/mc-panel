import express from 'express'
import http from 'http'
import socketIo, { Socket } from 'socket.io'
import serveStatic from 'serve-static'
import dotenv from 'dotenv'
import { connect } from './database'
import userRouter from './routes/user'
import authRouter from './routes/auth'

dotenv.config()

const app = express()
const server = http.createServer(app)
const io = new socketIo.Server(server, {
  cors: {
    origin: 'http://localhost:5173',
  },
})

app.use(express.json())
app.use('/user', userRouter)
app.use('/auth', authRouter)

connect()

function shutDownHost() {
  console.log('Stopping server if running')
  //wait until server stopped
}

process.on('exit', () => console.log('Exiting'))

app.use(serveStatic('frontend'))

io.sockets.on('connection', (socket: Socket) => {})

console.log(`Listening on port ${process.env.INTERFACE_PORT || 1234}`)

server.listen(process.env.INTERFACE_PORT || 1234)

process.on('SIGINT', () => {
  console.log('Received SIGINT')
  shutDownHost()
})
