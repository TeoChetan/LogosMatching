import sharp from 'sharp';
import axios from 'axios';

async function preprocessLogo(logoUrl) {
    try {
        // Validate URL format
        if (!logoUrl || !/^https?:\/\//i.test(logoUrl)) {
            throw new Error('Invalid URL');
        }

        const response = await axios.get(logoUrl, {
            responseType: 'arraybuffer',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
            }
        });

        // Check if response status is 200 (OK)
        if (response.status !== 200) {
            throw new Error(`Failed to fetch logo. Status code: ${response.status}`);
        }

        const imageBuffer = Buffer.from(response.data);

        // Process the image (resize to 100x100, grayscale)
        const processedLogo = await sharp(imageBuffer)
            .resize(100, 100)
            .grayscale()
            .toBuffer();

        return processedLogo;
    } catch (error) {
        console.error('Error processing logo:', error.message);
        return null;
    }
}

export default preprocessLogo;
