import Docker from 'dockerode'

const IMAGE_NAME =
  process.env.DOCKER_IMAGE || 'ghcr.io/coderadu/mc-panel/java17'

const docker = new Docker({
  socketPath: '/var/run/docker.sock',
  timeout: 60000,
})

export function getDocker(): Docker {
  return docker
}

export async function pullDockerImage() {
  console.log(`Pulling ${IMAGE_NAME}`)
  const stream = await docker.pull(IMAGE_NAME)

  const interval = setInterval(() => {
    process.stdout.write('.')
  }, 1000)

  // Handle the pull progress and completion
  await new Promise<void>((resolve, reject) => {
    docker.modem.followProgress(stream, (err, output) => {
      if (err) {
        reject(err)
      } else {
        // The image has been successfully pulled
        console.log(`\nPulled ${IMAGE_NAME}`)
        clearInterval(interval)
        resolve()
      }
    })
  })
}

export * from './volume'
export * from './server'
