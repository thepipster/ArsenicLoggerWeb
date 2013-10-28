var connect = require('connect');
var LdapAuth = require('ldapauth');

/*

 Host: logidc1.logixml.local
 BaseDN: ou=Staff,dc=logixml,dc=local
 Username: CN=mpritchard,OU=Service,OU=Staff,dc=logixml,dc=local
 Password: Your Password
 */

// Config from a .json or .ini file or whatever.
var config = {
    ldap: {
        url: "ldaps://logidc1.logixml.local:636",
        //adminDn: "uid=myadminusername,ou=users,o=example.com",
        //adminPassword: "mypassword",
        searchBase: "OU=Service,OU=Staff,dc=logixml,dc=local",
        searchFilter: "(uid={{username}})"
    }
};

var ldap = new LdapAuth({
    url: config.ldap.url,
    adminDn: config.ldap.adminDn,
    adminPassword: config.ldap.adminPassword,
    searchBase: config.ldap.searchBase,
    searchFilter: config.ldap.searchFilter,
    //log4js: require('log4js'),
    cache: true
});

var basicAuthMiddleware = connect.basicAuth(function (username, password, callback) {
    ldap.authenticate(username, password, function (err, user) {
        if (err) {
            console.log("LDAP auth error: %s", err);
        }
        callback(err, user)
    });
});