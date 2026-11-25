from pathlib import Path
import subprocess
import imageio_ffmpeg

root = Path(__file__).resolve().parents[1] / 'public/assets/cultivation'
ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
for stage in ('stone', 'young', 'adult', 'bimawen', 'qitian'):
    source = root / f'{stage}.mp4'
    frames = imageio_ffmpeg.read_frames(str(source))
    metadata = next(frames)
    print(stage, metadata)
    frames.close()
    subprocess.run([ffmpeg, '-y', '-i', str(source), '-frames:v', '1', '-vf', 'scale=960:-2', '-q:v', '3', str(root / f'{stage}.jpg')], check=True, capture_output=True)
