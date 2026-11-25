from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

assets = Path(__file__).resolve().parents[1] / 'public' / 'assets'
source = Image.open(assets / 'action-buttons-source.png').convert('RGBA')
pixels = np.array(source)
labels, _ = ndimage.label(pixels[:, :, 3] > 10)
sizes = np.bincount(labels.ravel())
components = sorted(np.argsort(sizes[1:])[-3:] + 1, key=lambda item: -sizes[item])
major = np.where(np.isin(labels, components), labels, 0)
distance, nearest = ndimage.distance_transform_edt(major == 0, return_indices=True)
ownership = major[tuple(nearest)]

# Faint glows join the top and middle silhouettes. Assign those pixels to
# their nearest opaque silhouette rather than cutting across either frame.
for variant, component in zip(('long', 'medium', 'short'), components):
    isolated = pixels.copy()
    isolated[(ownership != component) | (distance > 8)] = 0
    image = Image.fromarray(isolated)
    bounds = image.getbbox()
    image = image.crop(bounds)
    image.thumbnail((1200, 300), Image.Resampling.LANCZOS)
    image.save(assets / f'action-button-{variant}.png', optimize=True)
    print(variant, bounds, image.size)

for stage in ('stone', 'young', 'adult', 'bimawen', 'qitian'):
    image = Image.open(assets / f'realm-{stage}.png')
    image.thumbnail((1200, 800), Image.Resampling.LANCZOS)
    image.save(assets / f'realm-{stage}.webp', quality=88, method=6)
