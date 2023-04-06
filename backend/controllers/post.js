const PostModel = require('../models/post');

exports.updatePost =  (req, res, next) => {
  let imagePath;
  if(req.file) {
    const url = req.protocol + '://' + req.get("host");
    imagePath = url + '/images/' + req.file.filename;
  } else {
    imagePath = req.body.imagePath;
  }
  const post = new PostModel({
    _id: req.params.id,
    title: req.body.title,
    content: req.body.content,
    imagePath,
    creator: req.userData.userId
  });

  PostModel.updateOne({_id: req.params.id, creator: req.userData.userId}, post)
  .then( documents => {
    console.log(documents)
    if(documents.matchedCount) {
      res.status(200).json({
        message: 'Posts were updated successfully',
        post
      });
    } else {
      res.status(401).json({
        message: "Not Authorized!"
      });
    }
  }).catch((error) => {
    res.status(404).json({
      message: error
    });
  });
};

exports.deletePost = (req, res, next) => {
  PostModel.deleteOne({_id: req.params.id, creator: req.userData.userId})
  .then( documents => {
    if(documents.deletedCount) {
      res.status(200).json({
        message: 'Posts deleted successfully',
        posts: documents
      });
    } else {
      res.status(401).json({
        message: "Not Authorized!"
      });
    }
  }).catch((error) => {
    res.status(404).json({
      message: error
    });
  });
};

exports.getPost = (req, res, next) => {
  PostModel.findById(req.params.id)
  .then( post => {
    console.log(post)
    if(post) {
      res.status(200).json(post);
    } else {
      res.status(404).json({
        message: 'Post not found'
      });
    }
  }).catch((error) => {
    res.status(404).json({
      message: error
    });
  });
};

exports.getPosts = (req, res, next) => {
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.page;
  let postQuery = PostModel.find();
  let postsList = [];

  if(pageSize &&currentPage) {
    postQuery
    .skip(pageSize * (currentPage - 1))
    .limit(pageSize);
  }

  postQuery
  .then( documents => {
    postsList = documents;
    return PostModel.count()
  })
  .then((count) => {
    res.status(200).json({
      message: 'Posts fetched successfully',
      posts: postsList,
      maxPosts: count
    });
  })
  .catch((error) => {
    console.log(error)
    res.status(404).json({
      message: error
    });
  });;
};

exports.createPost = (req, res) => {
  const url = req.protocol + '://' + req.get("host");

  const post = new PostModel({
    title: req.body.title,
    content: req.body.content,
    imagePath: url + '/images/' + req.file.filename,
    creator: req.userData.userId
  });

  post.save().then((post) => {
    res.status(201).json({
      message: 'Post added successfully!',
      post
    });
  }).catch((error) => {
    res.status(404).json({
      message: error
    });
  });
}
