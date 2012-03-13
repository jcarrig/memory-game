//MemoryGame.js

var Db = require('mongodb').Db;
//var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
//var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;
var util = require('util');

var instagram_auth = require('./instagram_auth').instagram_auth;
var instagram = require('instagram').createClient(instagram_auth.client_id,instagram_auth.client_secret);

MemoryGame = function(){
	this.db= new Db('memorygame', new Server('localhost', 27017, {auto_reconnect: true}));
	//authenticate the server
	this.db.open(function() {});
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
			this.game_id = 'gPYfDz';
			callback(null, this.game_id);
			/*uncomment when you want to hit instagram and make a new game
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
			end block comment*/
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



/*
ArticleProvider.prototype.findAll = function(callback) {
	this.getCollection(function(error, article_collection) {
		if(error) callback(error)
		else {
			article_collection.find().sort({created_at:-1}).toArray(function(error, results) {
				if(error) callback(error)
				else callback(null, results)
			});
		}
	});
};

ArticleProvider.prototype.findById = function(id, callback) {
	this.getCollection(function(error, article_collection) {
		if(error) callback(error) 
		else {
				article_collection.findOne({_id: article_collection.db.bson_serializer.ObjectID.createFromHexString(id)}, function(error, result) {
				if(error) callback(error)
				else callback(null, result)
			});
		}
	});
}

ArticleProvider.prototype.save = function(articles, callback) {
	this.getCollection(function(error, article_collection) {
		if(error) callback(error)
		else {
			if(typeof(articles.length) == "undefined")
				articles = [articles];
			
			for(var i=0; i < articles.length; i++) {
				article = articles[i];
				article.created_at = new Date();

				if(article.comments === undefined)
					article.comments = [];

				for(var j=0;j < article.comments.length; j++) {
					article.comments[j].created_at = new Date();
				}
			}
			
			article_collection.insert(articles, function() {
				callback(null, articles);
			});	
		}
	});
}

ArticleProvider.prototype.addCommentToArticle = function(articleId, comment, callback) {
	this.getCollection(function(error, article_collection) {
		if(error) callback(error)
		else {
			article_collection.update(
				{_id: new ObjectID(articleId)},
				{"$push": {comments: comment}},
				function(error, article) {
					if(error) callback(error);
					else callback(null, article);
				}
			);
		}
	});
	
}*/
