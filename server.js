var express = require('express'),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    ejs = require('ejs'),
    auth = require('http-auth');

var Attendee = require('./app/models/attendee');

var port = 8080;

var app = express();

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/decoupled', {
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
    if(attendees.length > 50) {
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
      callback(username === "decoupled" && password === "123jaya");
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
    if (err)
      res.send(err);

    res.render('success');
  });
});

// listen
app.listen(port);
