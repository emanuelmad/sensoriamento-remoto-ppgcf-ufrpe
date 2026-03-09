# Sensoriamento Remoto | PPGCF/UFRPE

![Banner do curso](./assets/img/banner.svg)

Repositorio da disciplina de Sensoriamento Remoto do Programa de Pos-Graduacao em Ciencias Florestais da UFRPE.

Este projeto foi organizado para funcionar como base viva da disciplina: aulas, leituras, codigos, notebooks e estudos de caso no mesmo lugar.

## Visao geral

- Materiais de aula em portugues e ingles
- PDFs para distribuicao rapida
- Base pronta para notebooks e praticas computacionais
- Estrutura para projetos aplicados e estudos de caso
- Ambiente reproduzivel para evoluir a disciplina ao longo dos semestres

## Estrutura

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

## Modulos do curso

| Modulo | Tema | Materiais principais |
| --- | --- | --- |
| 01 | Introducao e historico | `Aula 1 - historico.pdf`, `Aula 2 - Definicoes.pdf`, `Além_da_Visao.pptx` |
| 02 | Fundamentos fisicos | `Aula 3 - Principios Fisicos do SR.pdf`, `Aula 4 - Interacoes da radiacao.pdf`, `A_Jornada_da_Luz.pptx`, `Fisica_do_Sensoriamento.pptx` |
| 03 | Fotografia aerea e visao orbital | `A_Ascensao_da_Fotografia_Aerea.pptx`, `Anatomia_da_Fotografia_Aerea.pptx`, `Evolution_of_Orbital_Vision.pptx`, `Metric_Photogrammetry.pptx` |
| 04 | Imagem digital e interpretacao | `Digital_Image_Analysis.pptx`, `Decoding_Aerial_Imagery.pptx`, `Remote_Sensing_Anatomy.pptx`, `The_Pixel_Journey.pptx` |
| 05 | Vegetacao e aplicacoes | `Decoding_the_Green.pptx`, `Indices de vegetacao.pdf`, `Aplicacoes de Sensoriamento Remoto 2ed_DEG.pdf` |

## Navegacao rapida

- Materiais de aula: [aulas/README.md](./aulas/README.md)
- Cronograma sugerido: [docs/cronograma.md](./docs/cronograma.md)
- Notebooks da disciplina: [notebooks/README.md](./notebooks/README.md)
- Projetos aplicados: [projetos/README.md](./projetos/README.md)
- Scripts utilitarios: [scripts/README.md](./scripts/README.md)
- Base de dados e instrucoes: [dados/README.md](./dados/README.md)

## Ambiente de execucao

Ha duas opcoes prontas:

- `requirements.txt` para `pip`
- `environment.yml` para `conda` ou `mamba`

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

## Como evoluir o curso

1. Adicione um notebook por tema ou aula.
2. Transforme exemplos recorrentes em funcoes reutilizaveis dentro de `scripts/`.
3. Organize cada atividade pratica ou estudo de caso em `projetos/`.
4. Mantenha dados pequenos versionados e dados grandes apenas documentados em `dados/`.

## Proximos incrementos recomendados

- Adicionar um estudo de caso com Sentinel-2 para indices espectrais
- Criar um notebook de classificacao supervisionada com dados reais
- Publicar amostras pequenas de dados raster para aulas demonstrativas
- Versionar o curso por semestre com tags Git

## Git

Para registrar a estrutura local:

```bash
git add .
git commit -m "Moderniza repositorio da disciplina de sensoriamento remoto"
```

Para publicar depois no GitHub:

```bash
git remote add origin <URL_DO_REPOSITORIO>
git push -u origin main
```
