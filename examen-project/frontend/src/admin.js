document.addEventListener('DOMContentLoaded', function() {
    adminFetchPosts(); 
});






// Function to handle post editing
function editPost(post) {
    // Logic to edit the post
}

// Function to handle post deletion
/* function deletePost(postId) {
    if (confirm('Are you sure you want to delete this post?')) {
        fetch(`http://localhost:9000/delete/post/${postId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                // Include authorization headers if needed
                'Authorization': 'Bearer ' + yourAuthToken, // Replace with actual token
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const postItem = document.getElementById(`post_${postId}`);
                if (postItem) {
                    postItem.remove();
                }
            } else {
                alert('Error deleting post: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error deleting post:', error);
            alert('Error deleting post');
        });
    }
} */



function adminFetchPosts() {
    fetch(`http://localhost:9000/api/posts/show`)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.posts.length > 0) {
                const adminPostContainer = document.getElementById('postsList');
                adminPostContainer.innerHTML = ''; // Clear existing posts
                data.posts.forEach(post => {
                    const postCard = createPostListItem(post);
                    adminPostContainer.appendChild(postCard);
                });
            }
        })
        .catch(error => console.error('Error fetching posts:', error));
}


function createPostListItem(post) {
    const listItem = document.createElement('li');
    listItem.className = 'post-item';

    const image = document.createElement('img');
    image.src = post.image.url; // Adjust according to your data structure
    image.alt = 'Post Image';
    image.className = 'post-image';

    const title = document.createElement('h3');
    title.textContent = post.title;
    title.className = 'post-title';

    const content = document.createElement('p');
    content.textContent = post.content;
    content.className = 'post-content';

    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.className = 'edit-post-btn';
    editButton.setAttribute('data-post-id', post._id);
    editButton.setAttribute('onclick', 'editPost(this.getAttribute("data-post-id"))');

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.className = 'delete-post-btn';
    deleteButton.setAttribute('data-post-id', post._id);
    deleteButton.setAttribute('onclick', `deletePost('${post._id}')`);

    listItem.appendChild(image);
    listItem.appendChild(title);
    listItem.appendChild(content);
    listItem.appendChild(editButton);
    listItem.appendChild(deleteButton);

    return listItem;
}

// Function to handle post deletion
function deletePost(postId) {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo || !userInfo.token) {
        alert("You must be logged in to delete posts.");
        return;
    }
    console.log("token works");
    
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
                console.log(response)
                throw new Error('Network response was not ok');
                
            }
            
            return response.json();
        })
        .then(data => {
            if (data.success) {
                const postItem = document.getElementById(`post_${postId}`);
                if (postItem) {
                    postItem.remove();
                }
            } else {
                alert('Error deleting post: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error deleting post:', error);
            alert('Error deleting post');
        });
    }
}




