"use strict";

var	express = require('express'),
	bodyParser = require('body-parser'),
	randtoken = require('rand-token'),
	MongoClient = require('mongodb').MongoClient,
	Twitter = require('twitter'),
	EventEmitter = require('events'),
	io = require('socket.io')();

var mongodbHost = process.env.database || "localhost";

class EventHandler extends EventEmitter {}
const eventHandler = new EventHandler();

io.on('connection', function(socketClient){
	console.log("Client found!")
	eventHandler.on('config', function(data) {
		console.log("EVENT: " +  JSON.stringify(data));
		socketClient.emit('config', data);
	});
});
io.listen(8081);

var app = express();
MongoClient.connect("mongodb://" + mongodbHost + ":27017/spdhack", function(err, connection) {
	app.database = connection;
});

var client = new Twitter({
	consumer_key: process.env.ckey,
	consumer_secret: process.env.csecret,
	access_token_key: process.env.atkey,
	access_token_secret: process.env.atsecret
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/www/index.html');
});

app.get('/logo.png', function(req, res) {
	res.sendFile(__dirname + '/www/logo.png');
});

app.post('/register', function(req, res) {
	let user = req.body.user

	var answer = {
		user: user,
		token: randtoken.generate(16)
	}
		let collection = app.database.collection('users');
		let insertData = {
			username: answer.user,
			token: answer.token,
		};

		collection.insert(insertData, {safe: true}, function(err, data) {
    		console.log("done!");
    	});

	res.send(answer);
});

function verifyUser(token, callback) {
	let collection = app.database.collection('users');

	console.log("TOKEN: " + token)

	collection.findOne({token: token}, function(err, answer) {
		callback(err, answer);
	});
}

function getScore(callback) {
	let collection = app.database.collection('scores');
	var score = 0;
	collection.find({}).toArray(function(err, data) {
		data.forEach(function(element, index) {
			score = score + element.score;
			if(index == data.length - 1) {
				callback(score);
			}
		});
	});
}

function countUser(callback) {
	let collection = app.database.collection('users');
	collection.count(function(err, data) {
		callback(data);
	});
}

function countSession(callback) {
	let collection = app.database.collection('sessions');
	collection.count(function(err, data) {
		callback(data);
	});
}

function generateConfig(callback) {
	let collection = app.database.collection('scores');
	getScore(function(score) {
		countUser(function(user) {
			countSession(function(session) {
				callback({score: score, user: user, session: session});
			});
		});
	});
}

app.put('/me/scores', function(req, res) {
	let score = req.body.score,
		token = req.body.token,
		session = req.body.session;

	verifyUser(token, function(err, data) {
		let username = data.username;

		let insertData = {
			username: username,
			score: parseInt(score)
		};

		let collection = app.database.collection('scores');
		collection.insert(insertData, {safe: true}, function(err, data) {
	    	res.send(data);
	    	generateConfig(function(data) {
   				eventHandler.emit('config', data);
   			});
	    });

	    let sessionCollecton = app.database.collection('sessions');
	   	sessionCollecton.remove({session: session});
	});
});

app.get('/scores', function(req, res) {
	let options = {
		"sort": [["score", "desc"]],
		"limit": 5
	};

	let collection = app.database.collection('scores');
	collection.find({}, options).toArray(function(err, answer) {
		res.send(answer);
	});
});

app.get('/configs', function(req, res) {
	generateConfig(function(data) {
		res.send(data);
	});
});

app.get('/twitter', function(req, res) {
	getScore(function(score) {
		countUser(function(user) {
			let tweet = `Seit unserer Abfahrt haben wir bereits ${score} km zurück gelegt und ${user} Passagiere sind auf den Chulzzug aufgesprungen! #SPDHack`;
			console.log(tweet)
			client.post('statuses/update', {status: tweet}, function(error, tweet, response) {
				console.log(response)
				if (!error) {
					console.log(tweet);
				}
			});
		});
	});
});

app.get('/me/scores', function(req, res) {
	var token = req.body.token,
		session = req.body.session;

	verifyUser(token, function(err, data) {
		console.log("DATA: " + JSON.stringify(data))

		let collection = app.database.collection('scores');
		let options = {
			"sort": [["score", "desc"]],
			"limit": 1
		};
		collection.findOne({"username": data.username}, options, function(err, answer) {
			console.log("ANSWER: " + JSON.stringify(answer))
			res.send(answer);
			generateConfig(function(data) {
   				eventHandler.emit('config', data);
   			});
		});
	});
});

app.post('/me/starts', function(req, res) {
	let round = randtoken.generate(16),
		token = req.body.token;

	let collection = app.database.collection('sessions');
	let insertData = {
		user: token,
		session: round
	};

	collection.insert(insertData, {safe: true}, function(err, data) {
   		console.log("done!");
   		delete insertData._id;
   		res.send(insertData);

   		generateConfig(function(data) {
   			eventHandler.emit('config', data);
   		});
   	});	
});

app.listen(8080, function(){
	console.log('listening on *:3000');
});