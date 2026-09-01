const fs = require('fs');
const path = require('path');

const blogDir = path.join(__dirname, '../blog');
const postsDir = path.join(__dirname, '../_posts');
const outputFile = path.join(blogDir, 'index.json');

if (!fs.existsSync(postsDir)) {
    console.error(`_posts directory does not exist: ${postsDir}`);
    process.exit(1);
}

if (!fs.existsSync(blogDir)) {
    fs.mkdirSync(blogDir, { recursive: true });
}

const files = fs.readdirSync(postsDir);
const posts = [];

files.forEach(file => {
    if (!file.endsWith('.html')) return;
    if (file === 'index.html') return; // ignore index list if any

    const filePath = path.join(postsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');

    let title = file.replace('.html', '').replace(/-/g, ' ');
    let date = '';
    let tags = [];
    let image = 'images/blog/image-1.png'; // default fallback image
    let excerpt = '';
    let discussionLink = '';

    const cleanContent = content.trim();
    if (cleanContent.startsWith('<!--')) {
        const endCommentIdx = cleanContent.indexOf('-->');
        if (endCommentIdx !== -1) {
            const commentContent = cleanContent.substring(4, endCommentIdx).trim();
            const bodyHtml = cleanContent.substring(endCommentIdx + 3).trim();

            // Extract excerpt from the first paragraph
            const pMatch = bodyHtml.match(/<p>(.*?)<\/p>/);
            if (pMatch) {
                excerpt = pMatch[1].replace(/<[^>]*>/g, '').substring(0, 160).trim();
                if (pMatch[1].replace(/<[^>]*>/g, '').length > 160) {
                    excerpt += '...';
                }
            }

            // Extract image if present in the body
            const imgMatch = bodyHtml.match(/<img[^>]+src="([^">]+)"/);
            if (imgMatch) {
                image = imgMatch[1].replace(/^(\/|\.\.\/)+/, '');
            }

            // Parse metadata lines
            const lines = commentContent.split('\n');
            lines.forEach(line => {
                const colonIdx = line.indexOf(':');
                if (colonIdx !== -1) {
                    const key = line.substring(0, colonIdx).trim().toLowerCase();
                    let value = line.substring(colonIdx + 1).trim();
                    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                        value = value.substring(1, value.length - 1);
                    }
                    if (key === 'title') {
                        title = value;
                    } else if (key === 'date') {
                        date = value;
                    } else if (key === 'tags') {
                        tags = value.split(',').map(t => t.trim()).filter(t => t.length > 0);
                    } else if (key === 'discussion_link') {
                        discussionLink = value;
                    }
                }
            });

            // Write compiled redirect/OG HTML to blogDir!
            const compiledHtml = `<!--
title: ${title}
date: ${date || '2026-07-12'}
tags: ${tags.join(', ')}
discussion_link: ${discussionLink}
-->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>${title} - Head & Heart Together</title>
    
    <!-- Open Graph/Facebook Sharing Meta Tags -->
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${excerpt || 'Read our latest blog post reflection.'}">
    <meta property="og:image" content="https://headhearttogether.com/${image}">
    <meta property="og:url" content="https://headhearttogether.com/blog/${file}">
    <meta property="og:type" content="article">
    
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": "${title.replace(/"/g, '\\"')}",
      "description": "${(excerpt || 'Read our latest blog post reflection.').replace(/"/g, '\\"')}",
      "image": "https://headhearttogether.com/${image}",
      "url": "https://headhearttogether.com/blog/${file}",
      "datePublished": "${date || '2026-07-12'}",
      "author": {
        "@type": "Organization",
        "name": "Head & Heart Together",
        "url": "https://headhearttogether.com"
      }
    }
    </script>
    
    <script>
        // Redirect human visitors to the dynamic blog view wrapper shell page
        window.location.href = "../blog.html?post=${file.replace('.html', '')}";
    </script>
</head>
<body>
    ${bodyHtml}
</body>
</html>`;
            fs.writeFileSync(path.join(blogDir, file), compiledHtml, 'utf8');
        }
    }

    posts.push({
        slug: file.replace('.html', ''),
        title,
        date: date || '2026-07-12', // default fallback date
        tags,
        image,
        excerpt: excerpt || 'Read our latest blog post reflection.'
    });
});

// Sort posts by date descending
posts.sort((a, b) => new Date(b.date) - new Date(a.date));

fs.writeFileSync(outputFile, JSON.stringify(posts, null, 2), 'utf8');
console.log(`Generated ${outputFile} with ${posts.length} posts.`);

// Generate sitemap.xml
const sitemapFile = path.join(__dirname, '../sitemap.xml');
const BASE_URL = 'https://headhearttogether.com';
let sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>${BASE_URL}/</loc>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>${BASE_URL}/about.html</loc>
        <priority>0.8</priority>
    </url>
    <url>
        <loc>${BASE_URL}/events.html</loc>
        <priority>0.8</priority>
    </url>
    <url>
        <loc>${BASE_URL}/blog.html</loc>
        <priority>0.8</priority>
    </url>
    <url>
        <loc>${BASE_URL}/contact.html</loc>
        <priority>0.8</priority>
    </url>
`;

posts.forEach(post => {
    sitemapContent += `    <url>
        <loc>${BASE_URL}/blog/${post.slug}.html</loc>
        <lastmod>${post.date}</lastmod>
        <priority>0.6</priority>
    </url>\n`;
});

sitemapContent += `</urlset>`;
fs.writeFileSync(sitemapFile, sitemapContent, 'utf8');
console.log(`Generated sitemap.xml with ${posts.length + 5} URLs.`);
