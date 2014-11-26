var httpd = require('http').createServer(handler);
var io = require('socket.io').listen(httpd);
var chat = io.of('/chat');//Using namespace
var fs = require('fs');
httpd.listen(4000);
//test
function handler(req, response) {
	fs.readFile(__dirname + '/index.html',
		function(err, data) {
			if (err) {
				response.writeHead(500);
				return response.end('Error loading index.html');
			}
			response.writeHead(200);
			response.writeHeader(200, {"Content-Type": "text/html"});  
			response.write(data);  
			response.end();  
		}
	);
}

chat.on('connection', function (socket) {

	socket.on('clientMessage', function(content) {
		socket.get('username', function(err, username){
			var msg = username + " : " + content.body + "<<<" + content.title;
			console.log(msg);
			socket.emit('serverMessage', msg);
			socket.broadcast.emit('serverMessage', msg);
		});

	});
	
	socket.on('loginMessage', function(username) {
		socket.set('username', username, function(err) {
			if (err) { throw err; }
			socket.emit('serverMessage', 'Currently logged in as ' + username);
			socket.broadcast.emit('serverMessage', 'User ' + username +	' logged in');
		});
	});
	
	socket.on('disconnect', function() {
		socket.get('username', function(err, username) {
		if (!username) {
			username = socket.id;
		}
		
		socket.broadcast.emit('serverMessage', 'User ' + username +	' disconnected');
		});
	});

});

