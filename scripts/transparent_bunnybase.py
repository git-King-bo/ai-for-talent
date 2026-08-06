from collections import deque
from pathlib import Path

from PIL import Image, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
RAW_DIR = ROOT / "assets" / "bunnyBaseRaw"
OUT_DIR = ROOT / "assets" / "bunnyBase"

BACKGROUND_BRIGHTNESS_MIN = 232
BACKGROUND_SPREAD_MAX = 34
SIDE_SEED_HEIGHT_RATIO = 0.88
BRIDGE_BREAK_ITERATIONS = 2


def is_background(pixel):
    r, g, b = pixel
    bright = (r + g + b) / 3
    spread = max(pixel) - min(pixel)
    return bright >= BACKGROUND_BRIGHTNESS_MIN and spread <= BACKGROUND_SPREAD_MAX


def keep_largest_foreground_component(mask, width, height):
    visited = bytearray(width * height)
    largest_component = []

    for y in range(height):
        for x in range(width):
            index = y * width + x
            if visited[index] or not mask[index]:
                continue

            component = []
            queue = deque([(x, y)])
            visited[index] = 1

            while queue:
                current_x, current_y = queue.popleft()
                current_index = current_y * width + current_x
                component.append(current_index)

                for next_x in (current_x - 1, current_x, current_x + 1):
                    if next_x < 0 or next_x >= width:
                        continue
                    for next_y in (current_y - 1, current_y, current_y + 1):
                        if next_y < 0 or next_y >= height:
                            continue

                        next_index = next_y * width + next_x
                        if visited[next_index] or not mask[next_index]:
                            continue

                        visited[next_index] = 1
                        queue.append((next_x, next_y))

            if len(component) > len(largest_component):
                largest_component = component

    cleaned = bytearray(width * height)
    for index in largest_component:
        cleaned[index] = 1

    return cleaned


def break_thin_background_bridges(mask, width, height):
    mask_image = Image.frombytes(
        "L",
        (width, height),
        bytes(255 if value else 0 for value in mask),
    )

    for _ in range(BRIDGE_BREAK_ITERATIONS):
        mask_image = mask_image.filter(ImageFilter.MinFilter(3))

    eroded = bytearray(1 if value else 0 for value in mask_image.tobytes())
    cleaned = keep_largest_foreground_component(eroded, width, height)
    mask_image = Image.frombytes(
        "L",
        (width, height),
        bytes(255 if value else 0 for value in cleaned),
    )

    for _ in range(BRIDGE_BREAK_ITERATIONS):
        mask_image = mask_image.filter(ImageFilter.MaxFilter(3))

    return bytearray(1 if value else 0 for value in mask_image.tobytes())


def make_alpha(image_path: Path, out_path: Path) -> None:
    img = Image.open(image_path).convert("RGB")
    width, height = img.size
    pixels = img.load()

    background = bytearray(width * height)
    queue = deque()

    def index_for(x, y):
        return y * width + x

    for x in range(width):
        y = 0
        index = index_for(x, y)
        if not background[index] and is_background(pixels[x, y]):
            background[index] = 1
            queue.append((x, y))

    for y in range(0, int(height * SIDE_SEED_HEIGHT_RATIO)):
        for x in (0, width - 1):
            index = index_for(x, y)
            if not background[index] and is_background(pixels[x, y]):
                background[index] = 1
                queue.append((x, y))

    while queue:
        x, y = queue.popleft()
        for nx in (x - 1, x, x + 1):
            if nx < 0 or nx >= width:
                continue
            for ny in (y - 1, y, y + 1):
                if ny < 0 or ny >= height:
                    continue
                index = index_for(nx, ny)
                if background[index]:
                    continue
                if is_background(pixels[nx, ny]):
                    background[index] = 1
                    queue.append((nx, ny))

    foreground = bytearray(1 if not value else 0 for value in background)
    foreground = break_thin_background_bridges(foreground, width, height)

    out = Image.new("RGBA", (width, height))
    out_pixels = out.load()

    for x in range(width):
        for y in range(height):
            r, g, b = pixels[x, y]
            if foreground[index_for(x, y)]:
                out_pixels[x, y] = (r, g, b, 255)
            else:
                out_pixels[x, y] = (r, g, b, 0)

    out.save(out_path)


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for image_path in sorted(RAW_DIR.glob("*.png")):
        make_alpha(image_path, OUT_DIR / image_path.name)


if __name__ == "__main__":
    main()
