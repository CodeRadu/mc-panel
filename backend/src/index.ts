import express from 'express'
import fs from 'fs'
import http from 'http'
import socketIo, { Socket } from 'socket.io'
import serveStatic from 'serve-static'
import dotenv from 'dotenv'
import { connect } from './database'
import userRouter from './routes/user'
import authRouter from './routes/auth'
import serverRouter from './routes/server'
import { pullDockerImage } from './docker'

dotenv.config()

pullDockerImage()

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
app.use('/server', serverRouter)

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
