$(document).ready(function(){

	var canvas = document.getElementById("mapCanvas");
	var ctx = canvas.getContext("2d");
	var walls = [];
	var worldHeight=480;
	var worldWidth=640;
	var map = {wrldH: 0, wrldW: 0, walls: [], spawns: []};
	var spawns= [];
	
	var insertEle = "wall";
	
	function SpawnPoints(x1,y1){
		this.x1 = x1;
		this.y1 = y1;
	}
		
	function Wall(x1,y1,x2,y2){
		this.x1 = x1;
		this.y1= y1;
		this.x2 = x2;
		this.y2 = y2;
	}
	
	
	function closestCoord(val, grid){
		var coord;	
		coord = val - (val%grid);
		return coord;
	}
	
	$('#insertWall').click(function(){
		insertEle="wall";
		//console.log(insertEle);
	
	});
	
	$('#insertSpawn').click(function(){
		insertEle="spawn";
		//console.log(insertEle);
	});
	
	//alter size of map, remove blocks and spawn points that are outside of new map size
	$( "#changeSize" ).click(function() {
		
		worldWidth = closestCoord($('input[name="wrldWidth"]').val(),16);
		worldHeight = closestCoord($('input[name="wrldHeight"]').val(),16);
		$('input[name="wrldWidth"]').val(worldWidth);
		$('input[name="wrldHeight"]').val(worldHeight);
		canvas.width=worldWidth;
		canvas.height=worldHeight;
		
		for(i=0;i<walls.length;i++){
			walls = walls.filter(function(ele){
				return (((ele.x1+ele.x2) <= worldWidth) && ((ele.y1+ele.y2) <= worldHeight));
			});
		}
			
			
		for(i=0;i<spawns.length;i++){
			spawns = spawns.filter(function(ele){
				return (((ele.x1+32) < worldWidth) && ((ele.y1+32) < worldHeight));
			});
			
		}
		
		
	});
	
	

	// when mouse button is clicked on map insert wall or spawn point    
	$('#mapCanvas').on('mousedown', function(e){
		var pos = getMousePos(canvas, e);
		var x = pos.x;
		var y = pos.y;
		
		if ((x%16)!=0){ 
			x=closestCoord(x,16);
		}
		if ((y%16)!=0){
			y=closestCoord(y,16);
		}
		
		
		
		if(insertEle =="wall"){
			var wallExists=0;
			for(i=0;i<walls.length;i++){
				if(walls[i].x1== x && walls[i].y1==y){
					wallExists=1;
				}
			}
			if(x<=worldWidth-16 && y<=worldHeight-16){
			
				if(!wallExists){
					walls.push(new Wall(x,y,16,16));
				}
			}
		
		}
		
		if(insertEle =="spawn"){
			var spawnExists=0;
			for(i=0;i<spawns.length;i++){
				if(spawns[i].x1== x && spawns[i].y1==y){
					spawnExists=1;
				}
			}
			if(x<=worldWidth-16 && y<=worldHeight-16){
			
				if(!spawnExists){
					spawns.push(new SpawnPoints(x,y));
				}
			}
			
		}
		
	});
	// get mouse pos relative to canvas
	function getMousePos(canvas, evt) {
		var rect = canvas.getBoundingClientRect();
		return {
			x: evt.clientX - rect.left,
			y: evt.clientY - rect.top
		};
	}
	
	//all walls created start as 16x16, when the map is generated walls that 
	//are touching are grouped together as new walls with larger dimensions 
	//to reduice amount of wall objects
	$('#genButton').click(function(){
		var temp1 = [];
		//sort by row
		walls.sort(function(a, b){
			
			if (a.y1 < b.y1) return -1;
			if (a.y1 > b.y1) return 1;
			
			if (a.x1 > b.x1) return 1;
			if (a.x1 < b.x1) return -1;
		});
		
		var x1=0;
		var x2=0;
		var y1=0;
		var y2=0;
		
		var i=0;
		
		//group walls next to each other on same row
		while(i<walls.length){
			y1=walls[i].y1;
			y2=walls[i].y2;
			x1=walls[i].x1;
			x2=walls[i].x2;
			
			//check if next wall exists
			if(i+1<walls.length){
				var j=i+1;
				var n=1;
				
				//check if next wall next to current
				while((walls[j].x1) == (x1+16*n)){
					x2+=16;
					
					//if next wall exists
					if((j+1)<walls.length){
						j++;
						n++;
					
					}
					else{
						n++;
						break;
					}
				}
				temp1.push(new Wall(x1,y1,x2,y2));	
				i=i+n;
			}
			else{
				temp1.push(new Wall(x1,y1,x2,y2));
				i++;
				
			}
		}
		//console.log(walls);
		//console.log(temp1);
		
		//group walls next to each other on same column
		j=0;
		var temp2=[];
		
		while(j<temp1.length){
			
			k=j+1;
			
			y1=temp1[j].y1;
			y2=temp1[j].y2;
			x1=temp1[j].x1;
			x2=temp1[j].x2;
			var n=1;
			while(k<temp1.length){
				if(temp1[j].x1 == temp1[k].x1 && temp1[j].x2 == temp1[k].x2){
					if(temp1[k].y1 == (temp1[j].y1+16*n)){
						temp1[k].y1=-1;
						y2+=16;
						n++;
					}
				
				}
				k++;
			}
			
			temp2.push(new Wall(x1,y1,x2,y2));
			j++;
			
		}
		
		temp2 = temp2.filter(function(ele){
			return ele.y1 !== -1;
		});
		
		//console.log(temp2);
		walls = temp2;
		//console.log(walls);
		map.spawns = spawns;
		map.wrldH = worldHeight;
		map.wrldW = worldWidth;
		map.walls = walls;
		save('map.json',JSON.stringify(map));
			
	});
	//save map.json
	function save(filename, data) {
		var blob = new Blob([data], {type: 'text/csv'});
		if(window.navigator.msSaveOrOpenBlob) {
			window.navigator.msSaveBlob(blob, filename);
		}
		else{
			var elem = window.document.createElement('a');
			elem.href = window.URL.createObjectURL(blob);
			elem.download = filename;        
			document.body.appendChild(elem);
			elem.click();        
			document.body.removeChild(elem);
			window.URL.revokeObjectURL(blob);
		}
	}
	
		
	
	function drawWall(x1,y1,x2,y2,col) {
		ctx.beginPath();
		ctx.rect(x1,y1,x2,y2);
		ctx.fillStyle = col;
		ctx.fill();
		ctx.closePath();
	}

	function drawGrid(){
		
		for(i=0;i<=worldWidth;i+=16){
			
			ctx.beginPath();
			ctx.moveTo(i, 0);
			ctx.lineTo(i, worldHeight);
			ctx.strokeStlye = "black";
			ctx.stroke();
		}
		
		for(i=0;i<=worldHeight;i+=16){
			
			ctx.beginPath();
			ctx.moveTo(0, i);
			ctx.lineTo(worldWidth, i);
			ctx.strokeStlye = "black";
			ctx.stroke();
		}
	}
	
	function draw() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		
		drawGrid();
		
		for(i=0;i<walls.length;i++){
			drawWall(walls[i].x1,walls[i].y1,walls[i].x2,walls[i].y2,"#0095DD");
		}
		
		for(i=0;i<spawns.length;i++){
			drawWall(spawns[i].x1,spawns[i].y1,32,32,"red");
		}
		
		
		
	}setInterval(draw, 10);

});