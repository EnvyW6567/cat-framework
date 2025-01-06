import {fetchWrapper} from "./fetchWrapper.js";

const queryStr = location.search;
const id = queryStr.split('=')[1];


document.addEventListener("DOMContentLoaded", async () => {
    const data = await fetchWrapper.get(`/api/post?id=${id}`);

    const $title = document.querySelector('.title-wrapper');
    const $meta = document.querySelector('.meta-wrapper');
    const $content = document.querySelector('.content-wrapper');

    const $newTitle = createTitle(data.title);
    const $newMeta = createMeta(data.author, data.createdAt);
    const $newContent = createContent(data.content);

    $title.replaceWith($newTitle);
    $meta.replaceWith($newMeta);
    $content.replaceWith($newContent);
});

const createTitle = (title) => {
    const $newTitle = document.createElement('div');
    $newTitle.className = "title-wrapper";
    $newTitle.innerHTML += `<p class="title">
        ${title}
    </p>`

    return $newTitle;
}

const createMeta = (author, createdAt) => {
    const $newMeta = document.createElement('div');

    const createdAtDate = new Date(createdAt);
    const createdAtDateTime = createdAtDate.toLocaleDateString().toString() + " " +
        createdAtDate.toLocaleTimeString();

    $newMeta.className = "meta-wrapper";
    $newMeta.innerHTML += `<span class="meta-author">작성자 : ${author}</span>
            <span class="meta-created-at">작성일자 : ${createdAtDateTime}</span>
            <span class="meta-view-count">조회 : 0</span>`

    return $newMeta;
}

const createContent = (content) => {
    const $newContent = document.createElement('div');

    $newContent.className = "content-wrapper";
    $newContent.innerHTML += `<p>${content}</p>`

    return $newContent;
}
