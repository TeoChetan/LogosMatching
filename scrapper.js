import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

async function preprocessUrl(url) {
    if (!url) return null;

    if (!/^https?:\/\//i.test(url)) {
        url = `http://${url}`;
    }

    try {
        const parsed = new URL(url);
        if (!parsed.hostname.startsWith('www.')) {
            parsed.hostname = `www.${parsed.hostname}`;
        }
        return parsed.href;
    } catch (error) {
        console.error(`Invalid URL format: ${url}`, error);
        return null;
    }
}

async function scrapeLogo(url) {
    const validUrl = await preprocessUrl(url);
    if (!validUrl) {
        console.log(`Skipping invalid URL: ${url}`);
        return null;
    }

    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-web-security',
                '--ignore-certificate-errors',
            ],
            executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
        });

        const page = await browser.newPage();
        await page.setRequestInterception(true);

        page.on('request', (req) => {
            const blocked = req.resourceType() === 'script' || req.url().includes('ads');
            blocked ? req.abort() : req.continue();
        });

        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36'
        );

        await page.goto(validUrl, { waitUntil: 'load', timeout: 60000 });

        const logoUrl = await page.$$eval('img', (imgs, pageUrl) => {
            for (const img of imgs) {
                const alt = (img.alt || '').toLowerCase();
                const className = (img.className || '').toLowerCase();
                const src = img.src || img.getAttribute('src') || '';

                if (
                    alt.includes('logo') ||
                    alt.includes('brand') ||
                    className.includes('logo') ||
                    className.includes('brand') ||
                    className.includes('header') ||
                    src.includes('logo') ||
                    src.includes('brand') ||
                    src.includes('identity')
                ) {
                    if (src.startsWith('//')) {
                        const parsed = new URL(pageUrl);
                        return parsed.protocol + src;
                    }

                    if (!src.startsWith('data:image')) {
                        return src;
                    }
                }
            }
            return null;
        }, validUrl);

        if (!logoUrl) {
            console.log(`❌ Logo not found for: ${validUrl}`);
            return null;
        }

        console.log(`✅ Logo found: ${logoUrl}`);
        return logoUrl;
    } catch (error) {
        console.error(`🚫 Error scraping logo from ${validUrl}:`, error.message || error);
        return null;
    } finally {
        if (browser) await browser.close();
    }
}

export default scrapeLogo;
