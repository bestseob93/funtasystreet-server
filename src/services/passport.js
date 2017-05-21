import dotenv from 'dotenv';
dotenv.config();

import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import LocalStrategy from 'passport-local';
import { Strategy as KaKaoStrategy } from 'passport-kakao';
import { Strategy as FacebookStrategy } from 'passport-facebook';

import kakaoConf from './kakao';
import facebookConf from './facebook';

import Account from '../models/account';

passport.serializeUser((account, done) => {
  console.log(account);
  console.log('--------serializeUser-------');
  done(null, account.id);
});

passport.deserializeUser(function(id, done) {
  console.log(id);
  console.log('--------deserializeUser-------');
  Account.findById(id, (err, account) => {
    done(err, account);
  });
});

//Setup options for Local Strategy
const localOptions = {
   usernameField: "useremail", // = req.body.useremail
   passwordField: "password"
};

// Setup options for JWT Strategy
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromHeader('authorization'),
  secretOrKey: process.env.SECRET_KEY
};

// Setup options for KAKAO Strategy
const kakaoOptions = {
  clientID: kakaoConf.appID,
  callbackURL: kakaoConf.callbackURL
};

// Setup options for Facebook Strategy
const facebookOptions = {
  clientID: facebookConf.appID,
  clientSecret: facebookConf.appSecret,
  callbackURL: facebookConf.callbackURL,
  profileFields: facebookConf.profileFields
};

const localLogin = new LocalStrategy(localOptions, (useremail, password, done) => {
  // Verify this username and password, call done with the account
  // if it is the correct username and password
  // otherwise, call done with false
  console.log(useremail);
  console.log(password);
  Account.findOne({ useremail: useremail }, (err, account) => {
    if(err) { return done(err); }

    if(!account) {
      return done(null, false);
    }
    console.log('localLogin - passport - ');
    console.log(account);

    // compare passwords - is 'password' equal to account.password?
    account.comparePassword(password, (err, isMatch) => {
      if(err) { return done(err); }
      console.log(password);
      console.log(isMatch);

      if(!isMatch) {
        return done(null, false);
      }

      return done(null, account);
    });
  });
});

// Create JWT Strategy
// payload = decoded JWT token
const jwtLogin = new JwtStrategy(jwtOptions, (payload, done) => {
  // See if the user ID in the payload exists in our DB
  // If it does, call 'done' with that other
  // otherwise, call done without a account object
  console.log(payload);
  Account.findById(payload.sub, (err, account) => {
    if(err) { return done(err, false); }

    if(account) {
      done(null, account);
    } else {
      done(null, false);
    }
  });
});


const kakaoLogin = new KaKaoStrategy(
  kakaoOptions,
  (accessToken, refreshToken, profile, done) => {
    console.log('kakao ---');
    console.log(profile);
    console.log(accessToken);
    console.log(refreshToken);
    Account.findOne({
      'o_auth.kakao.id': profile.id
    }, (err, existingAccount) => {
      if(err) { return done(err, false); }
      if(existingAccount) {
        done(null, existingAccount); // account already existed. login direct.
      } else {
        console.log(profile);
        const account = new Account({
          username: profile.username,
          provider: 'kakao',
          o_auth: {
            kakao: {
              id: profile.id,
              accessToken: accessToken
            }
          }
        });

        account.save(err => {
          if(err) { return done(err, false); }
          return done(null, account);
        });
      }
    });
});

const facebookLogin = new FacebookStrategy(
  facebookOptions,
  (accessToken, refreshToken, profile, done) => {
    console.log(profile);
    Account.findOne({
      'o_auth.facebook.id': profile.id
    }, (err, existingAccount) => {
      if(err) { return done(err, false); }
      if(existingAccount) {
        done(null, existingAccount);
      } else {
        const account = new Account({
          username: profile.name.familyName + profile.name.givenName,
          email: profile.emails ? (profile.email.length > 0 ? profile.emails[0].value : null) : null,
          provider: 'facebook',
          o_auth: {
            facebook: {
              id: profile.id,
              accessToken: accessToken
            }
          }
        });

        account.save( err => {
          if(err) { return done(err, false); }
          return done(null, account);
        });
      }
    });
});
// Tell passport to use this strategy
passport.use(jwtLogin);
passport.use(localLogin);
passport.use(kakaoLogin);
passport.use(facebookLogin);
