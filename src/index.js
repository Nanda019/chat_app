const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generatemessage,generatelocation}= require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
    console.log('New WebSocket connection')

    // socket.emit('message', generatemessage('Welcome!'))
    // socket.broadcast.emit('message', generatemessage('A new user has joined!'))      // to display the text for all except the new joiner. 'broadcast' is used

    socket.on('join',({username,room},callback)=>{
        const {error,user}=addUser({id: socket.id,username:username,room:room})

        if (error) {
            return callback(error)
        }

        socket.join(user.room)   // send message only in that room

        //io.to.emit => to send message everyone inside that room
        //socket.broadcast.to.emit => to send to everyone in the room except that sender

        socket.emit('message', generatemessage('Admin',`Welcome ${user.username}!`))
        socket.broadcast.to(user.room).emit('message', generatemessage('Admin',`${user.username} has joined!`)) 

        //for sidebar
        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUsersInRoom(user.room)
        })

        callback()

    })


    // socket.on('sendMessage', (message) => {
    //     io.emit('message', message)
    // })

    //with event acknowledgement
    socket.on('sendMessage', (message, callback) => {
        const user=getUser(socket.id)
        const filter = new Filter()

        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed!')
        }

        io.to(user.room).emit('message', generatemessage(user.username,message))
        callback()
    })

    // socket.on('location',(location)=>{
    //     io.emit('message',location)
    // })



    //with event acknowledgement
    socket.on('sendLocation', (location, callback) => {
        const user=getUser(socket.id)
        io.to(user.room).emit('location-message', generatelocation(user.username,location))
        callback()
    })

    socket.on('disconnect', () => {         // to notify that a user has left to everyone. 'disconnect' keyword is used.
        const user=removeUser(socket.id)

        if(user){
            io.to(user.room).emit('message', generatemessage('Admin',`${user.username} has left!`))     
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })  
})

server.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
})