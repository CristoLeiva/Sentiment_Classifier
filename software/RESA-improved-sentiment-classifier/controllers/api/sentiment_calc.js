var s = require('../../modules/sentiment_calculation');
// export routes
module.exports = function(app) {

    app.get('/api/resa/initiateSentiment/:keyword', function(req, res, next){ 
        var send = s.setSentiment();
        return res.send('Sentiment'+send);
		//return res.send(send);
    });

    
	
	
};





     