import scrapeLogo from './scrapper.js';
import preprocessLogo from './preprocess.js';
import clusterLogos from './cluster.js';
import readWebsitesFromParquet from './readfile.js';
import crypto from 'crypto';

async function hashBuffer(buffer) {
    return crypto.createHash('sha256').update(buffer).digest('hex');
}

async function main() {
    const parquetFilePath = 'D:/LogosMatching/data/logos.snappy.parquet';

    const websites = await readWebsitesFromParquet(parquetFilePath);
    console.log(`🔍 Found ${websites.length} websites.`);

    const logos = [];
    const hashes = new Set();

    let processedCount = 0;
    let skippedCount = 0;

    for (const website of websites) {
        try {
            const logoUrl = await scrapeLogo(website);
            if (!logoUrl) {
                console.log(`⚠️ No logo found for: ${website}`);
                skippedCount++;
                continue;
            }

            const processedLogo = await preprocessLogo(logoUrl);
            if (!processedLogo) {
                console.log(`❌ Failed to process logo for: ${website}`);
                skippedCount++;
                continue;
            }

            const logoHash = await hashBuffer(processedLogo);
            if (hashes.has(logoHash)) {
                console.log(`♻️ Duplicate logo skipped for: ${website}`);
                skippedCount++;
                continue;
            }

            hashes.add(logoHash);
            logos.push(processedLogo);
            processedCount++;
        } catch (error) {
            console.log(`🚫 Error processing ${website}:`, error.message || error);
            skippedCount++;
        }
    }

    console.log(`✅ Processed ${processedCount} unique logos. Skipped: ${skippedCount}.`);
    console.log(`📦 Starting clustering...`);

    const clusters = await clusterLogos(logos, 0.8); // similarity threshold
    console.log(`🔗 Clustering complete. Found ${clusters.length} clusters.`);
}

main();
