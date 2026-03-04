const express=require('express')
const http=require('http')
const {Server}=require('socket.io')
const cors=require('cors')
require('dotenv').config()
const app=express()
app.use(cors())
app.use(express.json())

const server=http.createServer(app)

const io=new Server(server,{
    cors:{
        origin:'*',
        methods:'*'
    }

})

let rooms={}


let currentWord="Apple"

io.on("connection",(socket)=>{
    console.log("User connected:",socket.id)

    socket.on("disconnect",()=>{
        console.log("User disconnected:",socket.id)
    })

    socket.on("guess",(data)=>{
        const {name,room,guess}=data
        if(guess.toLowerCase()===currentWord){
            io.to(room).emit("guess_result",{
                player:name,
                correct:true
            })
        }
        else{
            io.to(room).emit("chat_message",`${name}: ${guess}`)
        }
    })

    socket.on('join_room',({name,room})=>{
        socket.join(room)
        if(!rooms[room]){
            rooms[room]={
                players:[]
            }
        }

        rooms[room].players.push({
            id:socket.id,
            name,
            score:0
        })

        console.log(name,"joined",room)
        io.to(room).emit('player_list',rooms[room].players)
    })

    socket.on("draw_move",(data)=>{
        socket.to(data.room).emit("draw_move",data)
    })
})

const PORT=process.env.port || 3000


server.listen(PORT,()=>{
    console.log(`Server is running of port: ${PORT}`)
})