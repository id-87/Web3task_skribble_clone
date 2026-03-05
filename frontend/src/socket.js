import { io } from "socket.io-client"

const PORT = import.meta.env.VITE_PORT || 3000

export const socket = io(`https://web3task-skribble-clone.onrender.com/`, {
  autoConnect: true
})