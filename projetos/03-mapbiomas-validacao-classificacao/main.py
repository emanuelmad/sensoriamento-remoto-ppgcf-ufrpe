from __future__ import annotations

import argparse
import sys
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
from sklearn.metrics import ConfusionMatrixDisplay, classification_report, confusion_matrix


ROOT = Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.append(str(ROOT))

from scripts.rs_utils import read_raster  # noqa: E402


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Valida uma classificação raster com matriz de confusão.")
    parser.add_argument("--reference", required=True, help="Raster de referência.")
    parser.add_argument("--prediction", required=True, help="Raster classificado.")
    parser.add_argument("--outdir", default="resultados", help="Diretório de saída.")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    outdir = Path(args.outdir)
    outdir.mkdir(parents=True, exist_ok=True)

    reference, _ = read_raster(args.reference)
    prediction, _ = read_raster(args.prediction)

    mask = np.isfinite(reference) & np.isfinite(prediction)
    y_true = reference[mask].astype(int).ravel()
    y_pred = prediction[mask].astype(int).ravel()

    labels = sorted(set(y_true.tolist()) | set(y_pred.tolist()))
    cm = confusion_matrix(y_true, y_pred, labels=labels)
    report = classification_report(y_true, y_pred, labels=labels, zero_division=0)

    (outdir / "classification_report.txt").write_text(report, encoding="utf-8")

    fig, ax = plt.subplots(figsize=(6, 6))
    ConfusionMatrixDisplay(confusion_matrix=cm, display_labels=labels).plot(cmap="Greens", ax=ax)
    ax.set_title("Matriz de confusão")
    plt.tight_layout()
    fig.savefig(outdir / "confusion_matrix.png", dpi=180, bbox_inches="tight")
    plt.close(fig)

    print(report)
    print(f"Arquivos gerados em: {outdir.resolve()}")


if __name__ == "__main__":
    main()
