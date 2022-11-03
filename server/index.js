const express = require('express')
const socketio = require('socket.io')
const http = require('http')

// import the helper function for usres

const {addUser,removeUser,getUser,getUsersInRoom} =require('./users.js');

const PORT = process.env.PORT | 5000;


const router = require('./router');
const { SocketAddress } = require('net');


// Basic rundown for getting socket io server working
const app = express();

const server = http.createServer(app);

const io = socketio(server,{cors: {origin: "*",methods: ["GET", "POST"]}});

app.use(router)

// Register clients using socket.io

io.on("connection",(socket) => {
	socket.on('join',({name,room},callback) => {
		console.log(socket.id);
		const {error,user} = addUser({id:socket.id,name,room});
		
		if(error) return callback(error);

		socket.emit('message',{user: 'admin',text:`${user.name}, welcome to the room ${user.room}` })
		
		socket.broadcast.to(user.room).emit('message',{user: 'admin', text:`${user.name}, has joined!`})

		socket.join(user.room); 
		console.log(getUser(socket.id));
		callback();
	}) 

	socket.on('sendMessage',(message,callback) => {
		console.log(socket.id);

		const user = getUser(socket.id);

		io.to(user.room).emit('message',{user:user.name,text: message});

		callback();
	});

	socket.on('disconnect',() => {
		console.log('User has left!!');
	});
})


// Run Server

 server.listen(PORT,() => console.log(`Server has started on port: ${PORT}`));



