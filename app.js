
/**
 * Module dependencies.
 */

var express = require('express')
var app = module.exports = express.createServer();
var sys = require('util');
 
var Client = require('mysql').Client;
var db = new Client();
db.user = 'hailstorm';
db.password = 'alcatraz';


// Configuration

app.configure(function(){
	app.set('views', __dirname + '/views');
    app.set('views');
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(__dirname + '/public'));

	// disable layout
	app.set("view options", {layout: false});

	// make a custom html template
	app.register('.html', {
	compile: function(str, options){
	  return function(locals){
	    return str;
	  };
	}
	});

});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// FUNCTIONs

var saveIdeaToDB = function(idea){
	date = new Date();
	db.query('USE hailstorm', function(error, results) {
        if(error) {
            console.log('ClientConnectionReady Error: ' + error.message);
            db.end();
            return;
        }
    });
	db.query('INSERT INTO ideas SET idea_body=?, idea_date=?, idea_votes=?;'
		,	[idea.body, idea.date, idea.votes]
		,	function(error, results) {
				if(error) {
					console.log("ClientReady Error: " + error.message);
					db.end();
					return;
				}
				console.log('Inserted: ' + results.affectedRows + ' row.');
				console.log('Id inserted: ' + results.insertId);
			});
}

function formatDate(date) {
  return date.getFullYear() + '-' +
    (date.getMonth() < 9 ? '0' : '') + (date.getMonth()+1) + '-' +
    (date.getDate() < 10 ? '0' : '') + date.getDate() + ' ' + 
    date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
}

var topIdeas = function(res, numIdeas) {
	db.query('USE hailstorm', function(error, results) {
        if(error) {
            console.log('ClientConnectionReady Error: ' + error.message);
            db.end();
            return;
        }
    });

	ideas = db.query('SELECT * FROM ideas ORDER BY idea_votes desc, idea_date desc LIMIT 0, ' + numIdeas + ' ', function(err, results, fields){
		if (err) {
	      throw err;
	    }

	    sendJSON(res, results);
	});
}

var hashtagIdeas = function(res, numIdeas, hashtag) {
	db.query('USE hailstorm', function(error, results) {
        if(error) {
            console.log('ClientConnectionReady Error: ' + error.message);
            db.end();
            return;
        }
    });

	ideas = db.query('SELECT * FROM ideas WHERE MATCH (idea_body) AGAINST ("' + hashtag + '") ORDER BY idea_votes desc, idea_date desc LIMIT 0, ' + numIdeas + ' ', function(err, results, fields){
		if (err) {
	      throw err;
	    }

	    sendJSON(res, results);
	});
}

var sendJSON = function(res, results) {
	var ideas = {ideas: results};
	res.contentType('json');
	res.send(ideas);
}

// GETs

app.get('/', function(req, res){
	var numIdeas = req.query.numIdeas || 10;

	if(req.query.o == 'JSON') {
		topIdeas(res, numIdeas);
	} else {
		res.render('hailstorm.html');
	}
});

app.get('/tag/:hashtag', function(req, res){
	var numIdeas = req.query.numIdeas || 10;

	var hashtag = req.params.hashtag;

	if(req.query.o == 'JSON') {
		hashtagIdeas(res, numIdeas, hashtag);
	} else {
		res.render('hailstorm.html');
	}
});


// POSTs

app.post('/', function(req, res){
	var d = new Date();
	var idea = {
		body: req.body.idea_body,
		date: formatDate(d),
		votes: 0
	};

	saveIdeaToDB(idea);
	res.redirect('/');
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
