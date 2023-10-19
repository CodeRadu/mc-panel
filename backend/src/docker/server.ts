import { getDocker } from '.'
import { createVolume } from '.'

const IMAGE_NAME =
  process.env.DOCKER_IMAGE || 'ghcr.io/coderadu/mc-panel/java17'

export async function startServer(id: number, memoryAllocation: number, volumeName: string) {
  const docker = getDocker()
  const container = await docker.createContainer({
    name: `mc-server-${id}`,
    Image: IMAGE_NAME,
    HostConfig: {
      Binds: [`${volumeName}:/server`],
    },
    Env: [
      `MEMORY_ALLOCATION=${memoryAllocation}`,
    ]
  })
  await container.start()
  return container
}
