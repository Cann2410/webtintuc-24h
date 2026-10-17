/**
 * PHẦN 3: CROWLER TIN TỨC DÂN TRÍ (TỐI ƯU ẢNH DYNAMIC & CHỐNG TRÙNG LẶP)
 */

const CATEGORY_MAP = {
    'thoi-su': 'Thời sự',
    'the-gioi': 'Thế giới',
    'kinh-doanh': 'Kinh doanh',
    'bat-dong-san': 'Bất động sản',
    'the-thao': 'Thể thao',
    'lao-dong-viec-lam': 'Lao động',
    'suc-khoe': 'Sức khỏe',
    'van-hoa': 'Văn hóa',
    'giai-tri': 'Giải trí',
    'du-lich': 'Du lịch',
    'phap-luat': 'Pháp luật',
    'doi-song': 'Đời sống',
    'cong-nghe': 'Công nghệ',
    'giao-duc': 'Giáo dục',
    'xe': 'Xe ++'
};

// Kho ảnh minh họa đa dạng theo từng chuyên mục (tránh bị trùng 1 ảnh thỏi vàng)
function getSmartThumbnail(category, id, crawledImg) {
    if (crawledImg && crawledImg.startsWith('http') && !crawledImg.includes('photo-1610375461246')) {
        return crawledImg;
    }

    const categoryImages = {
        'Thể thao': [
            'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop'
        ],
        'Thế giới': [
            'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&auto=format&fit=crop'
        ],
        'Kinh doanh': [
            'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&auto=format&fit=crop'
        ],
        'Thời sự': [
            'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=800&auto=format&fit=crop'
        ],
        'Sức khỏe': [
            'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop'
        ]
    };

    const defaultList = categoryImages[category] || [
        'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=800&auto=format&fit=crop'
    ];

    // Dùng mã băm từ ID để phân bổ ảnh ngẫu nhiên nhưng cố định cho từng bài
    let hash = 0;
    const str = (id || '') + (category || '');
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % defaultList.length;
    return defaultList[index];
}

async function fetchArticleHtml(url) {
    const proxies = [
        async () => {
            const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
            if (!res.ok) return null;
            const data = await res.json();
            return data.contents;
        },
        async () => {
            const res = await fetch(`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`);
            if (!res.ok) return null;
            return await res.text();
        }
    ];

    for (const getHtml of proxies) {
        try {
            const html = await getHtml();
            if (html && html.length > 500) return html;
        } catch (e) {
            console.warn("Thử proxy tiếp theo...");
        }
    }
    return null;
}

async function getArticle(url) {
    try {
        if (!url || !url.includes('dantri.com.vn')) {
            alert("Vui lòng nhập đúng đường dẫn bài viết từ dantri.com.vn!");
            return null;
        }

        const parsedUrl = new URL(url);
        const pathSegments = parsedUrl.pathname.split('/').filter(Boolean);
        const rawCategorySlug = pathSegments[0] || 'thoi-su';
        const fileName = pathSegments[pathSegments.length - 1] || '';

        const idMatch = fileName.match(/(\d+)\.htm/);
        const articleNumId = idMatch ? idMatch[1] : `${Date.now()}`;
        const id = `dtri-${articleNumId}`;
        const slug = fileName.replace(/\.htm$/, '').replace(/-\d+$/, '');

        let publishedAt = "";
        if (articleNumId.length >= 12) {
            const y = articleNumId.substring(0, 4);
            const m = articleNumId.substring(4, 6);
            const d = articleNumId.substring(6, 8);
            const hh = articleNumId.substring(8, 10);
            const mm = articleNumId.substring(10, 12);
            publishedAt = `${y}-${m}-${d} ${hh}:${mm}`;
        } else {
            const now = new Date();
            publishedAt = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
        }

        const category = CATEGORY_MAP[rawCategorySlug] || 'Thời sự';

        const htmlText = await fetchArticleHtml(url);
        let title = "", excerpt = "", contentText = "", author = "Dân trí", rawThumbnail = "";

        if (htmlText) {
            const doc = new DOMParser().parseFromString(htmlText, 'text/html');

            const getText = (selector, index = 0) => {
                const elements = doc.querySelectorAll(selector);
                return elements[index]?.textContent?.trim() || '';
            };

            title = getText('#articleContent [data-slot="title"]') || 
                    getText('h1.title-page') || 
                    getText('h1') || 
                    doc.querySelector('title')?.textContent?.replace('- Báo Dân trí', '')?.trim();

            excerpt = getText('#articleContent [data-slot="sapo"]') || 
                      getText('h2.singular-sapo') || 
                      getText('.sapo');

            let contentEl = doc.querySelector('#articleContent [data-slot="content"]') || 
                            doc.querySelector('.singular-content') || 
                            doc.querySelector('.article-body');

            if (contentEl) {
                contentEl = contentEl.cloneNode(true);
                contentEl.querySelectorAll('.relate-container, .video-content-wrapper, iframe, script, style').forEach(el => el.remove());
            }
            contentText = contentEl ? contentEl.textContent.trim() : "";

            author = getText('#articleContent [rel="author"]', 1) || 
                     getText('#articleContent [rel="author"]', 0) || 
                     getText('.author-name') || 
                     'Dân trí';

            rawThumbnail = doc.querySelector('meta[property="og:image"]')?.getAttribute('content') ||
                           doc.querySelector('#articleContent img, .singular-content img')?.getAttribute('src') || "";
        }

        // Tự động khôi phục Tiêu đề từ Slug nếu proxy bị chặn
        if (!title || title.length < 5) {
            title = slug
                .split('-')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
        }

        // Chọn ảnh thông minh theo chuyên mục bài viết
        const thumbnail = getSmartThumbnail(category, id, rawThumbnail);

        return {
            "id": id,
            "title": title,
            "slug": slug,
            "excerpt": excerpt || `(Dân trí) - Thông tin chi tiết cập nhật về bài viết thuộc chuyên mục ${category} trên Báo Dân trí.`,
            "content": contentText || `Nội dung chi tiết bài viết "${title}" đang được cập nhật từ hệ thống Dân trí.`,
            "author": author,
            "category": category,
            "publishedAt": publishedAt,
            "source": "dantri.com.vn",
            "url": url,
            "thumbnail": thumbnail
        };

    } catch (error) {
        console.error("Lỗi cào dữ liệu:", error);
        return null;
    }
}
