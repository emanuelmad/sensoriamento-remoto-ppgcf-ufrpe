from __future__ import annotations

import argparse
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.append(str(ROOT))

from scripts.rs_utils import (  # noqa: E402
    compute_ndvi,
    compute_ndwi,
    read_raster,
    save_rgb_preview,
    save_single_band_preview,
    write_raster,
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Gera RGB, NDVI e NDWI a partir de bandas Sentinel-2.")
    parser.add_argument("--blue", required=True, help="Caminho da banda B02.")
    parser.add_argument("--green", required=True, help="Caminho da banda B03.")
    parser.add_argument("--red", required=True, help="Caminho da banda B04.")
    parser.add_argument("--nir", required=True, help="Caminho da banda B08.")
    parser.add_argument("--outdir", default="resultados", help="Diretorio de saida.")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    outdir = Path(args.outdir)
    outdir.mkdir(parents=True, exist_ok=True)

    blue, profile = read_raster(args.blue)
    green, _ = read_raster(args.green)
    red, _ = read_raster(args.red)
    nir, _ = read_raster(args.nir)

    ndvi = compute_ndvi(nir, red)
    ndwi = compute_ndwi(green, nir)

    save_rgb_preview(red, green, blue, outdir / "rgb.png", title="Sentinel-2 RGB")
    save_single_band_preview(ndvi, outdir / "ndvi.png", title="NDVI", cmap="YlGn")
    save_single_band_preview(ndwi, outdir / "ndwi.png", title="NDWI", cmap="Blues")
    write_raster(ndvi, profile, outdir / "ndvi.tif")
    write_raster(ndwi, profile, outdir / "ndwi.tif")

    print(f"Arquivos gerados em: {outdir.resolve()}")


if __name__ == "__main__":
    main()
