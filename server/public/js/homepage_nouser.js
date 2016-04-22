/**
 * Created by David on 2/23/2016.
 */

handleLogin = function() {
    var usernameInput = document.getElementById("inputUsername");
    var passwordInput = document.getElementById("inputPassword");
    var errorBox = document.getElementById("loginError");

    $.ajax({
        url: '/authenticate',
        type: 'POST',
        dataType: 'json',
        data: {
            username: usernameInput.value,
            password: passwordInput.value
        },
        statusCode: {
            200: function(resp) {
                window.location = '/';
            },
            403: function(resp) {
                errorBox.classList.remove('hidden');
                errorBox.innerHTML = $.parseJSON(resp.responseText).error;
            }

        }
    });
};

handleSignup = function() {
    var firstName = document.getElementById("inputFirstName");
    var lastName = document.getElementById("inputLastName");
    var username = document.getElementById("inputUsernameSignup");
    var email = document.getElementById("inputEmail");
    var password = document.getElementById('inputPasswordSignup');
    var errorBox = document.getElementById('signupError');

    $.ajax({
        url: '/signup',
        type: 'POST',
        dataType: 'json',
        data: {
            email: email.value,
            username: username.value,
            firstname: firstName.value,
            lastname: lastName.value,
            password: password.value
        },
        statusCode: {
            201: function(resp) {
                window.location = '/';
            },
            400: function(resp) {
                errorBox.classList.remove('hidden');
                errorBox.innerHTML = $.parseJSON(resp.responseText).error;
            }
        }
    })
};