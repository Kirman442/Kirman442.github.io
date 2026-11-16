"""Create responsive WebP previews without changing accepted source images.

Run with a Python installation containing Pillow. Originals remain untouched.
"""
import argparse
import json
import re
from pathlib import Path

from PIL import Image, ImageOps

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--preview-quality', type=int, default=76,
                    help='WebP preview quality, 1-100 (default: 76)')
args = parser.parse_args()
if not 1 <= args.preview_quality <= 100:
    parser.error('--preview-quality must be between 1 and 100')

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
sources = re.findall(r"image:'([^']+)'", (ROOT / "src/projects.js").read_text(encoding="utf-8"))
manifest = {}
for source in dict.fromkeys(sources):
    original = PUBLIC / source.lstrip("/")
    # Always derive EnergieAtlas from its preserved PNG master, even on reruns.
    if original.stem == "energieatlas-aerial-coast-v1":
        original = original.with_suffix(".png")
    with Image.open(original) as opened:
        image = ImageOps.exif_transpose(opened).convert("RGB")
        width, height = image.size
        cover = source
        if original.suffix.lower() == ".png":
            target = original.with_suffix(".webp")
            image.save(target, "WEBP", quality=86, method=6)
            cover = "/" + target.relative_to(PUBLIC).as_posix()
        variants = []
        preview_dir = PUBLIC / "assets/previews"
        preview_dir.mkdir(exist_ok=True)
        for size in sorted({min(width, size) for size in [160, 192, 256, 320, 384, 480, 640, 960, 1280]}):
            target = preview_dir / f"{original.stem}-{size}.webp"
            resized = image.resize((size, round(height * size / width)), Image.Resampling.LANCZOS)
            resized.save(target, "WEBP", quality=args.preview_quality, method=6)
            variants.append({"src": "/" + target.relative_to(PUBLIC).as_posix(), "width": size})
        manifest[cover] = {"width": width, "height": height, "variants": variants}
        print(f"{original.name}: {width}x{height}, {len(variants)} previews")

(ROOT / "src/project-images.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
