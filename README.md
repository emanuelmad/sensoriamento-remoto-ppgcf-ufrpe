# Sensoriamento Remoto | PPGCF/UFRPE

![Banner do curso](./assets/img/banner.svg)

Repositorio da disciplina de Sensoriamento Remoto do Programa de Pos-Graduacao em Ciencias Florestais da UFRPE.

Esta base foi organizada para funcionar como um repositorio de curso moderno: teoria, pratica, codigos, projetos e documentacao no mesmo lugar.

## O que este repositorio entrega

- trilha didatica organizada por modulos
- slides e PDFs para aula
- notebooks introdutorios para demonstracoes em sala
- scripts reutilizaveis para rotinas de sensoriamento remoto
- estudos de caso prontos para adaptacao por semestre
- estrutura limpa para publicar no GitHub e evoluir ao longo do tempo

## Para quem este material foi desenhado

- estudantes de pos-graduacao com foco em geotecnologias, ciencias florestais e analise ambiental
- turmas que precisam combinar base conceitual com aplicacao computacional
- disciplinas que desejam sair de uma pasta de arquivos soltos e virar um repositorio vivo

## Estrutura do curso

```text
Aulas_SR/
|-- assets/
|   `-- img/
|-- aulas/
|   |-- en/
|   |   `-- slides/
|   `-- pt-br/
|       |-- pdf/
|       `-- slides/
|-- dados/
|-- docs/
|-- materiais/
|   `-- referencias/
|-- notebooks/
|-- projetos/
`-- scripts/
```

## Modulos

| Modulo | Foco | Base teorica | Ponte pratica |
| --- | --- | --- | --- |
| 01 | Introducao e historico | Conceitos, evolucao e aplicacoes | Notebook 01 |
| 02 | Fundamentos fisicos | Radiacao, interacoes e resposta espectral | Notebook 02 |
| 03 | Sensores e plataformas | Fotografia aerea, sensores orbitais e resolucoes | Projeto 01 |
| 04 | Imagem digital | Pixel, bandas, composicoes e interpretacao | Notebook 03 |
| 05 | Analise aplicada | Indices, classificacao e validacao | Projetos 02 e 03 |

## Comece por aqui

- Materiais de aula: [aulas/README.md](./aulas/README.md)
- Cronograma sugerido: [docs/cronograma.md](./docs/cronograma.md)
- Ementa e objetivos: [docs/ementa.md](./docs/ementa.md)
- Metodologia da disciplina: [docs/metodologia.md](./docs/metodologia.md)
- Notebooks iniciais: [notebooks/README.md](./notebooks/README.md)
- Estudos de caso: [projetos/README.md](./projetos/README.md)
- Fontes de dados: [dados/README.md](./dados/README.md)

## Estudos de caso incluidos

| Projeto | Tema | Entrada esperada | Saidas |
| --- | --- | --- | --- |
| [01-sentinel2-indices-vegetacao](./projetos/01-sentinel2-indices-vegetacao/README.md) | NDVI e NDWI com Sentinel-2 | Bandas B02, B03, B04 e B08 | RGB, NDVI, NDWI e GeoTIFFs |
| [02-landsat-serie-temporal-vegetacao](./projetos/02-landsat-serie-temporal-vegetacao/README.md) | Delta NDVI em duas datas | Bandas vermelha e NIR de t1 e t2 | NDVI t1, NDVI t2 e delta NDVI |
| [03-mapbiomas-validacao-classificacao](./projetos/03-mapbiomas-validacao-classificacao/README.md) | Avaliacao de classificacao tematica | Raster de referencia e raster predito | Relatorio textual e matriz de confusao |

## Ambiente de execucao

Instalacao com `pip`:

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

Instalacao com `conda`:

```bash
conda env create -f environment.yml
conda activate sensoriamento-remoto
```

## Fluxo recomendado para a disciplina

1. Apresente o conceito no slide.
2. Leve a turma para um notebook curto.
3. Mostre um projeto aplicado com dados reais.
4. Feche com interpretacao tecnica e implicacoes ambientais ou florestais.

## Evolucao por semestre

- crie uma branch ou tag por periodo letivo
- adicione novos notebooks em `notebooks/`
- converta trechos repetidos em funcoes dentro de `scripts/`
- publique novos estudos de caso dentro de `projetos/`

## Git

O repositorio local ja foi inicializado e recebeu commit inicial.

Para publicar no GitHub:

```bash
git remote add origin <URL_DO_REPOSITORIO>
git push -u origin main
```
