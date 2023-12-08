const cloudinary = require('../utils/couldinary')
const Post = require('../models/postModel')
const ErrorResponse = require('../utils/errorResponse')

// create post 
exports.createPost = async (req, res, next) => {
    const { title, content, postedBy, image, likes, comments } = req.body

    try {
        // upload the image to cloudinary
        const result = await cloudinary.uploader.upload(image, {
            folder: "posts",
            width: 1200, 
            crop: 'scale'
        })
        const post = await Post.create({
            title,
            content,
            postedBy: req.user.id, 
            image: {
                public_id: result.public_id,
                url: result.secure_url
            }
        })
        res.status(201).json({
            success: true,
            post
        })
        
    } catch (error) {
        console.log(error)
        next(error)
    }
}

// show posts
exports.showPosts = async (req, res, next) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 }).populate('postedBy', 'name')
        res.status(201).json({
            success: true,
            posts
        })
    } catch (error) {
        next(error)
    }
}

// show single post
exports.showSinglePost = async (req, res, next) => {
    try {
        const posts = await Post.findById(req.params.id).populate('comments.postedBy', 'name')
        res.status(201).json({
            success: true,
            posts
        })
    } catch (error) {
        next(error)
    }
}


// delete post
exports.deletePost = async (req, res, next) => {
    try {
        // Check if post exists first
        const currentPost = await Post.findById(req.params.id);
        if (!currentPost) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            });
        }

        // delete post image in cloudinary 
        const imgId = currentPost.image.public_id;
        if (imgId) {
            await cloudinary.uploader.destroy(imgId);
        }

        // Delete the post using deleteOne
        await Post.deleteOne({ _id: req.params.id });
        res.status(200).json({
            success: true,
            message: "Post deleted"
        });
    } catch (error) {
        console.log("Error:", error);
        next(error);
    }
};




// update post
exports.updatePost = async (req, res, next) => {
    try {
        const { title, content, image } = req.body;
        const currentPost = await Post.findById(req.params.id);

        if (!currentPost) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }

        // build the object data
        const data = {
            title: title || currentPost.title,
            content: content || currentPost.content,
            image: currentPost.image // Keep the old image by default
        };

        // Function to check if string is base64
        const isBase64String = (str) => {
            if (str === '' || str.trim() === '') { return false; }
            try {
                return btoa(atob(str)) === str;
            } catch (err) {
                return false;
            }
        };

        // modify post image conditionally 
        if (image && image !== '') {
            const imgId = currentPost.image.public_id;
            if (imgId) {
                await cloudinary.uploader.destroy(imgId);
            }

            let newImage = null;

            // Check if image is a base64 string
            if (isBase64String(image)) {
                newImage = await cloudinary.uploader.upload(image, {
                    folder: 'posts',
                    width: 1200, 
                    crop: 'scale'
                });
            }
            // If it's not a base64 string, handle as URL or other type
            else {
                // Handle URL-based image upload or other types here
                // For now, we'll skip uploading if it's not a base64 string
            }

            if (newImage) {
                data.image = {
                    public_id: newImage.public_id,
                    url: newImage.secure_url
                };
            }
        }

        const postUpdate = await Post.findByIdAndUpdate(req.params.id, data, { new: true });

        res.status(200).json({
            success: true, 
            postUpdate
        });
    } catch (error) {
        console.error(error);
        next(error);
    }
};


// add comment
exports.addComment = async (req, res, next) => {
    const { comment } = req.body
    try {
        const post = await Post.findByIdAndUpdate(req.params.id, {
            $push: { comments: {text: comment, postedBy: req.user._id}}
        },
         {new: true}
        )
        res.status(200).json({
            status: true, 
            post
        })

    } catch (error) {
        next(error)
    }
}

// add like
exports.addLike = async (req, res, next) => {
   
    try {
        const post = await Post.findByIdAndUpdate(req.params.id, {
            $addToSet: {likes: req.user._id}
        },
            {new: true}
        )
        res.status(200).json({
            status: true, 
            post
        })
        
    } catch (error) {
        next(error)
    }
}

// remove like
exports.removeLike = async (req, res, next) => {
   
    try {
        const post = await Post.findByIdAndUpdate(req.params.id, {
            $pull: {likes: req.user._id}
        },
            {new: true}
        )
        res.status(200).json({
            status: true, 
            post
        })
        
    } catch (error) {
        next(error)
    }
}