# Projeto 02 | Serie temporal de vegetacao com Landsat

## Objetivo

Comparar duas datas Landsat por meio de NDVI e gerar um mapa simples de variacao temporal.

## Dados esperados

Para cada data, use pelo menos:

- banda vermelha
- banda NIR

## Execucao

```bash
python main.py ^
  --red-t1 dados/red_t1.tif ^
  --nir-t1 dados/nir_t1.tif ^
  --red-t2 dados/red_t2.tif ^
  --nir-t2 dados/nir_t2.tif
```

## Saidas

- `resultados/ndvi_t1.png`
- `resultados/ndvi_t2.png`
- `resultados/delta_ndvi.png`
- `resultados/ndvi_t1.tif`
- `resultados/ndvi_t2.tif`
- `resultados/delta_ndvi.tif`

## Discussao em sala

- O NDVI aumentou ou diminuiu entre as datas?
- O padrao espacial sugere degradacao, recuperacao ou sazonalidade?
- Que cuidados de comparabilidade entre cenas sao necessarios?
