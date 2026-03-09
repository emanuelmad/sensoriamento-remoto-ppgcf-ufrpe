"""Funcoes didaticas para aulas de sensoriamento remoto."""

from __future__ import annotations

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
    """Resume uma banda com metricas simples."""
    return {
        "min": float(np.nanmin(array)),
        "max": float(np.nanmax(array)),
        "mean": float(np.nanmean(array)),
        "std": float(np.nanstd(array)),
    }


def compute_ndvi(nir: np.ndarray, red: np.ndarray) -> np.ndarray:
    """Calcula o NDVI com protecao contra divisao por zero."""
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
    """Plota uma banda unica."""
    fig, ax = plt.subplots(figsize=(6, 5))
    image = ax.imshow(array, cmap=cmap)
    ax.set_title(title)
    ax.set_axis_off()
    fig.colorbar(image, ax=ax, shrink=0.75)
    plt.tight_layout()


def plot_rgb(red: np.ndarray, green: np.ndarray, blue: np.ndarray, title: str) -> None:
    """Plota uma composicao RGB com realce simples."""
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


def stack_features(scene: dict[str, np.ndarray], band_names: Iterable[str]) -> np.ndarray:
    """Empilha bandas 2D em uma matriz 2D para aprendizado de maquina."""
    return np.column_stack([scene[band].ravel() for band in band_names])


def make_synthetic_scene(height: int = 240, width: int = 240, seed: int = 42) -> dict[str, np.ndarray]:
    """Gera uma cena sintetica com tres classes para fins didaticos.

    Classes:
    0 = agua
    1 = vegetacao
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
