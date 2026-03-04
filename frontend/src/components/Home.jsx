import React, { useEffect, useState , useRef} from "react"
import { io } from "socket.io-client"

const PORT = import.meta.env.VITE_PORT || 3000

import { socket } from "../socket"

const Home = () => {

    const [name,setName]=useState("")
    const [room,setRoom]=useState("room1")
    const [players,setPlayers]=useState([])
    const canvasRef=useRef(null)

  useEffect(() => {

    // const socket = io(`http://localhost:${PORT}`)

    

    socket.on("connect", () => {
      console.log("Connected to server:", socket.id)
    })

      
    socket.on("player_list",(players)=>{
        setPlayers(players)
    })

    const canvas=canvasRef.current
    const ctx=canvas.getContext("2d")

    let drawing=false
    let lastX = 0
    let lastY = 0

    const handleMouseDown=(e)=>{
        drawing=true

        lastX=e.offsetX
        lastY=e.offsetY

        ctx.beginPath()
        ctx.moveTo(e.offsetX,e.offsetY)
    }

   

    const handleMouseMove = (e)=>{

      if(!drawing) return

      const x = e.offsetX
      const y = e.offsetY

      
      ctx.lineTo(x,y)
      ctx.stroke()

      
      socket.emit("draw_move",{x,y,lastX,lastY,room})

      lastX=x
      lastY=y

    }

    const handleMouseUp=()=>{
        drawing=false
    }


    canvas.addEventListener("mousedown",handleMouseDown)
    canvas.addEventListener("mousemove",handleMouseMove)
    canvas.addEventListener("mouseup",handleMouseUp)

    
    
   

    socket.on("draw_move",(data)=>{
        ctx.beginPath()
        ctx.moveTo(data.lastX,data.lastY)
        ctx.lineTo(data.x,data.y)
        ctx.stroke()
    })

    return () => {
      socket.off("player_list")
      socket.off("draw_move")
    }

    

    }, [])

  const joinRoom=()=>{
    socket.emit("join_room",{
        name,
        room
    })
  }
  


  return (
    <div className="container">
      <div>
        <input
            placeholder="Enter name"
            onChange={(e)=>setName(e.target.value)}
        />

        <button onClick={joinRoom}>
        Join Room
        </button>

        <h3>Players in Lobby</h3>

        {players.map(p => (
        <div key={p.id}>
        {p.name} — {p.score}
        </div>
        ))}
      </div>
      <canvas
      ref={canvasRef}
      width={600}
      height={400}
      style={{border:'2px solid black', marginTop:"20px"}}/>
    </div>
  )
}

export default Home