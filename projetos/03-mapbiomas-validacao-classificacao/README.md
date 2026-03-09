# Projeto 03 | Validação de classificação com referência MapBiomas

## Objetivo

Comparar um raster classificado pelo aluno com um raster de referência temática e gerar métricas básicas de desempenho.

## Entradas esperadas

- `reference.tif`: mapa de referência
- `prediction.tif`: mapa predito

Os rasters devem estar alinhados espacialmente e ter a mesma grade.

## Execução

```bash
python main.py ^
  --reference dados/reference.tif ^
  --prediction dados/prediction.tif
```

## Saídas

- `resultados/classification_report.txt`
- `resultados/confusion_matrix.png`

## Discussão em sala

- Quais classes estão sendo confundidas?
- A validação indica problema de amostragem, sensor ou método?
- O que seria necessário para melhorar a confiabilidade do mapa?
