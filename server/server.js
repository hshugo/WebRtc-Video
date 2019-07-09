const HTTPS_PORT = 8443;

const fs = require('fs');
const https = require('https');
const WebSocket = require('ws');
const WebSocketServer = WebSocket.Server;

// Yes, TLS is required
const serverConfig = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem'),
};

/*+++++++++++++++++++INICIO: +++++++++++++++++++++++++*/
const SerialPort = require('serialport');
var express = require('express');
//var path = require('path');
var app = express();
//var portNumber = 3000;

/*
var options = {
  key: fs.readFileSync('./public/ssl/server.key'),
  cert: fs.readFileSync('./public/ssl/server.crt')
};
*/
/*
var server = https.createServer(options, app).listen(portNumber, function () {
  console.log('App listening on port '+portNumber+'!');
});
*/
const httpsServer = https.createServer(serverConfig, app);
httpsServer.listen(HTTPS_PORT, '0.0.0.0');

var io = require('socket.io').listen(httpsServer);


const port = new SerialPort('/dev/ttyACM0', { baudRate: 9600 });
//READLINE
const Readline = require('@serialport/parser-readline');
const parser = port.pipe(new Readline({ delimiter: '\n' }));

//SET PUBLIC
app.use(express.static('client'));

//GET DIRECTORY

/*app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname+'/public/index.html'));
});
*/


// Read the port data SERIAL
port.on("open", () => {
  console.log('serial port open');
});

parser.on('data', data => {
  console.log(':::::>>>arduino:', data);
});

//INIT IO CONECTION
io.on('connection', function(socket) {
  //SOCKET IO DIRECTION
  socket.on('direction', function(data) {
    console.log(data.direction);
    //SET DATA TO SERIAL PORT
    port.write(data.direction, (err) => {
      if (err) {
        return console.log('Error on write: ', err.message);
      }
      console.log('message written');
    });
  });
});

/*++++++++++++++++++++FN++++++++++++++++++++*/

// ----------------------------------------------------------------------------------------

// Create a server for the client html page
const handleRequest = function(request, response) {
  // Render the single client html file for any request the HTTP server receives
  console.log('request received: ' + request.url);

  if(request.url === '/') {
    response.writeHead(200, {'Content-Type': 'text/html'});
    response.end(fs.readFileSync('client/index.html'));
  } else if(request.url === '/webrtc.js') {
    response.writeHead(200, {'Content-Type': 'application/javascript'});
    response.end(fs.readFileSync('client/webrtc.js'));
  }
};

/*
const httpsServer = https.createServer(serverConfig, handleRequest);
httpsServer.listen(HTTPS_PORT, '0.0.0.0');
*/

// ----------------------------------------------------------------------------------------

// Create a server for handling websocket calls
const wss = new WebSocketServer({server: httpsServer});

wss.on('connection', function(ws) {
  ws.on('message', function(message) {
    // Broadcast any received message to all clients
    console.log('received: %s', message);
    wss.broadcast(message);
  });
});

wss.broadcast = function(data) {
  this.clients.forEach(function(client) {
    if(client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};

console.log('Server running. Visit https://localhost:' + HTTPS_PORT + ' in Firefox/Chrome.\n\n\
Some important notes:\n\
  * Note the HTTPS; there is no HTTP -> HTTPS redirect.\n\
  * You\'ll also need to accept the invalid TLS certificate.\n\
  * Some browsers or OSs may not allow the webcam to be used by multiple pages at once. You may need to use two different browsers or machines.\n'
);
