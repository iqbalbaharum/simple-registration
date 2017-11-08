var express = require('express'),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    ejs = require('ejs'),
    auth = require('http-auth');

var Attendee = require('./app/models/attendee');
var Email = require('./app/controller/mailController');
var config = require('./config');

var port = 3000;

var app = express();

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/meetup3', {
  useMongoClient: true
});

app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(__dirname + "/public"));
app.set('view engine', 'ejs');

app.get('/register', (req, res) => {
  Attendee.find({}, function(err, attendees) {
    if(err)
      res.send(err);

    var isClosed = false;
    if(attendees.length > 1000) {
      isClosed = true;
    }

    res.render('index', {
      isClosed: isClosed
    })
  });
});

// authentication
var basic = auth.basic({
      realm: "Authentication Area"
  }, function (username, password, callback) {
      callback(username === "meetup3" && password === "123jaya");
  }
);

app.get('/admin', auth.connect(basic), (req, res) => {
  Attendee.find({}, function(err, attendees) {
    if(err)
      res.send(err);

    //console.log(attendees);

    res.render('admin', {
      attendees: attendees,
      count: attendees.length
    });
  });
});

app.post("/register", (req, res) => {
  var newAttendee = new Attendee(req.body);
  newAttendee.save(function(err, attendee) {
    if (err) {
      res.send(err);
    } else {
      Email.send_welcome_mail(req, res, attendee._id);
      res.render('success');
    }
  });
});

app.get("/checkin", (req, res) => {
  res.render('checkin', {
    isError: false
  });
});

app.post("/checkin", (req, res) => {
  Attendee.findOneAndUpdate(
    {email: req.body.email},
    req.body,
    {new: true, upsert: false},
    function(err, attendee) {
      if(err)
        res.send(err);

      if(attendee != null){
          res.render('checkin-done');
      } else {
          res.render('checkin', {
            isError: true
          });
      }
    });
});

app.get("/walkin", (req, res) => {
    res.render('walkin');
});

app.post("/walkin", (req, res) => {
  var newAttendee = new Attendee(req.body);
  newAttendee.save(function(err, attendee) {
    if (err)
      res.send(err);

    res.render('checkin-done');
  });
});

// listen
app.listen(port);
