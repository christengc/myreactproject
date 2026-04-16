import { saveAndProcessVideo, runPythonProcess } from '../services/golfTrackingService.js';

// In-memory job status store
const jobStatusMap = {};

// POST /api/track-golf-video
const trackGolfVideo = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No video file uploaded.' });
        }
        // Save and process video, generate jobId
        const { tempPath, jobId } = await saveAndProcessVideo(req.file);
        // Start Python process
        runPythonProcess(tempPath)
            .then((outputPath) => {
                jobStatusMap[jobId] = { status: 'done', outputPath };
            })
            .catch((err) => {
                console.error(`[GolfTracking] Job ${jobId} failed:`, err);
                jobStatusMap[jobId] = 'error';
            });
        // Set initial status
        jobStatusMap[jobId] = 'processing';
        res.status(200).json({ message: 'Video received and processing started.', jobId });
    } catch (err) {
        res.status(500).json({ error: 'Server error', details: err.message });
    }
};

// Export jobStatusMap for use in route
export { trackGolfVideo, jobStatusMap };
