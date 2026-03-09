"""Extrai códigos por unidade de um documento .docx para arquivos .js.

Uso:
    python scripts/import_curso_gee_pet_docx.py \
        --input "C:\\caminho\\Curso_GEE_PET.docx"
"""

from __future__ import annotations

import argparse
import re
import unicodedata
import xml.etree.ElementTree as ET
from pathlib import Path
from zipfile import ZipFile


NS = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
SECTION_RE = re.compile(r"^\s*(?://)?\s*Unidade\s+\d+(?:\.\d+)?\s*-\s*(.+?)\s*$", re.IGNORECASE)
SECTION_FULL_RE = re.compile(r"^\s*(?://)?\s*(Unidade\s+\d+(?:\.\d+)?\s*-\s*.+?)\s*$", re.IGNORECASE)
OPEN_COMMENT_RE = re.compile(r"^/\*{5,}\s*$")


def slugify(text: str) -> str:
    normalized = unicodedata.normalize("NFKD", text)
    ascii_text = normalized.encode("ascii", "ignore").decode("ascii")
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", ascii_text.lower()).strip("-")
    return slug


def read_docx_lines(docx_path: Path) -> list[str]:
    with ZipFile(docx_path) as archive:
        root = ET.fromstring(archive.read("word/document.xml"))

    lines: list[str] = []
    for paragraph in root.findall(".//w:p", NS):
        text = "".join(node.text or "" for node in paragraph.findall(".//w:t", NS)).rstrip()
        if text.strip():
            lines.append(text)
    return lines


def split_sections(lines: list[str]) -> list[list[str]]:
    starts = [
        index
        for index, line in enumerate(lines)
        if SECTION_FULL_RE.match(line)
    ]
    starts.append(len(lines))

    sections: list[list[str]] = []
    for index in range(len(starts) - 1):
        start, end = starts[index], starts[index + 1]
        if end > 0 and OPEN_COMMENT_RE.match(lines[end - 1].strip()):
            end -= 1
        section = lines[start:end]
        if start > 0 and OPEN_COMMENT_RE.match(lines[start - 1].strip()):
            section = [lines[start - 1]] + section
        sections.append(section)
    return sections


def normalize_header(lines: list[str]) -> list[str]:
    normalized: list[str] = []
    header_open = False

    for index, line in enumerate(lines):
        stripped = line.strip()

        if index < 4 and SECTION_FULL_RE.match(stripped) and not stripped.startswith("//"):
            normalized.append(f"// {stripped}")
            continue

        if index < 4 and stripped.startswith("Referência:"):
            normalized.append(f"// {stripped}")
            continue

        if index < 4 and (stripped.startswith("Prof.") or stripped.startswith("Elaborado")):
            normalized.append(f"// {stripped}")
            continue

        if stripped.startswith("/*") and not stripped.endswith("*/"):
            header_open = True
            normalized.append(line)
            continue

        if header_open:
            normalized.append(line)
            if "*/" in stripped:
                header_open = False
            continue

        normalized.append(line)

    return normalized


def write_readme(output_dir: Path, sections: list[dict[str, str]]) -> None:
    lines = [
        "# Curso GEE | PET/UFSM",
        "",
        "Material extraído do documento `Curso_GEE_PET.docx` e organizado em arquivos `.js` por unidade.",
        "",
        "## Estrutura",
        "",
        "- `codigos/`: scripts do Google Earth Engine separados por unidade",
        "- `README.md`: índice rápido das unidades",
        "",
        "## Como usar",
        "",
        "1. Abra o [Google Earth Engine Code Editor](https://code.earthengine.google.com/).",
        "2. Copie o conteúdo do arquivo `.js` desejado.",
        "3. Ajuste os assets e geometrias locais quando necessário.",
        "",
        "## Unidades disponíveis",
        "",
        "| Arquivo | Unidade |",
        "| --- | --- |",
    ]

    for section in sections:
        lines.append(f"| `{section['filename']}` | {section['title']} |")

    lines.extend(
        [
            "",
            "## Atualização a partir do .docx",
            "",
            "Para reimportar uma nova versão do documento:",
            "",
            "```bash",
            'python scripts/import_curso_gee_pet_docx.py --input "C:\\\\caminho\\\\Curso_GEE_PET.docx"',
            "```",
        ]
    )

    (output_dir / "README.md").write_text("\n".join(lines) + "\n", encoding="utf-8")


def find_section_title(section_lines: list[str], fallback_index: int) -> str:
    for line in section_lines[:6]:
        match = SECTION_FULL_RE.match(line.strip())
        if match:
            return match.group(1)
    return f"Unidade {fallback_index}"


def main() -> None:
    parser = argparse.ArgumentParser(description="Extrai códigos por unidade de um .docx para arquivos .js.")
    parser.add_argument("--input", required=True, help="Caminho do arquivo .docx de origem.")
    parser.add_argument(
        "--output",
        default="cursos/gee-pet-ufsm",
        help="Diretório de saída dentro do repositório.",
    )
    args = parser.parse_args()

    input_path = Path(args.input)
    output_dir = Path(args.output)
    codes_dir = output_dir / "codigos"
    codes_dir.mkdir(parents=True, exist_ok=True)
    for old_file in codes_dir.glob("*.js"):
        old_file.unlink()

    lines = read_docx_lines(input_path)
    raw_sections = split_sections(lines)

    sections_for_readme: list[dict[str, str]] = []

    for index, raw_section in enumerate(raw_sections, start=1):
        if not raw_section:
            continue

        title = find_section_title(raw_section, index)
        slug_source = SECTION_RE.match(title)
        slug = slugify(slug_source.group(1) if slug_source else title)
        filename = f"{index:02d}-{slug}.js"

        content = normalize_header(raw_section)
        output_path = codes_dir / filename
        output_path.write_text("\n".join(content) + "\n", encoding="utf-8")

        sections_for_readme.append({"filename": filename, "title": title})

    write_readme(output_dir, sections_for_readme)


if __name__ == "__main__":
    main()
