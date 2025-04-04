import compareLogos from './compare.js';

async function clusterLogos(logos, threshold = 0.8) {
    const clusters = [];

    for (let i = 0; i < logos.length; i++) {
        const logoA = logos[i];
        let foundCluster = false;

        for (let j = 0; j < clusters.length; j++) {
            const cluster = clusters[j];
            for (let logoB of cluster) {
                const similarity = await compareLogos(logoA.buffer, logoB.buffer); // Compare based on the image buffers
                if (similarity >= threshold) {
                    cluster.push(logoA); // Add to existing cluster
                    foundCluster = true;
                    break;
                }
            }
            if (foundCluster) break;
        }

        if (!foundCluster) {
            clusters.push([logoA]); // Create a new cluster
        }
    }

    return clusters;
}

export default clusterLogos;
