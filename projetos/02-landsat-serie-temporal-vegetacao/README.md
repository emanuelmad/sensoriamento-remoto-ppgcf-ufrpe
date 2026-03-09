# Projeto 02 | Série temporal de vegetação com Landsat

## Objetivo

Comparar duas datas Landsat por meio de NDVI e gerar um mapa simples de variação temporal.

## Dados esperados

Para cada data, use pelo menos:

- banda vermelha
- banda NIR

## Execução

```bash
python main.py ^
  --red-t1 dados/red_t1.tif ^
  --nir-t1 dados/nir_t1.tif ^
  --red-t2 dados/red_t2.tif ^
  --nir-t2 dados/nir_t2.tif
```

## Saídas

- `resultados/ndvi_t1.png`
- `resultados/ndvi_t2.png`
- `resultados/delta_ndvi.png`
- `resultados/ndvi_t1.tif`
- `resultados/ndvi_t2.tif`
- `resultados/delta_ndvi.tif`

## Discussão em sala

- O NDVI aumentou ou diminuiu entre as datas?
- O padrão espacial sugere degradação, recuperação ou sazonalidade?
- Que cuidados de comparabilidade entre cenas são necessários?
