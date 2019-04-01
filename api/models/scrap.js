var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var scrap = new Schema({
  addid:String,
  body_type:String,
  colour:String,
  condition:String,
  drivetrain:String,
  fuel_type:String,
  image:[],
  kilometers:String,
  make:String,
  model:String,
  no_of_Doors:String,
  no_of_Seats:String,
  price:String,
  title:String,
  transmission:String,
  trim:String,
  year:String,
  created_at : {
    type: Date,
    default : new Date()
  }
});

module.exports = mongoose.model('scrap', scrap);
