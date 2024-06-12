import socketIo, { Socket } from 'socket.io'
import { server } from '.'
import { Status, getLogs, getStatus, isRunning, sendCmd, startServer, stopServer, write } from './server'
import http from 'http'

export class Websocket {
  io: socketIo.Server | undefined

  constructor(server: http.Server) {
    this.initWebsocket(server)
  }

  initWebsocket(server: http.Server) {
    this.io = new socketIo.Server(server, {
      cors: {
        origin: 'http://localhost:5173',
      },
    })
    this.io.sockets.on('connection', (socket: Socket) => {
      if (isRunning()) {
        if (getStatus() != Status.STARTED) socket.emit('disable-stop')
        socket.emit('disable-start')
      } else {
        socket.emit('disable-stop')
        socket.emit('enable-start')
      }
      socket.emit('send-logs', getLogs())
      socket.on('stop-server', () => {
        stopServer()
        socket.emit('disable-stop')
      })
      socket.on('start-server', () => {
        startServer()
        socket.emit('disable-start')
      })
      socket.on('send-cmd', (cmd: string) => {
        sendCmd(cmd)
      })
      socket.on('write', (data: string) => {
        write(data)
      })
    })
  }

  async sendDataToClients(data: string) {
    for (const socket of await this.io!.fetchSockets()) {
      socket.emit('send-logs', data)
    }
  }

  async enableStop() {
    const sockets = await this.io!.fetchSockets()
    for (const socket of sockets) {
      socket.emit('enable-stop')
    }
  }

  async enableStart() {
    const sockets = await this.io!.fetchSockets()
    for (const socket of sockets) {
      socket.emit('enable-start')
    }
  }
}
