// === 1. ĐỌC VÀ QUẢN LÝ DỮ LIỆU LOCALSTORAGE ===
async function loadInitialData() {
    try {
        const resMenu = await fetch('./data/menu.json');
        const dataMenu = await resMenu.json();
        if (dataMenu && dataMenu.menu) {
            localStorage.setItem('categories', JSON.stringify(dataMenu.menu));
        }
    } catch(e) { console.error("Lỗi đọc menu.json:", e); }

    if (!localStorage.getItem('posts')) {
        try {
            const resPosts = await fetch('./data/posts.json');
            const posts = await resPosts.json();
            localStorage.setItem('posts', JSON.stringify(posts || []));
        } catch(e) { console.error("Lỗi đọc posts.json:", e); }
    }
}

function getPosts() { return JSON.parse(localStorage.getItem('posts')) || []; }
function getCategories() { return JSON.parse(localStorage.getItem('categories')) || []; }

function savePostToStorage(newPost) {
    const posts = getPosts();
    const index = posts.findIndex(p => p.id === newPost.id);
    if (index >= 0) { posts[index] = newPost; } 
    else { posts.unshift(newPost); }
    localStorage.setItem('posts', JSON.stringify(posts));
}

// === 2. THANH ĐIỀU HƯỚNG NAVBAR ===
function renderNavbar() {
    const categories = getCategories();
    const navMenuEl = document.getElementById('navbarMenu');
    const footerCatEl = document.getElementById('footerCategories');

    let navHtml = '';
    let footerHtml = '';

    categories.forEach(cat => {
        if (cat.children && cat.children.length > 0) {
            let subHtml = `<ul class="dropdown-menu">`;
            cat.children.forEach(child => {
                subHtml += `<li><a onclick="renderCategory('${child.id}')">${child.title}</a></li>`;
            });
            subHtml += `</ul>`;

            navHtml += `
                <li class="has-dropdown">
                    <a onclick="renderCategory('${cat.id}')" id="nav-${cat.id}">${cat.title} ▾</a>
                    ${subHtml}
                </li>
            `;
        } else {
            navHtml += `<li><a onclick="renderCategory('${cat.id}')" id="nav-${cat.id}">${cat.title}</a></li>`;
        }
        footerHtml += `<li><a onclick="renderCategory('${cat.id}')">${cat.title}</a></li>`;
    });

    navHtml += `<li><a onclick="renderCrawlerPage()" class="btn-crawler">Crawler Page</a></li>`;

    if (navMenuEl) navMenuEl.innerHTML = navHtml;
    if (footerCatEl) footerCatEl.innerHTML = footerHtml;
}

// === 3. KHUNG BÀI VIẾT TẠO BẰNG ONCLICK (MỞ TRỰC TIẾP TRÊN WEB) ===
function createGridHtml(postsList) {
    if (!postsList || postsList.length === 0) return '';

    const featuredLarge = postsList[0];
    const featuredSmall = postsList.slice(1, 3);

    let html = `<div class="featured-grid">`;

    // Bài viết lớn bên trái
    if (featuredLarge) {
        const defaultImg = "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop";
        const rawExcerpt = featuredLarge.excerpt || '';
        const excerptText = rawExcerpt.startsWith('(Dân trí)') ? rawExcerpt : (rawExcerpt ? `(Dân trí) - ${rawExcerpt}` : '');
        
        html += `
            <div class="card-clean" onclick="renderArticleDetail('${featuredLarge.id}')">
                <img src="${featuredLarge.thumbnail || defaultImg}" class="card-img-large" alt="thumb">
                <div class="card-category-green">${(featuredLarge.category || 'THỜI SỰ').toUpperCase()}</div>
                <h3 class="card-title-large-green">${featuredLarge.title}</h3>
                <p class="card-excerpt-clean">${excerptText}</p>
            </div>
        `;
    }

    // 2 bài viết nhỏ bên phải
    html += `<div class="featured-small-group">`;
    featuredSmall.forEach(post => {
        const defaultImgSmall = "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=600&auto=format&fit=crop";
        html += `
            <div class="card-clean" onclick="renderArticleDetail('${post.id}')">
                <img src="${post.thumbnail || defaultImgSmall}" class="card-img-small" alt="thumb">
                <h4 class="card-title-small-clean">${post.title}</h4>
                <div class="card-time-clean">${post.publishedAt || ''}</div>
            </div>
        `;
    });
    html += `</div></div>`;

    return html;
}

