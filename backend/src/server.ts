import { IPty, spawn } from "node-pty"
import env from "./env"
import { createBackup } from "./backup"
import { ws } from "."

let proc: IPty | undefined
let logs = 'Stopped\n\r'
let rowcrash = 0
let autosave: NodeJS.Timeout | undefined
let backup: NodeJS.Timeout | undefined

export enum Status {
  STOPPING,
  STOPPED,
  STARTING,
  STARTED,
}

let status: Status = Status.STOPPED

export function getLogs() {
  return logs
}

export function isRunning() {
  return !!proc
}

export function getStatus() {
  return status
}

export function startServer(crashed?: boolean) {
  if (proc) return
  if (crashed) logs = logs + 'Server crashed\n\r'

  const rowcrashTimeout = setTimeout(() => {
    rowcrash = 0
  }, 120 * 1000)

  console.log('Server is starting')
  logs += 'Started\n\r'

  const memoryAllocation = env.MEMORY_ALLOCATION

  const command = `java -Xmx${memoryAllocation}M -Xms${memoryAllocation}M -jar server.jar nogui`

  console.log(command.split(' ')[0], command.split(' ').slice(1))

  proc = spawn(command.split(' ')[0], command.split(' ').slice(1), {
    cwd: 'server',
    env: process.env,
    name: 'xterm-color',
  })

  proc.onData((data) => {
    logs = logs + data
    ws.sendDataToClients(data)
    if (data.includes('Done')) {
      console.log('Server started')
      ws.enableStop()
      const autosaveInterval = env.AUTOSAVE_INTERVAL
      const backupInterval = env.BACKUP_INTERVAL
      if (autosaveInterval > 0) {
        console.log(`Autosaving every ${autosaveInterval} minutes`)
        logs += `HOST: Autosaving every ${autosaveInterval} minutes\n\r`
        autosave = setInterval(
          () => {
            sendCmd('save-all')
          },
          autosaveInterval * 1000 * 60,
        )
      } else {
        console.log('Autosave disabled')
      }
      if (backupInterval > 0) {
        console.log(
          `Backing up every ${backupInterval} minutes (${backupInterval / 60
          } hours)`,
        )
        logs += `HOST: Backing up every ${backupInterval} minutes (${backupInterval / 60
          } hours)\n\r`
        backup = setInterval(() => {
          sendCmd('save-all')
          createBackup()
        }, backupInterval * 60000)
      } else {
        console.log('Backups disabled')
      }
    }
  })

  proc.onExit(({ exitCode: code }) => {
    console.log('Server stopped')
    proc = undefined
    logs = logs + 'Exited with code ' + code + '\n\r'
    ws.sendDataToClients('Exited with code ' + code + '\n\r')

    if (code != 0 && rowcrash < 3) {
      startServer(true)
      rowcrash++
    } else if (rowcrash >= 3) {
      console.error(
        'Server crashed more than 3 times in a row. Manual restart required',
      )
      logs =
        logs +
        'Server crashed more than 3 times in a row. Manual restart required\n\r'
      rowcrash = 0
    }

    if (code == 0) {
      clearTimeout(rowcrashTimeout)
      ws.enableStart()
    }

    if (autosave) clearInterval(autosave)
    if (backup) clearInterval(backup)
  })
}

export function stopServer() {
  if (!proc) return
  if (autosave) clearInterval(autosave)
  if (backup) clearInterval(backup)
  proc?.write('stop\n\r')
}

export function sendCmd(cmd: string) {
  proc?.write(`${cmd}\n\r`)
  logs = logs + 'CMD: ' + cmd + '\n\r'
}

export function write(data: string) {
  proc?.write(data)
}