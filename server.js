var	express = require('express'),
	bodyParser = require('body-parser');

var app = express();

app.use(bodyParser.json());

app.listen(8080, function(){
	console.log('listening on *:3000');
});