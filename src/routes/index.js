import express from 'express';

import geolocation from './geolocation';
import account from './account';
import musicstreet from './musicstreet';

const router = express.Router();

router.use('/account', account);
router.use('/geolocation', geolocation);
router.use('/musicstreet', musicstreet);

export default router;
