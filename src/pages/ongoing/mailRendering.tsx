// --- CONFIGURATION ---
const MAIL_RENDER_CONFIG = {
    blurSigma: 1.5, // Gaussian blur strength
    minCellSize: 4, // Minimum quadtree cell size
    adaptiveVarianceThresholds: [
        { threshold: 200, maxRect: 128 },
        { threshold: 1200, maxRect: 64 },
        { threshold: Infinity, maxRect: 32 },
    ],
    kMeansPaletteSize: 1024, // Number of colors for k-means quantization
    widths: [150, 200, 210, 220, 230, 240, 250, 260, 270, 280, 290, 300, 325, 350, 375, 400, 450, 500, 700, 900, 1200, 1500, 2000],
    maxKB: 90,
    minKB: 80,
};
// Rectangle covering pipeline: maximal rectangles (greedy)
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
    const response = await fetch("/api/send-mail", {
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
                    // Brug det slørede billede som input til nedskalering
                    context.drawImage(blurCanvas, 0, 0, image.width, image.height, 0, 0, targetWidth, targetHeight);

                    const pixels = context.getImageData(0, 0, targetWidth, targetHeight);
                    let cells = buildQuadtreeCells(pixels);

                    // Kvantisér farver efter quadtree vha. k-means (palette på kMeansPaletteSize farver)
                    const quantizeColorsKMeans = (cells: QuadCell[], k: number): QuadCell[] => {
                        // Saml alle farver
                        const colors = cells.map(cell => {
                            const match = cell.color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
                            if (!match) return [0,0,0];
                            return [parseInt(match[1],10), parseInt(match[2],10), parseInt(match[3],10)];
                        });
                        // Initier k tilfældige farver som centroids
                        const centroids = colors.slice(0, k);
                        while (centroids.length < k && colors.length > 0) {
                            centroids.push(colors[Math.floor(Math.random()*colors.length)]);
                        }
                        let changed = true;
                        let assignments = new Array(colors.length).fill(0);
                        let iter = 0;
                        while (changed && iter < 10) {
                            changed = false;
                            // Assign
                            for (let i = 0; i < colors.length; i++) {
                                let minDist = Infinity, minIdx = 0;
                                for (let c = 0; c < centroids.length; c++) {
                                    const d = Math.pow(colors[i][0]-centroids[c][0],2)+Math.pow(colors[i][1]-centroids[c][1],2)+Math.pow(colors[i][2]-centroids[c][2],2);
                                    if (d < minDist) { minDist = d; minIdx = c; }
                                }
                                if (assignments[i] !== minIdx) { changed = true; assignments[i] = minIdx; }
                            }
                            // Update centroids
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
                        // Erstat farver i celler med nærmeste centroid
                        return cells.map((cell, i) => {
                            const c = centroids[assignments[i]];
                            return { ...cell, color: `rgb(${c[0]}, ${c[1]}, ${c[2]})` };
                        });
                    };
                    cells = quantizeColorsKMeans(cells, MAIL_RENDER_CONFIG.kMeansPaletteSize);

                    const mergedCount = mergeRectangles(cells, targetWidth, targetHeight).length;
                    const estimatedChars = mergedCount * 46;
                    const estimatedKB = estimatedChars / 1000;

                    // Log resolution and estimated size for each iteration
                    console.log(`Iteration ${i + 1}: width=${targetWidth}, height=${targetHeight}, mergedRectangles=${mergedCount}, estimatedChars=${estimatedChars}, estimatedKB=${estimatedKB.toFixed(2)}`);

                    if (estimatedKB > maxKB && prevResult) {
                        // Log the oversized attempt as well
                        console.log(`Oversized attempt: width=${targetWidth}, height=${targetHeight}, mergedRectangles=${mergedCount}, estimatedChars=${estimatedChars}, estimatedKB=${estimatedKB.toFixed(2)}`);
                        resolve(prevResult);
                        return;
                    }
                    prevResult = { width: targetWidth, height: targetHeight, cells };
                    prevChars = estimatedChars;
                }
                // Hvis ingen kom over 100 KB, brug den største
                if (prevResult) {
                    // Log the final oversized attempt if it was never resolved
                    const mergedCount = mergeRectangles(prevResult.cells, prevResult.width, prevResult.height).length;
                    const estimatedChars = mergedCount * 46;
                    const estimatedKB = estimatedChars / 1000;
                    console.log(`Final attempt: width=${prevResult.width}, height=${prevResult.height}, mergedRectangles=${mergedCount}, estimatedChars=${estimatedChars}, estimatedKB=${estimatedKB.toFixed(2)}`);
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

export default function MailRendering() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [originalPreviewUrl, setOriginalPreviewUrl] = useState<string | null>(null);
    const [transformedResult, setTransformedResult] = useState<TransformedImageResult | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Rectangle covering pipeline only
    const imageHtmlSectionRectangleCover = useMemo(() => {
        if (!transformedResult) return "";
        return createHtmlSectionRectangleCover(transformedResult, selectedFile?.name ?? null);
    }, [selectedFile, transformedResult]);

    // Beregn mergeRectangles hvis transformedResult findes
    const mergedRectanglesCount = useMemo(() => {
        if (!transformedResult) return 0;
        // mergeRectangles kræver width, height, cells
        return mergeRectangles(transformedResult.cells, transformedResult.width, transformedResult.height).length;
    }, [transformedResult]);

    const handleImageUpload = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!selectedFile) {
            setErrorMessage("Please choose an image first.");
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

            const transformed = await transformImage(selectedFile);
            setTransformedResult(transformed);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Image transformation failed.";
            setErrorMessage(message);
            setTransformedResult(null);
        } finally {
            setIsProcessing(false);
        }
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

                <form onSubmit={handleImageUpload}>
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
                        <Button type="submit" bg="cyan.solid" mt="1em" loading={isProcessing}>
                            Upload and transform
                        </Button>
                    </Box>
                </form>

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
                        <Heading as="h3" size="md" mb="0.5em">
                            Rectangle Cover data
                        </Heading>
                        <Text color="#2B4570">
                            {`Rectangles før merge: ${transformedResult.cells.length} | efter merge: ${mergedRectanglesCount} | Canvas: ${transformedResult.width} x ${transformedResult.height}`}
                        </Text>
                        <Text color="#2B4570" fontSize="sm">
                            {`Estimeret filstørrelse: ${(mergedRectanglesCount * 46).toLocaleString()} karakterer (baseret på merged)`}
                        </Text>
                        <Text color="#2B4570" fontSize="sm">
                            {`≈ ${(Math.round((mergedRectanglesCount * 46) / 1000)).toLocaleString()} KB`}
                        </Text>
                        {mergedRectanglesCount * 46 > 100000 && (
                            <Text color="red.600" fontSize="sm" fontWeight="bold">
                                Advarsel: Det var ikke muligt at holde filstørrelsen under 100 KB med nuværende opløsning.
                            </Text>
                        )}
                    </Box>
                )}

                {imageHtmlSectionRectangleCover && (
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
                )}
            </Box>
        </Container>
    );
}
