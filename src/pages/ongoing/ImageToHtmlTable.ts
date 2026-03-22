// ImageToHtmlTable.ts
// Error-driven BSP partitioning pipeline class

export class ImageToHtmlTable {
    // Main pipeline: accepts a File, target width, and kMeansClusters, returns HTML string (async API)
    async processImageFile(file: File, targetWidth: number, kMeansClusters: number, blurSigma: number = 1.5, minCellSize: number = 4): Promise<string> {
        const t0 = performance.now();
        console.log('[ImageToHtmlTable] Starting processImageFile');
        const dataUrl = await this.readFileAsDataUrl(file);
        const t1 = performance.now();
        console.log(`[ImageToHtmlTable] File read as data URL in ${(t1-t0).toFixed(1)}ms`);
        const image = await this.loadImage(dataUrl);
        const t2 = performance.now();
        console.log(`[ImageToHtmlTable] Image loaded in ${(t2-t1).toFixed(1)}ms`);
        const blurred = await this.getBlurredImage(image, blurSigma);
        const t3 = performance.now();
        console.log(`[ImageToHtmlTable] Image blurred (sigma=${blurSigma}) in ${(t3-t2).toFixed(1)}ms`);
        const aspectRatio = image.width / image.height;
        const width = Math.min(targetWidth, image.width);
        const height = Math.max(1, Math.round(width / aspectRatio));
        const imageData = this.getResizedImageData(blurred, width, height);
        const t4 = performance.now();
        console.log(`[ImageToHtmlTable] Image resized to ${width}x${height} in ${(t4-t3).toFixed(1)}ms`);
        let bspRects = this.bspPartitionImage(imageData, minCellSize);
        const t5 = performance.now();
        console.log(`[ImageToHtmlTable] BSP partitioned (minCellSize=${minCellSize}) in ${(t5-t4).toFixed(1)}ms, rects: ${bspRects.length}`);
        bspRects = this.quantizeColorsKMeans(bspRects, kMeansClusters);
        const t6 = performance.now();
        console.log(`[ImageToHtmlTable] K-means quantized (k=${kMeansClusters}) in ${(t6-t5).toFixed(1)}ms`);
        bspRects = this.mergeRectangles(bspRects, width, height);
        const t7 = performance.now();
        console.log(`[ImageToHtmlTable] Rectangles merged in ${(t7-t6).toFixed(1)}ms, merged rects: ${bspRects.length}`);
        const html = this.createHtmlSectionFromBspRects(bspRects, imageData.width, imageData.height, file.name);
        const t8 = performance.now();
        console.log(`[ImageToHtmlTable] HTML generated in ${(t8-t7).toFixed(1)}ms`);
        console.log(`[ImageToHtmlTable] Total time: ${(t8-t0).toFixed(1)}ms`);
        return html;
    }

