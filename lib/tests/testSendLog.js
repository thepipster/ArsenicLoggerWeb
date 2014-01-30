var Logger = require('arsenic-logger'); 

Logger.useArsenicLogger('8083f661-ba0e-4a4e-b838-ebc21434fd75', 'MY-TAG');

setInterval(function(){

	var test = Math.floor((Math.random()*4)+1);

	switch(test){
		case 0: Logger.debug("A test debug messate sent at " + (new Date()).toString()); break;
		case 1: Logger.info("A test info message sent at " + (new Date()).toString()); break;
		case 2: Logger.warn("A test warn message sent at " + (new Date()).toString()); break;
		case 3: Logger.error("A test error message sent at " + (new Date()).toString()); break;
	}

}, 2000);