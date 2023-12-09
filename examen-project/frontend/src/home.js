// dom to listen for the socket response from the backend 
document.addEventListener('DOMContentLoaded', function () {
    fetchPosts()

    socket.on('postChange', (change) => {
        if (change.operationType === 'insert' || change.operationType === 'update') {
            fetchPosts()
        }
    })
})

// create a the post card to display
function createPostCard(post) {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'))
    // Create card container
    const card = document.createElement('div')
    card.classList.add('post-card')

   // Create and set title
   const title = document.createElement('h2')
   title.textContent = post.title
   title.style.height = '60px'
   title.style.overflow = 'hidden'
   title.style.cursor = 'pointer'
   title.onclick = () => {
       window.location.href = `post.html?id=${post._id}`
   };
   card.appendChild(title)

    // Create and set date
    const date = document.createElement('p')
    date.textContent = new Date(post.createdAt).toLocaleDateString()
    date.style.color = 'lightgray'
    date.style.height = '15px'
    card.appendChild(date)

    // Create and set image with fixed size
    if (post.image && post.image.url) {
        const img = document.createElement('img')
        img.src = post.image.url
        img.alt = 'Post Image'
        img.style.width = '100%'
        img.style.height = '200px'
        img.style.objectFit = 'cover'
        card.appendChild(img)
    }

    // Create and set content with limited height
    const content = document.createElement('p')
    content.textContent = post.content
    content.style.height = '38px'
    content.style.overflow = 'hidden'
    card.appendChild(content)

    // Create interactions container
    const interactions = document.createElement('div')
    interactions.style.display = 'flex'
    interactions.style.justifyContent = 'space-between'
    interactions.style.alignItems = 'center'

    // Left side - Likes
    const likesContainer = document.createElement('div')

    // Heart icon for likes
    const heartIcon = document.createElement('i')
    const userLikesThisPost = post.likes.includes(userInfo.id)
    heartIcon.className = userLikesThisPost ? 'fa-solid fa-heart' : 'fa-regular fa-heart'
    heartIcon.style.cursor = 'pointer'
    heartIcon.style.color = 'red'
    heartIcon.onclick = function () {
        addRemoveLike(post._id, userLikesThisPost)
    };
    likesContainer.appendChild(heartIcon)

    // Number of likes
    const likesCount = document.createElement('span')
    likesCount.textContent = ` ${post.likes.length} Like(s)`
    likesCount.style.color = 'white'
    likesContainer.appendChild(likesCount)

    interactions.appendChild(likesContainer)

    // Right side - Comments
    const commentsContainer = document.createElement('div')

    // Number of comments
    const commentsCount = document.createElement('span')
    commentsCount.textContent = `${post.comments.length} `
    commentsCount.style.color = 'white'
    commentsContainer.appendChild(commentsCount)

    // Message icon for comments
    const messageIcon = document.createElement('i')
    messageIcon.className = 'fa-solid fa-message'
    messageIcon.style.color = 'blue'
    commentsContainer.appendChild(messageIcon)

    interactions.appendChild(commentsContainer)

    card.appendChild(interactions)

    return card
}



// gets all posts from the database
function fetchPosts() {
    fetch(`http://localhost:9000/api/posts/show`)
        .then(response => response.json())
        .then(data => {
            const postContainer = document.getElementById('postContainer')
            if (!postContainer) {
                console.error('postContainer element not found')
                return
            }
            if (data.success && data.posts.length > 0) {
                postContainer.innerHTML = ''
                data.posts.forEach(post => {
                    const postCard = createPostCard(post)
                    postContainer.appendChild(postCard)
                })
            }
        })
        .catch(error => {
            showToast(`the error is in the catch inside fetch ${error}`, 'error')
        })
}


// add or remove a like depending on if the user that is logged in has like the post
function addRemoveLike(postId, isLiked) {
    // Check if user is logged in
    const userInfo = JSON.parse(localStorage.getItem('userInfo'))
    if (!userInfo || !userInfo.token) {
        showToast('User not logged in', 'error')
        return
    }

    const url = isLiked ? `http://localhost:9000/api/removelike/post/${postId}` : `http://localhost:9000/api/addlike/post/${postId}`

    fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userInfo.token}`
        }
    })
    .then(response => response.json().catch(() => {
        throw new Error('Invalid JSON response')
    }))
    .then(data => {
        if (data.status) { // Changed from data.success to data.status
            updateLikeUI(postId, data.post, !isLiked)
        } else {
            const errorMsg = data.message || 'Error occurred while toggling like'
            showToast(`Error toggling like: ${errorMsg}`, 'error')
        }
    })
    .catch(error => {
        showToast(`Error toggling like: ${error.message}`, 'error')
    })
}



function updatePost(post) {
    // Assuming each post card has an id like 'post_123'
    const postCard = document.querySelector(`#post_${post._id}`)
    if (postCard) {
        // Update the like count
        const likeCountElement = postCard.querySelector('.like-count')
        if (likeCountElement) {
            likeCountElement.textContent = `${post.likes.length} Like(s)`
        }
    }
}

function updateLikeUI(postId, isLiked) {
    // Find the post in the DOM
    const postCard = document.querySelector(`#post_${postId}`)

    if (!postCard) {
        console.error(`Post with ID ${postId} not found`)
        return
    }
    
    // Update the like button appearance
    const likeButton = postCard.querySelector('.like-button')
    if (likeButton) {
        likeButton.classList.toggle('liked', isLiked)
    } else {
        console.error(`Like button not found in post ${postId}`)
    }

    // Update the like count
    const likeCountElement = postCard.querySelector('.like-count')
    if (likeCountElement) {
        let likeCount = parseInt(likeCountElement.textContent);
        likeCount = isLiked ? likeCount + 1 : Math.max(0, likeCount - 1)
        likeCountElement.textContent = `${likeCount} Like(s)`
    } else {
        console.error(`Like count element not found in post ${postId}`)
    }
}