// === 4. TRANG CHỦ VÀ DANH SÁCH BÀI VIẾT ===
function renderCategory(catId = 'home') {
    const app = document.getElementById('appView');
    if (!app) return;

    const posts = getPosts();
    const categories = getCategories();

    document.querySelectorAll('.nav-menu a').forEach(el => el.classList.remove('active'));
    const activeNav = document.getElementById(`nav-${catId}`);
    if (activeNav) activeNav.classList.add('active');

    posts.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

    if (catId === 'home') {
        let html = `<h2 class="section-title">Tin mới nhất</h2>`;

        html += createGridHtml(posts.slice(0, 3));

        const listPosts = posts.slice(3, 10);
        if (listPosts.length > 0) {
            html += `<div class="recent-list">`;
            listPosts.forEach(post => {
                const rawExcerpt = post.excerpt || '';
                const excerptText = rawExcerpt.startsWith('(Dân trí)') ? rawExcerpt : (rawExcerpt ? `(Dân trí) - ${rawExcerpt}` : '');
                const defaultImgList = "https://images.unsplash.com/photo-1517649763962-0c623266010b?w=600&auto=format&fit=crop";
                
                html += `
                    <div class="list-item" onclick="renderArticleDetail('${post.id}')">
                        <img src="${post.thumbnail || defaultImgList}" class="list-item-img" alt="thumb">
                        <div class="list-content">
                            <div class="card-category-green">${(post.category || '').toUpperCase()}</div>
                            <h4 class="list-item-title">${post.title}</h4>
                            <p class="list-item-excerpt">${excerptText}</p>
                            <div class="list-item-meta">${post.publishedAt || ''} ${post.author ? '· ' + post.author : ''}</div>
                        </div>
                    </div>
                `;
            });
            html += `</div>`;
        }

        const sectionCategories = ['Thế giới', 'Thời sự', 'Pháp luật', 'Sức khỏe', 'Đời sống', 'Du lịch', 'Kinh doanh'];
        sectionCategories.forEach(catName => {
            const catPosts = posts.filter(p => p.category && p.category.toLowerCase().includes(catName.toLowerCase()));
            if (catPosts.length > 0) {
                html += `
                    <div class="category-block">
                        <h3 class="category-section-title" onclick="renderCategory('${catName.toLowerCase()}')">${catName.toUpperCase()} <span class="arrow">&gt;</span></h3>
                        ${createGridHtml(catPosts)}
                    </div>
                `;
            }
        });

        app.innerHTML = html;
        return;
    }

    let targetTitle = catId.toUpperCase();
    let filteredPosts = posts.filter(p => p.category && p.category.toLowerCase().includes(catId.toLowerCase()));

    let html = `<h2 class="section-title">${targetTitle}</h2>`;
    if (filteredPosts.length === 0) {
        app.innerHTML = html + `<p style="margin-top:15px;">Chưa có bài viết nào trong chuyên mục này.</p>`;
        return;
    }

    html += createGridHtml(filteredPosts.slice(0, 3));

    const remaining = filteredPosts.slice(3);
    if (remaining.length > 0) {
        html += `<div class="recent-list" style="margin-top:20px;">`;
        remaining.forEach(post => {
            const rawExcerpt = post.excerpt || '';
            const excerptText = rawExcerpt.startsWith('(Dân trí)') ? rawExcerpt : (rawExcerpt ? `(Dân trí) - ${rawExcerpt}` : '');
            const defaultImgList = "https://images.unsplash.com/photo-1517649763962-0c623266010b?w=600&auto=format&fit=crop";

            html += `
                <div class="list-item" onclick="renderArticleDetail('${post.id}')">
                    <img src="${post.thumbnail || defaultImgList}" class="list-item-img" alt="thumb">
                    <div class="list-content">
                        <div class="card-category-green">${(post.category || '').toUpperCase()}</div>
                        <h4 class="list-item-title">${post.title}</h4>
                        <p class="list-item-excerpt">${excerptText}</p>
                        <div class="list-item-meta">${post.publishedAt || ''} ${post.author ? '· ' + post.author : ''}</div>
                    </div>
                </div>
            `;
        });
        html += `</div>`;
    }

    app.innerHTML = html;
}

