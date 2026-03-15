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
                    // Convert rgb(...) to hex for bgcolor
                    const hexColor = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
                    rowHtml += `<td bgcolor="${hexColor}" width="${runLength}" height="1"` +
                        (runLength > 1 ? ` colspan="${runLength}"` : "") +
                        `></td>`;
                    x += runLength;
                }
                tableRows += `<tr>${rowHtml}</tr>`;
            }
            resolve(`<section style="padding:16px;background:#f6f8fb;border:1px solid #d8e1ee;border-radius:8px;"><h3 style="margin:0 0 12px;color:#2B4570;font-family:Arial,sans-serif;">Simple 10% Table: ${safeName}</h3><table cellpadding="0" cellspacing="0" border="0" width="${targetWidth}" height="${targetHeight}" style="border-collapse:collapse;padding:0;border:none;">${tableRows}</table></section>`);
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
    return `<section style="padding:16px;background:#f6f8fb;border:1px solid #d8e1ee;border-radius:8px;"><h3 style="margin:0 0 12px;color:#2B4570;font-family:Arial,sans-serif;">Horisontal Merge Table: ${safeName}</h3><table cellpadding="0" cellspacing="0" border="0" width="${result.width}" height="${result.height}" style="border-collapse:collapse;padding:0;border:none;">${tableRows}</table></section>`;
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
    // Merge horizontally
    const merged: QuadCell[] = [];
    const used: boolean[][] = Array.from({ length: height }, () => Array(width).fill(false));
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; ) {
            const cell = grid[y][x];
            if (!cell || used[y][x]) {
                x++;
                continue;
            }
            // Expand horizontally
            let w = 1;
            while (x + w < width && grid[y][x + w] && grid[y][x + w]?.color === cell.color && !used[y][x + w]) {
                w++;
            }
            // Expand vertically
            let h = 1;
            let canExpand = true;
            while (y + h < height && canExpand) {
                for (let dx = 0; dx < w; dx++) {
                    if (!grid[y + h][x + dx] || grid[y + h][x + dx]?.color !== cell.color || used[y + h][x + dx]) {
                        canExpand = false;
                        break;
                    }
                }
                if (canExpand) h++;
            }
            // Mark used
            for (let dy = 0; dy < h; dy++) {
                for (let dx = 0; dx < w; dx++) {
                    used[y + dy][x + dx] = true;
                }
            }
            merged.push({ x, y, width: w, height: h, color: cell.color });
            x += w;
        }
    }
    return merged;
}
import { useEffect, useMemo, useState } from "react";
import { Box, Button, Container, Heading, Text, Breadcrumb, Image as ChakraImage, Accordion } from "@chakra-ui/react";


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

function calculateRegionStats(imageData: Uint8ClampedArray, imageWidth: number, imageHeight: number, x: number, y: number, size: number) {
    const endX = Math.min(x + size, imageWidth);
    const endY = Math.min(y + size, imageHeight);

    if (x >= imageWidth || y >= imageHeight || endX <= x || endY <= y) {
        return null;
    }

    let sumR = 0;
    let sumG = 0;
    let sumB = 0;
    let sumSqR = 0;
    let sumSqG = 0;
    let sumSqB = 0;
    let count = 0;

    for (let row = y; row < endY; row++) {
        for (let column = x; column < endX; column++) {
            const index = (row * imageWidth + column) * 4;
            const red = imageData[index];
            const green = imageData[index + 1];
            const blue = imageData[index + 2];

            sumR += red;
            sumG += green;
            sumB += blue;
            sumSqR += red * red;
            sumSqG += green * green;
            sumSqB += blue * blue;
            count++;
        }
    }

    if (!count) {
        return null;
    }

    const avgR = sumR / count;
    const avgG = sumG / count;
    const avgB = sumB / count;

    const varianceR = sumSqR / count - avgR * avgR;
    const varianceG = sumSqG / count - avgG * avgG;
    const varianceB = sumSqB / count - avgB * avgB;

    return {
        avgR,
        avgG,
        avgB,
        variance: varianceR + varianceG + varianceB,
        width: endX - x,
        height: endY - y,
    };
}

