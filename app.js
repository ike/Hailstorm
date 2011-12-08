/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , db = require('riak-js').getClient();

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

// Homepage: http://hugehailstorm.com/
app.get('/', function(req, res){
	res.render('index', { title: 'Hailstorm'});
});


// Get the form: http://hugehailstorm.com/submit/love
app.get('/submit/:type', function(req, res){
	if ((req.params.type == 'bug') || (req.params.type == 'love') || (req.params.type == 'idea')){
		res.render('submit', { title: 'Submit', type: req.params.type });
	} else {
		res.render('whatsubmit', {title: 'Whatcha submitting?'});
	}
});

// Get any item: http://hugehailstorm.com/bug/this-is-a-bug-title
app.get('/:type/:title', function(req, res){
	var item = {
		content: "",
		date: "",
		title: "",
		urltitle: req.params.title,
		type: req.params.type
	};

	db.get(item.type, item.urltitle, function(err, data){
		item.content = data.content;
		item.date = data.date;
		item.title = data.title;
	});

	res.render('item', { item: item });
});

// Post form: http://hugehailstorm.com/submit/bug
app.post('/submit/:type', function(req, res){
	type = req.body.type;
	title = req.body.title;
	body = req.body.body;
	parsedtitle = title.replace(/\s+/g, '-').toLowerCase();
	date = new Date();

	if (db.exists(type, title)) title = title + '-' + date.getHours() + date.getMinutes();

	console.log('something happened.');

	db.save(type, parsedtitle, {title: title
							,	 id: parsedtitle
							,	 date: date
							,	 content: body 
						});

    res.redirect('/' + type + '/' + parsedtitle);
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);