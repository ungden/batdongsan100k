const fs = require('fs');
let content = fs.readFileSync('crawler/multi-source-crawl.mjs', 'utf8');

const target = `            const images = unique(
              [
                ...(Array.isArray(ad.image_thumbnails) ? ad.image_thumbnails.map(t => t?.image) : []),
                ...(Array.isArray(ad.images) ? ad.images.map((image) => (typeof image === "string" ? image : image?.image)) : []),
                ad.thumbnail_image,
                ad.image,
              ].filter(Boolean),
            ).slice(0, args.imageLimit);`;

const replacement = `            const images = unique(
              [
                ...(Array.isArray(ad.image_thumbnails) ? ad.image_thumbnails.map((t) => t?.image || t?.thumbnail_image) : []),
                ...(Array.isArray(ad.images) ? ad.images.map((image) => (typeof image === "string" ? image : image?.image || image?.thumbnail_image)) : []),
                ad.image,
                ad.thumbnail_image,
              ].filter(Boolean),
            ).slice(0, args.imageLimit);`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync('crawler/multi-source-crawl.mjs', content);
    console.log("Patched successfully.");
} else {
    console.log("Target not found!");
}