function buildQuadtreeCells(imageData: ImageData): QuadCell[] {
    const { width, height, data } = imageData;
    const rootSize = nextPowerOfTwo(Math.max(width, height));
    const minCellSize = 4;
    const varianceThreshold = 1200;
    const maxDepth = Math.max(1, Math.ceil(Math.log2(rootSize)));
    const cells: QuadCell[] = [];

    const visitNode = (x: number, y: number, size: number, depth: number) => {
        const stats = calculateRegionStats(data, width, height, x, y, size);
        if (!stats) {
            return;
        }

        const shouldSplit = size > minCellSize && depth < maxDepth && stats.variance > varianceThreshold;
        if (!shouldSplit) {
            cells.push({
                x,
                y,
                width: stats.width,
                height: stats.height,
                color: `rgb(${Math.round(stats.avgR)}, ${Math.round(stats.avgG)}, ${Math.round(stats.avgB)})`,
            });
            return;
        }

        const half = Math.max(1, Math.floor(size / 2));
        visitNode(x, y, half, depth + 1);
        visitNode(x + half, y, half, depth + 1);
        visitNode(x, y + half, half, depth + 1);
        visitNode(x + half, y + half, half, depth + 1);
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
            // Convert rgb(...) to hex for bgcolor
            const rgbMatch = cell.color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
            let hexColor = "#000000";
            if (rgbMatch) {
                const r = parseInt(rgbMatch[1], 10);
                const g = parseInt(rgbMatch[2], 10);
                const b = parseInt(rgbMatch[3], 10);
                hexColor = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
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
            rowHtml += `<td bgcolor="${hexColor}" width="1" height="1"` +
                (colspan > 1 ? ` colspan="${colspan}"` : "") +
                (rowspan > 1 ? ` rowspan="${rowspan}"` : "") +
                `></td>`;
            x += colspan;
        }
        tableRows += `<tr>${rowHtml}</tr>`;
    }
    // Table style: minified, only essential props
    return `<section style="padding:16px;background:#f6f8fb;border:1px solid #d8e1ee;border-radius:8px;"><h3 style="margin:0 0 12px;color:#2B4570;font-family:Arial,sans-serif;">Quadtree HTML Table: ${safeName}</h3><table cellpadding="0" cellspacing="0" border="0" width="${result.width}" height="${result.height}" style="border-collapse:collapse;padding:0;border:none;">${tableRows}</table></section>`;
}

