import { useEffect, useMemo, useState } from "react";
import { Box, Button, Container, Heading, Text, Breadcrumb, Image as ChakraImage } from "@chakra-ui/react";

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
    // Build a grid for table placement
    const grid: (QuadCell | null)[][] = Array.from({ length: result.height }, () => Array(result.width).fill(null));
    // Mark cells in grid
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
    // Track which cells have been rendered
    const rendered: boolean[][] = Array.from({ length: result.height }, () => Array(result.width).fill(false));
    // Build table rows
    let tableRows = "";
    for (let y = 0; y < result.height; y++) {
        let rowHtml = "";
        for (let x = 0; x < result.width; x++) {
            const cell = grid[y][x];
            if (!cell || !cell.color) {
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
            rowHtml += `<td bgcolor="${hexColor}"></td>`;
        }
        tableRows += `<tr>${rowHtml}</tr>`;
    }
    // Table style: minified, only essential props
    return `<section style="padding:16px;background:#f6f8fb;border:1px solid #d8e1ee;border-radius:8px;"><h3 style="margin:0 0 12px;color:#2B4570;font-family:Arial,sans-serif;">Quadtree HTML Table: ${safeName}</h3><table cellpadding="0" cellspacing="0" border="0" width="768" style="border-collapse:collapse;padding:0;border:none;width:1px;height:1px;">${tableRows}</table></section>`;
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

                {imageHtmlSection && (
                    <Box>
                        <Heading as="h3" size="md" mb="0.5em">
                            HTML section (rendered)
                        </Heading>
                        <Box mb="1em" dangerouslySetInnerHTML={{ __html: imageHtmlSection }} />

                        <Heading as="h3" size="md" mb="0.5em">
                            HTML section (code)
                        </Heading>
                        <Box as="pre" p="1em" borderRadius="8px" bg="#f7f9fc" border="1px solid #d8e1ee" overflowX="auto" whiteSpace="pre-wrap">
                            {imageHtmlSection && (
                                <Box>
                                    <Heading as="h3" size="md" mb="0.5em">
                                        HTML section (rendered)
                                    </Heading>
                                    <Box mb="1em" dangerouslySetInnerHTML={{ __html: imageHtmlSection }} />

                                    <Heading as="h3" size="md" mb="0.5em">
                                        HTML section (code)
                                    </Heading>
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
                                        {imageHtmlSection}
                                    </Box>
                                </Box>
                            )}
                        </Box>
                    </Box>
                )}
            </Box>
        </Container>
        )
    }
