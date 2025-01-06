import { boardHandler } from './boardHandler.js';

let $postContainer = document.querySelector('.post-container');

let page = 1;
let size = 10;

document.addEventListener('DOMContentLoaded', async () => {
    renderBoard();
});

const renderBoard = async () => {
    const postContainer = await boardHandler(page, size);

    $postContainer.replaceWith(postContainer);
    $postContainer = postContainer;

    const $pages = document.querySelectorAll('.page');
    const $writeButton = document.querySelector('.write-button');

    $writeButton.addEventListener('click', () => writeButtonHandler());
    $pages.forEach(($page) => $page.addEventListener('click', (event) => pageButtonHandler(event)));
};

const pageButtonHandler = (event) => {
    page = parseInt(event.target.id.split('_')[1], 10);
    renderBoard();
};

const writeButtonHandler = () => {
    const sessionId = localStorage.getItem('sessionId');

    if (!sessionId) {
        if (confirm('로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?')) {
            location.assign('http://localhost:3000/login');

            return;
        }
        return;
    }
    location.assign('http://localhost:3000/write');
};
