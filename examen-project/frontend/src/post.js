// setting up socket io for real time communication
document.addEventListener('DOMContentLoaded', function () {
    // Extract the post ID from the URL
    const urlParams = new URLSearchParams(window.location.search)
    const postId = urlParams.get('id')

    if (postId) {
        fetchPostData(postId)
    } else {
        showToast('No post ID provided.', 'error')
    }

    socket.on('postChange', (change) => {
        if ((change.operationType === 'insert' || change.operationType === 'update') && change.documentKey._id === postId) {
            fetchPostData(postId)
        }
    })
})

// fetch the data from the database
function fetchPostData(postId) {
    console.log('Fetching post with ID:', postId);
    fetch(`http://localhost:9000/api/post/${postId}`)
        .then(response => {
            if (!response.ok) {
                if (response.status === 404) {
                    showToast('Post not found', 'error')
                } else {
                    showToast('Failed to fetch post', 'error')
                }
                throw new Error('Failed to fetch post')
            }
            return response.json()
        })
        .then(post => {
            console.log('Fetched post data:', post)
            displayPost(post)
        })
        .catch(error => {
            console.log('Error fetching post:', error)
            showToast(`Error: ${error.message}`, 'error')
        })
}

// displays the post from the database information
function displayPost(data) {
    const postContainer = document.querySelector('.postWithId')
    const currentUserID = JSON.parse(localStorage.getItem('userInfo'))?.id

    // Clear previous content
    postContainer.innerHTML = ''

    if (data.success && data.posts) {
        const post = data.posts

        // Create and append title element
        const title = document.createElement('h1')
        title.textContent = post.title
        postContainer.appendChild(title)

        // Create and append image element, if available
        if (post.image && post.image.url) {
            const image = document.createElement('img')
            image.src = post.image.url
            image.alt = 'Post Image'
            image.classList.add('postImage')
            postContainer.appendChild(image)
        }

        // Create and append content element
        const content = document.createElement('p')
        content.textContent = post.content
        postContainer.appendChild(content)

        // Check if a user is logged in before adding comments
        if (currentUserID) {
            // Create and append comment form
            const commentForm = document.createElement('form')
            commentForm.className = 'comment-form'
            commentForm.addEventListener('submit', (e) => {
                e.preventDefault()
                submitComment(post._id)
            })

            const textarea = document.createElement('textarea')
            textarea.placeholder = 'Add a comment...'
            textarea.required = true
            commentForm.appendChild(textarea)

            const submitButton = document.createElement('button')
            submitButton.type = 'submit'
            submitButton.textContent = 'Post Comment'
            commentForm.appendChild(submitButton)

            postContainer.appendChild(commentForm)

            // Create and append comments section
            const commentsSection = document.createElement('div')
            commentsSection.className = 'commentsSection'

            // Loop through each comment and create its elements
            post.comments.forEach(comment => {
                const isCurrentUserComment = comment.postedBy._id === currentUserID

                // Create the outer container for the comment
                const commentContainer = document.createElement('div')
                commentContainer.className = isCurrentUserComment ? 'commentContainer current-user-commentContainer' : 'commentContainer'

                // Create the comment div
                const commentDiv = document.createElement('div')
                commentDiv.className = 'comment'

                // Create and append comment text
                const commentText = document.createElement('p')
                commentText.className = 'commentText'
                commentText.textContent = comment.text
                commentDiv.appendChild(commentText)

                // Append the comment div to its container
                commentContainer.appendChild(commentDiv)

                // Create and append comment info (posted by and date)
                const commentInfoDiv = document.createElement('div')
                commentInfoDiv.className = 'commentInfo'
                const postedByName = isCurrentUserComment ? 'You' : comment.postedBy.name
                commentInfoDiv.textContent = `Posted by: ${postedByName} on ${new Date(comment.created).toLocaleString()}`
                commentContainer.appendChild(commentInfoDiv)

                // Append the entire comment container to the comments section
                commentsSection.appendChild(commentContainer)
            });

            postContainer.appendChild(commentsSection)

        } else {
            // Display a message indicating that login is required to view comments
            const loginMessage = document.createElement('p')
            loginMessage.textContent = 'Log in to see comments'
            loginMessage.className = 'login-to-comment'
            loginMessage.style.cursor = 'pointer'
            loginMessage.addEventListener('click', () => {
                window.location.href = 'loginSignup.html'
            })
            postContainer.appendChild(loginMessage)
        }
    } else {
        // Handle case where post data is not successful or not present
        const errorMessage = document.createElement('p')
        errorMessage.textContent = 'Failed to load post data.'
        postContainer.appendChild(errorMessage)
    }
}

// submit a comment to the backend
function submitComment(postId) {
    const commentText = document.querySelector('.comment-form textarea').value
    const userInfo = JSON.parse(localStorage.getItem('userInfo'))

    // Ensure user is logged in
    if (!userInfo || !userInfo.token) {
        showToast('You must be logged in to add a comment.', 'error')
        return
    }

    // Data to be sent in the request
    const commentData = { comment: commentText }

    // Make a PUT request to add the comment
    fetch(`http://localhost:9000/api/comment/post/${postId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userInfo.token}`
        },
        body: JSON.stringify(commentData)
    })
    .then(response => {
        if (!response.ok) {
            // If server responds with an error
            throw new Error('Failed to post comment')
        }
        return response.json()
    })
    .then(data => {
        if (data.status) {
            // Comment added successfully
            showToast('Comment added successfully', 'success')
            // Optionally, refresh the post data to show the new comment
        } else {
            // Handle response when adding a comment is unsuccessful
            showToast('Failed to add comment: ' + data.message, 'error')
        }
    })
    .catch(error => {
        // Handle network errors or errors thrown from response handling
        showToast(`Error: ${error.message}`, 'error')
    })

    // Clear the textarea after submitting
    document.querySelector('.comment-form textarea').value = ''
}