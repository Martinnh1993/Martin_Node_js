// Initialize Socket.IO client and send token
const socket = io('http://localhost:9000')

// When the socket connection is established
socket.on('connect', () => {
    console.log('Connected to server with ID:', socket.id)
    const userJson = localStorage.getItem('user')
    if (userJson && userJson !== 'undefined') { 
        try {
            const user = JSON.parse(userJson)
            socket.emit('setUserData', user)
        } catch (e) {
            console.error('Error parsing user data:', e)
        }
    }
})

// When the DOM content is loaded
document.addEventListener('DOMContentLoaded', function() {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'))
    const loginLogoutIcon = document.getElementById('login-logout-icon')
    const postLink = document.getElementById('Posts')

    if (userInfo && userInfo.token) {
        // User is logged in, update UI accordingly
        if (loginLogoutIcon) {
            loginLogoutIcon.innerHTML = '<i class="fa-solid fa-right-from-bracket"></i>'
            loginLogoutIcon.href = 'javascript:logout();'
        }

        // Show or hide elements based on user role
        if (userInfo.role === 'admin') {
            postLink.style.display = 'block' // Show admin specific elements
        } else {
            postLink.style.display = 'none' // Hide admin specific elements for non-admin users
        }
    } else {
        // No user is logged in, update UI for logged-out state
        if (loginLogoutIcon) {
            loginLogoutIcon.innerHTML = '<i class="fa-solid fa-circle-user"></i>';
            loginLogoutIcon.href = 'loginSignup.html'
        }
        postLink.style.display = 'none' // Hide admin specific elements
    }
})

// Corrected getUserDataFromLocalStorage function
function getUserDataFromLocalStorage() {
    let userData = localStorage.getItem('user')
    console.log('User data in local storage:', userData)
    if (userData) {
        try {
            userData = JSON.parse(userData)
            return userData
        } catch (e) {
            console.error('Error parsing user data:', e)
            // Handle error
        }
    } else {
        console.log('No user data found in local storage.')
    }
    return null
}

function showSignupForm() {
    document.getElementById('loginForm').style.display = 'none'
    document.getElementById('signupForm').style.display = 'block'
}

function showLoginForm() {
    document.getElementById('signupForm').style.display = 'none'
    document.getElementById('loginForm').style.display = 'block'
}

// signin
function signin() {
    const email = document.getElementById('loginEmail').value
    const password = document.getElementById('loginPassword').value

    fetch('http://localhost:9000/api/signin', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            localStorage.setItem('userInfo', JSON.stringify(data))
            handleLoginSuccess(data)
        } else {
            showToast(data.error, 'error')
        }
    })
    .catch(error => {
        console.error('Login Error:', error)
        showToast('An error occurred.', error)
    })
   
}

// signup
function signup() {
    const email = document.getElementById('signupEmail').value
    const password = document.getElementById('signupPassword').value
    const name = document.getElementById('signupName').value

    fetch('http://localhost:9000/api/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            handleLoginSuccess(data)
        } else {
            showToast(data.error, 'error')
        }
    })
    .catch(error => {
        console.error('Signup Error:', error)
        showToast(error, 'error')
    });
}

// logout
function logout() {
    localStorage.removeItem('userInfo')
    window.location.href = 'loginSignup.html'
}

// redirect to home page if login was successful
function handleLoginSuccess(responseData) {
    localStorage.setItem('userInfo', JSON.stringify(responseData));
    console.log(localStorage.getItem('userInfo'));
    window.location.href = 'home.html';
}

function makeAuthenticatedRequest(endpoint, method = 'GET', body = null) {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'))
    if (!userInfo || !userInfo.token) {
        console.error('User is not logged in')
        return
    }

    fetch(endpoint, {
        method: method,
        headers: {
            'Authorization': `Bearer ${userInfo.token}`,
            'Content-Type': 'application/json'
        },
        body: body ? JSON.stringify(body) : null
    })
    .then(response => response.json())
    .then(data => {
        showLoginForm(data.error, error)
    })
    .catch(error => {
        showToast(error, 'error')
    })
}