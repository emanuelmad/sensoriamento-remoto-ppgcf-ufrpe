# Curso GEE | UFSM

Material extraído do documento `Curso_GEE_PET.docx` e organizado em arquivos `.js` por unidade.

## Estrutura

- `codigos/`: scripts do Google Earth Engine separados por unidade
- `README.md`: índice rápido das unidades

## Como usar

1. Abra o [Google Earth Engine Code Editor](https://code.earthengine.google.com/).
2. Copie o conteúdo do arquivo `.js` desejado.
3. Ajuste os assets e geometrias locais quando necessário.

## Unidades disponíveis

| Arquivo | Unidade |
| --- | --- |
| `01-definido-variaveis-objetos-e-funcoes.js` | Unidade 1.1 - Definido variáveis, objetos e funções |
| `02-definido-variaveis-objetos-e-funcoes.js` | Unidade 1.2 - Definido variáveis, objetos e funções |
| `03-definido-variaveis-objetos-e-funcoes.js` | Unidade 1.3 - Definido variáveis, objetos e funções |
| `04-conceitos-de-programacao-funcional.js` | Unidade 1.4 - Conceitos de programação funcional |
| `05-importando-colecao-de-imagens-e-selecionando-uma-imagem.js` | Unidade 2 - Importando Coleção de Imagens e Selecionando uma imagem |
| `06-redutores.js` | Unidade 2 - Redutores |
| `07-mascaras-de-nuvens.js` | Unidade 2 - Máscaras de Nuvens |
| `08-indices-de-vegetacao-e-agua.js` | Unidade 3 - Indices de Vegetação e Água |
| `09-mascara-de-agua.js` | Unidade 3 - Máscara de água |
| `10-mascara-de-vegetacao.js` | Unidade 3 - Máscara de Vegetação |
| `11-desmatamento.js` | Unidade 3 - Desmatamento |
| `12-graficos.js` | Unidade 4.1 - Gráficos |
| `13-graficos-mensais.js` | Unidade 4.2 - Gráficos mensais |
| `14-classificacao-de-imagens.js` | Unidade 5 - Classificação de imagens |
| `15-classificacao-de-imagens.js` | Unidade 4 - Classificação de imagens |
| `16-classificacao-de-imagens.js` | Unidade 5 - Classificação de imagens |
| `17-precipitacao-anual-e-evapotranspiracao-mensal.js` | Unidade 6 - Precipitação Anual e Evapotranspiração Mensal |
| `18-evopotranspiracao-anual-e-evapotranspiracao-mensal.js` | Unidade 6 - Evopotranspiração Anual e Evapotranspiração Mensal |

## Atualização a partir do .docx

Para reimportar uma nova versão do documento:

```bash
python scripts/import_curso_gee_pet_docx.py --input "C:\\caminho\\Curso_GEE_PET.docx"
```
