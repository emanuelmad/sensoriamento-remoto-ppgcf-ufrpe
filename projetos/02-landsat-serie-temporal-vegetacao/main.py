from __future__ import annotations

import argparse
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.append(str(ROOT))

from scripts.rs_utils import (  # noqa: E402
    compute_ndvi,
    read_raster,
    save_single_band_preview,
    write_raster,
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Compara NDVI entre duas datas Landsat.")
    parser.add_argument("--red-t1", required=True, help="Banda vermelha da data 1.")
    parser.add_argument("--nir-t1", required=True, help="Banda NIR da data 1.")
    parser.add_argument("--red-t2", required=True, help="Banda vermelha da data 2.")
    parser.add_argument("--nir-t2", required=True, help="Banda NIR da data 2.")
    parser.add_argument("--outdir", default="resultados", help="Diretorio de saida.")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    outdir = Path(args.outdir)
    outdir.mkdir(parents=True, exist_ok=True)

    red_t1, profile = read_raster(args.red_t1)
    nir_t1, _ = read_raster(args.nir_t1)
    red_t2, _ = read_raster(args.red_t2)
    nir_t2, _ = read_raster(args.nir_t2)

    ndvi_t1 = compute_ndvi(nir_t1, red_t1)
    ndvi_t2 = compute_ndvi(nir_t2, red_t2)
    delta_ndvi = ndvi_t2 - ndvi_t1

    save_single_band_preview(ndvi_t1, outdir / "ndvi_t1.png", title="NDVI t1", cmap="YlGn")
    save_single_band_preview(ndvi_t2, outdir / "ndvi_t2.png", title="NDVI t2", cmap="YlGn")
    save_single_band_preview(
        delta_ndvi,
        outdir / "delta_ndvi.png",
        title="Delta NDVI",
        cmap="RdYlGn",
    )

    write_raster(ndvi_t1, profile, outdir / "ndvi_t1.tif")
    write_raster(ndvi_t2, profile, outdir / "ndvi_t2.tif")
    write_raster(delta_ndvi, profile, outdir / "delta_ndvi.tif")

    print(f"Delta NDVI medio: {float(delta_ndvi.mean()):.4f}")
    print(f"Arquivos gerados em: {outdir.resolve()}")


if __name__ == "__main__":
    main()
