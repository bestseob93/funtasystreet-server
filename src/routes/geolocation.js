import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import request from 'request-promise';

const router = express.Router();

const G_URL = process.env.G_URL;
const G_KEY = process.env.GOOGLE_KEY;

router.get('/reversegeocode/:latlng', (req, res, next) => {
  let latlng = req.params.latlng;
  let latlngArr = latlng.split('-');
  let lat = latlngArr[0];
  let lng = latlngArr[1];
  const reqOptions = {
    method: 'GET',
    json: true,
    uri: `${G_URL}/json`,
    qs: {
      latlng: `${lat},${lng}`,
      key: G_KEY,
      language: 'ko'
    },
    headers: { 'content-type': 'application/json; charset=utf-8' }
  };
  console.log(reqOptions);

  request(reqOptions)
    .then(results => {
      console.log(results);
      return res.status(200).json({
        success: true,
        results
      });
    })
    .catch(err => {
      if(err) {
        return err.stack;
      }
    });
});

export default router;
