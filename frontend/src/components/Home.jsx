import React, { useEffect, useState , useRef} from "react"
import { io } from "socket.io-client"

const PORT = import.meta.env.VITE_PORT || 3000

import { socket } from "../socket"

const Home = () => {

    const [name,setName]=useState("")
    const [room,setRoom]=useState("room1")
    const [players,setPlayers]=useState([])
    const [guess,setGuess]=useState("")
    const [messages,setMessages]=useState([])
    const[isDrawer,setIsDrawer]=useState(false)
    const [isHost,setIsHost] = useState(false)
    const [wordChoices,setWordChoices] = useState([])
    const [maxRounds,setMaxRounds] = useState(7)
    const canvasRef=useRef(null)

  useEffect(() => {

    // const socket = io(`http://localhost:${PORT}`)

    

    socket.on("connect", () => {
      console.log("Connected to server:", socket.id)
    })

      
    socket.on("player_list",(players)=>{
        setPlayers(players)
        if(players[0]?.id===socket.id){
            setIsHost(true)
        }
        else{
            setIsHost(false)
        }
        
    })

    socket.on("game_over",(data)=>{

    alert(`Game Over! Winner: ${data.winner} (${data.score} points)`)

    })

    socket.off("word_options")
    socket.on("word_options",(options)=>{
    setWordChoices(options)
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

    socket.on("round_start",(data)=>{
        const canvas = canvasRef.current
        const ctx = canvas.getContext("2d")
        ctx.clearRect(0,0,canvas.width,canvas.height)
        if(socket.id===data.drawer){
            setIsDrawer(true)
        }
        else{
            setIsDrawer(false)
        }
    })

    
   

    const handleMouseMove = (e)=>{

      if(!drawing||!isDrawer) return

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


    socket.off('guess_result')

    socket.on("guess_result",(data)=>{
        setMessages(prev=>[...prev,`${data.player} guessed the word correctly`])
    })

    socket.off("chat_message")
    socket.on("chat_message",(msg)=>{

    setMessages(prev => [...prev,msg])

    })

    
    
   

    socket.on("draw_move",(data)=>{
        ctx.beginPath()
        ctx.moveTo(data.lastX,data.lastY)
        ctx.lineTo(data.x,data.y)
        ctx.stroke()
    })

    return () => {
      socket.off("player_list")
      socket.off("draw_move")
      socket.off("chat_message")
    socket.off("guess_result")
    }

    

    }, [])

    const sendGuess=()=>{
        console.log("Guess clicked")
        socket.emit("guess",{
            name,room,guess
        })
    }
    const chooseWord=(word)=>{

    socket.emit("select_word",{room,word})

    setWordChoices([])

    }

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


        {isHost && (
            <div>
            <label>Rounds:</label>

            <input
            type="number"
            value={maxRounds}
            onChange={(e)=>setMaxRounds(e.target.value)}
            style={{width:"60px"}}
            />

            <button onClick={()=>socket.emit("start_game",{room,maxRounds})}>
            Start Game
            </button>

            </div>
            )}

      

        <h3>Players in Lobby</h3>

        {players.map(p => (
        <div key={p.id}>
        {p.name} — {p.score}
        </div>
        ))}
      </div>

    {wordChoices.length > 0 && (
    <div style={{marginTop:"10px"}}>
    <h3>Choose a word</h3>

    {wordChoices.map(w=>(
    <button key={w} onClick={()=>chooseWord(w)}>
    {w}
    </button>
    ))}

    </div>
    )}
      <canvas
      ref={canvasRef}
      width={600}
      height={400}
      style={{border:'2px solid black', marginTop:"20px"}}/>

    <div style={{marginTop:"20px"}}>

    <input
    disabled={isDrawer}
    placeholder="Enter guess..."
    value={guess}
    onChange={(e)=>setGuess(e.target.value)}
    />

    <button onClick={sendGuess}>
    Guess
    </button>

    </div>

    <div style={{marginTop:"20px"}}>

    <h3>Chat</h3>

    {messages.map((msg,i)=>(
    <div key={i}>
    {msg}
    </div>
    ))}

    </div>

    </div>
  )
}

export default Home