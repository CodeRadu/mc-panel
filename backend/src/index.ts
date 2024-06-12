import fs from 'fs'
import express from 'express'
import http from 'http'
import serveStatic from 'serve-static'

import env from './env'

import * as srv from './server'
import { Websocket } from './websocket'

const app = express()
export const server = http.createServer(app)
export const ws = new Websocket(server)

if (!fs.existsSync('server')) fs.mkdirSync('server')
if (!fs.existsSync('backups')) fs.mkdirSync('backups')
if (!fs.existsSync('server/eula.txt'))
  fs.writeFileSync('server/eula.txt', 'eula=true', 'utf8')

if (env.AUTOSTART === 'true') {
  console.log('Autostarting server')
  srv.startServer()
}

function shutDownHost() {
  srv.stopServer()
  console.log('Stopping server if running')
  //wait until server stopped
  setInterval(() => {
    if (srv.getStatus() == srv.Status.STOPPED) process.exit(0)
  }, 1000)
}

process.on('exit', () => console.log('Exiting'))

app.use(serveStatic('frontend'))

console.log(`Listening on port ${process.env.INTERFACE_PORT || 1234}`)

server.listen(process.env.INTERFACE_PORT || 1234)

process.on('SIGINT', () => {
  console.log('Received SIGINT')
  shutDownHost()
})
