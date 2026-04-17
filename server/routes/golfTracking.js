import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { trackGolfVideo, jobStatusMap } from '../controllers/golfTrackingController.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// POST /api/track-golf-video
router.post('/track-golf-video', upload.single('video'), trackGolfVideo);

// GET /api/track-golf-video-status/:jobId
router.get('/track-golf-video-status/:jobId', async (req, res) => {
    const { jobId } = req.params;
    const entry = jobStatusMap[jobId];
    if (!entry) {
        return res.json({ status: 'not_found' });
    }
    if (typeof entry === 'object') {
        return res.json({ status: entry.status, progress: entry.progress ?? null });
    }
    res.json({ status: entry });
});

// GET /api/track-golf-video-result/:jobId — stream the tracked video
router.get('/track-golf-video-result/:jobId', async (req, res) => {
    const { jobId } = req.params;
    const entry = jobStatusMap[jobId];
    if (!entry || typeof entry !== 'object' || entry.status !== 'done') {
        return res.status(404).json({ error: 'Video not ready or not found.' });
    }
    const filePath = entry.outputPath;
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Output file not found on server.' });
    }
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const ext = path.extname(filePath).toLowerCase();
    const mimeMap = { '.mp4': 'video/mp4', '.webm': 'video/webm', '.avi': 'video/x-msvideo', '.mov': 'video/quicktime' };
    const contentType = mimeMap[ext] || 'video/mp4';

    const range = req.headers.range;
    if (range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunkSize = end - start + 1;
        const readStream = fs.createReadStream(filePath, { start, end });
        res.writeHead(206, {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunkSize,
            'Content-Type': contentType,
        });
        readStream.pipe(res);
    } else {
        res.writeHead(200, {
            'Content-Length': fileSize,
            'Content-Type': contentType,
            'Accept-Ranges': 'bytes',
        });
        fs.createReadStream(filePath).pipe(res);
    }
});

export default router;
