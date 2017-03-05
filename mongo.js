var MongoClient = require('mongodb').MongoClient;

// Connect to the db

var testUser = {
	_id: 0,
	username: 'peter',
	token: 'EstnUFIXM1Z34tAC'
};

var testScore = {
	_id: 0,
	username: 'peter',
	distance: 1,
	score: 123
};

var testSession = {
	_id: 0,
	user: 'EstnUFIXM1Z34tAC',
	session: 'EstnUFZUX1Z34tAC'
};

var mongodbHost = process.env.database || "localhost";
MongoClient.connect("mongodb://" + mongodbHost + ":27017/spdhack", function(err, db) {
	console.log("connected");

	var userCollection = db.collection('users');
	var scoreCollection = db.collection('scores');
	var sessionCollection = db.collection('sessions');

	userCollection.remove();
	scoreCollection.remove();

	var counter = 0;
	function updateCounter() {
		counter++;
		if(counter == 3) {
			console.log("Done!");
			process.exit();
		}
	}

	userCollection.insert(testUser, {safe: true}, function(err, data) {
		userCollection.find({_id: 0}).toArray(function(err, data) {
			console.log(data);
			updateCounter();
		});
	});

	scoreCollection.insert(testScore, {safe: true}, function(err, data) {
		scoreCollection.find({_id: 0}).toArray(function(err, data) {
			console.log(data);
			updateCounter();
		});
	});

	sessionCollection.insert(testSession, {safe: true}, function(err, data) {
		sessionCollection.find({_id: 0}).toArray(function(err, data) {
			console.log(data);
			updateCounter();
		});
	});
});