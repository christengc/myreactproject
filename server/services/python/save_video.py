"""Non-interactive mode: process the video and save the annotated result.

Usage:
    python save_video.py                        # uses defaults from config
    python save_video.py input.mp4              # custom input, default output name
    python save_video.py input.mp4 output.mp4   # custom input and output

Exit codes:
    0 - Success: output video was written and is non-empty.
    1 - Failure: input not found, output missing/empty, or unhandled exception.
        Fatal errors are printed to stderr even when SILENT mode is on.

Check exit code on the server:
    Bash:       python save_video.py in.mp4 out.mp4 ; echo $?
    PowerShell: python save_video.py in.mp4 out.mp4 ; $LASTEXITCODE
"""
import sys
import os

from video_processor import VideoProcessor
from config import DEFAULT_VIDEO_PATH
import config


def main():
    video_path = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_VIDEO_PATH

    if len(sys.argv) > 2:
        output_path = sys.argv[2]
    else:
        base, ext = os.path.splitext(video_path)
        output_path = f"{base}_tracked{ext}"

    # Disable evaluation (no COCO json needed on server)
    config.ENABLE_EVALUATION = False
    # Suppress all console output (keep stderr for progress + fatal errors)
    config.SILENT = True

    # Keep a reference to real stderr so progress and fatal errors are always visible
    real_stderr = sys.stderr

    if config.SILENT:
        sys.stdout = open(os.devnull, 'w')
        sys.stderr = open(os.devnull, 'w')

    # Pass real_stderr to config so VideoProcessor can report progress
    config._real_stderr = real_stderr

    try:
        if not os.path.isfile(video_path):
            print(f"ERROR: Input video not found: {video_path}", file=real_stderr)
            sys.exit(1)

        processor = VideoProcessor(video_path, headless=True, output_path=output_path)
        processor.run()

        # Verify output was actually written
        if not os.path.isfile(output_path) or os.path.getsize(output_path) == 0:
            print(f"ERROR: Output video is missing or empty: {output_path}", file=real_stderr)
            sys.exit(1)

    except Exception as e:
        print(f"ERROR: {e}", file=real_stderr)
        sys.exit(1)

    sys.exit(0)


if __name__ == "__main__":
    main()
