import mongoose from 'mongoose';
import bcrypt from 'bcrypt-nodejs';

const Schema = mongoose.Schema;
const provider = ['local', 'facebook', 'kakao'];

// Define Account Model
const Account = new Schema({
  useremail: { type: String, required: true },
  password: String,
  date: {
    created: { type: Date, default: Date.now }
  },
  provider: { type: String, enum: provider },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  o_auth: {
    kakao: {
      id: String,
      accessToken: String
    },
    facebook: {
      id: String,
      accessToken: String
    }
  }
  //streets: [{type: Schema.Types.ObjectId, ref: 'Musicstreet'}]
});

// On Save Hook, encrypt password,
// Before saving a model, run this function
Account.pre('save', function(next) {
  // get access to the account model
  const account = this;
  console.log(this);
  const err = new Error('something went wrong');
  //gensalt = generateSalt
  bcrypt.genSalt(10, (err, salt) => {
    if(err) { return next(err); }

    bcrypt.hash(account.password, salt, null, (err, hash) => {
      if(err) { return next(err); }

      account.password = hash;
      next();
    });
  });
});

Account.methods.comparePassword = function(candidatePassword, callback) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    if(err) { return callback(err); }

    callback(null, isMatch);
  });
};


export default mongoose.model('account', Account);
