#!/usr/bin/env python3
"""Generate a themed QR code for a talk in this repo.

Usage:
    ./make-qr.py <talk-dir> [url]

If <url> is omitted, defaults to
    https://codygunton.github.io/talks-and-writing/<talk-dir>/

Writes <talk-dir>/assets/qr.png. Requires `pip install qrcode[pil]`.
Colors match the zkevm theme: #8abff9 on #181e26.
"""
import sys
from pathlib import Path

import qrcode
from qrcode.image.styledpil import StyledPilImage
from qrcode.image.styles.colormasks import SolidFillColorMask


def main() -> int:
    if len(sys.argv) < 2 or len(sys.argv) > 3:
        print(__doc__, file=sys.stderr)
        return 2

    talk = Path(sys.argv[1].rstrip("/"))
    url = sys.argv[2] if len(sys.argv) == 3 else (
        f"https://codygunton.github.io/talks-and-writing/{talk.name}/"
    )

    out_dir = talk / "assets"
    if not out_dir.is_dir():
        print(f"error: {out_dir} does not exist", file=sys.stderr)
        return 1
    out = out_dir / "qr.png"

    qr = qrcode.QRCode(
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=2,
    )
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(
        image_factory=StyledPilImage,
        color_mask=SolidFillColorMask(
            back_color=(24, 30, 38), front_color=(138, 191, 249)
        ),
    )
    img.save(out)
    print(f"wrote {out} -> {url}")
    print()
    print("Paste into slides.md:")
    print()
    print(f"    {url}")
    print()
    print('    <img src="assets/qr.png" alt="QR code to slides" style="width:140px;border-radius:0;">')
    return 0


if __name__ == "__main__":
    sys.exit(main())
