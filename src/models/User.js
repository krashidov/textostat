var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  id: Schema.ObjectId,
  phone_number: { type: String, required: true, unique: true },
  token: { type: String },
  verification_code: String,
  verified: { type: Boolean, default: false, required: true }
});


module.exports = mongoose.model('User', userSchema);