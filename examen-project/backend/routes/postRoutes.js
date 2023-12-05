const express = require('express')
const router = express.Router()
const { createPost, showPosts, showSinglePost, deletePost, updatePost, addComment, addLike, removeLike } = require('../controllers/postController')
const { isAuthendicated, isAdmin } = require('../middleware/auth')

    // blog routes
    router.post('/post/create', isAuthendicated, isAdmin, createPost)
    router.get('/posts/show', showPosts)
    router.get('/post/:id', showSinglePost)
    router.delete('/delete/post/:id', isAuthendicated, isAdmin, deletePost)
    router.delete('/delete/post/:id', isAuthendicated, isAdmin, deletePost)
    router.put('/update/post/:id', isAuthendicated, isAdmin, updatePost)
    router.put('/comment/post/:id', isAuthendicated, addComment)
    router.put('/addlike/post/:id', isAuthendicated, addLike)
    router.put('/removelike/post/:id', isAuthendicated, removeLike)
    
module.exports = router