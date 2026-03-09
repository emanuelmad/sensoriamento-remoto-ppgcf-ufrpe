# Projeto 01 | Sentinel-2 e índices de vegetação

## Objetivo

Calcular produtos básicos de interpretação e análise com uma cena Sentinel-2 Level-2A:

- composição RGB
- NDVI
- NDWI

## Dados esperados

Baixe uma cena Sentinel-2 e separe pelo menos as bandas:

- `B02` azul
- `B03` verde
- `B04` vermelho
- `B08` infravermelho próximo

## Execução

```bash
python main.py ^
  --blue dados/B02.tif ^
  --green dados/B03.tif ^
  --red dados/B04.tif ^
  --nir dados/B08.tif
```

## Saídas

- `resultados/rgb.png`
- `resultados/ndvi.png`
- `resultados/ndwi.png`
- `resultados/ndvi.tif`
- `resultados/ndwi.tif`

## Discussão em sala

- Onde a vegetação aparece com maior vigor?
- Onde a água é separada com clareza?
- Quais limitações surgem sem mascaramento de nuvem?
