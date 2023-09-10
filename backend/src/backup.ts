import fs from 'fs'
import archiver from 'archiver'
import { Storage } from '@google-cloud/storage'
import dotenv from 'dotenv'

dotenv.config({ path: 'config/config.env' })

const keyFileName = 'config/service-account.json'

const bucketName = process.env.BACKUP_STORAGE_BUCKET
const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
const dynamicBackupFilename = process.env.BACKUP_FILENAME || 'backup-{date}.zip'
const projectId = process.env.BACKUP_PROJECT_ID

let error = false

if (
  parseFloat(process.env.BACKUP_INTERVAL as string) > 0 &&
  !fs.existsSync('config/service-account.json')
) {
  console.error(
    'ERROR: Backups are enabled, but no config/service-account.json is found',
  )
  error = true
}

if (
  parseFloat(process.env.BACKUP_INTERVAL as string) > 0 &&
  projectId == undefined
) {
  console.error('ERROR: Backups are enabled, but no project id specified')
  error = true
}

if (
  parseFloat(process.env.BACKUP_INTERVAL as string) > 0 &&
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
  process.env.BACKUP_SOURCE_DIRECTORIES ||
  'server/world,server/world_nether,server/world_the_end'
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
