import dotenv from 'dotenv';
dotenv.config();

import cors from 'cors';
import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import mongoose from 'mongoose';
import passport from 'passport';
// import session from 'express-session';
// const MongoStore = require('connect-mongo')(session);
import path from 'path';

import api from './routes';

const app = express();
const port = process.env.PORT || 3000;
const server = http.createServer(app);
app.use(cors());
app.use(bodyParser.json());
app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] :response-time ms'));

// app.use(session({
//   secret: process.env.SECRET_KEY,
//   resave: false,
//   saveUninitialized: true,
//   cookie: {
//     maxAge: 60000 * 30   // 30 minutes
//   },
//   store: new MongoStore({
//     mongooseConnection: mongoose.connection,
//     ttl: 1 * 24 * 60 * 60
//   })
// }));

app.use(passport.initialize());
// app.use(passport.session());

app.use('/', express.static(path.join(__dirname, '../public/')));


/* handle error */
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: {
            message: 'Something Broke!',
            code: 0
        }
    });
    next();
});

app.use('/api/v1', api);

mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on('error', console.error);
db.once('open', () => {
    console.log('Connected to mongod server');
});

if(process.env.NODE_ENV === 'development') {
    mongoose.set('debug', true);
    app.use(morgan('tiny')); // server logger
}

mongoose.connect(process.env.DB_URI);

server.listen(port, () => {
  console.log(`Express is running on port ${port}`);
});
