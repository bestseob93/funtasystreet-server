import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const Musicstreet = new Schema({
  selectedIcon: String,
  street_name: String,
  street_radius: Number,
  range_color: String,
  street_maker: {type: Schema.Types.ObjectId, ref: 'account'},
  date: {
	created: { type: Date, default: Date.now },
	recentVisit: { type: Date, default: Date.now }
  },
  music: [
    {
      track: String,
      likes: Number,
      plays_back: Number,
      artist_url: String,
      stream_url: String,
      duration: Number  
    }
  ],
  coord: {
      latitude: Number,
      longitude: Number
  },
  address: String,
  circleCoords: [{
      latitude: Number,
      longitude: Number}]
});

export default mongoose.model('musicstreet', Musicstreet);