    // Rectangle merging: horizontal then vertical
    private mergeRectangles(cells: BSPNode[], width: number, height: number): BSPNode[] {
        // Build grid for placement (for horizontal merge)
        const grid: (BSPNode | null)[][] = Array.from({ length: height }, () => Array(width).fill(null));
        cells.forEach(cell => {
            for (let dy = 0; dy < cell.height; dy++) {
                for (let dx = 0; dx < cell.width; dx++) {
                    const y = cell.y + dy;
                    const x = cell.x + dx;
                    if (y < height && x < width) {
                        grid[y][x] = cell;
                    }
                }
            }
        });
        // 1. Horizontal merge
        const horizontalMerged: BSPNode[] = [];
        for (let y = 0; y < height; y++) {
            let x = 0;
            while (x < width) {
                const cell = grid[y][x];
                if (!cell) { x++; continue; }
                const color = cell.color;
                let maxW = 1;
                while (x + maxW < width && grid[y][x + maxW] && grid[y][x + maxW]?.color === color) {
                    maxW++;
                }
                horizontalMerged.push({ x, y, width: maxW, height: 1, color, error: 0 });
                x += maxW;
            }
        }
        // 2. Vertical merge: only merge perfectly aligned horizontal runs
        const merged: BSPNode[] = [];
        const used: boolean[][] = Array.from({ length: height }, () => Array(width).fill(false));
        for (let i = 0; i < horizontalMerged.length; i++) {
            const rect = horizontalMerged[i];
            if (used[rect.y][rect.x]) continue;
            let maxH = 1;
            let canExpand = true;
            while (canExpand && rect.y + maxH < height) {
                // Find the next horizontal run at the same x, width, and color
                const next = horizontalMerged.find(r => r.x === rect.x && r.y === rect.y + maxH && r.width === rect.width && r.color === rect.color && !used[r.y][r.x]);
                if (!next) {
                    canExpand = false;
                    break;
                }
                maxH++;
            }
            // Mark all merged runs as used
            for (let dy = 0; dy < maxH; dy++) {
                for (let dx = 0; dx < rect.width; dx++) {
                    used[rect.y + dy][rect.x + dx] = true;
                }
            }
            merged.push({ x: rect.x, y: rect.y, width: rect.width, height: maxH, color: rect.color, error: 0 });
        }
        return merged;
    }
    // Blur image using canvas filter
    private getBlurredImage(image: HTMLImageElement, blurSigma: number): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            canvas.width = image.width;
            canvas.height = image.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) reject(new Error('Could not get canvas context'));
            ctx!.filter = `blur(${blurSigma}px)`;
            ctx!.drawImage(image, 0, 0);
            const blurred = new window.Image();
            blurred.onload = () => resolve(blurred);
            blurred.onerror = reject;
            blurred.src = canvas.toDataURL();
        });
    }
    // K-means quantization for BSP rectangles
    private quantizeColorsKMeans(cells: BSPNode[], k: number): BSPNode[] {
        if (cells.length === 0) return cells;
        const colors = cells.map(cell => {
            const match = cell.color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
            if (!match) return [0,0,0];
            return [parseInt(match[1],10), parseInt(match[2],10), parseInt(match[3],10)];
        });
        // Initialize centroids
        const centroids = colors.slice(0, k);
        while (centroids.length < k && colors.length > 0) {
            centroids.push(colors[Math.floor(Math.random()*colors.length)]);
        }
        let changed = true;
        let assignments = new Array(colors.length).fill(0);
        let iter = 0;
        while (changed && iter < 10) {
            changed = false;
            for (let i = 0; i < colors.length; i++) {
                let minDist = Infinity, minIdx = 0;
                for (let c = 0; c < centroids.length; c++) {
                    const d = Math.pow(colors[i][0]-centroids[c][0],2)+Math.pow(colors[i][1]-centroids[c][1],2)+Math.pow(colors[i][2]-centroids[c][2],2);
                    if (d < minDist) { minDist = d; minIdx = c; }
                }
                if (assignments[i] !== minIdx) { changed = true; assignments[i] = minIdx; }
            }
            const sums = Array.from({length:k},()=>[0,0,0,0]);
            for (let i = 0; i < colors.length; i++) {
                const c = assignments[i];
                sums[c][0] += colors[i][0];
                sums[c][1] += colors[i][1];
                sums[c][2] += colors[i][2];
                sums[c][3] += 1;
            }
            for (let c = 0; c < k; c++) {
                if (sums[c][3] > 0) {
                    centroids[c] = [
                        Math.round(sums[c][0]/sums[c][3]),
                        Math.round(sums[c][1]/sums[c][3]),
                        Math.round(sums[c][2]/sums[c][3])
                    ];
                }
            }
            iter++;
        }
        return cells.map((cell, i) => {
            const c = centroids[assignments[i]];
            return { ...cell, color: `rgb(${c[0]}, ${c[1]}, ${c[2]})` };
        });
    }

    // --- File and image helpers ---
    private readFileAsDataUrl(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
    private loadImage(dataUrl: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const img = new window.Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = dataUrl;
        });
    }
    private getResizedImageData(image: HTMLImageElement, width: number, height: number): ImageData {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Could not get canvas context');
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, width, height);
        return ctx.getImageData(0, 0, width, height);
    }

    // --- Quadtree partitioning (adaptive, matches old pipeline) ---
    private bspPartitionImage(imageData: ImageData, minCellSize: number): BSPNode[] {
        const { width, height, data } = imageData;
        // Find next power of two for root size
        const nextPowerOfTwo = (value: number) => {
            let power = 1;
            while (power < value) power *= 2;
            return power;
        };
        const rootSize = nextPowerOfTwo(Math.max(width, height));
        const cells: BSPNode[] = [];
        // Calculate region stats (mean color, variance)
        function calculateRegionStats(data: Uint8ClampedArray, imageWidth: number, imageHeight: number, x: number, y: number, size: number) {
            const endX = Math.min(x + size, imageWidth);
            const endY = Math.min(y + size, imageHeight);
            if (x >= imageWidth || y >= imageHeight || endX <= x || endY <= y) return null;
            let sumR = 0, sumG = 0, sumB = 0, count = 0;
            for (let row = y; row < endY; row++) {
                for (let col = x; col < endX; col++) {
                    const idx = (row * imageWidth + col) * 4;
                    sumR += data[idx];
                    sumG += data[idx + 1];
                    sumB += data[idx + 2];
                    count++;
                }
            }
            if (!count) return null;
            const avgR = sumR / count;
            const avgG = sumG / count;
            const avgB = sumB / count;
            // Variance (mean squared error to mean color)
            let variance = 0;
            for (let row = y; row < endY; row++) {
                for (let col = x; col < endX; col++) {
                    const idx = (row * imageWidth + col) * 4;
                    const r = data[idx], g = data[idx + 1], b = data[idx + 2];
                    variance += Math.pow(r - avgR, 2) + Math.pow(g - avgG, 2) + Math.pow(b - avgB, 2);
                }
            }
            variance /= count;
            return { avgR, avgG, avgB, variance, width: endX - x, height: endY - y };
        }
        // Adaptive max rectangle size based on variance (match old pipeline)
        const adaptiveVarianceThresholds = [
            { threshold: 200, maxRect: 128 },
            { threshold: 1200, maxRect: 64 },
            { threshold: Infinity, maxRect: 32 },
        ];
        function getAdaptiveMaxRect(variance: number) {
            for (const entry of adaptiveVarianceThresholds) {
                if (variance < entry.threshold) return entry.maxRect;
            }
            return 32;
        }
        function visitNode(x: number, y: number, size: number, depth: number) {
            const stats = calculateRegionStats(data, width, height, x, y, size);
            if (!stats) return;
            const adaptiveMaxRect = getAdaptiveMaxRect(stats.variance);
            if (size > adaptiveMaxRect || size > minCellSize) {
                if (size > minCellSize) {
                    const half = Math.max(1, Math.floor(size / 2));
                    visitNode(x, y, half, depth + 1);
                    visitNode(x + half, y, half, depth + 1);
                    visitNode(x, y + half, half, depth + 1);
                    visitNode(x + half, y + half, half, depth + 1);
                    return;
                }
            }
            cells.push({
                x,
                y,
                width: stats.width,
                height: stats.height,
                color: `rgb(${Math.round(stats.avgR)}, ${Math.round(stats.avgG)}, ${Math.round(stats.avgB)})`,
                error: 0
            });
        }
        visitNode(0, 0, rootSize, 0);
        return cells;
    }

    // --- HTML generation ---
    private createHtmlSectionFromBspRects(rects: BSPNode[], width: number, height: number, fileName: string | null): string {
        const escapeHtmlAttribute = (value: string) =>
            value.replaceAll("&", "&amp;")
                .replaceAll("\"", "&quot;")
                .replaceAll("<", "&lt;")
                .replaceAll(">", "&gt;");
        const safeName = fileName ? escapeHtmlAttribute(fileName) : "Uploaded image";
        // Build grid for placement
        const grid: (BSPNode | null)[][] = Array.from({ length: height }, () => Array(width).fill(null));
        rects.forEach(cell => {
            for (let dy = 0; dy < cell.height; dy++) {
                for (let dx = 0; dx < cell.width; dx++) {
                    const y = cell.y + dy;
                    const x = cell.x + dx;
                    if (y < height && x < width) {
                        grid[y][x] = cell;
                    }
                }
            }
        });
        let tableRows = "";
        for (let y = 0; y < height; y++) {
            let rowHtml = "";
            let x = 0;
            while (x < width) {
                const cell = grid[y][x];
                if (!cell) {
                    x++;
                    continue;
                }
                // Find horizontal run of same color
                let runLength = 1;
                while (x + runLength < width && grid[y][x + runLength] && grid[y][x + runLength]?.color === cell.color) {
                    runLength++;
                }
                // Convert rgb(...) to hex for bgcolor
                const rgbMatch = cell.color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
                let hexColor = "#000000";
                if (rgbMatch) {
                    const r = parseInt(rgbMatch[1], 10);
                    const g = parseInt(rgbMatch[2], 10);
                    const b = parseInt(rgbMatch[3], 10);
                    hexColor = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
                }
                rowHtml += `<td bgcolor="${hexColor}" width="${runLength}" height="1"` +
                    (runLength > 1 ? ` colspan="${runLength}"` : "") +
                    `></td>`;
                x += runLength;
            }
            tableRows += `<tr>${rowHtml}</tr>`;
        }
        return `<section style="padding:16px;background:#f6f8fb;border:1px solid #d8e1ee;border-radius:8px;">
    <head>
        <meta name="color-scheme" content="light">
        <meta name="supported-color-schemes" content="light">
    </head>
    <h3 style="margin:0 0 12px;color:#2B4570;font-family:Arial,sans-serif;">BSP Partition Table: ${safeName}</h3><table cellpadding="0" cellspacing="0" border="0" width="${width}" height="${height}" style="border-collapse:collapse;padding:0;border:none;">${tableRows}</table></section>`;
    }
}

// Types
export type BSPNode = {
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    error: number;
    left?: BSPNode;
    right?: BSPNode;
    splitDir?: 'horizontal' | 'vertical';
    splitPos?: number;
};
