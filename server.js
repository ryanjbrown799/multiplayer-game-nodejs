const express = require('express');
const app = express();
const port = 3000;
var server = require('http').createServer(app);
const io = require('socket.io')(server);
var fs = require('fs');
var path = require("path");


var playerList = [];
var spectatorList = [];
var maxPlayers = 0;
var map = {wrldH: 0, wrldW: 0, walls: [], spawns: []};


//print players
function getPlayerList(){
			var ret = [];
			for(var i=0;i<playerList.length;i++){
				ret.push(playerList[i]);
			}
			return ret;
		}
		
//print spectators
function getSpectatorList(){
			var ret = [];
			for(var i=0;i<spectatorList.length;i++){
				ret.push(spectatorList[i]);
			}
			return ret;
		}

//load map
fs.readFile('./public/map.json', function(err, contents) {
	map = JSON.parse(contents);
	maxPlayers = map.spawns.length;
	
	console.log(map);
	
	
});

io.on('connection', function(socket){
	
	
	console.log('a user connected');
	socket.player = {name: "", chara: "" , role: "", posX: 0, posY: 0};
	
	//get player name and character, if there is enough room spawn player in game or have them spectate
	socket.on("intro", function(data){

		data = JSON.parse(data);
		socket.player.name = data.name;
		socket.player.chara = data.chara;
		
		if(playerList.length < maxPlayers){
	
			socket.player.role = "playing";
			playerList.push(socket.player);
			
			//set spawn
			var indx = (playerList.length-1);
			socket.player.posX = map.spawns[indx].x1;
			socket.player.posY = map.spawns[indx].y1;
			
			console.log(getPlayerList());
			
		}
		else {
			socket.player.role = "spectate";
			spectatorList.push(socket.player);
			
			console.log(getSpectatorList());	
		}
		
		//send player map, update the list of players, welcome the player
		
		socket.emit("loadWorld", JSON.stringify(map));
		io.emit("playerListUpdate", JSON.stringify(playerList));
		socket.emit("welcome", JSON.stringify(socket.player));
	});
	
	
	//handle msgs
	socket.on("message", function(data){
		console.log("User: "+socket.player.name+" says "+data);
		socket.broadcast.emit("message",socket.player.name+": " +data);
	});
	
	//send coord of players
	socket.on("drawPlayers", function(data){
		var movements = [];
		for(i=0; i< playerList.length; i++){	
			var movement = {name: playerList[i].name, chara: playerList[i].chara, posX: playerList[i].posX, posY: playerList[i].posY};	
			movements.push(movement);
		}	
		
		io.emit("drawPlayers", JSON.stringify(movements));
		
	});

	//update player x
	socket.on("moveX", function(data){
		socket.player.posX = data;
	});
	
	//update player y
	socket.on("moveY", function(data){
		socket.player.posY = data;
	});
	
	
	
	//remove player from lists when they disconnect
	socket.on('disconnect', function(){
		console.log('user disconnected');
		
		if(socket.player.role == "playing"){
			playerList = playerList.filter(function(ele){  
			return ele!==socket.player});
			io.emit("playerListUpdate", JSON.stringify(playerList));
		};
			
		if(socket.player.role == "spectate"){
			spectatorList = spectatorList.filter(function(ele){  
				return ele!==socket.player});
		}
		
	});
});





app.get('/',function(req,res){
	res.sendFile(path.join(__dirname, './public', 'index.html'));
});

app.get('/public/game.js',function(req,res){
	res.sendFile(path.join(__dirname, '/public', 'game.js'));
});

app.get('/public/styles.css',function(req,res){
	res.sendFile(path.join(__dirname, '/public', 'styles.css'));
});

server.listen(port, function() {
	console.log("Running on port: " + port)});