
/**
 * Module dependencies.
 */

var express = require('express')
var db = require('riak-js').getClient();

var app = module.exports = express.createServer();

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
	ideaKey = '' + date.getMonth() + date.getDate() + date.getYear() + date.getHours() + date.getMinutes() + date.getSeconds();
	idea = JSON.stringify(idea);
	db.save('ideas', ideaKey, idea);
}

var getTopIdeas = function() {
	db.getAll('ideas', {where: {}})
}

// GETs

app.get('/', function(req, res){
	res.render('hailstorm.html');
});

app.get('/top', function(req, res){
	res.contentType('json');
	res.send({ ideas: [{ body:'This is my awesome idea.', votes: 12 }, { body:'Heres an idea!! Let\'s go to bed!!', votes: 122000 }, { body:'Yet another idea. so so so so so', votes: 5 }] });
});


// POSTs

app.post('/', function(req, res){
	var idea = {
		body: req.body.ideaBody,
	};

	saveIdeaToDB(idea);
	res.redirect('/');
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
