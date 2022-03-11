const spawn = require('child_process').spawn
const fs = require('fs')
const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const https = require('https')
require('dotenv').config({ path: 'config/config.env' })
let proc
let logs = 'Stopped\n'
let running = false
let autosave
let stop = false
rowcrash = 0

if (!fs.existsSync('server')) fs.mkdirSync('server')
if (!fs.existsSync('server/elua.txt'))
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
    (response) => response.pipe(output)
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

function startServer(crashed) {
  if (running == true) return
  if (crashed) logs = logs + 'Server crashed\n'
  const rowcrashTimeout = setTimeout(() => {
    rowcrash = 0
  }, 120 * 1000)
  console.log('Server is starting')
  running = true
  logs += 'Started\n'
  proc = spawn(
    'java',
    ['-Xmx2048M', '-Xms2048M', '-jar', 'server.jar', 'nogui'],
    { cwd: 'server', shell: true }
  )
  proc.stdout.on('data', (data) => {
    logs = logs + data.toString()
    if (data.includes('Done')) {
      console.log('Server started')
      io.emit('enable-stop')
      if (process.env.AUTOSAVE_INTERVAL == 0) {
        console.log('Autosave disabled')
        return
      }
      console.log(`Autosaving every ${process.env.AUTOSAVE_INTERVAL} minutes`)
      logs =
        logs +
        `HOST: Autosaving every ${process.env.AUTOSAVE_INTERVAL} minutes\n`
      autosave = setInterval(() => {
        sendCmd('save-all')
      }, parseFloat(process.env.AUTOSAVE_INTERVAL * 1000 * 60))
    }
  })
  proc.stderr.pipe(process.stderr)
  proc.stderr.on('data', (data) => {
    logs = logs + data.toString()
  })
  proc.stdin.setDefaultEncoding('utf8')
  proc.on('exit', (code) => {
    console.log('Server stopped')
    logs = logs + 'Exited with code ' + code + '\n'
    running = false
    if (code != 0 && rowcrash < 3 && !stop) {
      startServer((crashed = true))
      rowcrash++
    } else if (rowcrash >= 3) {
      console.error(
        'Server crashed more than 3 times in a row. Manual restart required'
      )
      logs =
        logs +
        'Server crashed more than 3 times in a row. Manual restart required\n'
      rowcrash = 0
    }
    if (code == 0) {
      clearTimeout(rowcrashTimeout)
      io.emit('enable-start')
    }
    clearInterval(autosave)
  })
  proc.on('message', (msg) => {
    console.log(msg)
  })
}

function stopServer() {
  if (running == false) return
  clearInterval(autosave)
  proc.stdin.write('stop\n')
}

function sendCmd(cmd) {
  proc.stdin.write(`${cmd}\n`)
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

setInterval(() => {
  io.emit('send-logs', logs)
}, 1000)

io.on('connection', (socket) => {
  if (running) {
    socket.emit('enable-stop')
    socket.emit('disable-start')
  } else {
    socket.emit('disable-stop')
    socket.emit('enable-start')
  }
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
  socket.on('send-cmd', (cmd) => {
    sendCmd(cmd)
  })
  socket.on('shut-down', () => {
    shutDownHost()
  })
})

console.log('Host running')

server.listen(1234)

process.on('message', (msg) => {
  if (msg == 'shutdown') {
    console.log('Shutdown message recieved. Please wait')
    shutDownHost()
  }
})

process.on('SIGINT', () => {
  console.log('Recieved SIGINT')
  shutDownHost()
})
