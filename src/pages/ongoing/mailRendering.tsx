// --- CONSTANTS ---
const HTML_RECT_ESTIMATE_CHARS = 43;
// --- CONFIGURATION ---
const MAIL_RENDER_CONFIG = {
    blurSigma: 1.5, // Gaussian blur strength
    minCellSize: 2, // Minimum quadtree cell size
    adaptiveVarianceThresholds: [
        { threshold: 200, maxRect: 128 },
        { threshold: 1200, maxRect: 64 },
        { threshold: Infinity, maxRect: 32 },
    ],
    kMeansPaletteSize: 2048, // Number of colors for k-means quantization
    widths: [300, 400, 500],
    maxKB: 300,
    minKB: 270,
};
// Rectangle covering pipeline: maximal rectangles (greedy)
// Alternative pipeline: error-driven BSP partition

// --- BSP Partition rectangle count for a given cell grid ---
function countBspRectsFromCells(cells: QuadCell[], width: number, height: number): number {
    // Build grid
    const grid: string[][] = Array.from({ length: height }, () => Array(width).fill(""));
    cells.forEach(cell => {
        for (let dy = 0; dy < cell.height; dy++) {
            for (let dx = 0; dx < cell.width; dx++) {
                const y = cell.y + dy;
                const x = cell.x + dx;
                if (y < height && x < width) {
                    grid[y][x] = cell.color;
                }
            }
        }
    });
    // BSP partition logic (copied from useMemo)
    const minSize = 4;
    const errorThreshold = 12000;
    type BSPNode = {
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
    function regionStats(x: number, y: number, w: number, h: number): { color: string; error: number } {
        let sumR = 0, sumG = 0, sumB = 0, count = 0;
        let error = 0;
        for (let row = y; row < y + h; row++) {
            for (let col = x; col < x + w; col++) {
                const rgbMatch = grid[row][col].match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
                let r = 0, g = 0, b = 0;
                if (rgbMatch) {
                    r = parseInt(rgbMatch[1], 10);
                    g = parseInt(rgbMatch[2], 10);
                    b = parseInt(rgbMatch[3], 10);
                }
                sumR += r;
                sumG += g;
                sumB += b;
                count++;
            }
        }
        if (!count) return { color: 'rgb(0,0,0)', error: 0 };
        const avgR = Math.round(sumR / count);
        const avgG = Math.round(sumG / count);
        const avgB = Math.round(sumB / count);
        for (let row = y; row < y + h; row++) {
            for (let col = x; col < x + w; col++) {
                const rgbMatch = grid[row][col].match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
                let r = 0, g = 0, b = 0;
                if (rgbMatch) {
                    r = parseInt(rgbMatch[1], 10);
                    g = parseInt(rgbMatch[2], 10);
                    b = parseInt(rgbMatch[3], 10);
                }
                error += Math.pow(r - avgR, 2) + Math.pow(g - avgG, 2) + Math.pow(b - avgB, 2);
            }
        }
        return { color: `rgb(${avgR}, ${avgG}, ${avgB})`, error };
    }
    function bspPartition(x: number, y: number, w: number, h: number, minSize: number, errorThreshold: number): BSPNode {
        const { color, error } = regionStats(x, y, w, h);
        if (w <= minSize && h <= minSize || error < errorThreshold) {
            return { x, y, width: w, height: h, color, error };
        }
        let bestSplit: { dir: 'horizontal' | 'vertical'; pos: number; error: number } | null = null;
        for (let split = 1; split < w; split++) {
            const leftStats = regionStats(x, y, split, h);
            const rightStats = regionStats(x + split, y, w - split, h);
            const totalError = leftStats.error + rightStats.error;
            if (!bestSplit || totalError < bestSplit.error) {
                bestSplit = { dir: 'vertical', pos: split, error: totalError };
            }
        }
        for (let split = 1; split < h; split++) {
            const topStats = regionStats(x, y, w, split);
            const bottomStats = regionStats(x, y + split, w, h - split);
            const totalError = topStats.error + bottomStats.error;
            if (!bestSplit || totalError < bestSplit.error) {
                bestSplit = { dir: 'horizontal', pos: split, error: totalError };
            }
        }
        if (!bestSplit) {
            return { x, y, width: w, height: h, color, error };
        }
        if (bestSplit.dir === 'vertical') {
            return {
                x, y, width: w, height: h, color, error,
                splitDir: 'vertical', splitPos: bestSplit.pos,
                left: bspPartition(x, y, bestSplit.pos, h, minSize, errorThreshold),
                right: bspPartition(x + bestSplit.pos, y, w - bestSplit.pos, h, minSize, errorThreshold)
            };
        } else {
            return {
                x, y, width: w, height: h, color, error,
                splitDir: 'horizontal', splitPos: bestSplit.pos,
                left: bspPartition(x, y, w, bestSplit.pos, minSize, errorThreshold),
                right: bspPartition(x, y + bestSplit.pos, w, h - bestSplit.pos, minSize, errorThreshold)
            };
        }
    }
    function collectRects(node: BSPNode, rects: BSPNode[]) {
        if (!node.left && !node.right) {
            rects.push(node);
        } else {
            if (node.left) collectRects(node.left, rects);
            if (node.right) collectRects(node.right, rects);
        }
    }
    const root = bspPartition(0, 0, width, height, minSize, errorThreshold);
    const rects: BSPNode[] = [];
    collectRects(root, rects);
    return rects.length;
}

// --- BSP-aware transformImage ---
function transformImageBSP(file: File): Promise<TransformedImageResult> {
    return new Promise((resolve, reject) => {
        void (async () => {
            try {
                const dataUrl = await readFileAsDataUrl(file);
                const image = await loadImage(dataUrl);

                const maxKB = MAIL_RENDER_CONFIG.maxKB;
                const aspectRatio = image.width / image.height;
                const widths = MAIL_RENDER_CONFIG.widths;
                const blurSigma = MAIL_RENDER_CONFIG.blurSigma;
                const blurCanvas = document.createElement("canvas");
                blurCanvas.width = image.width;
                blurCanvas.height = image.height;
                const blurCtx = blurCanvas.getContext("2d");
                if (!blurCtx) {
                    reject(new Error("Canvas context for blur could not be created."));
                    return;
                }
                blurCtx.filter = `blur(${blurSigma}px)`;
                blurCtx.drawImage(image, 0, 0, image.width, image.height);

                let prevResult: TransformedImageResult | null = null;
                let prevKB = 0;
                for (let i = 0; i < widths.length; i++) {
                    let targetWidth = Math.min(widths[i], image.width);
                    let targetHeight = Math.max(1, Math.floor(targetWidth / aspectRatio));
                    targetHeight = Math.min(targetHeight, image.height);

                    const canvas = document.createElement("canvas");
                    canvas.width = targetWidth;
                    canvas.height = targetHeight;

                    const context = canvas.getContext("2d", { willReadFrequently: true });
                    if (!context) {
                        reject(new Error("Canvas context could not be created."));
                        return;
                    }

                    context.imageSmoothingEnabled = true;
                    context.drawImage(blurCanvas, 0, 0, image.width, image.height, 0, 0, targetWidth, targetHeight);

                    const pixels = context.getImageData(0, 0, targetWidth, targetHeight);
                    let cells = buildQuadtreeCells(pixels);
                    // Kvantisér farver efter quadtree vha. k-means (palette på kMeansPaletteSize farver)
                    const quantizeColorsKMeans = (cells: QuadCell[], k: number): QuadCell[] => {
                        const colors = cells.map(cell => {
                            const match = cell.color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
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
                    };
                    cells = quantizeColorsKMeans(cells, MAIL_RENDER_CONFIG.kMeansPaletteSize);

                    const bspRects = countBspRectsFromCells(cells, targetWidth, targetHeight);
                    const estimatedChars = bspRects * HTML_RECT_ESTIMATE_CHARS;
                    const estimatedKB = estimatedChars / 1000;

                    console.log(`BSP Iteration ${i + 1}: width=${targetWidth}, height=${targetHeight}, kMeansPaletteSize=${MAIL_RENDER_CONFIG.kMeansPaletteSize}, bspRects=${bspRects}, estimatedChars=${estimatedChars}, estimatedKB=${estimatedKB.toFixed(2)}`);

                    if (estimatedKB > maxKB && prevResult) {
                        console.log(`BSP Oversized attempt: width=${targetWidth}, height=${targetHeight}, bspRects=${bspRects}, estimatedKB=${estimatedKB.toFixed(2)}`);
                        resolve(prevResult);
                        return;
                    }
                    prevResult = { width: targetWidth, height: targetHeight, cells };
                    prevKB = estimatedKB;
                }
                // Hvis ingen kom over grænsen, brug den største
                if (prevResult) {
                    const bspRects = countBspRectsFromCells(prevResult.cells, prevResult.width, prevResult.height);
                    const estimatedKB = (bspRects * HTML_RECT_ESTIMATE_CHARS) / 1000;
                    console.log(`BSP Final attempt: width=${prevResult.width}, height=${prevResult.height}, bspRects=${bspRects}, estimatedKB=${estimatedKB.toFixed(2)}`);
                    resolve(prevResult);
                } else {
                    reject(new Error("Image transformation failed."));
                }
            } catch (error) {
                reject(error instanceof Error ? error : new Error("Image transformation failed."));
            }
        })();
    });
}
function createHtmlSectionBSPPartition(result: TransformedImageResult, fileName: string | null): string {
        // Multi-pass rectangle merging for BSP rectangles
        function multiPassMerge(rects: BSPNode[], width: number, height: number): BSPNode[] {
            let merged = rects.slice();
            let changed = true;
            while (changed) {
                changed = false;
                // Horizontal merge
                let horMerged: BSPNode[] = [];
                const used = new Set<number>();
                for (let i = 0; i < merged.length; i++) {
                    if (used.has(i)) continue;
                    let r1 = merged[i];
                    let mergedRect = r1;
                    for (let j = 0; j < merged.length; j++) {
                        if (i === j || used.has(j)) continue;
                        let r2 = merged[j];
                        // Same color, same y, same height, adjacent x
                        if (
                            r1.color === r2.color &&
                            r1.y === r2.y &&
                            r1.height === r2.height &&
                            r1.x + r1.width === r2.x
                        ) {
                            mergedRect = {
                                x: r1.x,
                                y: r1.y,
                                width: r1.width + r2.width,
                                height: r1.height,
                                color: r1.color,
                                error: 0
                            };
                            used.add(j);
                            changed = true;
                            r1 = mergedRect;
                        }
                    }
                    horMerged.push(mergedRect);
                    used.add(i);
                }
                // Vertical merge
                let verMerged: BSPNode[] = [];
                used.clear();
                for (let i = 0; i < horMerged.length; i++) {
                    if (used.has(i)) continue;
                    let r1 = horMerged[i];
                    let mergedRect = r1;
                    for (let j = 0; j < horMerged.length; j++) {
                        if (i === j || used.has(j)) continue;
                        let r2 = horMerged[j];
                        // Same color, same x, same width, adjacent y
                        if (
                            r1.color === r2.color &&
                            r1.x === r2.x &&
                            r1.width === r2.width &&
                            r1.y + r1.height === r2.y
                        ) {
                            mergedRect = {
                                x: r1.x,
                                y: r1.y,
                                width: r1.width,
                                height: r1.height + r2.height,
                                color: r1.color,
                                error: 0
                            };
                            used.add(j);
                            changed = true;
                            r1 = mergedRect;
                        }
                    }
                    verMerged.push(mergedRect);
                    used.add(i);
                }
                merged = verMerged;
            }
            return merged;
        }
    const safeName = fileName ? escapeHtmlAttribute(fileName) : "Uploaded image";
    // Build pixel grid
    const grid: string[][] = Array.from({ length: result.height }, () => Array(result.width).fill(""));
    result.cells.forEach(cell => {
        for (let dy = 0; dy < cell.height; dy++) {
            for (let dx = 0; dx < cell.width; dx++) {
                const y = cell.y + dy;
                const x = cell.x + dx;
                if (y < result.height && x < result.width) {
                    grid[y][x] = cell.color;
                }
            }
        }
    });

    // Error-driven BSP partition algorithm
    type BSPNode = {
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

    function regionStats(x: number, y: number, w: number, h: number): { color: string; error: number } {
        let sumR = 0, sumG = 0, sumB = 0, count = 0;
        let error = 0;
        for (let row = y; row < y + h; row++) {
            for (let col = x; col < x + w; col++) {
                const rgbMatch = grid[row][col].match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
                let r = 0, g = 0, b = 0;
                if (rgbMatch) {
                    r = parseInt(rgbMatch[1], 10);
                    g = parseInt(rgbMatch[2], 10);
                    b = parseInt(rgbMatch[3], 10);
                }
                sumR += r;
                sumG += g;
                sumB += b;
                count++;
            }
        }
        if (!count) return { color: 'rgb(0,0,0)', error: 0 };
        const avgR = Math.round(sumR / count);
        const avgG = Math.round(sumG / count);
        const avgB = Math.round(sumB / count);
        // Error: sum squared distance to mean color
        for (let row = y; row < y + h; row++) {
            for (let col = x; col < x + w; col++) {
                const rgbMatch = grid[row][col].match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
                let r = 0, g = 0, b = 0;
                if (rgbMatch) {
                    r = parseInt(rgbMatch[1], 10);
                    g = parseInt(rgbMatch[2], 10);
                    b = parseInt(rgbMatch[3], 10);
                }
                error += Math.pow(r - avgR, 2) + Math.pow(g - avgG, 2) + Math.pow(b - avgB, 2);
            }
        }
        return { color: `rgb(${avgR}, ${avgG}, ${avgB})`, error };
    }

    function bspPartition(x: number, y: number, w: number, h: number, minSize: number, errorThreshold: number): BSPNode {
        const { color, error } = regionStats(x, y, w, h);
        if (w <= minSize && h <= minSize || error < errorThreshold) {
            return { x, y, width: w, height: h, color, error };
        }
        // Try all possible splits, pick the one with lowest sum error
        let bestSplit: { dir: 'horizontal' | 'vertical'; pos: number; error: number } | null = null;
        // Vertical splits
        for (let split = 1; split < w; split++) {
            const leftStats = regionStats(x, y, split, h);
            const rightStats = regionStats(x + split, y, w - split, h);
            const totalError = leftStats.error + rightStats.error;
            if (!bestSplit || totalError < bestSplit.error) {
                bestSplit = { dir: 'vertical', pos: split, error: totalError };
            }
        }
        // Horizontal splits
        for (let split = 1; split < h; split++) {
            const topStats = regionStats(x, y, w, split);
            const bottomStats = regionStats(x, y + split, w, h - split);
            const totalError = topStats.error + bottomStats.error;
            if (!bestSplit || totalError < bestSplit.error) {
                bestSplit = { dir: 'horizontal', pos: split, error: totalError };
            }
        }
        if (!bestSplit) {
            return { x, y, width: w, height: h, color, error };
        }
        // Recursively partition
        if (bestSplit.dir === 'vertical') {
            return {
                x, y, width: w, height: h, color, error,
                splitDir: 'vertical', splitPos: bestSplit.pos,
                left: bspPartition(x, y, bestSplit.pos, h, minSize, errorThreshold),
                right: bspPartition(x + bestSplit.pos, y, w - bestSplit.pos, h, minSize, errorThreshold)
            };
        } else {
            return {
                x, y, width: w, height: h, color, error,
                splitDir: 'horizontal', splitPos: bestSplit.pos,
                left: bspPartition(x, y, w, bestSplit.pos, minSize, errorThreshold),
                right: bspPartition(x, y + bestSplit.pos, w, h - bestSplit.pos, minSize, errorThreshold)
            };
        }
    }

    // Traverse BSP tree and collect rectangles
    function collectRects(node: BSPNode, rects: BSPNode[]) {
        if (!node.left && !node.right) {
            rects.push(node);
        } else {
            if (node.left) collectRects(node.left, rects);
            if (node.right) collectRects(node.right, rects);
        }
    }

    // Parameters for partitioning
    const minSize = 4;
    const errorThreshold = 12000;
    const root = bspPartition(0, 0, result.width, result.height, minSize, errorThreshold);
    const rects: BSPNode[] = [];
    collectRects(root, rects);
    // Multi-pass merge
    const mergedRects = multiPassMerge(rects, result.width, result.height);

    // Generate HTML table
    let tableRows = "";
    for (let y = 0; y < result.height; y++) {
        let rowHtml = "";
        for (let x = 0; x < result.width; x++) {
            // Find rectangle starting at (x, y)
            const rect = mergedRects.find(r => r.x === x && r.y === y);
            if (rect) {
                // Quantize color to RGB444 and output 3-digit hex
                const rgbMatch = rect.color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
                let hexColor = "#000";
                if (rgbMatch) {
                    const r444 = Math.floor(parseInt(rgbMatch[1], 10) / 16);
                    const g444 = Math.floor(parseInt(rgbMatch[2], 10) / 16);
                    const b444 = Math.floor(parseInt(rgbMatch[3], 10) / 16);
                    hexColor = `#${r444.toString(16)}${g444.toString(16)}${b444.toString(16)}`;
                }
                let attrs = `bgcolor=${hexColor}`;
                if (rect.width > 1) attrs += ` colspan=${rect.width}`;
                if (rect.height > 1) attrs += ` rowspan=${rect.height}`;
                rowHtml += `<td ${attrs}></td>`;
            }
        }
        tableRows += `<tr>${rowHtml}</tr>`;
    }
    let html = `<section style="padding:16px;background:#f6f8fb;border:1px solid #d8e1ee;border-radius:8px;">
    <head>
        <meta name="color-scheme" content="light">
        <meta name="supported-color-schemes" content="light">
    </head>
    <h3 style="margin:0 0 12px;color:#2B4570;font-family:Arial,sans-serif;">BSP Partition HTML Table: ${safeName}</h3><table cellpadding="0" cellspacing="0" border="0" width="${result.width}" height="${result.height}" style="border-collapse:collapse;padding:0;border:none;">${tableRows}</table></section>`;
    html = html.replace(/\n/g, '').replace(/\s{2,}/g, '').replace(/>\s+</g, '><');
    return html;
}
function createHtmlSectionRectangleCover(result: TransformedImageResult, fileName: string | null): string {
    const safeName = fileName ? escapeHtmlAttribute(fileName) : "Uploaded image";
    // Build pixel grid
    const grid: string[][] = Array.from({ length: result.height }, () => Array(result.width).fill(""));
    result.cells.forEach(cell => {
        for (let dy = 0; dy < cell.height; dy++) {
            for (let dx = 0; dx < cell.width; dx++) {
                const y = cell.y + dy;
                const x = cell.x + dx;
                if (y < result.height && x < result.width) {
                    grid[y][x] = cell.color;
                }
            }
        }
    });
    // Rectangle covering algorithm
    const rectangles: { x: number; y: number; width: number; height: number; color: string }[] = [];
    const covered = Array.from({ length: result.height }, () => Array(result.width).fill(false));
    for (let y = 0; y < result.height; y++) {
        for (let x = 0; x < result.width; x++) {
            if (covered[y][x]) continue;
            const color = grid[y][x];
            // Find maximal rectangle starting at (x, y)
            let maxWidth = 1;
            while (x + maxWidth < result.width && grid[y][x + maxWidth] === color && !covered[y][x + maxWidth]) {
                maxWidth++;
            }
            let maxHeight = 1;
            let valid = true;
            while (y + maxHeight < result.height && valid) {
                for (let dx = 0; dx < maxWidth; dx++) {
                    if (grid[y + maxHeight][x + dx] !== color || covered[y + maxHeight][x + dx]) {
                        valid = false;
                        break;
                    }
                }
                if (valid) maxHeight++;
            }
            // Mark covered
            for (let dy = 0; dy < maxHeight; dy++) {
                for (let dx = 0; dx < maxWidth; dx++) {
                    covered[y + dy][x + dx] = true;
                }
            }
            rectangles.push({ x, y, width: maxWidth, height: maxHeight, color });
        }
    }
    // Generate HTML table
    let tableRows = "";
    for (let y = 0; y < result.height; y++) {
        let rowHtml = "";
        for (let x = 0; x < result.width; x++) {
            // Find rectangle starting at (x, y)
            const rect = rectangles.find(r => r.x === x && r.y === y);
            if (rect) {
                // Quantize color to 12-bit
                const rgbMatch = rect.color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
                let hexColor = "#000000";
                if (rgbMatch) {
                    const quantize = (v: number) => Math.floor(v / 16) * 16;
                    const r = quantize(parseInt(rgbMatch[1], 10));
                    const g = quantize(parseInt(rgbMatch[2], 10));
                    const b = quantize(parseInt(rgbMatch[3], 10));
                    const toHex = (v: number) => v.toString(16).padStart(2, '0');
                    const hex6 = toHex(r) + toHex(g) + toHex(b);
                    hexColor = `#${hex6}`;
                    if (
                        hex6.length === 6 &&
                        hex6[0] === hex6[1] &&
                        hex6[2] === hex6[3] &&
                        hex6[4] === hex6[5]
                    ) {
                        hexColor = `#${hex6[0]}${hex6[2]}${hex6[4]}`;
                    }
                }
                let attrs = `bgcolor=${hexColor}`;
                if (rect.width > 1) attrs += ` colspan=${rect.width}`;
                if (rect.height > 1) attrs += ` rowspan=${rect.height}`;
                // Removed width and height attributes
                rowHtml += `<td ${attrs}></td>`;
            }
        }
        tableRows += `<tr>${rowHtml}</tr>`;
    }
    let html = `<section style="padding:16px;background:#f6f8fb;border:1px solid #d8e1ee;border-radius:8px;">
    <head>
        <meta name="color-scheme" content="light">
        <meta name="supported-color-schemes" content="light">
    </head>
    <h3 style="margin:0 0 12px;color:#2B4570;font-family:Arial,sans-serif;">Rectangle Cover HTML Table: ${safeName}</h3><table cellpadding="0" cellspacing="0" border="0" width="${result.width}" height="${result.height}" style="border-collapse:collapse;padding:0;border:none;">${tableRows}</table></section>`;
    html = html.replace(/\n/g, '').replace(/\s{2,}/g, '').replace(/>\s+</g, '><');
    return html;
}
// New pipeline: PixelGridHtml - each cell is a pixel, no merging, 12-bit color
function createHtmlSectionPixelGrid(result: TransformedImageResult, fileName: string | null): string {
    const safeName = fileName ? escapeHtmlAttribute(fileName) : "Uploaded image";
    // Build grid for placement
    const grid: (QuadCell | null)[][] = Array.from({ length: result.height }, () => Array(result.width).fill(null));
    result.cells.forEach(cell => {
        for (let dy = 0; dy < cell.height; dy++) {
            for (let dx = 0; dx < cell.width; dx++) {
                const y = cell.y + dy;
                const x = cell.x + dx;
                if (y < result.height && x < result.width) {
                    grid[y][x] = cell;
                }
            }
        }
    });
    let tableRows = "";
    for (let y = 0; y < result.height; y++) {
        let rowHtml = "";
        for (let x = 0; x < result.width; x++) {
            const cell = grid[y][x];
            if (!cell) continue;
            // Quantize to 4 bits per channel (12-bit color)
            const rgbMatch = cell.color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
            let hexColor = "#000000";
            if (rgbMatch) {
                const quantize = (v: number) => Math.floor(v / 16) * 16;
                const r = quantize(parseInt(rgbMatch[1], 10));
                const g = quantize(parseInt(rgbMatch[2], 10));
                const b = quantize(parseInt(rgbMatch[3], 10));
                const toHex = (v: number) => v.toString(16).padStart(2, '0');
                const hex6 = toHex(r) + toHex(g) + toHex(b);
                hexColor = `#${hex6}`;
                if (
                    hex6.length === 6 &&
                    hex6[0] === hex6[1] &&
                    hex6[2] === hex6[3] &&
                    hex6[4] === hex6[5]
                ) {
                    hexColor = `#${hex6[0]}${hex6[2]}${hex6[4]}`;
                }
            }
            rowHtml += `<td bgcolor=${hexColor}></td>`;
        }
        tableRows += `<tr>${rowHtml}</tr>`;
    }
    let html = `<section style="padding:16px;background:#f6f8fb;border:1px solid #d8e1ee;border-radius:8px;">
    <head>
        <meta name="color-scheme" content="light">
        <meta name="supported-color-schemes" content="light">
    </head>
    <h3 style="margin:0 0 12px;color:#2B4570;font-family:Arial,sans-serif;">PixelGrid HTML Table: ${safeName}</h3><table cellpadding="0" cellspacing="0" border="0" width="${result.width}" height="${result.height}" style="border-collapse:collapse;padding:0;border:none;">${tableRows}</table></section>`;
    html = html.replace(/\n/g, '').replace(/\s{2,}/g, '').replace(/>\s+</g, '><');
    return html;
}
// New method: y-boundary based table generation
// Third method: simple 10% scale, 1 cell per pixel, horizontal merge only
function createHtmlSectionSimple10pct(file: File | null, fileName: string | null, originalPreviewUrl: string | null): Promise<string> {
    if (!file) return Promise.resolve("");
    const safeName = fileName ? escapeHtmlAttribute(fileName) : "Uploaded image";
    return new Promise(async (resolve, reject) => {
        try {
            const dataUrl = await readFileAsDataUrl(file);
            const image = await loadImage(dataUrl);
            const targetWidth = Math.max(1, Math.floor(image.width * 0.1));
            const targetHeight = Math.max(1, Math.floor(image.height * 0.1));
            const canvas = document.createElement("canvas");
            canvas.width = targetWidth;
            canvas.height = targetHeight;
            const context = canvas.getContext("2d", { willReadFrequently: true });
            if (!context) {
                resolve("");
                return;
            }
            context.imageSmoothingEnabled = true;
            context.drawImage(image, 0, 0, targetWidth, targetHeight);
            const pixels = context.getImageData(0, 0, targetWidth, targetHeight);
            // Quantize colors: 4 levels per channel
            const quantize = (v: number) => Math.floor(v / 64) * 64;
            let tableRows = "";
            for (let y = 0; y < targetHeight; y++) {
                let rowHtml = "";
                let x = 0;
                while (x < targetWidth) {
                    const idx = (y * targetWidth + x) * 4;
                    const r = quantize(pixels.data[idx]);
                    const g = quantize(pixels.data[idx + 1]);
                    const b = quantize(pixels.data[idx + 2]);
                    // Find horizontal run of same quantized color
                    let runLength = 1;
                    while (x + runLength < targetWidth) {
                        const nextIdx = (y * targetWidth + x + runLength) * 4;
                        const nr = quantize(pixels.data[nextIdx]);
                        const ng = quantize(pixels.data[nextIdx + 1]);
                        const nb = quantize(pixels.data[nextIdx + 2]);
                        if (nr === r && ng === g && nb === b) {
                            runLength++;
                        } else {
                            break;
                        }
                    }
                    // Convert rgb(...) to hex for bgcolor, use 3-digit if possible
                    const toHex = (v: number) => v.toString(16).padStart(2, '0');
                    const hex6 = toHex(r) + toHex(g) + toHex(b);
                    let hexColor = `#${hex6}`;
                    // Check if each channel is a double (e.g. aa, bb, cc)
                    if (
                        hex6.length === 6 &&
                        hex6[0] === hex6[1] &&
                        hex6[2] === hex6[3] &&
                        hex6[4] === hex6[5]
                    ) {
                        hexColor = `#${hex6[0]}${hex6[2]}${hex6[4]}`;
                    }
                    rowHtml += `<td bgcolor="${hexColor}" width="${runLength}" height="1"` +
                        (runLength > 1 ? ` colspan="${runLength}"` : "") +
                        `></td>`;
                    x += runLength;
                }
                tableRows += `<tr>${rowHtml}</tr>`;
            }
            resolve(`<section style="padding:16px;background:#f6f8fb;border:1px solid #d8e1ee;border-radius:8px;">
    <head>
        <meta name="color-scheme" content="light">
        <meta name="supported-color-schemes" content="light">
    </head>
    <h3 style="margin:0 0 12px;color:#2B4570;font-family:Arial,sans-serif;">Simple 10% Table: ${safeName}</h3><table cellpadding="0" cellspacing="0" border="0" width="${targetWidth}" height="${targetHeight}" style="border-collapse:collapse;padding:0;border:none;">${tableRows}</table></section>`);
        } catch (error) {
            resolve("");
        }
    });
}
function createHtmlSectionYBoundary(result: TransformedImageResult, fileName: string | null): string {
    const safeName = fileName ? escapeHtmlAttribute(fileName) : "Uploaded image";
    // Build grid for placement
    const grid: (QuadCell | null)[][] = Array.from({ length: result.height }, () => Array(result.width).fill(null));
    result.cells.forEach(cell => {
        for (let dy = 0; dy < cell.height; dy++) {
            for (let dx = 0; dx < cell.width; dx++) {
                const y = cell.y + dy;
                const x = cell.x + dx;
                if (y < result.height && x < result.width) {
                    grid[y][x] = cell;
                }
            }
        }
    });
    let tableRows = "";
    for (let y = 0; y < result.height; y++) {
        let rowHtml = "";
        let x = 0;
        while (x < result.width) {
            const cell = grid[y][x];
            if (!cell) {
                x++;
                continue;
            }
            // Find horizontal run of same color
            let runLength = 1;
            while (x + runLength < result.width && grid[y][x + runLength] && grid[y][x + runLength]?.color === cell.color) {
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
    <h3 style="margin:0 0 12px;color:#2B4570;font-family:Arial,sans-serif;">Horisontal Merge Table: ${safeName}</h3><table cellpadding="0" cellspacing="0" border="0" width="${result.width}" height="${result.height}" style="border-collapse:collapse;padding:0;border:none;">${tableRows}</table></section>`;
}
// Merge adjacent rectangles with same color horizontally and vertically
function mergeRectangles(cells: QuadCell[], width: number, height: number): QuadCell[] {
    // Build grid
    const grid: (QuadCell | null)[][] = Array.from({ length: height }, () => Array(width).fill(null));
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
    // To-fase merge: først horisontal, derefter vertikal
    // 1. Horisontal merge
    const horizontalMerged: QuadCell[] = [];
    for (let y = 0; y < height; y++) {
        let x = 0;
        while (x < width) {
            const cell = grid[y][x];
            if (!cell) {
                x++;
                continue;
            }
            const color = cell.color;
            let maxW = 1;
            while (x + maxW < width && grid[y][x + maxW] && grid[y][x + maxW]?.color === color) {
                maxW++;
            }
            horizontalMerged.push({ x, y, width: maxW, height: 1, color });
            x += maxW;
        }
    }

    // 2. Vertikal merge
    const merged: QuadCell[] = [];
    let used: boolean[][] = Array.from({ length: height }, () => Array(width).fill(false));
    for (let i = 0; i < horizontalMerged.length; i++) {
        const rect = horizontalMerged[i];
        if (used[rect.y][rect.x]) continue;
        let maxH = 1;
        let canExpand = true;
        while (canExpand && rect.y + maxH < height) {
            for (let dx = 0; dx < rect.width; dx++) {
                const nextCell = grid[rect.y + maxH][rect.x + dx];
                if (!nextCell || nextCell.color !== rect.color) {
                    canExpand = false;
                    break;
                }
            }
            if (canExpand) maxH++;
        }
        // Mark used
        for (let dy = 0; dy < maxH; dy++) {
            for (let dx = 0; dx < rect.width; dx++) {
                used[rect.y + dy][rect.x + dx] = true;
            }
        }
        merged.push({ x: rect.x, y: rect.y, width: rect.width, height: maxH, color: rect.color });
    }
    return merged;
}
import { useEffect, useMemo, useState } from "react";
import { Box, Button, Container, Heading, Text, Breadcrumb, Image as ChakraImage, Accordion } from "@chakra-ui/react";
// Placeholder for Resend integration
async function sendHtmlEmail(html: string, subject: string) {
    // POST to backend route instead of calling Resend directly
    const recipients = ["christengc@gmail.com", "christenchristensen@live.dk"];
    const sender = "test@christenchristensen.dk";
    const response = await fetch("https://www.api.christenchristensen.dk/api/send-mail", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            from: sender,
            to: recipients,
            subject,
            html
        })
    });
    if (!response.ok) {
        const text = await response.text();
        throw new Error(text);
    }
}


const fontLuckiestGuy = {
    fontFamily: "LuckiestGuy",
};

type QuadCell = {
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
};

type TransformedImageResult = {
    width: number;
    height: number;
    cells: QuadCell[];
};

function escapeHtmlAttribute(value: string): string {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("\"", "&quot;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");
}

function nextPowerOfTwo(value: number): number {
    let power = 1;
    while (power < value) {
        power *= 2;
    }
    return power;
}

function readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error("Could not read image file."));
        reader.onload = () => resolve(String(reader.result ?? ""));
        reader.readAsDataURL(file);
    });
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new window.Image();
        image.onerror = () => reject(new Error("Could not load image for transformation."));
        image.onload = () => resolve(image);
        image.src = dataUrl;
    });
}

// Helper: RGB to XYZ
function rgbToXyz(r: number, g: number, b: number) {
    // Convert sRGB to linear
    function srgbToLinear(c: number) {
        c = c / 255;
        return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    }
    r = srgbToLinear(r);
    g = srgbToLinear(g);
    b = srgbToLinear(b);
    // Observer = 2°, Illuminant = D65
    const x = r * 0.4124 + g * 0.3576 + b * 0.1805;
    const y = r * 0.2126 + g * 0.7152 + b * 0.0722;
    const z = r * 0.0193 + g * 0.1192 + b * 0.9505;
    return [x, y, z];
}

// Helper: XYZ to Lab
function xyzToLab(x: number, y: number, z: number) {
    // D65 reference white
    const refX = 0.95047;
    const refY = 1.00000;
    const refZ = 1.08883;
    x = x / refX;
    y = y / refY;
    z = z / refZ;
    function f(t: number) {
        return t > 0.008856 ? Math.cbrt(t) : (7.787 * t) + 16 / 116;
    }
    const fx = f(x);
    const fy = f(y);
    const fz = f(z);
    const L = 116 * fy - 16;
    const a = 500 * (fx - fy);
    const b = 200 * (fy - fz);
    return [L, a, b];
}

// Helper: RGB to Lab
function rgbToLab(r: number, g: number, b: number) {
    const [x, y, z] = rgbToXyz(r, g, b);
    return xyzToLab(x, y, z);
}

// Helper: DeltaE (CIE76)
function deltaE(lab1: [number, number, number], lab2: [number, number, number]) {
    return Math.sqrt(
        Math.pow(lab1[0] - lab2[0], 2) +
        Math.pow(lab1[1] - lab2[1], 2) +
        Math.pow(lab1[2] - lab2[2], 2)
    );
}

function calculateRegionStats(imageData: Uint8ClampedArray, imageWidth: number, imageHeight: number, x: number, y: number, size: number) {
    const endX = Math.min(x + size, imageWidth);
    const endY = Math.min(y + size, imageHeight);

    if (x >= imageWidth || y >= imageHeight || endX <= x || endY <= y) {
        return null;
    }

    let sumL = 0, sumA = 0, sumB = 0, count = 0;
    const labPixels: [number, number, number][] = [];

    for (let row = y; row < endY; row++) {
        for (let column = x; column < endX; column++) {
            const index = (row * imageWidth + column) * 4;
            const r = imageData[index];
            const g = imageData[index + 1];
            const b = imageData[index + 2];
            const lab = rgbToLab(r, g, b);
            // Ensure lab is always [number, number, number]
            if (Array.isArray(lab) && lab.length === 3) {
                sumL += lab[0];
                sumA += lab[1];
                sumB += lab[2];
                labPixels.push([lab[0], lab[1], lab[2]]);
            } else {
                // Fallback to [0,0,0] if conversion fails
                labPixels.push([0, 0, 0]);
            }
            count++;
        }
    }

    if (!count) {
        return null;
    }

    const avgL = sumL / count;
    const avgA = sumA / count;
    const avgB_ = sumB / count;
    const avgLab: [number, number, number] = [avgL, avgA, avgB_];

    // Perceptual variance: mean squared ΔE to mean
    let sumDeltaE2 = 0;
    for (let i = 0; i < labPixels.length; i++) {
        const dE = deltaE(labPixels[i], avgLab);
        sumDeltaE2 += dE * dE;
    }
    const variance = sumDeltaE2 / count;

    // For output color, use mean RGB (for compatibility with rest of pipeline)
    let sumR = 0, sumG = 0, sumB2 = 0;
    for (let row = y; row < endY; row++) {
        for (let column = x; column < endX; column++) {
            const index = (row * imageWidth + column) * 4;
            sumR += imageData[index];
            sumG += imageData[index + 1];
            sumB2 += imageData[index + 2];
        }
    }
    const avgR = sumR / count;
    const avgG = sumG / count;
    const avgB = sumB2 / count;

    return {
        avgR,
        avgG,
        avgB,
        variance,
        width: endX - x,
        height: endY - y,
    };
}

function buildQuadtreeCells(imageData: ImageData): QuadCell[] {
    const { width, height, data } = imageData;
    const rootSize = nextPowerOfTwo(Math.max(width, height));
    const minCellSize = MAIL_RENDER_CONFIG.minCellSize;
    const maxDepth = Math.max(1, Math.ceil(Math.log2(rootSize)));
    const cells: QuadCell[] = [];

    // Adaptive max rectangle size based on variance
    function getAdaptiveMaxRect(variance: number) {
        for (const entry of MAIL_RENDER_CONFIG.adaptiveVarianceThresholds) {
            if (variance < entry.threshold) return entry.maxRect;
        }
        return 32; // fallback
    }

    const visitNode = (x: number, y: number, size: number, depth: number) => {
        const stats = calculateRegionStats(data, width, height, x, y, size);
        if (!stats) {
            return;
        }

        const adaptiveMaxRect = getAdaptiveMaxRect(stats.variance);
        // Split hvis størrelsen er større end adaptiveMaxRect, eller hvis størrelsen er større end minCellSize
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
        });
    };

    visitNode(0, 0, rootSize, 0);
    return cells;
}

function createHtmlSectionFromQuadCells(result: TransformedImageResult, fileName: string | null): string {
    const safeName = fileName ? escapeHtmlAttribute(fileName) : "Uploaded image";
    // Merge rectangles
    const mergedCells = mergeRectangles(result.cells, result.width, result.height);
    // Build grid for placement
    const grid: (QuadCell | null)[][] = Array.from({ length: result.height }, () => Array(result.width).fill(null));
    mergedCells.forEach(cell => {
        for (let dy = 0; dy < cell.height; dy++) {
            for (let dx = 0; dx < cell.width; dx++) {
                const y = cell.y + dy;
                const x = cell.x + dx;
                if (y < result.height && x < result.width) {
                    grid[y][x] = cell;
                }
            }
        }
    });
    // Track rendered
    const rendered: boolean[][] = Array.from({ length: result.height }, () => Array(result.width).fill(false));
    let tableRows = "";
    for (let y = 0; y < result.height; y++) {
        let rowHtml = "";
        for (let x = 0; x < result.width;) {
            const cell = grid[y][x];
            if (!cell || rendered[y][x]) {
                x++;
                continue;
            }
            // Convert rgb(...) to hex for bgcolor, use 3-digit if possible
            const rgbMatch = cell.color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
            let hexColor = "#000000";
            if (rgbMatch) {
                // Quantize to 4 bits per channel (16 levels)
                const quantize = (v: number) => Math.floor(v / 16) * 16;
                const r = quantize(parseInt(rgbMatch[1], 10));
                const g = quantize(parseInt(rgbMatch[2], 10));
                const b = quantize(parseInt(rgbMatch[3], 10));
                const toHex = (v: number) => v.toString(16).padStart(2, '0');
                const hex6 = toHex(r) + toHex(g) + toHex(b);
                hexColor = `#${hex6}`;
                // Check if each channel is a double (e.g. aa, bb, cc)
                if (
                    hex6.length === 6 &&
                    hex6[0] === hex6[1] &&
                    hex6[2] === hex6[3] &&
                    hex6[4] === hex6[5]
                ) {
                    hexColor = `#${hex6[0]}${hex6[2]}${hex6[4]}`;
                }
            }
            // Calculate colspan/rowspan
            let colspan = cell.width;
            let rowspan = cell.height;
            // Mark rendered
            for (let dy = 0; dy < rowspan; dy++) {
                for (let dx = 0; dx < colspan; dx++) {
                    if (rendered[y + dy]) {
                        rendered[y + dy][x + dx] = true;
                    }
                }
            }
            // Only add colspan/rowspan if > 1, drop width/height
            let tdAttrs = `bgcolor=${hexColor}`;
            if (colspan > 1) tdAttrs += ` colspan=${colspan}`;
            if (rowspan > 1) tdAttrs += ` rowspan=${rowspan}`;
            rowHtml += `<td ${tdAttrs}></td>`;
            x += colspan;
        }
        tableRows += `<tr>${rowHtml}</tr>`;
    }
    // Minify HTML: remove newlines, spaces, indentation
    let html = `<section style="padding:16px;background:#f6f8fb;border:1px solid #d8e1ee;border-radius:8px;">
    <head>
        <meta name="color-scheme" content="light">
        <meta name="supported-color-schemes" content="light">
    </head>
    <h3 style="margin:0 0 12px;color:#2B4570;font-family:Arial,sans-serif;">Quadtree HTML Table: ${safeName}</h3><table cellpadding="0" cellspacing="0" border="0" width="${result.width}" height="${result.height}" style="border-collapse:collapse;padding:0;border:none;">${tableRows}</table></section>`;
    html = html.replace(/\n/g, '').replace(/\s{2,}/g, '').replace(/>\s+</g, '><');
    return html;
}

function transformImage(file: File): Promise<TransformedImageResult> {
    return new Promise((resolve, reject) => {
        void (async () => {
            try {
                const dataUrl = await readFileAsDataUrl(file);
                const image = await loadImage(dataUrl);

                // Iterativt juster opløsning for at holde filstørrelse under ca. 100 KB
                const maxKB = MAIL_RENDER_CONFIG.maxKB;
                const minKB = MAIL_RENDER_CONFIG.minKB;
                const maxChars = maxKB * 1000;
                const minChars = minKB * 1000;
                const aspectRatio = image.width / image.height;
                const widths = MAIL_RENDER_CONFIG.widths;
                let prevResult: TransformedImageResult | null = null;
                let prevChars = 0;
                // Første step: Gaussian blur på originalt billede
                // Tegn originalbilledet over på et midlertidigt canvas med blur
                const blurSigma = MAIL_RENDER_CONFIG.blurSigma;
                const blurCanvas = document.createElement("canvas");
                blurCanvas.width = image.width;
                blurCanvas.height = image.height;
                const blurCtx = blurCanvas.getContext("2d");
                if (!blurCtx) {
                    reject(new Error("Canvas context for blur could not be created."));
                    return;
                }
                blurCtx.filter = `blur(${blurSigma}px)`;
                blurCtx.drawImage(image, 0, 0, image.width, image.height);

                // Track all attempts for best resolution under maxKB
                const attempts: { width: number; height: number; mergedCount: number; estimatedKB: number; result: TransformedImageResult }[] = [];
                for (let i = 0; i < widths.length; i++) {
                    let targetWidth = Math.min(widths[i], image.width);
                    let targetHeight = Math.max(1, Math.floor(targetWidth / aspectRatio));
                    targetHeight = Math.min(targetHeight, image.height);

                    const canvas = document.createElement("canvas");
                    canvas.width = targetWidth;
                    canvas.height = targetHeight;

                    const context = canvas.getContext("2d", { willReadFrequently: true });
                    if (!context) {
                        reject(new Error("Canvas context could not be created."));
                        return;
                    }

                    context.imageSmoothingEnabled = true;
                    context.drawImage(blurCanvas, 0, 0, image.width, image.height, 0, 0, targetWidth, targetHeight);

                    const pixels = context.getImageData(0, 0, targetWidth, targetHeight);
                    let cells = buildQuadtreeCells(pixels);

                    // Kvantisér farver efter quadtree vha. k-means (palette på kMeansPaletteSize farver)
                    const quantizeColorsKMeans = (cells: QuadCell[], k: number): QuadCell[] => {
                        const colors = cells.map(cell => {
                            const match = cell.color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
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
                    };
                    cells = quantizeColorsKMeans(cells, MAIL_RENDER_CONFIG.kMeansPaletteSize);

                    const beforeMergeCount = cells.length;
                    const mergedRectangles = mergeRectangles(cells, targetWidth, targetHeight);
                    const mergedCount = mergedRectangles.length;
                    const estimatedChars = mergedCount * HTML_RECT_ESTIMATE_CHARS;
                    const estimatedKB = estimatedChars / 1000;

                    console.log(`Iteration ${i + 1}: width=${targetWidth}, height=${targetHeight}, kMeansPaletteSize=${MAIL_RENDER_CONFIG.kMeansPaletteSize}, cellsBeforeMerge=${beforeMergeCount}, mergedRectangles=${mergedCount}, estimatedChars=${estimatedChars}, estimatedKB=${estimatedKB.toFixed(2)}`);

                    attempts.push({ width: targetWidth, height: targetHeight, mergedCount, estimatedKB, result: { width: targetWidth, height: targetHeight, cells: mergedRectangles } });
                }
                // Find best attempt under maxKB
                const best = attempts.filter(a => a.estimatedKB <= maxKB).sort((a, b) => b.width - a.width)[0];
                if (best) {
                    console.log(`Selected attempt: width=${best.width}, height=${best.height}, kMeansPaletteSize=${MAIL_RENDER_CONFIG.kMeansPaletteSize}, mergedRectangles=${best.mergedCount}, estimatedKB=${best.estimatedKB.toFixed(2)}`);
                    resolve(best.result);
                } else {
                    // If none fit, use largest and log
                    const last = attempts[attempts.length - 1];
                    console.log(`Final oversized attempt: width=${last.width}, height=${last.height}, kMeansPaletteSize=${MAIL_RENDER_CONFIG.kMeansPaletteSize}, mergedRectangles=${last.mergedCount}, estimatedKB=${last.estimatedKB.toFixed(2)}`);
                    resolve(last.result);
                }
            } catch (error) {
                reject(error instanceof Error ? error : new Error("Image transformation failed."));
            }
        })();
    });
}

export default function MailRendering() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [originalPreviewUrl, setOriginalPreviewUrl] = useState<string | null>(null);
    const [transformedResult, setTransformedResult] = useState<TransformedImageResult | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [selectedPipeline, setSelectedPipeline] = useState<'rectangle' | 'bsp' | null>(null);

    // Rectangle Cover pipeline
    const imageHtmlSectionRectangleCover = useMemo(() => {
        if (!transformedResult) return "";
        return createHtmlSectionRectangleCover(transformedResult, selectedFile?.name ?? null);
    }, [selectedFile, transformedResult]);

    const mergedRectanglesCount = useMemo(() => {
        if (!transformedResult) return 0;
        return mergeRectangles(transformedResult.cells, transformedResult.width, transformedResult.height).length;
    }, [transformedResult]);

    // BSP Partition pipeline
    const imageHtmlSectionBSPPartition = useMemo(() => {
        if (!transformedResult) return "";
        return createHtmlSectionBSPPartition(transformedResult, selectedFile?.name ?? null);
    }, [selectedFile, transformedResult]);

    const bspRectsCount = useMemo(() => {
        if (!transformedResult) return 0;
        // Collect BSP rectangles
        const safeName = selectedFile?.name ?? null;
        // Reuse BSP logic
        const grid: string[][] = Array.from({ length: transformedResult.height }, () => Array(transformedResult.width).fill(""));
        transformedResult.cells.forEach(cell => {
            for (let dy = 0; dy < cell.height; dy++) {
                for (let dx = 0; dx < cell.width; dx++) {
                    const y = cell.y + dy;
                    const x = cell.x + dx;
                    if (y < transformedResult.height && x < transformedResult.width) {
                        grid[y][x] = cell.color;
                    }
                }
            }
        });
        // Parameters for partitioning
        const minSize = 4;
        const errorThreshold = 12000;
        // BSPNode type
        type BSPNode = {
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
        function regionStats(x: number, y: number, w: number, h: number): { color: string; error: number } {
            let sumR = 0, sumG = 0, sumB = 0, count = 0;
            let error = 0;
            for (let row = y; row < y + h; row++) {
                for (let col = x; col < x + w; col++) {
                    const rgbMatch = grid[row][col].match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
                    let r = 0, g = 0, b = 0;
                    if (rgbMatch) {
                        r = parseInt(rgbMatch[1], 10);
                        g = parseInt(rgbMatch[2], 10);
                        b = parseInt(rgbMatch[3], 10);
                    }
                    sumR += r;
                    sumG += g;
                    sumB += b;
                    count++;
                }
            }
            if (!count) return { color: 'rgb(0,0,0)', error: 0 };
            const avgR = Math.round(sumR / count);
            const avgG = Math.round(sumG / count);
            const avgB = Math.round(sumB / count);
            for (let row = y; row < y + h; row++) {
                for (let col = x; col < x + w; col++) {
                    const rgbMatch = grid[row][col].match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
                    let r = 0, g = 0, b = 0;
                    if (rgbMatch) {
                        r = parseInt(rgbMatch[1], 10);
                        g = parseInt(rgbMatch[2], 10);
                        b = parseInt(rgbMatch[3], 10);
                    }
                    error += Math.pow(r - avgR, 2) + Math.pow(g - avgG, 2) + Math.pow(b - avgB, 2);
                }
            }
            return { color: `rgb(${avgR}, ${avgG}, ${avgB})`, error };
        }
        function bspPartition(x: number, y: number, w: number, h: number, minSize: number, errorThreshold: number): BSPNode {
            const { color, error } = regionStats(x, y, w, h);
            if (w <= minSize && h <= minSize || error < errorThreshold) {
                return { x, y, width: w, height: h, color, error };
            }
            let bestSplit: { dir: 'horizontal' | 'vertical'; pos: number; error: number } | null = null;
            for (let split = 1; split < w; split++) {
                const leftStats = regionStats(x, y, split, h);
                const rightStats = regionStats(x + split, y, w - split, h);
                const totalError = leftStats.error + rightStats.error;
                if (!bestSplit || totalError < bestSplit.error) {
                    bestSplit = { dir: 'vertical', pos: split, error: totalError };
                }
            }
            for (let split = 1; split < h; split++) {
                const topStats = regionStats(x, y, w, split);
                const bottomStats = regionStats(x, y + split, w, h - split);
                const totalError = topStats.error + bottomStats.error;
                if (!bestSplit || totalError < bestSplit.error) {
                    bestSplit = { dir: 'horizontal', pos: split, error: totalError };
                }
            }
            if (!bestSplit) {
                return { x, y, width: w, height: h, color, error };
            }
            if (bestSplit.dir === 'vertical') {
                return {
                    x, y, width: w, height: h, color, error,
                    splitDir: 'vertical', splitPos: bestSplit.pos,
                    left: bspPartition(x, y, bestSplit.pos, h, minSize, errorThreshold),
                    right: bspPartition(x + bestSplit.pos, y, w - bestSplit.pos, h, minSize, errorThreshold)
                };
            } else {
                return {
                    x, y, width: w, height: h, color, error,
                    splitDir: 'horizontal', splitPos: bestSplit.pos,
                    left: bspPartition(x, y, w, bestSplit.pos, minSize, errorThreshold),
                    right: bspPartition(x, y + bestSplit.pos, w, h - bestSplit.pos, minSize, errorThreshold)
                };
            }
        }
        function collectRects(node: BSPNode, rects: BSPNode[]) {
            if (!node.left && !node.right) {
                rects.push(node);
            } else {
                if (node.left) collectRects(node.left, rects);
                if (node.right) collectRects(node.right, rects);
            }
        }
        const root = bspPartition(0, 0, transformedResult.width, transformedResult.height, minSize, errorThreshold);
        const rects: BSPNode[] = [];
        collectRects(root, rects);
        return rects.length;
    }, [transformedResult]);


    const handleImageUpload = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!selectedFile || !selectedPipeline) {
            setErrorMessage("Vælg billede og pipeline.");
            return;
        }

        setErrorMessage(null);
        setIsProcessing(true);

        try {
            const sourcePreview = URL.createObjectURL(selectedFile);
            setOriginalPreviewUrl((previousUrl) => {
                if (previousUrl && previousUrl.startsWith("blob:")) {
                    URL.revokeObjectURL(previousUrl);
                }
                return sourcePreview;
            });

            let transformed: TransformedImageResult;
            if (selectedPipeline === 'bsp') {
                transformed = await transformImageBSP(selectedFile);
            } else {
                transformed = await transformImage(selectedFile);
            }
            setTransformedResult(transformed);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Image transformation failed.";
            setErrorMessage(message);
            setTransformedResult(null);
        } finally {
            setIsProcessing(false);
        }
    };

    // Separate upload handlers for each pipeline
    const handleRectangleUpload = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        setSelectedPipeline('rectangle');
        await handleImageUpload(event as any);
    };
    const handleBspUpload = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        setSelectedPipeline('bsp');
        await handleImageUpload(event as any);
    };

    return (
        <Container>
            <Breadcrumb.Root size="lg" ml={{ base: "0em", sm: "0em", md: "-16em", lg: "-16em" }} mt="0.5em" mb="0.5em">
                <Breadcrumb.List>
                    <Breadcrumb.Item>
                        <Breadcrumb.Link href="../" color="#2B4570">
                            Home
                        </Breadcrumb.Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Separator />
                    <Breadcrumb.Item>
                        <Breadcrumb.Link href="/ongoing" color="#2B4570">
                            Ongoing Work
                        </Breadcrumb.Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Separator />
                    <Breadcrumb.Item>
                        <Breadcrumb.CurrentLink color="#2B4570">Mail Rendering</Breadcrumb.CurrentLink>
                    </Breadcrumb.Item>
                </Breadcrumb.List>
            </Breadcrumb.Root>

            <Box className="dropShadow">
                <Heading as="h2" size="2xl" style={fontLuckiestGuy} mb="1em">
                    Mail Rendering
                </Heading>
                <Text mb="1em">
                    This page will host experiments and demos for rendering email-friendly layouts and components.
                </Text>

                <Box mb="1.5em">
                    <label htmlFor="mail-image-upload" style={{ display: "block", marginBottom: "0.5em", color: "#2B4570", fontWeight: 600 }}>
                        Upload an image
                    </label>
                    <input
                        id="mail-image-upload"
                        type="file"
                        accept="image/*"
                        onChange={(event) => {
                            const file = event.target.files?.[0] ?? null;
                            setSelectedFile(file);
                            setErrorMessage(null);
                        }}
                    />
                    <Box display="flex" gap="1em" mt="1em">
                        <Button
                            bg="cyan.solid"
                            loading={isProcessing}
                            onClick={handleRectangleUpload}
                        >
                            Upload og transform (Rectangle Cover)
                        </Button>
                        <Button
                            bg="purple.solid"
                            loading={isProcessing}
                            onClick={handleBspUpload}
                        >
                            Upload og transform (BSP Partition)
                        </Button>
                    </Box>
                </Box>

                {errorMessage && (
                    <Text color="red.600" mb="1em">
                        {errorMessage}
                    </Text>
                )}

                {originalPreviewUrl && (
                    <Box mb="1.5em">
                        <Heading as="h3" size="md" mb="0.5em">
                            Original image preview
                        </Heading>
                        <ChakraImage
                            src={originalPreviewUrl}
                            alt="Uploaded preview"
                            width={transformedResult ? `${transformedResult.width}px` : "100%"}
                            height={transformedResult ? `${transformedResult.height}px` : "auto"}
                            maxW={transformedResult ? `${transformedResult.width}px` : "600px"}
                            borderRadius="8px"
                            border="1px solid #d8e1ee"
                            objectFit="cover"
                        />
                    </Box>
                )}

                {transformedResult && (
                    <Box mb="1.5em">
                        {selectedPipeline === 'rectangle' && (
                            <>
                                <Heading as="h3" size="md" mb="0.5em">
                                    Rectangle Cover data
                                </Heading>
                                <Text color="#2B4570">
                                    {`Rectangles før merge: ${transformedResult.cells.length} | efter merge: ${mergedRectanglesCount} | Canvas: ${transformedResult.width} x ${transformedResult.height}`}
                                </Text>
                                <Text color="#2B4570" fontSize="sm">
                                    {`Estimeret filstørrelse: ${(mergedRectanglesCount * HTML_RECT_ESTIMATE_CHARS).toLocaleString()} karakterer (baseret på merged)`}
                                </Text>
                                <Text color="#2B4570" fontSize="sm">
                                    {`≈ ${(Math.round((mergedRectanglesCount * HTML_RECT_ESTIMATE_CHARS) / 1000)).toLocaleString()} KB`}
                                </Text>
                                {mergedRectanglesCount * HTML_RECT_ESTIMATE_CHARS > 100000 && (
                                    <Text color="red.600" fontSize="sm" fontWeight="bold">
                                        Advarsel: Det var ikke muligt at holde filstørrelsen under 100 KB med nuværende opløsning.
                                    </Text>
                                )}
                            </>
                        )}
                        {selectedPipeline === 'bsp' && (
                            <>
                                <Heading as="h3" size="md" mb="0.5em">
                                    BSP Partition data
                                </Heading>
                                <Text color="#2B4570">
                                    {`BSP rectangles: ${bspRectsCount} | Canvas: ${transformedResult.width} x ${transformedResult.height}`}
                                </Text>
                                <Text color="#2B4570" fontSize="sm">
                                    {`Estimeret filstørrelse: ${(bspRectsCount * HTML_RECT_ESTIMATE_CHARS).toLocaleString()} karakterer (baseret på BSP)`}
                                </Text>
                                <Text color="#2B4570" fontSize="sm">
                                    {`≈ ${(Math.round((bspRectsCount * HTML_RECT_ESTIMATE_CHARS) / 1000)).toLocaleString()} KB`}
                                </Text>
                                {bspRectsCount * HTML_RECT_ESTIMATE_CHARS > 100000 && (
                                    <Text color="red.600" fontSize="sm" fontWeight="bold">
                                        Advarsel: Det var ikke muligt at holde filstørrelsen under 100 KB med BSP-partition.
                                    </Text>
                                )}
                            </>
                        )}
                    </Box>
                )}

                {/* BSP Partition stats and preview */}

                {imageHtmlSectionRectangleCover && (
                    selectedPipeline === 'rectangle' && (
                        <Box mb="1.5em">
                            <Heading as="h3" size="md" mb="0.5em">
                                Rectangle Cover metode
                            </Heading>
                            <Text mb="1em">HTML genereret ved at dække billedet med størst mulige ensfarvede rektangler (maximal rectangles, greedy).</Text>
                            <Box mb="1em" dangerouslySetInnerHTML={{ __html: imageHtmlSectionRectangleCover }} />
                            <Box display="flex" alignItems="center" mb="0.5em">
                                <Button
                                    size="sm"
                                    colorScheme="cyan"
                                    onClick={async () => {
                                        try {
                                            await navigator.clipboard.writeText(imageHtmlSectionRectangleCover);
                                            setErrorMessage("HTML kopieret!");
                                            setTimeout(() => setErrorMessage(null), 1200);
                                        } catch {
                                            setErrorMessage("Kunne ikke kopiere HTML.");
                                            setTimeout(() => setErrorMessage(null), 1200);
                                        }
                                    }}
                                    mr="1em"
                                >
                                    Kopier HTML
                                </Button>
                                <Button
                                    size="sm"
                                    colorScheme="green"
                                    style={{ display: 'none' }}
                                    onClick={async () => {
                                        await sendHtmlEmail(imageHtmlSectionRectangleCover, "Mail Rendering - Rectangle Cover metode");
                                        setErrorMessage("Email sendt!");
                                        setTimeout(() => setErrorMessage(null), 1200);
                                    }}
                                    mr="1em"
                                >
                                    Send email
                                </Button>
                                {errorMessage && (
                                    <Text color="cyan.700" fontSize="sm">
                                        {errorMessage}
                                    </Text>
                                )}
                            </Box>
                            <Box as="pre" p="1em" borderRadius="8px" bg="#f7f9fc" border="1px solid #d8e1ee" overflowX="auto" whiteSpace="pre-wrap">
                                {imageHtmlSectionRectangleCover || "Ingen HTML blev genereret."}
                            </Box>
                        </Box>
                    )
                )}

                {/* BSP Partition preview */}
                {selectedPipeline === 'bsp' && imageHtmlSectionBSPPartition && (
                    <Box mb="1.5em">
                        <Heading as="h3" size="md" mb="0.5em">
                            BSP Partition metode
                        </Heading>
                        <Text mb="1em">HTML genereret ved error-driven BSP partition af billedet.</Text>
                        <Box mb="1em" dangerouslySetInnerHTML={{ __html: imageHtmlSectionBSPPartition }} />
                        <Box display="flex" alignItems="center" mb="0.5em">
                            <Button
                                size="sm"
                                colorScheme="purple"
                                onClick={async () => {
                                    try {
                                        await navigator.clipboard.writeText(imageHtmlSectionBSPPartition);
                                        setErrorMessage("BSP HTML kopieret!");
                                        setTimeout(() => setErrorMessage(null), 1200);
                                    } catch {
                                        setErrorMessage("Kunne ikke kopiere BSP HTML.");
                                        setTimeout(() => setErrorMessage(null), 1200);
                                    }
                                }}
                                mr="1em"
                            >
                                Kopier BSP HTML
                            </Button>
                        </Box>
                        <Box as="pre" p="1em" borderRadius="8px" bg="#f7f9fc" border="1px solid #d8e1ee" overflowX="auto" whiteSpace="pre-wrap">
                            {imageHtmlSectionBSPPartition || "Ingen BSP HTML blev genereret."}
                        </Box>
                    </Box>
                )}
            </Box>
        </Container>
    );
}
