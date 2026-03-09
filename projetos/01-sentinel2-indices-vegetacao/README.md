# Projeto 01 | Sentinel-2 e indices de vegetacao

## Objetivo

Calcular produtos basicos de interpretacao e analise com uma cena Sentinel-2 Level-2A:

- composicao RGB
- NDVI
- NDWI

## Dados esperados

Baixe uma cena Sentinel-2 e separe pelo menos as bandas:

- `B02` azul
- `B03` verde
- `B04` vermelho
- `B08` infravermelho proximo

## Execucao

```bash
python main.py ^
  --blue dados/B02.tif ^
  --green dados/B03.tif ^
  --red dados/B04.tif ^
  --nir dados/B08.tif
```

## Saidas

- `resultados/rgb.png`
- `resultados/ndvi.png`
- `resultados/ndwi.png`
- `resultados/ndvi.tif`
- `resultados/ndwi.tif`

## Discussao em sala

- Onde a vegetacao aparece com maior vigor?
- Onde a agua e separada com clareza?
- Quais limitacoes surgem sem mascaramento de nuvem?
