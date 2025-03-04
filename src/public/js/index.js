// 네비게이션 토글 버튼
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('nav ul');

navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    navToggle.classList.toggle('active');
});

// 스크롤 시 헤더 스타일 변경
const header = document.querySelector('header');
const heroSection = document.querySelector('.hero');

const heroHeight = heroSection.clientHeight - 1;
console.log(heroHeight);

window.addEventListener('scroll', () => {
    if (window.scrollY > heroHeight - 60) {
        // 60은 헤더 높이와 동일하게 설정
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');

    }

    if (window.scrollY > heroHeight - navLinks.scrollHeight - 60) {
        navLinks.classList.add('scrolled');
    } else {
        navLinks.classList.remove('scrolled');
    }
});

// 스크롤 시 네비게이션 링크 활성화
const sections = document.querySelectorAll('section');
const navItems = document.querySelectorAll('nav ul li a');

window.addEventListener('scroll', () => {
    let current = '';

    sections.forEach((section) => {
        const sectionTop = section.offsetTop - 70;
        if (pageYOffset >= sectionTop) {
            current = section.getAttribute('id');
        }
    });

    navItems.forEach((a) => {
        a.classList.remove('active');
        if (a.getAttribute('href') === `#${current}`) {
            a.classList.add('active');
        }
    });
});

// 부드러운 스크롤
const smoothScroll = document.querySelectorAll('a[href^="#"]');

smoothScroll.forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        const target = document.querySelector(this.getAttribute('href'));

        window.scrollTo({
            top: target.offsetTop - 60,
            behavior: 'smooth',
        });

        // 모바일 메뉴 닫기
        if (navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            navToggle.classList.remove('active');
        }
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const modal = document.getElementById("pdf-modal");
    const projects = document.querySelectorAll(".project-item");
    const closeModalBtn = document.getElementById("pdf-close");
    const canvas = document.getElementById("pdf-canvas");
    const ctx = canvas.getContext("2d");
    const nextPageBtn = document.getElementById("pdf-next");
    const prevPageBtn = document.getElementById("pdf-prev");
    const githubLink = document.getElementById("github-link");

    let pdfDoc = null;
    let currentPage = 1; // 현재 페이지를 추적
    let currentProject= null;

    const projectsGithub = {
        "watchducks": "https://github.com/boostcampwm-2024/web35-WatchDucks",
        "dad-auction": "https://github.com/orgs/DarkAndDarker-Auction/repositories",
        "travellery": "https://github.com/Travellery-Project/travellery_BE",
        "teentam": "https://github.com/EnvyW6567/TeenTam-backend"
    }

    // PDF 열기 버튼 클릭
    projects.forEach(project => project.addEventListener("click", function () {
        currentProject= project.id;
        if (project.id === "cat-framework") {
            window.open("https://github.com/EnvyW6567/cat-framework", "_blank");

            return;
        }
        modal.style.display = "block";

        let url = "pdf/" + project.id + ".pdf";
        pdfjsLib.getDocument(url).promise.then(pdf => {
            pdfDoc = pdf;
            currentPage = 1; // 페이지가 새로 열릴 때마다 첫 번째 페이지로 초기화
            prevPageBtn.style.visibility = "hidden";
            nextPageBtn.style.visibility = "visible";
            renderPage(currentPage); // 첫 번째 페이지 렌더링
        });
    }));

    // 페이지 렌더링 함수
    function renderPage(pageNum) {
        pdfDoc.getPage(pageNum).then(page => {
            let viewport = page.getViewport({ scale: 1.5 });
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            let renderContext = {
                canvasContext: ctx,
                viewport: viewport
            };
            page.render(renderContext);
        });
    }

    if (nextPageBtn) {
        nextPageBtn.addEventListener("click", function () {
            if (currentPage < pdfDoc.numPages) {
                currentPage++;
                renderPage(currentPage);
                if (currentPage > 0) {
                    prevPageBtn.style.visibility = "visible";
                }
            } else {
                nextPageBtn.style.visibility = "hidden";
            }
        });
    }

    if (prevPageBtn) {
        prevPageBtn.addEventListener("click", function () {
            if (currentPage > 1)  {
                currentPage--;
                renderPage(currentPage);
                if (currentPage < pdfDoc.numPages) {
                    nextPageBtn.style.visibility = "visible";
                }
            } else {
                prevPageBtn.style.visibility = "hidden";
            }
        });
    }

    closeModalBtn.addEventListener("click", function () {
        modal.style.display = "none";
    });

    window.addEventListener("click", function (event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });

    githubLink.addEventListener("click", function (event) {
        window.open(projectsGithub[currentProject], "_blank")
    });
});
