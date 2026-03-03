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

io.on("connection",()=>{
    console.log("User connected:",socket.id)

    socket.on("disconnect",()=>{
        console.log("User disconnected:",socket.id)
    })
})

const PORT=process.env.port || 3000


server.listen(PORT,()=>{
    console.log(`Server is running of port: ${PORT}`)
})