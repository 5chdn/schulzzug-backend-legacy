"use strict";

var	express = require('express'),
	bodyParser = require('body-parser'),
	randtoken = require('rand-token'),
	MongoClient = require('mongodb').MongoClient;

var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/www/index.html');
});

app.post('/register', function(req, res) {
	let user = req.body.user

	var answer = {
		user: user,
		token: randtoken.generate(16)
	}

	var mongodbHost = process.env.database || "localhost";
	MongoClient.connect("mongodb://" + mongodbHost + ":27017/spdhack", function(err, connection) {
		let collection = connection.collection('users');
		let insertData = {
			username: answer.user,
			token: answer.token
		};

		collection.insert(insertData, {safe: true}, function(err, data) {
    		console.log("done!");
    	});
	});	

	res.send(answer);
});

app.put('/score/:user', function(req, res) {
	let user = req.params.user,
		score = req.body.score;
	
	var mongodbHost = process.env.database || "localhost";
	MongoClient.connect("mongodb://" + mongodbHost + ":27017/spdhack", function(err, connection) {
		let collection = connection.collection('score');
		let insertData = {
			username: user,
			score: score
		};

		collection.insert(insertData, {safe: true}, function(err, data) {
    		console.log("done!");
    	});
	});

	res.send(user);
});

app.get('/score', function(req, res) {
	var mongodbHost = process.env.database || "localhost";
	MongoClient.connect("mongodb://" + mongodbHost + ":27017/spdhack", function(err, connection) {
		let collection = connection.collection('scores');
			let options = {
				"sort": [["score", "desc"]],
				"limit": 1
			};
			collection.findOne({}, options, function(err, answer) {
			res.send(answer);
		});
	});
});

app.get('/score/:user', function(req, res) {
	var user = req.params.user;

	var mongodbHost = process.env.database || "localhost";
	MongoClient.connect("mongodb://" + mongodbHost + ":27017/spdhack", function(err, connection) {
		let collection = connection.collection('scores');
			let options = {
				"sort": [["score", "desc"]],
				"limit": 1
			};
			collection.findOne({"username": user}, options, function(err, answer) {
			res.send(answer);
		});
	});
});

app.listen(8080, function(){
	console.log('listening on *:8080');
});