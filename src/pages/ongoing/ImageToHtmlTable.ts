// ImageToHtmlTable.ts
// Error-driven BSP partitioning pipeline class

export class ImageToHtmlTable {
    // Main pipeline: accepts a File, target width, and kMeansClusters, returns HTML string (async API)
    async processImageFile(
        file: File,
        targetWidth: number,
        kMeansClusters: number,
        blurSigma: number = 1.5,
        minCellSize: number = 4,
        useShortHex: boolean = false,
        onStepChange?: (msg: string) => void
    ): Promise<string> {
        const t0 = performance.now();
        if (onStepChange) onStepChange("Reading file...");
        let tStart = performance.now();
        const dataUrl = await this.readFileAsDataUrl(file);
        let tEnd = performance.now();
        console.log(`[Timing] readFileAsDataUrl: ${(tEnd - tStart).toFixed(1)}ms`);

        if (onStepChange) onStepChange("Loading image...");
        tStart = performance.now();
        const image = await this.loadImage(dataUrl);
        tEnd = performance.now();
        console.log(`[Timing] loadImage: ${(tEnd - tStart).toFixed(1)}ms`);

        if (onStepChange) onStepChange("Blurring image...");
        tStart = performance.now();
        const blurred = await this.getBlurredImage(image, blurSigma);
        tEnd = performance.now();
        console.log(`[Timing] getBlurredImage: ${(tEnd - tStart).toFixed(1)}ms`);

        if (onStepChange) onStepChange("Resizing image...");
        tStart = performance.now();
        const aspectRatio = image.width / image.height;
        const width = Math.min(targetWidth, image.width);
        const height = Math.max(1, Math.round(width / aspectRatio));
        const imageData = this.getResizedImageData(blurred, width, height);
        tEnd = performance.now();
        console.log(`[Timing] getResizedImageData: ${(tEnd - tStart).toFixed(1)}ms`);

        if (onStepChange) onStepChange("Partitioning image (BSP)...");
        tStart = performance.now();
        let bspRects = await this.runBspPartitionImageWorker(imageData, minCellSize);
        tEnd = performance.now();
        console.log(`[Timing] runBspPartitionImageWorker: ${(tEnd - tStart).toFixed(1)}ms`);

        if (onStepChange) onStepChange("Quantizing colors (K-means)...");
        tStart = performance.now();
        bspRects = await this.runQuantizeColorsKMeansWorker(bspRects, kMeansClusters);
        tEnd = performance.now();
        console.log(`[Timing] runQuantizeColorsKMeansWorker: ${(tEnd - tStart).toFixed(1)}ms`);

        if (onStepChange) onStepChange("Merging rectangles...");
        tStart = performance.now();
        bspRects = await this.runMergeRectanglesWorker(bspRects, width, height);
        tEnd = performance.now();
        console.log(`[Timing] runMergeRectanglesWorker: ${(tEnd - tStart).toFixed(1)}ms`);

        if (onStepChange) onStepChange("Generating HTML...");
        tStart = performance.now();
        const html = this.createHtmlSectionFromBspRects(bspRects, imageData.width, imageData.height, file.name, useShortHex);
        tEnd = performance.now();
        console.log(`[Timing] createHtmlSectionFromBspRects: ${(tEnd - tStart).toFixed(1)}ms`);

        if (onStepChange) onStepChange("Done!");
        return html;
    }

