var Logger = require('arsenic-logger');

var SecurityUtils = {

    /**
     * Generate a unique alpha-numeric key
     */
    generateUUID : function(){
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = (d + Math.random()*16)%16 | 0;
            d = Math.floor(d/16);
            return (c=='x' ? r : (r&0x7|0x8)).toString(16);
        });
        return uuid;
    },

    // //////////////////////////////////////////////////////////////

    /**
     * Get the client IP address, and handle cases where we are behind a load balancer
     * @param req the express request object
     * @returns {*}
     */
    getClientIp : function(req) {

        var ipAddress;

        // Amazon EC2 / Heroku workaround to get real client IP
        var forwardedIpsStr = req.header('x-forwarded-for');

        if (forwardedIpsStr) {
            // 'x-forwarded-for' header may return multiple IP addresses in
            // the format: "client IP, proxy 1 IP, proxy 2 IP" so take the
            // the first one
            var forwardedIps = forwardedIpsStr.split(',');
            ipAddress = forwardedIps[0];
        }

        if (!ipAddress) {
            // Ensure getting client IP address still works in
            // development environment
            ipAddress = req.connection.remoteAddress;
        }

        return ipAddress;
    },

    // //////////////////////////////////////////////////////////////

    /**
     * Generate a token for use as a secret key, nonce etc.
     * @param length (optional) specify length, defaults to 48;
     * @return {string}
     */
    getToken : function(length){

        if (typeof length == 'undefined') length = 48;

        var crypto = require('crypto');

        try {
            var buf = crypto.randomBytes(length);
            return buf.toString('hex');
        }
        catch (ex) {
            Logger.fatal("Error getting random bytes from crypto!");
        }

        return '';

    },

    // //////////////////////////////////////////////////////////////

    saltLength : 17,
    pbkdf2KeyLength : 512,
    pbkdf2Iterations : 10000,

    /**
     * Generate a secure hash
     * @param password Plain text password to be hashed using PBKDF2
     * @param salt Pass the salt, or set to '' and it will be generated for you
     * @param object returns they key and the salt, {key: derivedKey, salt: salt}
     */
    createPBKDF2Hash : function(password, salt){

        var crypto = require('crypto');

        if (salt == ''){
            salt = crypto.randomBytes(SecurityUtils.saltLength).toString('hex');
        }

        var derivedKey = crypto.pbkdf2Sync(password, salt, SecurityUtils.pbkdf2Iterations, SecurityUtils.pbkdf2KeyLength);

        return {key: Buffer(derivedKey, 'binary').toString('hex'), salt: salt};
    },

    // //////////////////////////////////////////////////////////////

    /**
     * Validate a previously created hash
     *
     * @param hash The password hash
     * @param salt The salt used to generate the password
     * @param password password Plain text password to be hashed using PBKDF2
     */
    validatePBKDF2Hash : function(hash, salt, password){

        var crypto = require('crypto');

        var pass = SecurityUtils.createPBKDF2Hash(password, salt);
        var key = pass.key;

        if (key == hash) {
            return true;
        }

        return false;
    },

    // //////////////////////////////////////////////////////////////

    /**
     * Conventional password hashinf function using salt and SHA256
     * @param {String} password Plain text password to be hashed using sha-256
     * @return {String} hash
     */
    createHash : function(password){

        var crypto = require('crypto');

        try {
            // Use the password length x3 as the salt length, making it damn hard to figure out the salt
            // even if an attacker has access to the DB and the code
            var salt = crypto.randomBytes(password.length*6).toString('base64').substr(0, password.length*3);
            var hash = crypto.createHash('sha512').update(password + salt).digest('hex');
            return salt + hash;
        }
        catch (ex) {
            Logger.fatal("Error creating password hash!");
        }

        return '';
    },

    // //////////////////////////////////////////////////////////////

    /**
     *
     * @param {String} hash Password hash, from createHash
     * @param {String} password Plain text password
     * @return {boolean} true if the password is a match
     */
    validatePassword : function(hash, password){
        var salt = hash.substr(0, password.length*3).toString('base64');
        var validHash = salt + SecurityUtils.getSha512(password + salt);
        return hash === validHash;
    },

    // //////////////////////////////////////////////////////////////

    /**
     * Verify a incoming HTTP request using HMAC and the expected secret key
     * @param {string} key The secret key
     * @param {Object} reqHeaders The HTTP headers
     * @return {boolean} True if the signatures match, otherwise false
     */
    verifyHMAC : function(key, reqHeaders){

        //Logger.debug(">>>>>> Entering verifyHMAC <<<<<<<<");

        var sig = reqHeaders.headers.authorization;
        var appId = reqHeaders.headers['x-yeti-appid'];
        var dateString = reqHeaders.headers['x-yeti-timestamp'];
        var contentType = reqHeaders.headers['content-type'];
        var verb = reqHeaders.method.toUpperCase();
        var content_md5 = "";

        var check = "";
        if (verb == 'GET' || verb == 'DELETE'){
            check = verb + "\n" + dateString + "\n" + reqHeaders.path;
        }
        else {
            //Logger.debug(">>>> JSON.stringify(req.body) = " + JSON.stringify(reqHeaders.body));
            content_md5 = SecurityUtils.getMD5(JSON.stringify(reqHeaders.body));
            check = verb + "\n" + contentType + "\n" + content_md5 + "\n" + dateString + "\n" + reqHeaders.path;
        }

        // Check the delta between when the message was sent and received, if its too long this could be a
        // man-in-the-middle attack so fail
        var txDate = new Date(dateString);
        var rxDate = new Date();

        var delta = (rxDate.getTime() - txDate.getTime())/1000;
        //Logger.info('Request was sent ' + delta + ' seconds ago!');

        if (delta > Settings.hmacMaxTimeDelta){
            Logger.error("HMAC fail, too big a difference between client sending a command and the server getting it. Potential man-in-the-middle attack!?");
            return false;
        }

        var test_sig = "YETI " + appId + ":" + require('crypto').createHmac("sha256", key).update(check).digest("hex");

        if (sig == test_sig){
            return true;
        }
        else {

            Logger.error('HMAC Authentication fail!');

            var info = {
                unencoded: check,
                secret_key: key,
                content_md5: content_md5,
                content_nd5_source: JSON.stringify(reqHeaders.body),
                incoming_sig : sig,
                generated_sig: test_sig,
                xlogiappid: reqHeaders.headers['x-logi-appid'],
                xlogitimestamp:  reqHeaders.headers['x-logi-timestamp'],
                path: reqHeaders.path
            }

            Logger.error(info);

            return false;
        }

    },

    // //////////////////////////////////////////////////////////////

    /**
     * Convenience method to generate a SHA1 hash
     * @param phrase
     * @returns {string} hash
     */
    getSha1 : function(phrase){
        return require('crypto').createHash('sha1').update(phrase).digest('hex');
    },

    /**
     * Convenience method to generate a SHA-256 hash
     * @param phrase
     * @returns {string} hash
     */
    getSha256 : function(phrase){
        return require('crypto').createHash('sha256').update(phrase).digest('hex');
    },

    /**
     * Convenience method to generate a SHA-512 hash
     * @param phrase
     * @returns {string} hash
     */
    getSha512 : function(phrase){
        return require('crypto').createHash('sha512').update(phrase).digest('hex');
    },

    /**
     * Convenience method to generate a MD5 hash (NOTE: md5 is no longer consider secure!)
     * @param phrase
     * @returns {string} hash
     */
    getMD5 : function(phrase){
        return require('crypto').createHash('md5').update(phrase).digest('hex');
    }

}

module.exports = SecurityUtils;