import {fetchWrapper} from "./fetchWrapper.js";

document.addEventListener("DOMContentLoaded", () => {
    const $signupButton = document.querySelector(".submit-button");

    $signupButton.addEventListener('click', (event) => signupButtonHandler(event));

});

const signupButtonHandler = (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const username = document.getElementById("username").value;

    console.log(email, password, username);

    fetchWrapper.post('/api/user/signup', {
        email,
        password,
        username
    }).then(() => {
        console.log("what?");
        location.assign('http://localhost:3000/login')
    });
}