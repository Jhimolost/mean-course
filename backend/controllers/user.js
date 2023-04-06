const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');

const UserModel = require("../models/user");

exports.createUser = (req, res, next) => {
  bcrypt.hash(req.body.password, 10).then((hash) => {
    const user = new UserModel({
      email: req.body.email,
      password: hash,
    });
    user.save().then((result) => {
      res.status(201).
        json({
          message: "User created!",
          result
        })
  }).catch((error) => {
      console.log(error)
      res.status(500).json({
        message: error
      });
    });
  });
};

exports.loginUser = (req, res, next) => {
  let fetchedUser;
  UserModel.findOne({
    email: req.body.email
  })
  .then(user => {
    if(!user) {
      return res.status(404).json({
        message: 'No user found'
      });
    }
    fetchedUser = user;
    return bcrypt.compare(req.body.password, fetchedUser.password);

  })
  .then((result) => {
    if(!result) {
      return res.status(401).json({
        message: "Auth failed"
      });
    }

    const token = jwt.sign({
      email: fetchedUser.email,
      userId: fetchedUser._id
    },
    process.env.JWT_KEY,
    {
      expiresIn: '1h'
    });

    res.status(200).json({
      message: 'Auth successful',
      token,
      expiresIn: 3600,
      userId: fetchedUser._id
    });

  })
  .catch((error) => {
    console.log(error)
    res.status(404).json({
      message: error
    });
  });
};
