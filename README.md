
For Marp presentations, just run `npm run start`.

 - 2025-06-17: ZuBerlin Cryptography Day; [streamed on X](https://x.com/i/broadcasts/1yNGaLvpdZgKj)
 - 2025-07-11: Ethproofs Call #3; [Youtube](https://youtu.be/D2TpmD62tjQ?feature=shared)

## QR codes

Generated with the Python `qrcode` library (`pip install qrcode[pil]`):

```python
import qrcode
from qrcode.image.styledpil import StyledPilImage
from qrcode.image.styles.colormasks import SolidFillColorMask

qr = qrcode.QRCode(version=1, error_correction=qrcode.constants.ERROR_CORRECT_H, box_size=10, border=2)
qr.add_data('https://codygunton.github.io/talks-and-writing/2026-02-13-ethboulder/')
qr.make(fit=True)
img = qr.make_image(
    image_factory=StyledPilImage,
    color_mask=SolidFillColorMask(back_color=(24, 30, 38), front_color=(138, 191, 249))
)
img.save('2026-02-13-ethboulder/images/qr-slides.png')
```

Colors match the zkevm theme: `#8abff9` foreground on `#181e26` background.
