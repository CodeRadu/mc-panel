import { getDocker } from '.'

export async function createVolume(name: string) {
  const docker = getDocker()
  const volume = await docker.createVolume({ Name: name })
  return volume
}
