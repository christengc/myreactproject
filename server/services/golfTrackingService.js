import fs from 'fs';
import path from 'path';

// Gemmer videoen midlertidigt og returnerer stien
import { fileURLToPath } from 'url';

import { spawn } from 'child_process';
import os from 'os';

export const saveAndProcessVideo = async (file) => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const tempDir = path.join(__dirname, 'tmp');
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }
    const jobId = Math.random().toString(36).substr(2, 9); // Simpelt jobId
    const tempPath = path.join(tempDir, jobId + '_' + file.originalname);
    // Flyt filen til tmp-mappen
    fs.renameSync(file.path, tempPath);
    return { tempPath, jobId };
};

// Start the Python save_video.py process with input and output video paths
export const runPythonProcess = (inputVideoPath, onProgress) => {
    return new Promise((resolve, reject) => {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const scriptPath = path.join(__dirname, 'python', 'save_video.py');

        const ext = path.extname(inputVideoPath);
        const base = inputVideoPath.slice(0, -ext.length);
        const outputVideoPath = `${base}_tracked.mp4`;

        const pythonCmd = os.platform() === 'win32' ? 'python' : 'python3';
        const python = spawn(pythonCmd, [scriptPath, inputVideoPath, outputVideoPath], {
            cwd: path.join(__dirname, 'python'),
        });
        let output = '';
        let error = '';
        python.stdout.on('data', (data) => {
            output += data.toString();
        });
        python.stderr.on('data', (data) => {
            const text = data.toString();
            const lines = text.split('\n');
            for (const line of lines) {
                const match = line.match(/^PROGRESS:(\d+)$/);
                if (match && onProgress) {
                    onProgress(parseInt(match[1], 10));
                } else if (line.trim()) {
                    error += line + '\n';
                }
            }
        });
        python.on('close', (code) => {
            if (code === 0) {
                resolve(outputVideoPath);
            } else {
                reject(error || `Python process exited with code ${code}`);
            }
        });
        python.on('error', (err) => {
            reject(err.message);
        });
    });
};
