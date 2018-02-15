// if debug is enabled
exports.debug = false;

// cookies stuff
exports.sidSalt = 'initMe';
exports.cookieParserSalt = 'initMeToo';
exports.cookieSecret = 'andMeToo';

// password salt
exports.passwordSalt = 'ThisIsPasswordSalt';

// default app port
exports.defaultPort = 8080;
// default websockets port
exports.defaultSocketPort = 8081;
// default app uri (needed for websocket server)
exports.defaultHost = 'localhost';

// default db
exports.db = 'mongodb://localhost/context';

// session config
exports.sessionDb = {
    url: exports.db
};

// facebook app config
exports.facebook = {
    clientID: 'FACEBOOK_APP_ID',
    clientSecret: 'FACEBOOK_APP_SECRET',
    callbackURL: 'http://localhost:8080/auth/facebook/callback',
};

// google app config
exports.google = {
    returnURL: 'http://localhost:8080/auth/google/return',
    realm: 'http://localhost:8080/'
};

// twitter app config
exports.twitter = {
    consumerKey: 'ONSjA60gea7te4iUmP0uDa76Z',
    consumerSecret: 'SN4XQfd9IwIiK0Jt6nzLh7H9J7zXNzDEafUjwqZFS8gOvXNjgT',
    accessTokenKey: '2525018046-5SoNOxtwXtKMBArBOcDb9sPvE7Y42it6VfmyFS8',
    accessTokenSecret: 'dHT6gvNU4HXiPECPSNgFnB6wtuOtweQcGaDsE4KEnUl5L',
    callbackURL: 'http://localhost:8080/auth/twitter/callback'
};

// linkedin app config
exports.linkedin = {
    consumerKey: 'LINKEDIN_API_KEY',
    consumerSecret: 'LINKEDIN_SECRET_KEY',
    callbackURL: 'http://localhost:8080/auth/linkedin/callback'
};
