var bodyParser = require('body-parser')
var express = require('express');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/newauth');


var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var User = mongoose.model('User', new Schema({
	id: ObjectId,
	firstName: String,
	lastName: String,
	email: { type: String, unique: true },
	password: String
}))

var app = express();
//use jade a template engine
app.set('view engine', 'jade');
app.locals.pretty = true;


//middleware
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', function(req, res){
  res.render('index.jade');
});

app.get('/register', function(req, res) {
	res.render('register.jade');
});

app.post('/register', function(req, res) {
	var user = new User({
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		email: req.body.email,
		password: req.body.password
	});
	user.save(function(err) {
		if(err) {
			if(err.code === 11000) {
				err = 'That email is already taken! Try another.';
			}
			res.render('register.jade', { error: 'Something went wrong.' });

		} else {
			res.redirect('/dashboard');
		}
	})
});

app.get('/login', function(req, res) {
	res.render('login.jade');
});

app.post('/login', function(req, res) {
	User.findOne({ email: req.body.email }, function(err, user) {
		if(!user || req.body.password !== user.password) {
			res.render('login.jade', { error: 'Invalid email or password.'})
		} else {
			if(req.body.password === user.password) {
				res.redirect('/dashboard');
			}
		}
	})
});

app.get('/dashboard', function(req, res) {
	res.render('dashboard.jade');
});

app.get('/logout', function(req, res) {
	res.redirect('/');
});

app.listen(3000);
