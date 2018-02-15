var s = require('../../modules/sentiment');
// export routes
module.exports = function(app) {

    app.get('/api/resa/initiate/:keyword', function(req, res, next){ 
        var send = s.setSentiment();
        return res.send('Sentiment: '+send);
		//return res.send(send);
    });

    
	
	
};





     