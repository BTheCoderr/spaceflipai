#!/usr/bin/env python3
"""Generate simple visible SpaceFlip Pro placeholder PNG assets (stdlib only)."""

from __future__ import annotations

import struct
import zlib
from pathlib import Path

GREEN = (27, 67, 50)
GOLD = (184, 134, 11)
WHITE = (255, 255, 255)
BG = (250, 250, 248)

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"


def new_canvas(width: int, height: int, color: tuple[int, int, int]) -> list[list[tuple[int, int, int]]]:
    return [[color for _ in range(width)] for _ in range(height)]


def fill_rect(
    pixels: list[list[tuple[int, int, int]]],
    x: int,
    y: int,
    w: int,
    h: int,
    color: tuple[int, int, int],
) -> None:
    height = len(pixels)
    width = len(pixels[0])
    for row in range(max(0, y), min(y + h, height)):
        for col in range(max(0, x), min(x + w, width)):
            pixels[row][col] = color


def in_rounded_rect(px: int, py: int, x: int, y: int, w: int, h: int, r: int) -> bool:
    if px < x or py < y or px >= x + w or py >= y + h:
        return False
    if px < x + r and py < y + r:
        return (px - (x + r)) ** 2 + (py - (y + r)) ** 2 <= r * r
    if px >= x + w - r and py < y + r:
        return (px - (x + w - r - 1)) ** 2 + (py - (y + r)) ** 2 <= r * r
    if px < x + r and py >= y + h - r:
        return (px - (x + r)) ** 2 + (py - (y + h - r - 1)) ** 2 <= r * r
    if px >= x + w - r and py >= y + h - r:
        return (px - (x + w - r - 1)) ** 2 + (py - (y + h - r - 1)) ** 2 <= r * r
    return True


def draw_rounded_rect(
    pixels: list[list[tuple[int, int, int]]],
    x: int,
    y: int,
    w: int,
    h: int,
    r: int,
    color: tuple[int, int, int],
) -> None:
    for row in range(y, y + h):
        for col in range(x, x + w):
            if in_rounded_rect(col, row, x, y, w, h, r):
                pixels[row][col] = color


def draw_arrow(pixels: list[list[tuple[int, int, int]]], x: int, y: int, size: int) -> None:
    thickness = max(4, size // 14)
    shaft_len = size // 2
    for i in range(shaft_len):
        fill_rect(pixels, x + i, y + size // 2 - thickness // 2, thickness, thickness, GOLD)
    head = size // 5
    for i in range(head):
        fill_rect(
            pixels,
            x + shaft_len - thickness + i,
            y + size // 2 - thickness // 2 - i,
            thickness,
            thickness + 2 * i,
            GOLD,
        )


def draw_sf_mark(
    pixels: list[list[tuple[int, int, int]]],
    cx: int,
    cy: int,
    box: int,
    *,
    green_bg: bool = True,
) -> None:
    x = cx - box // 2
    y = cy - box // 2
    radius = max(8, box // 8)

    if green_bg:
        draw_rounded_rect(pixels, x, y, box, box, radius, GREEN)
        fg = WHITE
    else:
        fg = GREEN

    letter_h = int(box * 0.42)
    letter_w = int(box * 0.16)
    gap = int(box * 0.08)
    stroke = max(3, box // 18)
    left_x = cx - letter_w - gap // 2
    right_x = cx + gap // 2
    top_y = cy - letter_h // 2

    # S
    fill_rect(pixels, left_x, top_y, letter_w, stroke, fg)
    fill_rect(pixels, left_x, top_y, stroke, letter_h // 2, fg)
    fill_rect(pixels, left_x, top_y + letter_h // 2 - stroke, letter_w, stroke, fg)
    fill_rect(pixels, left_x + letter_w - stroke, top_y + letter_h // 2, stroke, letter_h // 2, fg)
    fill_rect(pixels, left_x, top_y + letter_h - stroke, letter_w, stroke, fg)

    # F
    fill_rect(pixels, right_x, top_y, letter_w, stroke, fg)
    fill_rect(pixels, right_x, top_y, stroke, letter_h, fg)
    fill_rect(pixels, right_x, top_y + letter_h // 2 - stroke // 2, int(letter_w * 0.72), stroke, fg)

    draw_arrow(pixels, x + int(box * 0.58), y + int(box * 0.62), int(box * 0.28))


def write_png(path: Path, pixels: list[list[tuple[int, int, int]]]) -> None:
    height = len(pixels)
    width = len(pixels[0])
    raw = bytearray()
    for row in pixels:
        raw.append(0)
        for r, g, b in row:
            raw.extend((r, g, b))

    compressed = zlib.compress(bytes(raw), 9)

    def chunk(tag: bytes, data: bytes) -> bytes:
        return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)

    png = b"\x89PNG\r\n\x1a\n"
    png += chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0))
    png += chunk(b"IDAT", compressed)
    png += chunk(b"IEND", b"")
    path.write_bytes(png)


def make_icon(size: int) -> list[list[tuple[int, int, int]]]:
    pixels = new_canvas(size, size, GREEN)
    draw_sf_mark(pixels, size // 2, size // 2, int(size * 0.72), green_bg=False)
    # Re-draw on green: white SF inside implied by green_bg=False using white on green
    # Actually green_bg=False uses GREEN fg on GREEN bg - fix: full green, white mark
    pixels = new_canvas(size, size, GREEN)
    box = int(size * 0.62)
    letter_h = int(box * 0.42)
    letter_w = int(box * 0.16)
    gap = int(box * 0.08)
    stroke = max(4, box // 16)
    cx, cy = size // 2, size // 2
    left_x = cx - letter_w - gap // 2
    right_x = cx + gap // 2
    top_y = cy - letter_h // 2
    fill_rect(pixels, left_x, top_y, letter_w, stroke, WHITE)
    fill_rect(pixels, left_x, top_y, stroke, letter_h // 2, WHITE)
    fill_rect(pixels, left_x, top_y + letter_h // 2 - stroke, letter_w, stroke, WHITE)
    fill_rect(pixels, left_x + letter_w - stroke, top_y + letter_h // 2, stroke, letter_h // 2, WHITE)
    fill_rect(pixels, left_x, top_y + letter_h - stroke, letter_w, stroke, WHITE)
    fill_rect(pixels, right_x, top_y, letter_w, stroke, WHITE)
    fill_rect(pixels, right_x, top_y, stroke, letter_h, WHITE)
    fill_rect(pixels, right_x, top_y + letter_h // 2 - stroke // 2, int(letter_w * 0.72), stroke, WHITE)
    draw_arrow(pixels, cx + int(box * 0.08), cy + int(box * 0.08), int(box * 0.34))
    return pixels


def make_splash(width: int, height: int) -> list[list[tuple[int, int, int]]]:
    pixels = new_canvas(width, height, BG)
    box = min(width, height) // 3
    draw_sf_mark(pixels, width // 2, height // 2 - height // 16, box, green_bg=True)
    return pixels


def main() -> None:
    ASSETS.mkdir(parents=True, exist_ok=True)
    write_png(ASSETS / "icon.png", make_icon(1024))
    write_png(ASSETS / "adaptive-icon.png", make_icon(1024))
    write_png(ASSETS / "favicon.png", make_icon(192))
    write_png(ASSETS / "splash.png", make_splash(1284, 2778))
    print("Wrote icon.png, adaptive-icon.png, favicon.png, splash.png")


if __name__ == "__main__":
    main()
