
/**
 * Module dependencies. - testing startScreen branch
 */

var express = require('express')
  , stylus = require('stylus')
  , nib = require('nib')
  , routes = require('./routes')
  , util = require('util')
;

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(stylus.middleware({
    src: __dirname + '/public',
    compile: compile
  }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

function compile(str, path) {
  return stylus(str)
    .set('filename', path)
    .set('compress', true)
    .use(nib());
}

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});


// io events to recieve and send
var io = require('socket.io').listen(app);
io.sockets.on('connection', function(socket) {
	// listens to see if new game with a tag has started and sends
	// tag update to browser to update Popular recent tags
	socket.on('startedGame', function(data){
		socket.broadcast.emit('tagUpdate', data.gameTag);
	});
});


// mongodb url
var dburl = process.env['MONGOLAB_URI'] != null ? process.env['MONGOLAB_URI'] : 'mongodb://localhost:27017/memorygame';
var dbconfig = require('./dbconfig.js').dbconfig(dburl);


// create memoryGame 
var MemoryGame = require('./MemoryGame.js').MemoryGame;
var memoryGame = new MemoryGame(dbconfig);


// Routes
app.get('/', function(req,res) {
	memoryGame.getPopularTags(function(error, tags){
		if(error) callback(error);
		else{
			res.render('index.jade', {
				locals: {
					tags: tags
				}
			});
		}
	});
});

app.post('/start', function(req,res) {
	
	var gameConfig = {
		'matches': 8
	,	'tag': req.param('tag')
	};
	
	//create a new game of in the database
	memoryGame.newGame(gameConfig, function(error, game){
		//load photos from instagram
		memoryGame.getPhotos(function(error, photos){
			//add game and photos to db
			memoryGame.setupGame({'games':game, 'photos':photos}, function(error, game) {
				//get dealt cards for the game and display them
				memoryGame.dealGame(game, function(error, cards) {
					if(error) callback(error)
					else {
						res.send(cards);
					}
				});
			});
		});
	});
});

app.get('/flip/:game_id/:card_id', function(req, res) {
	memoryGame.flipCard(req.params.game_id, req.params.card_id, function(error, pic) {
		if(error) callback(error)
		else {
			res.send(pic);
		}
	});
});

var port = process.env.PORT || 3000;
app.listen(port);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);