    // --- Minimal web worker wrapper for bspPartitionImage ---
    private runBspPartitionImageWorker(imageData: ImageData, minCellSize: number): Promise<BSPNode[]> {
        return new Promise((resolve, reject) => {
            const workerCode = `
                self.onmessage = function(e) {
                    const [imageData, minCellSize] = e.data;
                    const data = new Uint8ClampedArray(imageData.data);
                    const width = imageData.width;
                    const height = imageData.height;
                    function nextPowerOfTwo(value) {
                        let power = 1;
                        while (power < value) power *= 2;
                        return power;
                    }
                    function calculateRegionStats(data, imageWidth, imageHeight, x, y, size) {
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
                    const adaptiveVarianceThresholds = [
                        { threshold: 200, maxRect: 128 },
                        { threshold: 1200, maxRect: 64 },
                        { threshold: Infinity, maxRect: 32 },
                    ];
                    function getAdaptiveMaxRect(variance) {
                        for (const entry of adaptiveVarianceThresholds) {
                            if (variance < entry.threshold) return entry.maxRect;
                        }
                        return 32;
                    }
                    const rootSize = nextPowerOfTwo(Math.max(width, height));
                    const cells = [];
                    function visitNode(x, y, size, depth) {
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
                            x: x,
                            y: y,
                            width: stats.width,
                            height: stats.height,
                            color: "rgb(" + Math.round(stats.avgR) + ", " + Math.round(stats.avgG) + ", " + Math.round(stats.avgB) + ")",
                            error: 0
                        });
                    }
                    visitNode(0, 0, rootSize, 0);
                    self.postMessage(cells);
                };
            `;
            const blob = new Blob([workerCode], { type: 'application/javascript' });
            const worker = new Worker(URL.createObjectURL(blob));
            worker.onmessage = (e) => {
                resolve(e.data);
                worker.terminate();
            };
            worker.onerror = (err) => {
                reject(err);
                worker.terminate();
            };
            worker.postMessage([
                { data: imageData.data.buffer, width: imageData.width, height: imageData.height },
                minCellSize
            ]);
        });
    }

