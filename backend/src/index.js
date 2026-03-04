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

function startRound(room){
    const players=rooms[room].players
    if(players.length===0){
        return
    }
    const drawer=players[Math.floor(Math.random()*players.length)]
    const word=words[Math.floor(Math.random()*words.length)]

    rooms[room].currentWord=word
    rooms[room].drawer=drawer.id

    io.to(room).emit('round_start',{drawer:drawer.id})

    io.to(drawer.id).emit("your_word",word)
}


const words=["apple",'car','house','tree','cat','phone']

io.on("connection",(socket)=>{
    console.log("User connected:",socket.id)

    socket.on("disconnect",()=>{
        console.log("User disconnected:",socket.id)
    })

    socket.on("guess",(data)=>{

    const {name,room,guess} = data

    const word = rooms[room].currentWord

    if(guess.toLowerCase() === word){

        const player = rooms[room].players.find(p=>p.name===name)

        if(player){
        player.score += 10
        }

        io.to(room).emit("player_list",rooms[room].players)

        io.to(room).emit("chat_message",`${name} guessed correctly!`)

        startRound(room)

    } else {

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

        if(rooms[room].players.length>=2){
            startRound(room)
        }
    })

    socket.on("draw_move",(data)=>{
        socket.to(data.room).emit("draw_move",data)
    })
})

const PORT=process.env.port || 3000


server.listen(PORT,()=>{
    console.log(`Server is running of port: ${PORT}`)
})