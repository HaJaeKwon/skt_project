var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();
var mongoose = require('mongoose');

mongoose.connect('mongodb://root:1234@ds053136.mlab.com:53136/hajaekwon');
var db = mongoose.connection;
db.once('open', function() {
  console.log("DB connected");
});
db.on("error", function(err) {
  console.log("DB ERROR :", err);
});

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var allowCORS = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  (req.method === 'OPTIONS') ?
    res.send(200) :
    next();
};
 
// 이 부분은 app.use(router) 전에 추가하도록 하자
app.use(allowCORS);

var Artist = mongoose.model('Artist', {
	name : String,
	city : Number,
	totalPoint : Number,
	img: Array,
	musicList: Array
});

app.get('/api/artist/getAll', function(req, res) {
	Artist.find(function(err, artists) {
		if (err) return res.status(500).send({success:false, message: err});
		res.json({success:true, data:artists});
	});
});

app.get('/api/artist/get/:name', function(req, res) {
	Artist
		.find({})
		.exec(function(err, artists) {
			if(err) return res.status(500).send({success:false, message: err});
			
			for(var i=0; i<artists.length; i++) {
				if(artists[i]['name'] == req.params.name) {
					return res.json({success:true, data:artists[i]});
				}
			}
			return res.json({success:true, data:[]});
		});
});

app.post('/api/artist/insert', function(req, res) {
		// create a todo, information comes from AJAX request from Angular
	Artist.create({
		name : req.body.name,
		city : req.body.city,
		totalPoint : req.body.totalPoint,
		img : req.body.img,
		musicList : req.body.musicList
	}, function(err, artist) {
		if (err) return res.send({success:false, message: err});

		Artist.find(function(err, artists) {
			if (err) return res.send({success:false, message: err});
			res.json({success:true, data:artist});
		});
	});
});

app.delete('/api/artist/delete/:name', function(req, res) {
	Artist.remove({
		name : req.params.name
	}, function(err, artist) {
		if (err) if (err) return res.send({success:false, message: err});

		Artist.find(function(err, artists) {
			if (err) return res.send({success:false, message: err});
			res.json({success:true, data:artists});
		});
	});
});

var Invite = mongoose.model('Invite', {
	name : String,
	cur : Number,
	max : Number
});

app.get('/api/invite/getAll', function(req, res) {
	Invite.find(function(err, invites) {
		if (err) return res.send({success:false, message: err});
		res.json({success:true, data:invites});
	});
});

app.get('/api/invite/get/:name', function(req, res) {
	Invite
		.find({})
		.exec(function(err, invites) {
			if(err) return res.status(500).send({success:false, message: err});

			for(var i=0; i<invites.length; i++) {
				if(invites[i]['name'] == req.params.name) {
					return res.json({success:true, data:invites[i]});
				}
			}
			return res.json({success:true, data:[]});
		});
});

app.post('/api/invite/insert', function(req, res) {
		// create a todo, information comes from AJAX request from Angular
	Invite.create({
		name : req.body.name,
		cur : req.body.cur,
		max : req.body.max
	}, function(err, invite) {
		if (err) return res.send({success:false, message: err});

		Invite.find(function(err, invites) {
			if (err) return res.send({success:false, message: err});
			res.json({success:true, data:invites});
		});
	});
});

app.put('/api/invite/like/:name', function(req, res) {
	
	Invite.findOne({name:req.params.name}, function(err, invite) {
		if(err) return res.status(500).send({success:false, massage:err});
		invite['cur'] = invite['cur'] + 1;
		invite.save(function(err) {
			if(err) return res.status(500).send({success:false, message: err});
			res.json({success:true, data:'updated successfully'});
		});
	});
})
	// delete a todo
app.delete('/api/invite/delete/:name', function(req, res) {
	Invite.remove({
		name : req.params.name
	}, function(err, invite) {
		if (err)
			res.send(err);
			// get and return all the todos after you create another
		Invite.find(function(err, invites) {
			if (err) return res.send({success:false, message: err});
			res.json({success:true, data:invites});
		});
	});
});


app.get('*', function(req, res) {
	res.sendfile('./public/index.html');
});

//app.listen(process.env.PORT, process.env.IP);
//console.log("App listening on port " + process.env.PORT);
app.listen(9000);
console.log("App listening on port 9000");
