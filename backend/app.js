const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();

const postRoutes = require('./routes/post');
const userRoutes = require('./routes/user');


mongoose.connect("mongodb+srv://admin:" + process.env.MONGO_ATLAS_PASSWORD + "@cluster0.hnonn24.mongodb.net/mean-course?retryWrites=true&w=majority")
.then(() => {console.log('Connection works!!!')})
.catch(() => {console.log('Connection failed!!!')});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));
app.use("/images", express.static(path.join('images')));

app.use((req,res,next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requiested-With, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS, PUT');
  next();
});

app.use('/api/posts', postRoutes);
app.use('/api/user', userRoutes);

module.exports = app;
