import { fetchWrapper } from './fetchWrapper.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const goSignup = document.querySelector('.go-signup');

    loginForm.addEventListener('submit', (event) => loginHandler(event));
    goSignup.addEventListener('click', () => goSignupHandler());
});

const loginHandler = (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!email || !password) {
        alert('입력란을 채워주세요!');

        return;
    }

    fetchWrapper
        .post('/api/user/login', {
            email,
            password,
        })
        .then((data) => {
            if (data.sessionId) {
                localStorage.setItem('sessionId', data.sessionId);

                location.assign('/');
            } else {
                console.warn('Session ID not found in the response');
            }
        })
        .catch((error) => {
            window.alert(`로그인 실패. ${error}`);
        });
};

const goSignupHandler = () => {
    location.assign('http://localhost:3000/signup');
};
