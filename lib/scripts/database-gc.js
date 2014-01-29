var Logger = require('arsenic-logger')
var mongoose = require('mongoose');
var Settings = require('../Settings.js'); // Holds global settings such as DB connection strings

// Get a the current collection size.
/*
var storage = db.foo.storageSize();
var total = db.foo.totalSize();

print('Storage Size: ' + tojson(storage));

print('TotalSize: ' + tojson(total));

print('-----------------------');
print('Running db.repairDatabase()');
print('-----------------------');
*/

mongoose.connection.on('open', function () {
	
	// Run repair
	//Settings.db.repairDatabase();
	//mongoose.db.getCollection("$cmd").findOne({repairDatabase:1});

	Logger.info();
	
	Settings.db.command({repairDatabase:1}, function(err, result) {
		Logger.debug(err);
		process.exit(0);
	});

});


// Get new collection sizes.
/*
var storage_a = db.foo.storageSize();
var total_a = db.foo.totalSize();

print('Storage Size: ' + tojson(storage_a));
print('TotalSize: ' + tojson(total_a));
*/