"use strict";

var	express = require('express'),
	bodyParser = require('body-parser'),
	randtoken = require('rand-token'),
	MongoClient = require('mongodb').MongoClient;

var app = express();

app.use(bodyParser.json());

app.get('/register', function(req, res) {
	let answer = {
		token: randtoken.generate(16)
	}
	res.send(answer);
});

app.listen(8080, function(){
	console.log('listening on *:3000');
});