import ioClient from 'socket.io-client'
const isDevelopment = import.meta.env.DEV

const ENDPOINT = isDevelopment
  ? `${window.location.hostname}:1234`
  : window.location.origin

const socket = ioClient(ENDPOINT)

export const io = socket
