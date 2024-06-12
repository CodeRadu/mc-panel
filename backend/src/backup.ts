import fs from 'fs'
import archiver from 'archiver'
import { Storage } from '@google-cloud/storage'
import env from './env'

const keyFileName = 'config/service-account.json'

const bucketName = env.BACKUP_STORAGE_BUCKET
const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
const dynamicBackupFilename = env.BACKUP_FILENAME
const projectId = env.BACKUP_PROJECT_ID

let error = false

if (
  env.BACKUP_INTERVAL > 0 &&
  !fs.existsSync('config/service-account.json')
) {
  console.error(
    'ERROR: Backups are enabled, but no config/service-account.json is found',
  )
  error = true
}

if (
  env.BACKUP_INTERVAL > 0 &&
  projectId == undefined
) {
  console.error('ERROR: Backups are enabled, but no project id specified')
  error = true
}

if (
  env.BACKUP_INTERVAL > 0 &&
  bucketName == undefined
) {
  console.error('ERROR: Backups are enabled, but no bucket name specified')
  error = true
}

if (error) process.exit(1)

const storage = new Storage({
  projectId: projectId,
  keyFilename: keyFileName,
})

const sourceDirectories = (
  env.BACKUP_SOURCE_DIRECTORIES
).split(',')

export function createBackup() {
  const backupFilename = dynamicBackupFilename.replace('{date}', timestamp)
  const output = fs.createWriteStream(`backups/${backupFilename}`)
  const archive = archiver('zip', {
    zlib: { level: 9 }, // Highest compression level
  })
  output.on('close', () => {
    console.log(`Backup ${backupFilename} created successfully.`)
    uploadBackup(backupFilename)
  })
  archive.on('error', (err) => {
    console.error('Error creating backup:', err)
  })
  archive.pipe(output)

  for (const sourceDir of sourceDirectories) {
    console.log(`Adding directory ${sourceDir}`)
    archive.directory(sourceDir.trim(), sourceDir.split('/')[-1])
  }
  archive.finalize()
}

async function uploadBackup(fileName: string) {
  try {
    const bucket = storage.bucket(bucketName!)
    const file = bucket.file(fileName)
    await bucket.upload(`backups/${fileName}`, { destination: file })
    console.log('Backup uploaded')
  } catch (err) {
    console.error(`ERROR: Could not upload backup: ${err}`)
  }
}
