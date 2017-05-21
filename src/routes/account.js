import express from 'express';
import * as AccountController from './accountController';

import passportService from '../services/passport';
import passport from 'passport';

const router = express.Router();

const requireAuth = passport.authenticate('jwt', { session: false });
const requireSignIn = passport.authenticate('local', { session: false });
const requireKakao = passport.authenticate('kakao', { session: false, failureRedirect: '/api/v1/account/failure' });
const requireFacebook = passport.authenticate('facebook', { session: false, failureRedirect: '/api/v1/account/failure' });

router.get('/', requireAuth, (req, res) => {
    console.log('aaaa');
	console.log(req.user);
	res.json({ hi: 'there' });
});

router.get('/failure', (req, res) => {
  res.redirect('/');
});

router.get('/who', AccountController.whoThere);
router.post('/signUp', AccountController.signUp);
router.post('/signIn', requireSignIn, AccountController.signIn);
router.post('/logout', AccountController.logout);
router.get('/kakao', requireKakao);
router.get('/kakao/callback', requireKakao, AccountController.signIn);

router.get('/facebook', requireFacebook);
router.get('/facebook/callback', requireFacebook, AccountController.signIn);

export default router;
