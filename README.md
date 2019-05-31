# multiplayer-game-nodejs
HTML5 multiplayer game using nodejs with map editor
by Ryan Brown

INSTALL
download files
open terminal in root directory
  npm install express
  npm install socket.io

To run 
  open terminal in root directory start the server
    node server.js
  open web browser and goto http://localhost:3000
  or enter the ip address of the device running the server and connect to port 3000
  example - 192.168.50.133:3000

Once in game enter a username and select a colour
  use arrow keys to move around
  enter text and click send or press enter to send messages in the chat

To create a map
  open map_editor.html
  to change map size enter desired dimensions and click change
  to insert walls click walls and then click on areas of the map to place
  to insert spawn points click spwan point then click on the map to place a spawn point
  once finished click generate
    the individual 16x16 walls that are togther forming larger rectangles will be grouped together
    into single wall objects with larger dimensions
    the wall objects and spawn point objects will then be saved as map.json
    open downloads folder and move this file to the public folder replacing the current map.json

About
  uses node.js with express and socket.io to create a webserver that runs a multiplayer HTML5 game
  currently the game is very basic, players are squares that move around a map with walls, players 
  can message each other. If more players enter the game then spawn points set, they enter spectator 
  mode and can watch the other players play and chat with them
  
Known bugs
  collisions with other players if both are moving can cause them to get stuck on each other
  likely due to moving to the same point before recieving from the server the other players coord
  
Things to add
  creating boundaries around map so players don't move off screen
  fixing collision checking with other players
  creating multiple game rooms, that players can start if the one game is full
  more game play related things- points, combat system, inventories etc 
