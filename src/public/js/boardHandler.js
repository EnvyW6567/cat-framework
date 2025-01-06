import { fetchWrapper } from './fetchWrapper.js';

const TOTAL = '전체글 ';
const COUNT = '개';
const OFFSET = 10;

export const boardHandler = async (page, size) => {
    const result = await fetchWrapper.get(`/api/post/board?size=${size}&page=${page - 1}`);

    return createPostContainer(result, page);
};

const createPostContainer = (result, page) => {
    const total = result.total;
    const board = result.board;

    const postCount = createPostCount(total);
    const postTable = createPostTable(board);
    const footerWrapper = createFooterWrapper(total, page);

    const postContainer = document.createElement('div');

    postContainer.className = 'post-container';
    postContainer.appendChild(postCount);
    postContainer.appendChild(postTable);
    postContainer.appendChild(footerWrapper);

    return postContainer;
};

const createPostCount = (total) => {
    const count = document.createElement('div');

    count.className = 'post-count';
    count.textContent = TOTAL + total + COUNT;

    return count;
};

const createPostTable = (board) => {
    const table = document.createElement('table');

    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    thead.innerHTML = `
    <tr>
      <th class="table-title">제목</th>
      <th class="table-author">작성자</th>
      <th class="table-date">작성일시</th>
      <th class="table-views">조회수</th>
    </tr>
  `;

    board.forEach((post) => {
        const tr = document.createElement('tr');

        tr.id = post.id;
        tr.className = 'post';
        tr.addEventListener('click', (event) => postHandler(event));
        tr.innerHTML = `
      <td class="table-title">${post.title}</td>
      <td class="table-author">${post.author}</td>
      <td class="table-date">${formatDate(post.createdAt)}</td>
      <td class="table-views">0</td>
    `;
        tbody.appendChild(tr);
    });

    table.appendChild(thead);
    table.appendChild(tbody);
    table.className = 'board';

    return table;
};

const createFooterWrapper = (total, page) => {
    const footerWrapper = document.createElement('div');
    const pagination = document.createElement('div');
    const writeButton = document.createElement('button');

    footerWrapper.className = 'footer-wrapper';
    pagination.className = 'pagination';
    writeButton.className = 'button write-button';
    writeButton.textContent = '글쓰기';

    let totalPage = Math.ceil(total / OFFSET);
    let startPage = 1;
    let endPage = totalPage;

    if (page > 3) {
        if (page + 2 > totalPage) {
            startPage = totalPage - 4;
        } else {
            startPage = page - 2;
        }
    }

    if (totalPage > 5) {
        if (page + 2 < endPage) {
            if (page > 2) {
                endPage = page + 2;
            } else if (page > 1) {
                endPage = page + 3;
            } else {
                endPage = page + 4;
            }
        }
    }

    for (let p = startPage; p <= endPage; p++) {
        if (p === page) {
            pagination.innerHTML += `<div class="active page" id="page_${p}">${p}</div>`;
            continue;
        }
        pagination.innerHTML += `<div class="page" id="page_${p}">${p}</div>`;
    }

    footerWrapper.appendChild(pagination);
    footerWrapper.appendChild(writeButton);

    return footerWrapper;
};

const postHandler = (event) => {
    const postId = event.currentTarget.id;

    location.assign(`http://localhost:3000/post?id=${postId}`);
};

const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}.${month}.${day}`;
};
