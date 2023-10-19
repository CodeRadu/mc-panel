import { getDocker } from '.'
import { createVolume } from '.'

const IMAGE_NAME =
  process.env.DOCKER_IMAGE || 'ghcr.io/CodeRadu/mc-panel/java17'

export async function createContainer(id: number, volumeName: string) {
  const docker = getDocker()
  const container = await docker.createContainer({
    name: `mc-server-${id}`,
    Image: IMAGE_NAME,
    HostConfig: {
      Binds: [`${volumeName}:/server`],
    },
  })
  return container
}
