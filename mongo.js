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

var mongodbHost = process.env.database || "localhost";
MongoClient.connect("mongodb://" + mongodbHost + ":27017/spdhack", function(err, db) {
	console.log("connected");

	var userCollection = db.collection('users');
	var scoreCollection = db.collection('scores');

	userCollection.remove();
	scoreCollection.remove();

	var counter = 0;
	function updateCounter() {
		counter++;
		if(counter == 2) {
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
});