function transformImage(file: File): Promise<TransformedImageResult> {
    return new Promise((resolve, reject) => {
        void (async () => {
            try {
                const dataUrl = await readFileAsDataUrl(file);
                const image = await loadImage(dataUrl);

                // Use 20% resolution.
                const targetWidth = Math.max(1, Math.floor(image.width * 0.2));
                const targetHeight = Math.max(1, Math.floor(image.height * 0.2));

                const canvas = document.createElement("canvas");
                canvas.width = targetWidth;
                canvas.height = targetHeight;

                const context = canvas.getContext("2d", { willReadFrequently: true });
                if (!context) {
                    reject(new Error("Canvas context could not be created."));
                    return;
                }

                context.imageSmoothingEnabled = true;
                context.drawImage(image, 0, 0, targetWidth, targetHeight);

                const pixels = context.getImageData(0, 0, targetWidth, targetHeight);
                const cells = buildQuadtreeCells(pixels);

                resolve({ width: targetWidth, height: targetHeight, cells });
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

    const imageHtmlSection = useMemo(() => {
        if (!transformedResult) {
            return "";
        }
        return createHtmlSectionFromQuadCells(transformedResult, selectedFile?.name ?? null);
    }, [selectedFile, transformedResult]);

    // New y-boundary method
    const imageHtmlSectionYBoundary = useMemo(() => {
        if (!transformedResult) {
            return "";
        }
        return createHtmlSectionYBoundary(transformedResult, selectedFile?.name ?? null);
    }, [selectedFile, transformedResult]);

    // Third method: simple 10% scale, 1 cell per pixel, horizontal merge only
    const [imageHtmlSectionSimple, setImageHtmlSectionSimple] = useState<string>("");
    useEffect(() => {
        if (!selectedFile) {
            setImageHtmlSectionSimple("");
            return;
        }
        createHtmlSectionSimple10pct(selectedFile, selectedFile?.name ?? null, originalPreviewUrl).then(setImageHtmlSectionSimple);
    }, [selectedFile, originalPreviewUrl]);
    useEffect(() => {
        return () => {
            if (originalPreviewUrl && originalPreviewUrl.startsWith("blob:")) {
                URL.revokeObjectURL(originalPreviewUrl);
            }
        };
    }, [originalPreviewUrl]);

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

    // DOM element count for generated HTML
    const domElementCountClassic = useMemo(() => {
        if (!imageHtmlSection) return 0;
        const match = imageHtmlSection.match(/<table[\s\S]*<\/table>/);
        const tableHtml = match ? match[0] : imageHtmlSection;
        const tagMatches = tableHtml.match(/<\/?[a-zA-Z]+/g);
        return tagMatches ? tagMatches.length : 0;
    }, [imageHtmlSection]);
    const domElementCountHorizontal = useMemo(() => {
        if (!imageHtmlSectionYBoundary) return 0;
        const match = imageHtmlSectionYBoundary.match(/<table[\s\S]*<\/table>/);
        const tableHtml = match ? match[0] : imageHtmlSectionYBoundary;
        const tagMatches = tableHtml.match(/<\/?[a-zA-Z]+/g);
        return tagMatches ? tagMatches.length : 0;
    }, [imageHtmlSectionYBoundary]);
    const domElementCountSimple = useMemo(() => {
        if (!imageHtmlSectionSimple) return 0;
        const match = imageHtmlSectionSimple.match(/<table[\s\S]*<\/table>/);
        const tableHtml = match ? match[0] : imageHtmlSectionSimple;
        const tagMatches = tableHtml.match(/<\/?[a-zA-Z]+/g);
        return tagMatches ? tagMatches.length : 0;
    }, [imageHtmlSectionSimple]);

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
                            Quadtree data
                        </Heading>
                        <Text color="#2B4570">
                            {`Squares: ${transformedResult.cells.length} | Canvas: ${transformedResult.width} x ${transformedResult.height}`}
                        </Text>
                    </Box>
                )}

                {(imageHtmlSection || imageHtmlSectionYBoundary || imageHtmlSectionSimple) && (
                    <Accordion.Root collapsible defaultValue={["classic", "horizontal", "simple"]}>
                        <Accordion.Item value="classic">
                            <Accordion.ItemTrigger>
                                <Box as="span" flex="1" textAlign="left" fontWeight="semibold" fontSize="18px">Klassisk metode</Box>
                                <Accordion.ItemIndicator />
                            </Accordion.ItemTrigger>
                            <Accordion.ItemContent>
                                <Accordion.ItemBody>
                                    <Text mb="1em">HTML genereret med klassisk quadtree + rectangle merge.</Text>
                                    {imageHtmlSection ? (
                                        <Box mb="1em" dangerouslySetInnerHTML={{ __html: imageHtmlSection }} />
                                    ) : (
                                        <Text color="red.600" mb="1em">Ingen HTML blev genereret. Prøv at uploade et billede igen.</Text>
                                    )}
                                    <Text fontSize="sm" color="gray.600" mb={1}>Antal DOM elementer: {domElementCountClassic}</Text>
                                    <Box display="flex" alignItems="center" mb="0.5em">
                                        <Button
                                            size="sm"
                                            colorScheme="cyan"
                                            onClick={async () => {
                                                try {
                                                    await navigator.clipboard.writeText(imageHtmlSection);
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
                                        {errorMessage && (
                                            <Text color="cyan.700" fontSize="sm">
                                                {errorMessage}
                                            </Text>
                                        )}
                                    </Box>
                                    <Box as="pre" p="1em" borderRadius="8px" bg="#f7f9fc" border="1px solid #d8e1ee" overflowX="auto" whiteSpace="pre-wrap">
                                        {imageHtmlSection || "Ingen HTML blev genereret."}
                                    </Box>
                                </Accordion.ItemBody>
                            </Accordion.ItemContent>
                        </Accordion.Item>
                        <Accordion.Item value="horizontal">
                            <Accordion.ItemTrigger>
                                <Box as="span" flex="1" textAlign="left" fontWeight="semibold" fontSize="18px">Horisontal merge metode</Box>
                                <Accordion.ItemIndicator />
                            </Accordion.ItemTrigger>
                            <Accordion.ItemContent>
                                <Accordion.ItemBody>
                                    <Text mb="1em">HTML genereret ved at slå sammen vandrette celler med samme farve til én td med colspan.</Text>
                                    {imageHtmlSectionYBoundary ? (
                                        <Box mb="1em" dangerouslySetInnerHTML={{ __html: imageHtmlSectionYBoundary }} />
                                    ) : (
                                        <Text color="red.600" mb="1em">Ingen HTML blev genereret. Prøv at uploade et billede igen.</Text>
                                    )}
                                    <Text fontSize="sm" color="gray.600" mb={1}>Antal DOM elementer: {domElementCountHorizontal}</Text>
                                    <Box display="flex" alignItems="center" mb="0.5em">
                                        <Button
                                            size="sm"
                                            colorScheme="cyan"
                                            onClick={async () => {
                                                try {
                                                    await navigator.clipboard.writeText(imageHtmlSectionYBoundary);
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
                                        {errorMessage && (
                                            <Text color="cyan.700" fontSize="sm">
                                                {errorMessage}
                                            </Text>
                                        )}
                                    </Box>
                                    <Box as="pre" p="1em" borderRadius="8px" bg="#f7f9fc" border="1px solid #d8e1ee" overflowX="auto" whiteSpace="pre-wrap">
                                        {imageHtmlSectionYBoundary || "Ingen HTML blev genereret."}
                                    </Box>
                                </Accordion.ItemBody>
                            </Accordion.ItemContent>
                        </Accordion.Item>
                        <Accordion.Item value="simple">
                            <Accordion.ItemTrigger>
                                <Box as="span" flex="1" textAlign="left" fontWeight="semibold" fontSize="18px">Simpel 10% metode</Box>
                                <Accordion.ItemIndicator />
                            </Accordion.ItemTrigger>
                            <Accordion.ItemContent>
                                <Accordion.ItemBody>
                                    <Text mb="1em">HTML genereret ved at skalere billedet til 10% og lave én celle pr. pixel, kun med horisontal merge.</Text>
                                    {imageHtmlSectionSimple ? (
                                        <Box mb="1em" dangerouslySetInnerHTML={{ __html: imageHtmlSectionSimple }} />
                                    ) : (
                                        <Text color="red.600" mb="1em">Ingen HTML blev genereret. Prøv at uploade et billede igen.</Text>
                                    )}
                                    <Text fontSize="sm" color="gray.600" mb={1}>Antal DOM elementer: {domElementCountSimple}</Text>
                                    <Box display="flex" alignItems="center" mb="0.5em">
                                        <Button
                                            size="sm"
                                            colorScheme="cyan"
                                            onClick={async () => {
                                                try {
                                                    await navigator.clipboard.writeText(imageHtmlSectionSimple);
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
                                        {errorMessage && (
                                            <Text color="cyan.700" fontSize="sm">
                                                {errorMessage}
                                            </Text>
                                        )}
                                    </Box>
                                    <Box as="pre" p="1em" borderRadius="8px" bg="#f7f9fc" border="1px solid #d8e1ee" overflowX="auto" whiteSpace="pre-wrap">
                                        {imageHtmlSectionSimple || "Ingen HTML blev genereret."}
                                    </Box>
                                </Accordion.ItemBody>
                            </Accordion.ItemContent>
                        </Accordion.Item>
                    </Accordion.Root>
                )}
            </Box>
        </Container>
    );
}
