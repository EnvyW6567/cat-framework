import {fetchWrapper} from "./fetchWrapper.js";

document.addEventListener("DOMContentLoaded", () => {
    const $loginButton = document.querySelector('.login-button');
    const $logo = document.querySelector('.logo');

    if ($loginButton) {
        $loginButton.addEventListener('click', () => loginButtonHandler());
    }
    $logo.addEventListener('click', () => logoHandler());

    if (localStorage.getItem("sessionId")) {
        const logoutButton = createButton('로그아웃', 'logout-button', logoutButtonHandler);

        $loginButton.replaceWith(logoutButton);
    }
});

const createButton = (text, className, clickHandler) => {
    const button = document.createElement('button');

    button.textContent = text;
    button.className = `button ${className}`;
    button.addEventListener('click', clickHandler);

    return button;
}

const loginButtonHandler = () => {
    location.assign("http://localhost:3000/login");
}

const logoutButtonHandler = () => {
    fetchWrapper.post('/api/user/logout')
        .then(() => {
            localStorage.removeItem("sessionId");
            location.reload();
        })
        .catch(e => {
            alert("로그아웃에 실패했습니다.");
            console.log(e);
        });
}

const logoHandler = () => {
    console.log("???"); //TODO: delete
    location.assign("http://localhost:3000/");
}