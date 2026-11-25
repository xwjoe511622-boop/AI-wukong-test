from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
source = Image.open(root / 'public/assets/nav-source.png').convert('RGBA')
print('Navigation source:', source.size)

# The checkerboard is baked into the supplied image, so neutral background
# pixels must be removed before cropping the gold artwork.
def remove_checker(image):
    pixels = []
    for r, g, b, a in image.getdata():
        chroma = max(r, g, b) - min(r, g, b)
        if min(r, g, b) > 65:
            # Luminance keys retain the alternating light/dark squares inside
            # gold glows. Channel differences cancel the neutral checkerboard.
            opacity = max(0, min(1, (chroma - 22) / 105))
            if opacity > 0:
                neutral = min(r, g, b) * (1 - opacity)
                r, g, b = [round(max(0, min(255, (c - neutral) / opacity))) for c in (r, g, b)]
            a = round(a * opacity)
        pixels.append((r, g, b, a) if a else (0, 0, 0, 0))
    image.putdata(pixels)
    return image

source = remove_checker(source)
# Equal canvases preserve a consistent scale and baseline in both states.
centers = [150, 414, 694, 949, 1235, 1487, 1772, 2026]
names = ['home', 'world', 'house', 'me']
for index, center in enumerate(centers):
    tile = source.crop((center - 137, 45, center + 137, 377))
    state = 'active' if index % 2 else 'default'
    tile.save(root / f'public/assets/nav-{names[index // 2]}-{state}.png', optimize=True)

# Reuse the original cloud endcaps and an undecorated section of its rail;
# do not keep the four baked-in icons/text underneath the clickable buttons.
rail = source.crop((0, 465, 2172, 675))
center_strip = source.crop((610, 465, 670, 675))
for x in range(275, 1900, 60):
    width = min(60, 1900 - x)
    rail.paste(center_strip.crop((0, 0, width, 210)), (x, 0))
rail.save(root / 'public/assets/nav-rail.png', optimize=True)
