import { io, Socket } from 'socket.io-client'

export const socket = io('http://localhost:8000', {
  autoConnect: false,
  auth: {token : localStorage.getItem('dars_token')} 
})