// === 5. TRANG CHI TIẾT BÀI VIẾT (MỞ TRỰC TIẾP TRÊN WEB) ===
function renderArticleDetail(postId) {
    const app = document.getElementById('appView');
    if (!app) return;

    const posts = getPosts();
    const article = posts.find(p => p.id === postId);

    if (!article) {
        app.innerHTML = `<h2>Bài viết không tồn tại</h2>`;
        return;
    }

    const rawExcerpt = article.excerpt || '';
    const sapoText = rawExcerpt.startsWith('(Dân trí)') ? rawExcerpt : (rawExcerpt ? `(Dân trí) - ${rawExcerpt}` : '');

    // Render trực tiếp giao diện bài viết vào main
    app.innerHTML = `
        <div class="article-detail">
            <h1 class="article-title-main">${article.title}</h1>
            <div class="article-meta-info">
                <span>Tác giả: <b>${article.author || 'Dân trí'}</b></span> · 
                <span>Đăng ngày: ${article.publishedAt || ''}</span> · 
                <span style="color:#008837; font-weight:bold;">Chuyên mục: ${article.category || ''}</span>
            </div>
            <p class="article-sapo-main">${sapoText}</p>
            ${article.thumbnail ? `<img src="${article.thumbnail}" class="detail-main-img" alt="thumb">` : ''}
            <div class="article-content-body">${article.content || ''}</div>
            <br><hr><br>
            <button onclick="renderCategory('home')" class="btn-submit" style="background:#6c757d;">&larr; Quay lại trang chủ</button>
        </div>
    `;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// === 6. TRANG CRAWLER PAGE ===
function renderCrawlerPage() {
    const app = document.getElementById('appView');
    if (!app) return;

    document.querySelectorAll('.nav-menu a').forEach(el => el.classList.remove('active'));

    app.innerHTML = `
        <div class="crawler-box">
            <h2 class="section-title">Chức năng Crawler Tin Tức</h2>
            <p style="margin-bottom: 15px;">Nhập URL bài viết từ website Dantri.com.vn để tự động bóc tách dữ liệu:</p>
            
            <div class="form-group">
                <label for="crawlUrl">Đường dẫn bài viết (URL):</label>
                <input type="text" id="crawlUrl" placeholder="https://dantri.com.vn/thoi-su/tong-bi-thu-chu-tich-nuoc-phap-luat-phai-du-on-dinh-de-nguoi-dan-yen-tam-20260928141449559.htm">
            </div>
            <button class="btn-submit" onclick="handleCrawl()">Bắt đầu Cào Dữ Liệu</button>

            <div id="crawlerStatus" style="margin-top: 15px; font-weight: bold;"></div>
            <div id="jsonPreviewContainer" style="display:none;">
                <h3 style="margin-top: 20px;">Kết quả JSON Trích xuất:</h3>
                <pre class="json-preview" id="jsonPreview"></pre>
                <button class="btn-submit" style="background: #28a745; margin-top: 15px;" onclick="saveCrawledArticle()">Lưu Bài Viết Vào LocalStorage</button>
            </div>
        </div>
    `;
}

let tempCrawledPost = null;

async function handleCrawl() {
    const urlInput = document.getElementById('crawlUrl').value.trim();
    const statusEl = document.getElementById('crawlerStatus');
    const previewContainer = document.getElementById('jsonPreviewContainer');
    const jsonPreview = document.getElementById('jsonPreview');

    if (!urlInput) { alert("Vui lòng nhập đường dẫn URL!"); return; }

    statusEl.style.color = "orange";
    statusEl.innerText = "Đang cào dữ liệu từ Dantri...";
    previewContainer.style.display = "none";

    const result = await getArticle(urlInput);

    if (result) {
        tempCrawledPost = result;
        statusEl.style.color = "green";
        statusEl.innerText = "Cào dữ liệu thành công!";
        jsonPreview.innerText = JSON.stringify(result, null, 2);
        previewContainer.style.display = "block";
    } else {
        statusEl.style.color = "red";
        statusEl.innerText = "Không thể cào bài viết. Vui lòng kiểm tra lại URL!";
    }
}

function saveCrawledArticle() {
    if (tempCrawledPost) {
        savePostToStorage(tempCrawledPost);
        alert("Đã lưu bài viết thành công vào LocalStorage!");
        renderCategory('home');
    }
}

window.onload = async function() {
    await loadInitialData();
    renderNavbar();
    renderCategory('home');
};
