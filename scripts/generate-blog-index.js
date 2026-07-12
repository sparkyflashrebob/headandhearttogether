const fs = require('fs');
const path = require('path');

const blogDir = path.join(__dirname, '../blog');
const outputFile = path.join(blogDir, 'index.json');

if (!fs.existsSync(blogDir)) {
    console.error(`Blog directory does not exist: ${blogDir}`);
    process.exit(1);
}

const files = fs.readdirSync(blogDir);
const posts = [];

files.forEach(file => {
    if (!file.endsWith('.html')) return;
    if (file === 'index.html') return; // ignore index list if any

    const filePath = path.join(blogDir, file);
    const content = fs.readFileSync(filePath, 'utf8');

    let title = file.replace('.html', '').replace(/-/g, ' ');
    let date = '';
    let tags = [];
    let image = 'images/blog/image-1.png'; // default fallback image
    let excerpt = '';

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
                image = imgMatch[1];
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
                    }
                }
            });
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
