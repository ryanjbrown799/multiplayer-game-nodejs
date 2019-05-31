$(document).ready(function(){
	
	var canvas = document.getElementById("gameCanvas");
	var player = {name: "", chara: "" , role: "", posX: 0, posY: 0};
	var ctx = canvas.getContext("2d");
	var playersList = [];
	var socket = io();
	var otherPlayers = [];
	var speed = 16;
	var camX = 0;
	var camY = 0;
	var worldHeight = 0;
	var worldWidth = 0;
	var collidables = [];
	
	function Wall(x1,y1,x2,y2){
		this.x1 = x1;
		this.y1= y1;
		this.x2 = x2;
		this.y2 = y2;
		this.viewX = x1;
		this.viewY = y1;
		
		
	}



/********** initial interface **********/
	
	//set player name and show character select options
	$('#conButton').click(function(){
		var data = document.getElementById("userName").value;
		player.name = data;
		document.getElementById('newUser').style.display = "none";
		document.getElementById('displayCharas').style.display = "block";
		document.getElementById('c1').style.background = "green";
		document.getElementById('c2').style.background = "red";
		document.getElementById('c3').style.background = "blue";		
	});
	
	
	$('#displayCharas').click(function (e) {
		player.chara = e.target.id;
		loadChat();
	
	});
	
	//send player infor to server and show game and chat
	function loadChat(){
		socket.emit("intro", JSON.stringify(player));
		document.getElementById('displayCharas').style.display = "none";
		document.getElementById('hud').style.display = "block";
		document.getElementById('chatInput').style.display = "block";	
		document.getElementById('gameCanvas').style.display = "block";
	}
	
	//recieve map from server and generate wall list
	socket.on("loadWorld", function(data){
		data=JSON.parse(data);
		
		worldHeight= data.wrldH;
		worldWidth = data.wrldW;
		
		for(i=0;i<data.walls.length;i++){
			collidables.push(new Wall(data.walls[i].x1,data.walls[i].y1,data.walls[i].x2,data.walls[i].y2));
		}
		
		
	});
	
	//recieve welcome and load player
	socket.on("welcome",function(data){
		
		data = JSON.parse(data);
		player.role = data.role;
		player.posX = data.posX;
		player.posY = data.posY;
		
		
		var msg;
		if(player.role == "spectate"){
			msg = "Welcome "+data.name+", unfortunatley this game is full, but you can spectate";
		}
		if(player.role == "playing"){
			msg = "welcome " +data.name+ " you have selected " + data.chara;
			
		}

		$('#chatLog').append($('<li>').text(msg));
		
		//adjust cam for spawn point
		if(player.posX > canvas.width/2){camX=(canvas.width/2)-64;}
		if(player.posY > canvas.height/2){camY=(canvas.height/2)-64;}
	
	});
	
	
/********** hud **********/
	//send message and add your msg to your chatlog
	$('form').submit(function(e){
		e.preventDefault(); // prevents page reloading
		socket.emit('message', $('#m').val());
		$('#chatLog').append($('<li>').text("You: "+$('#m').val()));
		$('#chat')[0].scrollTop=$('#chat')[0].scrollHeight;
		$('#m').val('');
		return false;
		});
	
	//recieve message and show in log
	socket.on("message",function(data){
		console.log(data);
		$('#chatLog').append($('<li>').text(data));
		$('#chatLog')[0].scrollTop=$('#chatLog')[0].scrollHeight;

	});	
	
	//recieve list of other players
	socket.on("playerListUpdate", function(data){
		
		var data = JSON.parse(data);
		
			otherPlayers = data.filter(function(ele){  
				return ele.name!==player.name});
		//console.log(JSON.stringify(otherPlayers));
		$('#playersLog > li').text('');
		for(i=0;i<otherPlayers.length;i++){
			$('#playersLog').append($('<li>').text(otherPlayers[i].name));
		}

			
	});
	
	
/********** game **********/

	//recieve coord of other players and update their posistions
	socket.on("drawPlayers", function(data){
		var data = JSON.parse(data);

		for(j=0;j<data.length;j++){
			for(i=0;i<otherPlayers.length;i++){
				if(otherPlayers[i].name == data[j].name){
					otherPlayers[i].posX = data[j].posX;
					otherPlayers[i].posY = data[j].posY;
					otherPlayers[i].chara = data[j].chara;
				
				}
			
			}
		}
			
	});
	
	//movement
	$(document).keydown(function(e){
		
			switch(e.which){
				case 37: // left
						if(player.role=="playing"){
							var nextStep = player.posX -speed;
							var check = collisionCheck(nextStep,player.posY);
							if (check[0] == 1){
								break;
							}
							else{
								player.posX = nextStep;
								socket.emit("moveX",player.posX);
								setCam();
							}
						}
						if(player.role=="spectate"){
							player.posX -=speed;
							setSpectCam();
						}
						
						
					break;

				case 38: // up
						if(player.role=="playing"){
							var nextStep = player.posY -speed;
							
							var check = collisionCheck(player.posX,nextStep);
							if (check[0] == 1){
								break;
							}
							else{
								player.posY = nextStep;
								socket.emit("moveY",player.posY);
								setCam();
							}
						}
						if(player.role=="spectate"){
							player.posY -=speed;
							setSpectCam();
						}
						
					break;

				case 39: // right
						if(player.role=="playing"){			
							var nextStep = (player.posX +speed);
							
							var check = collisionCheck(nextStep,player.posY);
							if (check[0] == 1){
								break;
							}
							else{
								player.posX = nextStep;
								socket.emit("moveX",player.posX);
								setCam();
							}
						}
						if(player.role=="spectate"){
							player.posX +=speed;
							setSpectCam();
						}
					break;
		
				case 40: // down
						if(player.role=="playing"){	
							var nextStep = player.posY+speed;
							
							var check = collisionCheck(player.posX,nextStep);
							if (check[0] == 1){
								break;
							}
							else{
								player.posY = nextStep;
								socket.emit("moveY",player.posY);
								setCam();
							}
						}
						if(player.role=="spectate"){
							player.posY +=speed;
							setSpectCam();
						}
					break;
					
				default: return; // exit this handler for other keys
			}
			e.preventDefault();
	});	
	
	//loops through list of collidables and checks if there is a collision
	function collisionCheck(checkX,checkY){
		
		for(j=0;j<otherPlayers.length;j++){
			var left1 = otherPlayers[j].posX;
			var right1 = otherPlayers[j].posX+32;
			var top1 = otherPlayers[j].posY;
			var bot1 = otherPlayers[j].posY+32;
			
			if(checkX+32 > left1 && checkX < right1 && checkY+32 > top1 && checkY < bot1){
				
				return [1, left1, right1, top1, bot1];
			}
			
		}
		
		
		
		for(i=0;i<collidables.length;i++){
			
			var left1 = collidables[i].x1;
			var right1 = collidables[i].x1+collidables[i].x2;
			var top1 = collidables[i].y1;
			var bot1 = collidables[i].y1+collidables[i].y2;
			
			if(checkX+32 > left1 && checkX < right1 && checkY+32 > top1 && checkY < bot1){
				
				return [1, left1, right1, top1, bot1];
			}
		}
		return false;
	}

/*********** view **********/
	
	//draw blocks
	function drawPlayer(x1,y1,x2,y2,col) {
		var colour;
		
		switch(col){
			case "c1":
				colour = "green";
				break;
			case "c2":
				colour = "red";
				break;
			case "c3":
				colour = "blue";
				break;
			default:
				colour = "#0095DD";
		}
			
		ctx.beginPath();
		ctx.rect(x1,y1,x2,y2);
		ctx.fillStyle = colour;
		ctx.fill();
		ctx.closePath();
	}
	
	function setSpectCam(){
		camX = player.posX;
		camY = player.posY;
	}
	
	function setCam(){
	
		if(player.posX >= canvas.width/2 && player.posX <= worldWidth - canvas.width/2){
			camX =player.posX - canvas.width/2;
		}
		if(player.posY >= canvas.height/2 && player.posY <= worldHeight - canvas.height/2){
			camY =player.posY - canvas.height/2;
		}
		
	}
	//get player coords, draw map, draw players
	function draw() {
		socket.emit("drawPlayers", );
		
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		
		for(i=0;i<collidables.length;i++){
			drawPlayer(collidables[i].viewX-camX,collidables[i].viewY-camY,collidables[i].x2,collidables[i].y2,"#0095DD");
			
		}
		
		if(player.role=="playing"){
			drawPlayer(player.posX-camX,player.posY-camY,32,32,player.chara);
		}
		for(i=0;i<otherPlayers.length;i++){
			drawPlayer(0+otherPlayers[i].posX-camX,0+otherPlayers[i].posY-camY,32,32,otherPlayers[i].chara);
			
		}
	}
	setInterval(draw, 10);
		
});





