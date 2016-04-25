var express = require('express')
var morgan = require('morgan')
var bodyParser = require('body-parser')
var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/redux-debug');

var app = express()

app.use(morgan('dev'))

app.use(function(req,res,next){
	req.db = db;
	next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/log', function (req, res, next){
	var db = req.db;

    var log = {
    	data: req.body.log,
	    submittedBy: req.body.submittedBy,
	    submittedAt: (new Date).toISOString()
	}

    // Set our collection
    var collection = db.get('logs');

    // Submit to the DB
    var promise = collection.insert(log)

    promise.on('error', function(err){
    	console.log(err);
    	res.sendStatus(500)
    });
	promise.on('success', function(doc){
		res.json(doc)
	});
})

app.get('/log/:id', function (req, res, next){
	var id = req.params.id

	var promise = req.db.get('logs').findById(id)
    promise.on('error', function(err){
    	console.log(err);
    	res.sendStatus(500)
    });
	promise.on('success', function(doc){
		if (!doc) return res.sendStatus(404);
		res.json(doc)
	});
})

app.use(function(req, res, next){
	res.sendStatus(404)
})

app.listen(PORT, function () {"listening on " + PORT})