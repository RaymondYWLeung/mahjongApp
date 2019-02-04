var http = require('http');
var url  = require('url');
var fs = require('fs');
var formidable = require('formidable');
var MongoClient = require('mongodb').MongoClient; 
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var session = require('cookie-session');
var bodyParser = require('body-parser');
var dbPassword = 'admin';
const mongourl = 'mongodb+srv://admin:admin@cluster0-rcc6q.azure.mongodb.net/mahjong_app';
var express = require('express');
var app = express();

var users;
var searchCriteria = "";

app = express();
app.set('view engine','ejs');

var SECRETKEY1 = 'I want to pass COMPS381F';
var SECRETKEY2 = 'Keep this to yourself';



app.set('view engine','ejs');

app.use(session({
  name: 'session',
  keys: [SECRETKEY1,SECRETKEY2]
}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/',function(req,res) {
	//console.log(req.session);
	res.redirect('/login');
});

app.get('/login',function(req,res) {
	res.render('login',{});
});

app.get('/main',function(req,res) {
	getGameRecord(res,req.session.username,function(result){
		res.render('main',{username:req.session.username,record:result});
	});
});

app.post('/login',function(req,res) {

	req.session.authenticated = false;

	/*MongoClient.connect(mongourl, function(err, client) {
	   if(err) {
	        console.log('Error occurred while connecting to MongoDB Atlas...\n',err);
	   }else{
		   console.log('Connected...');
		   var collection = client.db("mahjong_app").collection("mahjong_app_ac");
		   // perform actions on the collection object
		   console.log(collection);
		   client.close();
		}
	});*/

	if(req.body.username != '' && req.body.password != ''){

		userLogin(res,req.body.username,req.body.password,function(result){
			console.log(result.length);
			if(result.length > 0){
				console.log(result);
				console.log("Login successful. Redirect to Main.ejs.");
				req.session.authenticated = true;
				req.session.username = req.body.username;
				if(req.session.authenticated){
					res.redirect('/main');
				}
			}else{
				console.log("Wrong account input. Redirect to Login.ejs.");
				res.render('login',{error:"wrong_input"});
			}
		});
	}else{
		console.log("Empty field. Redirect to Login.ejs.");
		res.render('login',{error:"empty_input"});
	}
});

app.get('/event_detail',function(req,res){
	var eventID = req.query.eventID;
	getEventDetail(res,req,eventID,function(result){
		res.render('event_details',{event:result});
	});
})

app.get('/logout',function(req,res) {
	req.session = null;
	res.redirect('/');
});


app.get('*',function(req,res){
    res.status(404).end('File not found');
});

app.listen(process.env.PORT || 8099);

function userLogin(res,user,pass,callback){
	MongoClient.connect(mongourl, function(err, db) {
	 	if (err) throw err;
	 	console.log("Function: userLogin()");
	 	var dbo = db.db("mahjong_app");
	 	dbo.collection("mahjong_app_ac").find({username:user,password:pass}).toArray(function(err, result) {
	    	if (err) throw err;
	    	db.close();
	    	callback(result);
	  	});
	});
}

function getGameRecord(res,user,callback){
	MongoClient.connect(mongourl, function(err, db) {
	 	if (err) throw err;
	 	console.log("Function: getGameRecord");
	 	var dbo = db.db("mahjong_app");
	 	dbo.collection("mahjong_app_record").find({creator:user},{_id:1,event:1,date:1,creator:1}).toArray(function(err, result) {
	    	if (err) throw err;
	    	db.close();
	    	callback(result);
	  	});
	});
}

function getEventDetail(res,req,eventID,callback){
	MongoClient.connect(mongourl, function(err, db) {
	 	if (err) throw err;
	 	console.log("Function: getGameRecord");
	 	var dbo = db.db("mahjong_app");
	 	dbo.collection("mahjong_app_record").findOne({_id:ObjectId(eventID)}, function(err, result) {
	    	if (err) throw err;
	    	db.close();
	    	callback(result);
	  	});
	});
}