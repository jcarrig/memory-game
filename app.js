
/**
 * Module dependencies.
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


var MemoryGame = require('./MemoryGame.js').MemoryGame;
var memoryGame = new MemoryGame();

// Routes
app.get('/', function(req,res) {
	//create a new game of in the database
	memoryGame.newGame(function(error, game){
		//get dealt cards for the game and display them
		memoryGame.dealGame(game, function(error, cards) {
			if(error) callback(error)
			else {
				//res.send(util.inspect(cards));
				res.render('index.jade', { 
					locals: {
						title: 'memory',
						cards:cards
					}
				});
			}
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





app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);





