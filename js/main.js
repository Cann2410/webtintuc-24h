// === 3. KHUNG BÀI VIẾT TRANG CHỦ ===
function createGridHtml(postsList) {
    if (!postsList || postsList.length === 0) return '';

    const featuredLarge = postsList[0];
    const featuredSmall = postsList.slice(1, 3);

    let html = `<div class="featured-grid">`;

    if (featuredLarge) {
        const defaultImg = "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop";
        const rawExcerpt = featuredLarge.excerpt || '';
        const excerptText = rawExcerpt.startsWith('(Dân trí)') ? rawExcerpt : (rawExcerpt ? `(Dân trí) - ${rawExcerpt}` : '');
        
        // ĐỌC CẢ THUỘC TÍNH THUMBNAIL VÀ IMAGE
        const imgUrl = featuredLarge.thumbnail || featuredLarge.image || defaultImg;

        html += `
            <div class="card-clean" onclick="renderArticleDetail('${featuredLarge.id}')">
                <img src="${imgUrl}" class="card-img-large" alt="thumb">
                <div class="card-category-green">${(featuredLarge.category || 'THỜI SỰ').toUpperCase()}</div>
                <h3 class="card-title-large-green">${featuredLarge.title}</h3>
                <p class="card-excerpt-clean">${excerptText}</p>
            </div>
        `;
    }

    html += `<div class="featured-small-group">`;
    featuredSmall.forEach(post => {
        const defaultImgSmall = "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=600&auto=format&fit=crop";
        const imgUrlSmall = post.thumbnail || post.image || defaultImgSmall;

        html += `
            <div class="card-clean" onclick="renderArticleDetail('${post.id}')">
                <img src="${imgUrlSmall}" class="card-img-small" alt="thumb">
                <h4 class="card-title-small-clean">${post.title}</h4>
                <div class="card-time-clean">${post.publishedAt || ''}</div>
            </div>
        `;
    });
    html += `</div></div>`;

    return html;
}
