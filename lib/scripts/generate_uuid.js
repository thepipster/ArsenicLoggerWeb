/**
 * Module dependencies.
 */

var Logger = require('arsenic-logger')
var SecurityUtils = require('../utils/SecurityUtils.js');

Logger.debug("UDID = " + SecurityUtils.generateUUID());

process.exit(0);