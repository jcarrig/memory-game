//MemoryGame.js

var Db = require('mongodb').Db;
var Server = require('mongodb').Server;
var ObjectID = require('mongodb').ObjectID;
var util = require('util');

//authenticate instagram api
var instagram = require('instagram').createClient(process.env['INSTAGRAM_CLIENT_ID'] ,process.env['INSTAGRAM_CLIENT_SECRET'] );

MemoryGame = function(dbconfig, callback){
	//connecting to mongo db
	this.db= new Db(dbconfig.database, new Server(dbconfig.hostname, dbconfig.port, {auto_reconnect: true}));
	//authenticate the server
	if(dbconfig.auth) {
		this.db.open(function(err, data) { 
			if(err) callback(err);
			else {
				data.authenticate(dbconfig.username, dbconfig.password, function(err2, data2) { 
					if(err2) callback(err2)
					else{
						callback(null,data2);
					}
					//if(data2){
					//	console.log("database opened");
					//}
					//else{
					//	console.log(err2);
					//}
				});
			}
		});
	}else{
		this.db.open(function() {});
	}	
	
	this.cards = [];
};

MemoryGame.prototype.getCollection = function(callback) {
	this.db.collection('games', function(error, game_collection) {
		if(error) callback(error)
		else callback(null, game_collection)
	});
}

MemoryGame.prototype.newGame = function(callback) {
	this.getCollection(function(error, games) {
		if(error) callback(error)
		else {
			//this.game_id = 'gPYfDz';
			//callback(null, this.game_id);
			//uncomment when you want to hit instagram and make a new game
			var numMatches = 8;
			var numCards = 2 * numMatches;
			this.game_id = "g"+makeid();
			var card = {};
			
			instagram.media.popular(function(images, error) {
				if(error) console.log("instagram error: "+error);
				else {
					//res.send(util.inspect(images));
					var i = 0;
					for(var x in images) {
						//console.log(util.inspect(images[x]));
						if(i < numMatches) {
							for(var j = 0; j < 2; j++) {
								card = {
									'game_id' : this.game_id,
									'card_id' : makeid(),
									'source' : images[x].images.thumbnail.url,
									'pic_id' : images[x].id,
									'created_at' : new Date()
								};
								games.insert(card);
							}
							i++;
						}else break;
					}
				}
				callback(null, this.game_id);
			});
			//end block comment
		}
	});
}

MemoryGame.prototype.dealGame = function(game_id, callback) {
	this.getCollection(function(error, games) {
		if(error) callback(error)
		else {
			games.find({'game_id':game_id}).sort({'card_id':1}).toArray(function(error, cards) {
				if(error) callback(error)
				else callback(null, cards);
			});
		}
	});
}

MemoryGame.prototype.flipCard = function(game_id, card_id, callback) {
	this.getCollection(function(error, games) {
		if(error) callback(error)
		else {
			games.findOne({'game_id':game_id, 'card_id': card_id}, function(error, pic) {
				if(error) callback(error)
				else callback(null, pic);
			});
		}
	});
}

function makeid()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}


exports.MemoryGame = MemoryGame;