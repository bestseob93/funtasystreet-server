import dotenv from 'dotenv';
dotenv.config();

import passport from 'passport';
import express from 'express';
import request from 'request-promise';

import mongoose from 'mongoose';
import Account from '../models/account';
import MusicStreet from '../models/musicstreet';

import { drawCircle } from '../services/geometryCompute';

const router = express.Router();

const SC_URL = process.env.ROOT_SC;
const SC_ID = process.env.SC_ID;

const requireAuth = passport.authenticate('jwt', { session: false });

router.get('/', requireAuth, (req, res, next) => {
	if(!req.user) {
		return res.status(401).json({
			code: 0,
			message: 'INVALID USER'
		});
	}
	console.log(req.user);
	let user = req.user;
	MusicStreet.find({ street_maker: user._id })
		   .sort({ _id: -1 })
		   .exec((err, musicstreets) => {
			return res.status(200).json({
				musicstreets
			});
		   });
});

router.get('/whole', (req, res, next) => {
	MusicStreet.find()
		   .sort({ _id: -1 })
		   .exec((err, musicstreets) => {
			return res.status(200).json({
				musicstreets
			});
		   });
});

router.get('/search/:searchResult', (req, res) => {
  let trackResult = req.params.searchResult;
  console.log(req.params);
  console.log(req.headers);
  console.log(req.get('content-type'));
  console.log('test');
  console.log(trackResult);

  const reqOptions = {
    method: 'GET',
    json: true,
    uri: `${SC_URL}/tracks`,
    qs: {
      q: trackResult,
      client_id: SC_ID,
      limit: 20,
      linked_partitioning: 10
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
        console.log('errrr');
        console.log(err.stack);
      }
    });
});

router.post('/register', requireAuth, (req, res, next) => {
	console.log("register came");
	console.log(req.body.latitude);
	console.log(req.body.longitude);
	console.log('check');
	console.log(req.body.address);
/* for compute circle coords */
	let center = {
		latitude: req.body.latitude,
		longitude: req.body.longitude
	};
	let computeRadius = req.body.street_radius / 1000;

	if(req.body.street_name === '' || typeof req.body.street_name !== 'string') {
	return res.status(422).json({
		error: "street_name is null",
		code: 0
	});
	}

	if(typeof req.body.street_radius !== 'number') {
		return res.status(422).json({
			error: "invalid street_radius",
			code: 2
		});
	}

	if(req.body.range_color === '' || typeof req.body.range_color !== 'string') {
		return res.status(422).json({
			error: "Invalid Range Color",
			code: 3
		});
	}

	if(typeof req.body.latitude !== 'number' || typeof req.body.longitude !== 'number') {
		return res.status(422).json({
			error: "Invalid Coordinates",
			code: 4
		});
	}
	if(req.user) {
		let user = req.user;
		drawCircle(center, computeRadius).then((circleCoords) => { 
		Account.findById(user._id, (err, account) => {
			if(err) throw err;
			if(!account) {
				return res.status(419).json({
					error: "Account Does Not Exist",
					code: 1
				});
			}
			MusicStreet.findOne({street_name: req.body.street_name}, (err, exist) => {
				if(err) throw err;
				if(exist) {
					return res.status(419).json({
						error: "Same Name Street Error",
						code: 10
					});
				}
		
			let musicstreet = new MusicStreet({
				selectedIcon: req.body.selectedIcon,
				street_name: req.body.street_name,
				street_radius: req.body.street_radius,
				range_color: req.body.range_color,
				street_maker: account._id,
				coord: {
					latitude: req.body.latitude,
					longitude: req.body.longitude
				},
				address: req.body.address
			});
			console.log(req.body.track);
			/* 검색 후 바로 선택 음악과 함께 거리를 만들 때 */
			if(req.body.track !== undefined) {
				let artist_url;
				if(req.body.artist_url === null) {
					artist_url = 'https://c1.staticflickr.com/5/4194/33900642883_e12fce7386_b.jpg';
				} else {
					artist_url = req.body.artist_url
				}

				let music = {
					track: req.body.track,
					likes: req.body.likes,
					plays_back: req.body.plays_back,
					artist_url: artist_url,
					stream_url: req.body.stream_url,
					duration: req.body.duration
				};
			
				musicstreet.music.push(music);
			}

			circleCoords.map((coords) => {
				musicstreet.circleCoords.push(coords);
			});
	
			musicstreet.save(err => {
				if(err) throw err;
				console.log("music added");
			
				return res.status(200).json({
					success: true
				});
			});
		  });
		});
	      });
	}
});

router.post('/addMusic/:id', requireAuth, (req, res, next) => {
	if(!mongoose.Types.ObjectId.isValid(req.params.id)) {
		return res.status(422).json({
			error: "INVALID ID",
			code: 0
		});
	}

	if(!req.user) {
		return res.status(401).json({
			error: "INVALID TOKEN",
			code: 1
		});
	} else {
		MusicStreet.findById(req.params.id, (err, musicstreet) => {
			if(err) throw err;
			if(!musicstreet) {
				return res.status(419).json({
					error: "MUSICSTREET DOES NOT EXIST",
					code: 2
				});
			}

                        let music = {
                                track: req.body.track,
                                likes: req.body.likes,
                                plays_back: req.body.plays_back,
                                artist_url: req.body.artist_url,
                                stream_url: req.body.stream_url,
				duration: req.body.duration
                        };

			musicstreet.music.push(music);

			musicstreet.save((err) => {
				if(err) throw err;
				return res.status(200).json({
					success: true
				});
			});
		});	
	}
});

router.delete('/musicitem/:streetid/:musicid', requireAuth, (req, res, next) => {
	console.log(mongoose.Types.ObjectId.isValid(req.params.streetid));
	if(!mongoose.Types.ObjectId.isValid(req.params.streetid) || !mongoose.Types.ObjectId.isValid(req.params.musicid)) {
		return res.status(422).json({
			error: "INVALID ID",
			code: 0
		});
	}

	if(!req.user) {
		return res.status(401).json({
			error: "INVALID TOKEN",
			code: 1
		});
	} else {
		MusicStreet.findById(req.params.streetid, (err, musicstreet) => {
			if(err) throw err;
			if(!musicstreet) {
				return res.status(419).json({
					error: "MUSICSTREET DOES NOT EXIST",
					code: 2
				});
			}
			
			let musicId = req.params.musicid;
			let index = -1;
			let musicLeng = musicstreet.music.length;
			
			for(let i=0; i<musicLeng; i++) {
				if(musicstreet.music[i]._id === musicId) {
					index = i;
					break;
				}
			}
			
			musicstreet.music.splice(index, 1);
			musicstreet.save( err => {
				if(err) throw err;
				return res.status(200).json({
					success: true,
					musicstreet
				});
			});
		});
	}
});

router.get('/what/:streetid', (req, res, next) => {
	let a = mongoose.Types.ObjectId.isValid(req.params.streetid);
	console.log(a);
	MusicStreet.findById({_id: req.params.streetid})
	     .exec((err, music) => {
		if(err) throw err;
		console.log(music);
		return res.status(200).json({
		});
	});
});

export default router;
