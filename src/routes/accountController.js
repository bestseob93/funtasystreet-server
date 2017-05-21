import Account from '../models/account';
import { tokenForAccount } from '../services/jwt';

export const signUp = (req, res, next) => {
  const useremail = req.body.useremail;
  const password = req.body.password;
  console.log(req.body);

  if(typeof useremail !== 'string' || typeof password !== 'string') {
    return res.status(422).json({
      error: 'please fill form',
      code: 1
    });
  }

  if(useremail === '' || password === '') {
    return res.status(422).json({
      error: 'please fill form',
      code: 1
    });
  }

  Account.findOne({useremail: useremail}, (err, existingAccount) => {
    if(err) { return next(err); }
    if(existingAccount) {
      return res.status(419).json({
        error: 'account is in use',
        code: 2
      });
    }

    const account = new Account({
      useremail: useremail,
      password: password,
      provider: 'local'
    });

    account.save(err => {
      if(err) { return next(err); }
      res.status(200).json({
        success: true,
        token: tokenForAccount(account)
      });
    });
  });
};

export const signIn = (req, res, next) => {
  // Account has already had their username, password auth'd
  // we just need to give them a token
  console.log('signIn route');
  console.log(req.user);
  console.log(req.body);

  res.status(200).json({ token: tokenForAccount(req.user)} );
};

export const whoThere = (req, res, next) => {
  Account.find().exec((err, accounts) => {
    if(err) throw err;
    res.status(200).json({
      accounts
    });
  });
};

export const logout = (req, res, next) => {
	req.logout();
	res.json({
		success: true
	});
};
