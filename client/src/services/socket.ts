import { io, Socket } from 'socket.io-client'

export const socket = io('http://localhost:8000', {
  autoConnect: false,
  auth: {token : localStorage.getItem('dars_token')} 
})

export function joinBarangay(barangayId: number): void {
  socket.emit('join:barangay', barangayId)
}

export function leaveBarangay(barangayId: number): void {
  socket.emit('leave:barangay', barangayId)
}
