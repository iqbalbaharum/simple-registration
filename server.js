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

    var tracks, states, genders;

    // aggregate result
    data_field_count("$track", function(tres) {
      tracks = tres;
      data_field_count("$gender", function(tgen) {
        genders = tgen;
        data_field_count("$state", function(tsta) {
          states = tsta;

          // open admin
          res.render('admin', {
            attendees: attendees,
            count: attendees.length,
            tracks: tracks,
            genders: genders,
            states: states
          });
        })
      });
    });
  });
});

app.get("/count/track", (req, res) => {
  data_field_count("$track", function(result) {
    res.json(result);
  });
});

app.get("/count/gender", (req, res) => {
  Attendee.aggregate([
    {
        $group: {
          _id: "$gender",
          total: {$sum: 1}
        }
    }], function(err, result) {
      if(err) {
        res.send(err);
      } else {
        res.json(result);
      }
    }
  );
});

app.get("/count/state", (req, res) => {
  Attendee.aggregate([
    {
        $group: {
          _id: "$state",
          total: {$sum: 1}
        }
    }], function(err, result) {
      if(err) {
        res.send(err);
      } else {
        res.json(result);
      }
    }
  );
});

data_field_count = function(field, callback) {
  Attendee.aggregate([
    {
        $group: {
          _id: field,
          total: {$sum: 1}
        }
    }], function(err, result) {
      if(err) {
        res.send(err);
      } else {
        callback(result);
      }
    }
  );
}

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

app.get("/json", (req, res) => {

  var token = req.body.token || req.query.token || req.headers['authorization'];

  if(token) {

    var key = token.split(" ");

    if(key[0] !== "Bearer" ||
        key[1] !== 'WHOGIVEAFUCK') {
      return res.status(500).send({
        success: false,
        message: "Invalid token"
      });
    }

    Attendee.find({}, function(err, attendees) {
      if(err)
        res.send(err);

      res.json(attendees);
    });

  } else {

    return res.status(500).send({
      success: false,
      message: "No authorization token"
    });
  }

});

app.get("/admin/count/:track", (req, res) => {

  var filter = {};

  if(req.params.track === 'all') {
    filter = {}
  } else {
    filter = {track: req.params.track.toLowerCase()};
  }

  Attendee.count(
    filter,
    function(err, count) {
      if(err)
        res.send(err);

      res.json({
        success: true,
        count: count
      });

    });
});

// listen
app.listen(port);
