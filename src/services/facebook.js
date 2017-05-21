module.exports = {
  'appID': process.env.FB_ID,
  'appSecret': process.env.FB_KEY,
  'callbackURL': 'http://localhost:4000/api/v1/account/facebook/callback',
  'profileFields': ['id', 'name', 'emails', 'friends']
};
