var bcrypt = require('bcryptjs');
var bodyParser = require('body-parser');
var express = require('express');
var mongoose = require('mongoose');
var sessions = require('client-sessions');
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
app.use(bodyParser.urlencoded({ extended: true }));

app.use(sessions({
	cookieName: 'session',
	secret: 'asjhabdkjhbfq7238g32bbjhfq89abfj',
	duration: 30 * 60 * 1000, //30 minutes
	activeDuration: 5 * 60 * 1000, //5 minutes
}));

app.get('/', function(req, res){
  res.render('index.jade');
});

app.get('/register', function(req, res) {
	res.render('register.jade');
});

app.post('/register', function(req, res) {
	var hash = bycrypt.hashSync(req.body.password, bycrypt.genSaltSync(10));

	var user = new User({
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		email: req.body.email,
		password: hash
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
		if(!user) {
			res.render('login.jade', { error: 'Invalid email or password.'});
		} else {
			if(bcrypt.compareSync(req.body.password, user.password)) {
				req.session.user = user; //set-cookie: session={email:... , password:...}
				res.redirect('/dashboard');
			} else {
				res.render('login.jade', { error: 'Invalid email or password.'});
			}
		}
	})
});

app.get('/dashboard', function(req, res) {
	if(req.session && req.session.user) {
		User.findOne({ email: req.session.user.email }, function(err, user) {
			if(!user) {
				req.session.reset();
				res.redirect('/login')
			} else {
				res.locals.user = user;
				res.render('dashboard.jade')
			}
		});
	} else {
		res.render('/login');
	}
});

app.get('/logout', function(req, res) {
	res.session.reset();
	res.redirect('/');
});

app.listen(3000);
