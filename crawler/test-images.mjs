import * as cheerio from 'cheerio';
import fetch from 'node-fetch';

async function testSite(name, url, selector, linkSelector, imgSelector, hostFilter) {
    console.log(`\n=== Testing ${name} ===`);
    try {
        const res = await fetch(url);
        const html = await res.text();
        const $ = cheerio.load(html);
        const link = $(linkSelector).first().attr('href');
        if (!link) {
            console.log('No link found');
            return;
        }
        
        const fullLink = link.startsWith('http') ? link : new URL(link, url).href;
        console.log(`Listing URL: ${fullLink}`);
        
        const res2 = await fetch(fullLink);
        const html2 = await res2.text();
        const $2 = cheerio.load(html2);
        
        const imgs = [];
        $2(imgSelector).each((_, el) => {
            const src = $2(el).attr('src');
            const dataSrc = $2(el).attr('data-src');
            if (src && src.includes(hostFilter)) imgs.push({ type: 'src', url: src });
            if (dataSrc && dataSrc.includes(hostFilter)) imgs.push({ type: 'data-src', url: dataSrc });
            
            // Also grab all attributes just in case
            const attrs = el.attributes;
            for (let i = 0; i < attrs.length; i++) {
                const attr = attrs[i];
                if (attr.name !== 'src' && attr.name !== 'data-src' && attr.value.includes(hostFilter)) {
                    imgs.push({ type: attr.name, url: attr.value });
                }
            }
        });
        
        console.log(`Found ${imgs.length} images matching host`);
        imgs.slice(0, 5).forEach(img => console.log(`  [${img.type}] ${img.url}`));
        
        // Also let's print raw img tags for the first 2 matching images to see what they look like
        console.log('Raw tags:');
        $2(imgSelector).each((_, el) => {
            const src = $2(el).attr('src') || '';
            const dataSrc = $2(el).attr('data-src') || '';
            if ((src && src.includes(hostFilter)) || (dataSrc && dataSrc.includes(hostFilter))) {
                console.log($.html(el));
            }
        });
        
    } catch (err) {
        console.error(err);
    }
}

async function run() {
    await testSite('Homedy', 'https://homedy.com/ban-nha-dat', '.product-item', '.product-item .image-control a', 'img', 'img.homedy.com/store/images/');
    await testSite('Meeyland', 'https://meeyland.com/mua-ban-nha-dat', '.property-item', 'a[href*="/ban-"]', 'img', 'img.meeyland.com/');
    await testSite('Mogi', 'https://mogi.vn/mua-nha-dat', '.property-item', 'a.link-overlay', 'img', 'cloud.mogi.vn/images');
    await testSite('Odt', 'https://odt.vn/ban-nha-dat', '.property-item', 'a[href*=".html"]', 'img', 'odt.vn/storage/properties');
    await testSite('Cafeland', 'https://nhadat.cafeland.vn/nha-dat-ban/', '.property-item', '.prop-title a', 'img', 'cafeland.vn');
}

run();
