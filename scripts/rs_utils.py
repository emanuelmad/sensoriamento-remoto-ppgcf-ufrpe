"""Funções didáticas para aulas de sensoriamento remoto."""

from __future__ import annotations

from pathlib import Path
from typing import Iterable

import matplotlib.pyplot as plt
import numpy as np


def percentile_stretch(array: np.ndarray, lower: float = 2, upper: float = 98) -> np.ndarray:
    """Aplica realce por percentis e devolve valores entre 0 e 1."""
    low, high = np.nanpercentile(array, [lower, upper])
    if np.isclose(high, low):
        return np.zeros_like(array, dtype=float)
    stretched = (array - low) / (high - low)
    return np.clip(stretched, 0.0, 1.0)


def describe_band(array: np.ndarray) -> dict[str, float]:
    """Resume uma banda com métricas simples."""
    return {
        "min": float(np.nanmin(array)),
        "max": float(np.nanmax(array)),
        "mean": float(np.nanmean(array)),
        "std": float(np.nanstd(array)),
    }


def compute_ndvi(nir: np.ndarray, red: np.ndarray) -> np.ndarray:
    """Calcula o NDVI com proteção contra divisão por zero."""
    denominator = nir + red
    return np.divide(
        nir - red,
        denominator,
        out=np.zeros_like(nir, dtype=float),
        where=~np.isclose(denominator, 0),
    )


def compute_ndwi(green: np.ndarray, nir: np.ndarray) -> np.ndarray:
    """Calcula o NDWI (McFeeters)."""
    denominator = green + nir
    return np.divide(
        green - nir,
        denominator,
        out=np.zeros_like(green, dtype=float),
        where=~np.isclose(denominator, 0),
    )


def plot_single_band(array: np.ndarray, title: str, cmap: str = "viridis") -> None:
    """Plota uma banda única."""
    fig, ax = plt.subplots(figsize=(6, 5))
    image = ax.imshow(array, cmap=cmap)
    ax.set_title(title)
    ax.set_axis_off()
    fig.colorbar(image, ax=ax, shrink=0.75)
    plt.tight_layout()


def plot_rgb(red: np.ndarray, green: np.ndarray, blue: np.ndarray, title: str) -> None:
    """Plota uma composição RGB com realce simples."""
    rgb = np.dstack(
        [
            percentile_stretch(red),
            percentile_stretch(green),
            percentile_stretch(blue),
        ]
    )
    fig, ax = plt.subplots(figsize=(6, 6))
    ax.imshow(rgb)
    ax.set_title(title)
    ax.set_axis_off()
    plt.tight_layout()


def read_raster(path: str | Path, band_index: int = 1) -> tuple[np.ndarray, dict]:
    """Lê uma banda raster e retorna array e perfil."""
    import rasterio

    with rasterio.open(path) as src:
        array = src.read(band_index).astype("float32")
        profile = src.profile.copy()
    return array, profile


def write_raster(
    array: np.ndarray,
    reference_profile: dict,
    output_path: str | Path,
    dtype: str = "float32",
) -> None:
    """Escreve um raster de banda única usando o perfil de referência."""
    import rasterio

    profile = reference_profile.copy()
    profile.update(dtype=dtype, count=1)
    output = Path(output_path)
    output.parent.mkdir(parents=True, exist_ok=True)

    with rasterio.open(output, "w", **profile) as dst:
        dst.write(array.astype(dtype), 1)


def save_single_band_preview(
    array: np.ndarray,
    output_path: str | Path,
    title: str,
    cmap: str = "viridis",
) -> None:
    """Salva a visualização de uma banda ou índice em PNG."""
    fig, ax = plt.subplots(figsize=(6, 5))
    image = ax.imshow(array, cmap=cmap)
    ax.set_title(title)
    ax.set_axis_off()
    fig.colorbar(image, ax=ax, shrink=0.75)
    output = Path(output_path)
    output.parent.mkdir(parents=True, exist_ok=True)
    plt.tight_layout()
    fig.savefig(output, dpi=180, bbox_inches="tight")
    plt.close(fig)


def save_rgb_preview(
    red: np.ndarray,
    green: np.ndarray,
    blue: np.ndarray,
    output_path: str | Path,
    title: str,
) -> None:
    """Salva composição RGB em PNG."""
    rgb = np.dstack(
        [
            percentile_stretch(red),
            percentile_stretch(green),
            percentile_stretch(blue),
        ]
    )
    fig, ax = plt.subplots(figsize=(6, 6))
    ax.imshow(rgb)
    ax.set_title(title)
    ax.set_axis_off()
    output = Path(output_path)
    output.parent.mkdir(parents=True, exist_ok=True)
    plt.tight_layout()
    fig.savefig(output, dpi=180, bbox_inches="tight")
    plt.close(fig)


def stack_features(scene: dict[str, np.ndarray], band_names: Iterable[str]) -> np.ndarray:
    """Empilha bandas 2D em uma matriz 2D para aprendizado de máquina."""
    return np.column_stack([scene[band].ravel() for band in band_names])


def make_synthetic_scene(height: int = 240, width: int = 240, seed: int = 42) -> dict[str, np.ndarray]:
    """Gera uma cena sintética com três classes para fins didáticos.

    Classes:
    0 = água
    1 = vegetação
    2 = solo exposto
    """
    rng = np.random.default_rng(seed)
    y, x = np.mgrid[0:height, 0:width]

    water = (x < width * 0.30) & (y > height * 0.18)
    vegetation = (x >= width * 0.30) & (y < height * 0.62)
    bare_soil = ~(water | vegetation)

    landcover = np.zeros((height, width), dtype=np.uint8)
    landcover[vegetation] = 1
    landcover[bare_soil] = 2

    texture = rng.normal(0, 0.015, size=(height, width))
    slope = (x / width) * 0.04 + (y / height) * 0.02

    red = np.zeros((height, width), dtype=float)
    green = np.zeros_like(red)
    blue = np.zeros_like(red)
    nir = np.zeros_like(red)
    swir1 = np.zeros_like(red)

    red[water] = 0.05
    green[water] = 0.07
    blue[water] = 0.10
    nir[water] = 0.02
    swir1[water] = 0.01

    red[vegetation] = 0.07
    green[vegetation] = 0.11
    blue[vegetation] = 0.05
    nir[vegetation] = 0.48
    swir1[vegetation] = 0.18

    red[bare_soil] = 0.22
    green[bare_soil] = 0.18
    blue[bare_soil] = 0.12
    nir[bare_soil] = 0.26
    swir1[bare_soil] = 0.31

    for band in (red, green, blue, nir, swir1):
        band += texture + slope
        band += rng.normal(0, 0.01, size=(height, width))
        np.clip(band, 0.0, 1.0, out=band)

    return {
        "blue": blue,
        "green": green,
        "red": red,
        "nir": nir,
        "swir1": swir1,
        "landcover": landcover,
    }
