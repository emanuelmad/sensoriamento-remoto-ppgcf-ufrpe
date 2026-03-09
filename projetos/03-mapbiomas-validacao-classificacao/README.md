# Projeto 03 | Validacao de classificacao com referencia MapBiomas

## Objetivo

Comparar um raster classificado pelo aluno com um raster de referencia tematica e gerar metricas basicas de desempenho.

## Entradas esperadas

- `reference.tif`: mapa de referencia
- `prediction.tif`: mapa predito

Os rasters devem estar alinhados espacialmente e ter a mesma grade.

## Execucao

```bash
python main.py ^
  --reference dados/reference.tif ^
  --prediction dados/prediction.tif
```

## Saidas

- `resultados/classification_report.txt`
- `resultados/confusion_matrix.png`

## Discussao em sala

- Quais classes estao sendo confundidas?
- A validacao indica problema de amostragem, sensor ou metodo?
- O que seria necessario para melhorar a confiabilidade do mapa?
