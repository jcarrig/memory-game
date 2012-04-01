//MemoryGame.js

var Db = require('mongodb').Db;
var Server = require('mongodb').Server;
var ObjectID = require('mongodb').ObjectID;
var util = require('util');

//authenticate instagram api
var instagram = require('instagram').createClient(process.env['INSTAGRAM_CLIENT_ID'] ,process.env['INSTAGRAM_CLIENT_SECRET'] );

MemoryGame = function(dbconfig){
	//connecting to mongo db
	this.db= new Db(dbconfig.database, new Server(dbconfig.hostname, dbconfig.port, {auto_reconnect: true}));
	//authenticate the server
	if(dbconfig.auth) {
		this.db.open(function(err, data) { 
			if(err){
			   console.log("error opening: "+err);	
			   //callback(err);
			}else {
				data.authenticate(dbconfig.username, dbconfig.password, function(err2, data2) { 
					if(err2){ 
						console.log("error authenticating: "+err2);
						//callback(err2)
					}else{
						console.log("database opened.");
						//callback(null,data2);
					}
				});
			}
		});
	}else{
		this.db.open(function() {});
	}	
	
	this.cards = [];

};

MemoryGame.prototype.getCollection = function(collectionName, callback) {
	this.db.collection(collectionName, function(error, coll) {
		if(error) callback(error)
		else callback(null, coll)
	});
}

MemoryGame.prototype.saveTagToDB = function(tag, callback) {
	this.getCollection('tags', function(error, tags) {
		if(error) callback(error)
		else {
			//will add a new tag to the db and increment an existing tag's total and updated_at
			tags.update( 
				{ 'tagName': tag }, 
				{ $set: { 'updated_at': new Date() }, $inc: { 'total': 1 } }, 
				{ upsert: true }, 
				function(error, obj){
					if(error){
						console.log('error: '+error.message)
						callback(error);
					}else{
						callback(null, tag);
					}
				}
			);
		}
	});
}

MemoryGame.prototype.getPopularTags = function(callback) {
	this.getCollection('tags', function(error, tags){
		if(error) callback(error);
		else {
			tags.find( {}, { 'limit': 50, 'sort': [[ 'total', 'desc' ], ['updated_at', 'desc']] } ).toArray(function(error, popTags){
				if(error) callback(error);
				else {
					callback(null, popTags);
				}
			});
		}
	});
}

MemoryGame.prototype.newGame = function(config, callback) {
	
	this.numMatches = config.matches;
	this.tag = config.tag;
		
	this.getCollection('games', function(error, games) {
		if(error) callback(error)
		else {
			callback(null, games);
		}
	});
}

MemoryGame.prototype.getPhotos = function(callback) {
	
	if(this.tag) {
		this.saveTagToDB(this.tag, function(error, searchTag){
			if(error) callback(error);
			else {
				instagram.tags.media(searchTag, function (images, error) {
					if(error) console.log("instagram error: "+error);
					else {	
						callback(null, images);
					}
				});
			}
		});
	}else{
		instagram.media.popular(function(images, error){
			if(error) console.log("instagram error: "+error);
			else {
				callback(null, images);
			}
		});
	}
}

MemoryGame.prototype.setupGame = function(config, callback) {
	
	this.game_id = "g"+makeid();
	
	var card = {};
	var i = 0;
	//insert cards into a game
	for(var x in config.photos) {
		if(i < this.numMatches) {
			for(var j = 0; j < 2; j++) {
				card = {
					'game_id' : this.game_id,
					'card_id' : makeid(),
					'source' : config.photos[x].images.thumbnail.url,
					'pic_id' : config.photos[x].id,
					'created_at' : new Date()
				};
				if(this.tag != null)
					card.tag = this.tag;
				config.games.insert(card);
			}
			i++;
		}else break;
	}
	callback(null, this.game_id);
}

MemoryGame.prototype.dealGame = function(game_id, callback) {
	var gameTag = this.tag; 
	this.getCollection('games', function(error, games, gameTag) {
		if(error) callback(error)
		else {
			var thisGameTag = gameTag;
			games.find({'game_id':game_id}, {'card_id': 1, 'tag': 1}).sort({'card_id':1}).toArray(function(error, cards, thisGameTag) {
				if(error) callback(error)
				else {
					var delt = [{"game_id": game_id, "cards": cards}];
					callback(null, delt);
				}
			});
		}
	});
}

MemoryGame.prototype.flipCard = function(game_id, card_id, callback) {
	this.getCollection('games', function(error, games) {
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