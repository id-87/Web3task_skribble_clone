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
    rooms[room].drawer = drawer.id


    const options = []

    for(let i=0;i<3;i++){
    options.push(words[Math.floor(Math.random()*words.length)])
    }


    io.to(room).emit('round_start',{drawer:drawer.id})


    io.to(drawer.id).emit("word_options",options)
        
}


const words=["apple",'car','house','tree','cat','phone']

io.on("connection",(socket)=>{
    console.log("User connected:",socket.id)

    socket.on("disconnect",()=>{
        console.log("User disconnected:",socket.id)
    })

    socket.on("select_word",({room,word})=>{

    rooms[room].currentWord = word

    io.to(room).emit("chat_message","Word selected. Start guessing!")

})

    socket.on("start_game",(room)=>{

        if(socket.id !== rooms[room].host){
        return
        }

        startRound(room)

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
            players:[],
            host:socket.id,
            currentWord:null,
            drawer:null
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