'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AttendeeSchema = new Schema({

  name: String,
  email: String,
  track: {
    type: String,
    required: 'Need a class to attend',
    lowercase: true
  },
  checkin: {
    type: String,
    enum: ['NONE', 'CHECKIN', 'WALKIN'],
    default: 'NONE'
  },
  university: String,
  gender: {
    type: String,
    enum: ['NONE', 'MALE', 'FEMALE'],
    default: 'NONE'
  },
  CreatedAt: {
    type: Date,
    default: Date.Now
  }
});

module.exports = mongoose.model('Attendee', AttendeeSchema);
