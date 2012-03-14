/*
	parse the database url and export as dbconfig
*/


var dbconfig = function(dburl) {
	
	var options = require('url').parse(dburl);
	if(options.auth) {
		options.username = options.auth.split(':')[0];
		options.password = options.auth.split(':')[1];
	}
	options.port = parseInt(options.port);
	options.database = options.pathname.split('/')[1];
	return options;
	
}

exports.dbconfig = dbconfig;