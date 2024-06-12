import { z } from 'zod'

const envSchema = z.object({
  MEMORY_ALLOCATION: z.number().optional().default(1024),
  AUTOSAVE_INTERVAL: z.number().optional().default(5),
  AUTOSTART: z.boolean().optional().default(true),
  BACKUP_INTERVAL: z.number().optional().default(0), // disabled
  BACKUP_PROJECT_ID: z.string().optional(),
  BACKUP_STORAGE_BUCKET: z.string().optional(),
  BACKUP_FILENAME: z.string().optional().default('backup-{date}.zip'),
  BACKUP_SOURCE_DIRECTORIES: z.string().optional().default('server/world,server/world_nether,server/world_the_end'),
})

export default envSchema.parse(process.env)