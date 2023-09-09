import fs from 'fs'
import express from 'express'
import http from 'http'
import socketIo, { Socket } from 'socket.io'
import https from 'https'
import { spawn, ChildProcess } from 'child_process'

import dotenv from 'dotenv'
import { createBackup } from './backup'

dotenv.config({ path: 'config/config.env' })

let proc: ChildProcess | undefined
let logs = 'Stopped\n'
let running = false
let autosave: NodeJS.Timeout | undefined
let backup: NodeJS.Timeout | undefined
let stop = false
let started = false
let rowcrash = 0

const app = express()
const server = http.createServer(app)
const io = new socketIo.Server(server)

if (!fs.existsSync('server')) fs.mkdirSync('server')
if (!fs.existsSync('backups')) fs.mkdirSync('backups')
if (!fs.existsSync('server/eula.txt'))
  fs.writeFileSync('server/eula.txt', 'eula=true', 'utf8')

if (
  !fs.existsSync('server/server.jar') &&
  process.env.DOWNLOAD_PAPERMC === 'true'
) {
  const output = fs.createWriteStream('server/server.jar')
  logs += 'Downloading server.jar\n'
  console.log('Downloading server.jar')
  const request = https.get(
    `https://papermc.io/api/v2/projects/paper/versions/${process.env.PAPERMC_DOWNLOAD_VERSION}/builds/${process.env.PAPERMC_DOWNLOAD_BUILD}/downloads/paper-${process.env.PAPERMC_DOWNLOAD_VERSION}-${process.env.PAPERMC_DOWNLOAD_BUILD}.jar`,
    (response) => response.pipe(output),
  )
  request.on('finish', () => {
    logs += 'Downloaded server.jar\n'
    console.log('Downloaded server.jar')
    if (process.env.AUTOSTART === 'true') {
      console.log('Waiting for 5 seconds before starting server')
      setTimeout(() => {
        console.log('Autostarting server')
        logs += 'HOST: Autostarting server\n'
        startServer()
      }, 5000)
    }
  })
} else if (process.env.AUTOSTART === 'true') {
  console.log('Autostarting server')
  logs += 'HOST: Autostarting server\n'
  startServer()
}

async function sendLogsToClients() {
  for (const socket of await io.fetchSockets()) {
    socket.emit('send-logs', logs)
  }
}

async function enableStop() {
  const sockets = await io.fetchSockets()
  for (const socket of sockets) {
    socket.emit('enable-stop')
  }
}

async function disableStop() {
  const sockets = await io.fetchSockets()
  for (const socket of sockets) {
    socket.emit('disable-stop')
  }
}

async function enableStart() {
  const sockets = await io.fetchSockets()
  for (const socket of sockets) {
    socket.emit('enable-start')
  }
}

async function disableStart() {
  const sockets = await io.fetchSockets()
  for (const socket of sockets) {
    socket.emit('disable-start')
  }
}

function startServer(crashed?: boolean) {
  if (running == true) return
  if (crashed) logs = logs + 'Server crashed\n'

  const rowcrashTimeout = setTimeout(() => {
    rowcrash = 0
  }, 120 * 1000)

  console.log('Server is starting')
  running = true
  logs += 'Started\n'

  const memoryAllocation =
    process.env.MEMORY_ALLOCATION != undefined
      ? parseInt(process.env.MEMORY_ALLOCATION)
      : 1024

  proc = spawn(
    'java',
    [
      `-Xmx${memoryAllocation}M`,
      `-Xms${memoryAllocation}M`,
      '-jar',
      'server.jar',
      'nogui',
    ],
    { cwd: 'server', shell: true },
  )

  proc.stdout?.on('data', (data) => {
    logs = logs + data.toString()
    sendLogsToClients()
    if (data.includes('Done')) {
      console.log('Server started')
      started = true
      enableStop()
      const autosaveInterval = process.env.AUTOSAVE_INTERVAL
        ? parseFloat(process.env.AUTOSAVE_INTERVAL)
        : 0
      const backupInterval = process.env.BACKUP_INTERVAL
        ? parseFloat(process.env.BACKUP_INTERVAL)
        : 0
      if (autosaveInterval > 0) {
        console.log(`Autosaving every ${autosaveInterval} minutes`)
        logs += `HOST: Autosaving every ${autosaveInterval} minutes\n`
        autosave = setInterval(() => {
          sendCmd('save-all')
        }, autosaveInterval * 1000 * 60)
      } else {
        console.log('Autosave disabled')
      }
      if (backupInterval > 0) {
        console.log(
          `Backing up every ${backupInterval} minutes (${
            backupInterval / 60
          } hours)`,
        )
        logs += `HOST: Backing up every ${backupInterval} minutes (${
          backupInterval / 60
        } hours)\n`
        backup = setInterval(() => {
          sendCmd('save-all')
          createBackup()
        }, backupInterval * 60000)
      } else {
        console.log('Backups disabled')
      }
    }
  })

  proc.stderr?.pipe(process.stderr)

  proc.stderr?.on('data', (data) => {
    logs = logs + data.toString()
    sendLogsToClients()
  })

  proc.stdin?.setDefaultEncoding('utf8')

  proc.on('exit', (code) => {
    console.log('Server stopped')
    logs = logs + 'Exited with code ' + code + '\n'
    running = false

    if (code != 0 && rowcrash < 3 && !stop) {
      startServer(true)
      rowcrash++
    } else if (rowcrash >= 3) {
      console.error(
        'Server crashed more than 3 times in a row. Manual restart required',
      )
      logs =
        logs +
        'Server crashed more than 3 times in a row. Manual restart required\n'
      rowcrash = 0
    }

    if (code == 0) {
      clearTimeout(rowcrashTimeout)
      enableStart()
    }

    if (autosave) clearInterval(autosave)
    if (backup) clearInterval(backup)
  })

  proc.on('message', (msg) => {
    console.log(msg)
  })
}

function stopServer() {
  if (running == false) return
  started = false
  if (autosave) clearInterval(autosave)
  proc?.stdin?.write('stop\n')
}

function sendCmd(cmd: string) {
  proc?.stdin?.write(`${cmd}\n`)
  logs = logs + 'CMD: ' + cmd + '\n'
}

function shutDownHost() {
  stop = true
  console.log('Host shutting down')
  stopServer()
  console.log('Stopping server if running')
  //wait until server stopped
  setInterval(() => {
    if (!running) process.exit(0)
  }, 1000)
}

process.on('exit', () => console.log('Exiting'))

app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.render('index')
})

io.sockets.on('connection', (socket: Socket) => {
  if (running) {
    if (!started) socket.emit('disable-stop')
    socket.emit('disable-start')
  } else {
    socket.emit('disable-stop')
    socket.emit('enable-start')
  }
  socket.emit('send-logs', logs)
  socket.on('stop-server', () => {
    stopServer()
    socket.emit('disable-stop')
  })
  socket.on('get-logs', () => {
    socket.emit('send-logs', logs)
  })
  socket.on('start-server', () => {
    startServer()
    socket.emit('disable-start')
  })
  socket.on('send-cmd', (cmd: string) => {
    sendCmd(cmd)
  })
  socket.on('shut-down', () => {
    shutDownHost()
  })
})

console.log('Host running')

server.listen(process.env.INTERFACE_PORT || 1234)

process.on('message', (msg) => {
  if (msg == 'shutdown') {
    console.log('Shutdown message received. Please wait')
    shutDownHost()
  }
})

process.on('SIGINT', () => {
  console.log('Received SIGINT')
  shutDownHost()
})
