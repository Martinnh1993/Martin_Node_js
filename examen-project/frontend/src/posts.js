// dom to listen for the socket response from the backend 
document.addEventListener('DOMContentLoaded', function () {
    adminFetchPosts()

    socket.on('postChange', (change) => {
        if (change.operationType === 'insert' || change.operationType === 'update' || change.operationType === 'delete') {
            adminFetchPosts()
        }
    })
})

// takes the user to createPost.html
function createNewPostForm() {
    const userInfoJson = localStorage.getItem('userInfo')
    if (userInfoJson) {
        const userInfo = JSON.parse(userInfoJson)
        console.log(userInfo)

        // Check if the user is authenticated and is an admin
        if (userInfo.role === 'admin') {
            window.location.href = 'createPost.html'
        } else {
            showToast('Only admin users can create posts.', 'error')
        }
    } else {
        showToast('You must be logged in to create posts.', 'error')
    }
}

function adminFetchPosts() {
    fetch(`http://localhost:9000/api/posts/show`)
        .then(response => response.json())
        .then(data => {
            const adminPostContainer = document.getElementById('postsList')
            if (!adminPostContainer) {
                showToast('Admin post container not found', 'error')
                return;
            }

            // Clear existing posts before repopulating
            adminPostContainer.innerHTML = ''

            if (data.success && data.posts.length > 0) {
                data.posts.forEach(post => {
                    const postCard = createPostListItem(post)
                    adminPostContainer.appendChild(postCard)
                });
            } else {
                // Handle the case where there are no posts
                const noPostsMessage = document.createElement('li')
                noPostsMessage.textContent = 'No posts available.'
                adminPostContainer.appendChild(noPostsMessage)
            }
        })
        .catch(error => {
            console.error('Error fetching posts:', error)
            showToast('Error fetching posts', 'error')
        })
}

function createPostListItem(post) {
    const listItem = document.createElement('li')
    listItem.className = 'post-item'

    const image = document.createElement('img')
    image.src = post.image.url
    image.alt = 'Post Image'
    image.className = 'post-image'

    // create and populate title
    const title = document.createElement('h3')
    const maxTitleLength = 50
    title.textContent = post.title.length > maxTitleLength 
        ? post.title.substring(0, maxTitleLength) + '...' 
        : post.title
    title.className = 'post-title'

    // create and populate content 
    const content = document.createElement('p')
    const maxLength = 500
    content.textContent = post.content.length > maxLength 
        ? post.content.substring(0, maxLength) + '...' 
        : post.content
    content.className = 'post-content'

    const editButton = document.createElement('button')
    editButton.textContent = 'Edit'
    editButton.className = 'edit-post-btn'
    editButton.setAttribute('data-post-id', post._id)
    editButton.setAttribute('onclick', 'editPost(this.getAttribute("data-post-id"))')

    const deleteButton = document.createElement('button')
    deleteButton.textContent = 'Delete'
    deleteButton.className = 'delete-post-btn'
    deleteButton.setAttribute('data-post-id', post._id)
    deleteButton.setAttribute('onclick', `deletePost('${post._id}')`)

    listItem.appendChild(image)
    listItem.appendChild(title)
    listItem.appendChild(content)
    listItem.appendChild(editButton)
    listItem.appendChild(deleteButton)

    return listItem
}

// Function to handle post editing
function editPost(postId) {
    // Redirect to the editPost.html page with the post's ID as a query parameter
    window.location.href = `editPost.html?id=${postId}`
}

// Function to handle post deletion
function deletePost(postId) {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'))
    if (!userInfo || !userInfo.token) {
        showToast('You must be logged in to delete posts.', 'error')
        return
    }
    
    if (confirm('Are you sure you want to delete this post?')) {
        fetch(`http://localhost:9000/api/delete/post/${postId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userInfo.token}`
            },
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok')
            }
            return response.json()
        })
        .then(data => {
            if (data.success) {
                showToast(`Post with ID: ${postId} has been deleted`, 'success')
            } else {
                throw new Error(`Error deleting post: ${data.message}`)
            }
        })
        .catch(error => {
            showToast(`Error deleting post with ID: ${postId} - ${error.message}`, 'error')
        })
    }
}