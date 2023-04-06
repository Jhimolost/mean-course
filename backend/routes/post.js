const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');
const exctractFile = require('../middleware/file');

const PostController = require('../controllers/post');

router.post('', checkAuth, exctractFile, PostController.createPost);

router.get('', PostController.getPosts);

router.get('/:id', PostController.getPost);

router.put('/:id', checkAuth, exctractFile, PostController.updatePost);

router.delete('/:id', checkAuth, PostController.deletePost);

module.exports = router;
