import puppeteer from 'puppeteer-core';
import parquet from 'parquetjs-lite'; 
import fs from 'fs';

const { ParquetReader } = parquet;

async function readWebsitesFromParquet(filePath) {
    if (!fs.existsSync(filePath)) {
        console.log('File not found!');
        return;
    }

    const reader = await ParquetReader.openFile(filePath);
    const websites = [];
    const cursor = reader.getCursor();
    let record;
    while (record = await cursor.next()) {
        console.log("Record read from Parquet:", record); 
        websites.push(record.domain);
    }

    await reader.close();
    return websites;
}
export default readWebsitesFromParquet;

async function processWebsites() {
    const websites = await readWebsitesFromParquet('D:/LogosMatching/datalogos.snappy.parquet');
    if (!websites) {
        console.log("No websites found in the Parquet file.");
        return;
    }

    const browser = await puppeteer.launch({
        executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', 
    });
    const page = await browser.newPage();

    for (const websiteUrl of websites) {
        console.log("Processing website URL:", websiteUrl);

        if (!websiteUrl || websiteUrl === 'undefined') {
            console.log("Skipping invalid or undefined URL:", websiteUrl);
            continue;
        }

        let formattedUrl = websiteUrl;
        if (!/^https?:\/\//i.test(formattedUrl)) {
            formattedUrl = 'https://' + formattedUrl; 
        }

        if (!isValidUrl(formattedUrl)) {
            console.log("Skipping invalid URL format:", formattedUrl);
            continue; 
        }

        try {
            console.log(`Navigating to: ${formattedUrl}`);
            await page.goto(formattedUrl, { waitUntil: 'load', timeout: 60000 });  
        } catch (error) {
            console.log(`Error processing website: ${formattedUrl}`, error);
        }
    }

    await browser.close();
}

function isValidUrl(url) {
    const regex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
    const isValid = regex.test(url);
    console.log(`URL "${url}" is valid: ${isValid}`);
    return isValid;
}

processWebsites();
