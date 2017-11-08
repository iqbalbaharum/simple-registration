'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AttendeeSchema = new Schema({

  name: String,
  email: String,
  skills: String,
  github: String,
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
  state: {
    type: String,
    enum: ['NONE', 'JOHOR', 'KEDAH', 'KELANTAN', 'MELAKA', 'NEGERISEMBILAN', 'PAHANG',
    'PERAK', 'PERLIS', 'PULAUPINANG', 'SABAH', 'SARAWAK', 'SELANGOR', 'TERENGGANU',
    'KUALALUMPUR', 'LABUAN', 'PUTRAJAYA','OTHER'],
    default: 'NONE'
  },
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
