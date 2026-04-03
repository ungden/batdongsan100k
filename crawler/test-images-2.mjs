import * as cheerio from 'cheerio';
import fetch from 'node-fetch';

async function testSite(name, url, linkRegex, imgSelector, hostFilter) {
    console.log(`\n=== Testing ${name} ===`);
    try {
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        const html = await res.text();
        const $ = cheerio.load(html);
        
        let link = null;
        $('a').each((i, el) => {
            const href = $(el).attr('href');
            if (href && linkRegex.test(href) && !link) {
                link = href;
            }
        });
        
        if (!link) {
            console.log('No link found');
            return;
        }
        
        const fullLink = link.startsWith('http') ? link : new URL(link, url).href;
        console.log(`Listing URL: ${fullLink}`);
        
        const res2 = await fetch(fullLink, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        const html2 = await res2.text();
        const $2 = cheerio.load(html2);
        
        console.log('Raw tags:');
        let count = 0;
        $2(imgSelector).each((_, el) => {
            if (count > 5) return;
            const src = $2(el).attr('src') || '';
            const dataSrc = $2(el).attr('data-src') || '';
            if ((src && src.includes(hostFilter)) || (dataSrc && dataSrc.includes(hostFilter))) {
                console.log($2.html(el));
                count++;
            }
        });
        
    } catch (err) {
        console.error(err);
    }
}

async function run() {
    await testSite('Homedy', 'https://homedy.com/ban-nha-dat', /\/(ban|cho-thue)-.*-es\d+$/i, 'img', 'img.homedy.com');
    await testSite('Odt', 'https://odt.vn/ban-nha-dat', /-\d+\.html$/, 'img', 'odt.vn');
    await testSite('Cafeland', 'https://nhadat.cafeland.vn/nha-dat-ban/', /-\d+\.html$/, 'img', 'cafeland.vn');
}

run();
