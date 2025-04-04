import sharp from 'sharp';

async function calculateColorHistogram(imageBuffer) {
    // Convert image to raw pixels and calculate histogram
    const { data, info } = await sharp(imageBuffer)
        .resize(100, 100) // Resize to a standard size to simplify comparison
        .raw()
        .toBuffer({ resolveWithObject: true });

    const histogram = {};
    for (let i = 0; i < data.length; i += 3) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        const colorKey = `${r},${g},${b}`;
        histogram[colorKey] = (histogram[colorKey] || 0) + 1;
    }
    return histogram;
}

function calculateSimilarity(histogram1, histogram2) {
    //Euclidean distance
    let distance = 0;
    const allKeys = new Set([...Object.keys(histogram1), ...Object.keys(histogram2)]);

    allKeys.forEach(key => {
        const count1 = histogram1[key] || 0;
        const count2 = histogram2[key] || 0;
        distance += Math.pow(count1 - count2, 2);
    });

    return 1 / (1 + Math.sqrt(distance)); // Similarity score between 0 and 1
}

async function compareLogos(logo1Buffer, logo2Buffer) {
    const histogram1 = await calculateColorHistogram(logo1Buffer);
    const histogram2 = await calculateColorHistogram(logo2Buffer);

    return calculateSimilarity(histogram1, histogram2);
}

export default compareLogos;
