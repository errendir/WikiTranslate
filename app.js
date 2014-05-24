var express = require('express');

var http = require('http');
var path = require('path');

var fs = require('fs');
var marked = require('marked');
marked.setOptions({
	renderer: new marked.Renderer(),
	gfm: true,
	tables: true,
	breaks: true,
	pedantic: false,
	sanitize: false,
	smartLists: true,
	smartypants: false,
	highlight: function (code) {
		return require('highlight.js').highlightAuto(code).value;
	}
});

var app = express();

function RenderMarkup (filename)
{
	return function (req, res) {
		fs.readFile("./texts/" + filename, 'utf8', function (err, data) {
			//res.setHeader("Content-Type", "application/json");
			res.render('plan', { code : marked(data)});
		});
	};
}

function RenderMarkupSync (filename)
{
	var filecontent = fs.readFileSync("./texts/" + filename, 'utf8');
	return marked(filecontent);
}

app.use(function(req, res, next){
	res.locals.rendermarkup = RenderMarkupSync;
	
	var now = new Date();
	var t = pad(now.getHours(),2) + ":" + pad(now.getMinutes(),2) + " " +
			pad(now.getDate(),2) + "." + pad((now.getMonth() + 1),2) + "." + now.getFullYear();
	
	res.locals.time = t;
	
	next();
})

// all environments
app.set('port', process.env.PORT || 80);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.set('case sensitive routing', true);

var cookieParser = require('cookie-parser')
var favicon = require('serve-favicon');
var logger = require('logger-request');

app.use(cookieParser());
app.use(favicon("public/favico2.png"));
app.use(logger('dev'));
//app.use(express.bodyParser());
//app.use(express.methodOverride());
//app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// Error page
app.use(function(err, req, res, next){
	res.status(500);
	res.render("500", {"trace" : err.stack || err.message, "err" : err});
});

// development only
//if ('development' == app.get('env')) {
//  app.use(express.errorHandler());
//}

function SimpleRender (filename)
{
	return function(req, res) {
		res.render(filename);
	}
}

// My pages!
var simplepages = ["main", "plan", "photos", "various", "contact", "stories", "design", "fractal"];
for (var i=0; i<simplepages.length; i++)
	app.get("/" + simplepages[i], SimpleRender(simplepages[i]));
app.get('/', SimpleRender("main"));


function pad(number, digits)
{
	for (var i=0; i<digits - Math.floor(Math.log(number)/Math.log(10)) - 1; i++)
		number = "0" + number;
	
	return number;
}

app.use(function(req, res, next){
	res.status(404);

	// respond with html page
	if (req.accepts('html')) {
		res.render('404');
		return;
	}

	// respond with json
	if (req.accepts('json')) {
		res.send({ error: 'Not found' });
		return;
	}

	// default to plain-text. send()
	res.type('txt').send('Not found');
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

process.once('SIGUSR2', function () {
	console.log("SZUPAK");
	gracefulShutdown(function () {
		process.kill(process.pid, 'SIGUSR2');
	});
});