    // --- Minimal web worker wrapper for mergeRectangles ---
    private runMergeRectanglesWorker(cells: BSPNode[], width: number, height: number): Promise<BSPNode[]> {
        return new Promise((resolve, reject) => {
            const cellsData = cells.map(cell => ({ ...cell }));
            const workerCode = `
                self.onmessage = function(e) {
                    let [cells, width, height] = e.data;
                    let merged = cells.slice();
                    let changed = true;
                    while (changed) {
                        changed = false;
                        const grid = Array.from({ length: height }, () => Array(width).fill(null));
                        merged.forEach(cell => {
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
                        let horMerged = [];
                        for (let y = 0; y < height; y++) {
                            let x = 0;
                            while (x < width) {
                                const cell = grid[y][x];
                                if (!cell) { x++; continue; }
                                if (cell.x !== x || cell.y !== y) { x++; continue; }
                                let maxW = cell.width;
                                let mergedRect = cell;
                                while (x + maxW < width) {
                                    const neighbor = grid[y][x + maxW];
                                    if (
                                        neighbor &&
                                        neighbor.y === y &&
                                        neighbor.height === cell.height &&
                                        neighbor.color === cell.color &&
                                        neighbor.x === x + maxW
                                    ) {
                                        mergedRect = {
                                            x: x,
                                            y: y,
                                            width: mergedRect.width + neighbor.width,
                                            height: mergedRect.height,
                                            color: cell.color,
                                            error: 0
                                        };
                                        maxW += neighbor.width;
                                        changed = true;
                                    } else {
                                        break;
                                    }
                                }
                                horMerged.push(mergedRect);
                                x += maxW;
                            }
                        }
                        let verMerged = [];
                        for (let i = 0; i < horMerged.length; i++) {
                            const rect = horMerged[i];
                            let mergedRect = rect;
                            while (true) {
                                const neighbor = horMerged.find(r =>
                                    r.x === rect.x &&
                                    r.y === mergedRect.y + mergedRect.height &&
                                    r.width === mergedRect.width &&
                                    r.color === mergedRect.color
                                );
                                if (neighbor) {
                                    mergedRect = {
                                        x: mergedRect.x,
                                        y: mergedRect.y,
                                        width: mergedRect.width,
                                        height: mergedRect.height + neighbor.height,
                                        color: mergedRect.color,
                                        error: 0
                                    };
                                    horMerged = horMerged.filter(r => r !== neighbor);
                                    changed = true;
                                } else {
                                    break;
                                }
                            }
                            verMerged.push(mergedRect);
                        }
                        merged = verMerged;
                    }
                    self.postMessage(merged);
                };
            `;
            const blob = new Blob([workerCode], { type: 'application/javascript' });
            const worker = new Worker(URL.createObjectURL(blob));
            worker.onmessage = (e) => {
                resolve(e.data);
                worker.terminate();
            };
            worker.onerror = (err) => {
                reject(err);
                worker.terminate();
            };
            worker.postMessage([cellsData, width, height]);
        });
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

    // --- Minimal web worker wrapper for quantizeColorsKMeans ---
    private runQuantizeColorsKMeansWorker(cells: BSPNode[], k: number): Promise<BSPNode[]> {
        return new Promise((resolve, reject) => {
            // Serialize cells for transfer (no functions, only data)
            const cellsData = cells.map(cell => ({ ...cell }));
            const workerCode = `
                self.onmessage = function(e) {
                    const [cells, k] = e.data;
                    if (cells.length === 0) { self.postMessage(cells); return; }
                    const colors = cells.map(cell => {
                        const match = cell.color.match(/rgb\\((\\d+),\\s*(\\d+),\\s*(\\d+)\\)/);
                        if (!match) return [0,0,0];
                        return [parseInt(match[1],10), parseInt(match[2],10), parseInt(match[3],10)];
                    });
                    const centroids = colors.slice(0, k);
                    while (centroids.length < k && colors.length > 0) {
                        centroids.push(colors[Math.floor(Math.random()*colors.length)]);
                    }
                    let changed = true;
                    let assignments = new Array(colors.length).fill(0);
                    let iter = 0;
                    const maxIterations = 10;
                    while (changed && iter < maxIterations) {
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
                    const result = cells.map((cell, i) => {
                        const c = centroids[assignments[i]];
                        return Object.assign({}, cell, { color: "rgb(" + c[0] + ", " + c[1] + ", " + c[2] + ")" });
                    });
                    self.postMessage(result);
                };
            `;
            const blob = new Blob([workerCode], { type: 'application/javascript' });
            const worker = new Worker(URL.createObjectURL(blob));
            worker.onmessage = (e) => {
                resolve(e.data);
                worker.terminate();
            };
            worker.onerror = (err) => {
                reject(err);
                worker.terminate();
            };
            worker.postMessage([cellsData, k]);
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
    private createHtmlSectionFromBspRects(
        rects: BSPNode[],
        width: number,
        height: number,
        fileName: string | null,
        useShortHex: boolean = false
    ): string {
        // Removed file name from heading as per user request
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
        // Use merged rectangles and output <td> with colspan/rowspan like the old method
        const mergedRects = rects;
        // Track which cells have been rendered
        const rendered: boolean[][] = Array.from({ length: height }, () => Array(width).fill(false));
        let tableRows = "";
        for (let y = 0; y < height; y++) {
            let rowHtml = "";
            for (let x = 0; x < width; x++) {
                // Only render <td> at the top-left of each rectangle
                const rect = mergedRects.find(r => r.x === x && r.y === y);
                if (rect && !rendered[y][x]) {
                    // Convert rgb(...) to hex for bgcolor
                    const rgbMatch = rect.color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
                    let hexColor = "#000000";
                    if (rgbMatch) {
                        let r = parseInt(rgbMatch[1], 10);
                        let g = parseInt(rgbMatch[2], 10);
                        let b = parseInt(rgbMatch[3], 10);
                        if (useShortHex) {
                            // Quantize to 4 bits per channel, then use #rgb
                            const r4 = (r >> 4) & 0xf;
                            const g4 = (g >> 4) & 0xf;
                            const b4 = (b >> 4) & 0xf;
                            hexColor = `#${r4.toString(16)}${g4.toString(16)}${b4.toString(16)}`;
                        } else {
                            // Standard 6-digit hex
                            const toHex = (n: number) => n.toString(16).padStart(2, '0');
                            hexColor = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
                        }
                    }
                    let attrs = `bgcolor=\"${hexColor}\"`;
                    if (rect.width > 1) attrs += ` colspan=\"${rect.width}\"`;
                    if (rect.height > 1) attrs += ` rowspan=\"${rect.height}\"`;
                    rowHtml += `<td ${attrs}></td>`;
                    // Mark all covered cells as rendered
                    for (let dy = 0; dy < rect.height; dy++) {
                        for (let dx = 0; dx < rect.width; dx++) {
                            if (rendered[y + dy]) rendered[y + dy][x + dx] = true;
                        }
                    }
                }
            }
            tableRows += `<tr>${rowHtml}</tr>`;
        }
        return `<section style="padding:16px;background:#fff;border:1px solid #d8e1ee;border-radius:8px;">
    <head>
        <meta name="color-scheme" content="light">
        <meta name="supported-color-schemes" content="light">
    </head>
    <table cellpadding="0" cellspacing="0" border="0" width="${width}" height="${height}" style="border-collapse:collapse;padding:0;border:none;background:#fff;">${tableRows}</table></section>`;
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
