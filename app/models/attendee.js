'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AttendeeSchema = new Schema({

  name: String,
  email: String,
  skills: String,
  github: String,
  CreatedAt: {
    type: Date,
    default: Date.Now
  }
});

module.exports = mongoose.model('Attendee', AttendeeSchema);
