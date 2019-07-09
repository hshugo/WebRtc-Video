const HTTPS_PORT = 8445;

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
var app = express();

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

app.use(express.static('client'));

const httpsServer = https.createServer(serverConfig, app);
httpsServer.listen(HTTPS_PORT, '0.0.0.0');


var portNumber = 3000;
var server = app.listen(portNumber, function () {
  console.log('App listening on port '+portNumber+'!');
});
var io = require('socket.io').listen(server);

const port = new SerialPort('/dev/ttyACM0', { baudRate: 9600 });
//READLINE
const Readline = require('@serialport/parser-readline');
const parser = port.pipe(new Readline({ delimiter: '\n' }));

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
  console.log("CONEXION EN SOCKET IO ESTABLECIDA!!");
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
