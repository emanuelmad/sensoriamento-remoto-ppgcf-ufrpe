/*****************************************************************************************************
//Unidade 6 - Evopotranspiração Anual e Evapotranspiração Mensal
//Curso de Gooogle Earth Engine
// O objetivo desta Unidade é permitir que o usuário consiga:
// 1) Delimitar uma área de interesse por meio de uma geometria/ponto
// 2) Construir funções
// 3) Construir gráficos
// 4) Exportar Resultados
/**********************DEFINIÇÃO DO INTERVALO DE TEMPO PARA ANALISE - ANO X E ANO X+1 *********/
Map.setOptions('SATELLITE')
var startyear = 2002;
var endyear = 2020;
// CRIAR LISTA PARA VARIÁVEL YEARS
var years = ee.List.sequence(startyear,endyear);
// CRIAR LISTA DE MESES PARA UTILIZAR NAS FUNÇÕES
var months = ee.List.sequence(1,12);
// DEFINIR INÍCIO E FIM
var startdate = ee.Date.fromYMD(startyear,1,1);
var enddate = ee.Date.fromYMD(endyear,12,31);
// DEFINIÇÃO DA ÁREA DE ESTUDO
var area_estudo = ee.FeatureCollection('projects/ee-emanuelufrpearima/assets/RS_Municipios_2022')
                  .filter(ee.Filter.or(ee.Filter.eq('NM_MUN','Frederico Westphalen'),
                  ee.Filter.eq('NM_MUN','Seberi'),
                   ee.Filter.eq('NM_MUN','Iraí'),
                  ee.Filter.eq('NM_MUN','Ametista do Sul')));
// DEFINIR A BORDA DO LAYER DAS ÁREAS DE ESTUDO
var empty = ee.Image().byte();
var outline = empty.paint({
  featureCollection: area_estudo,
  color: 1,
  width: 2
});
Map.addLayer(outline, {palette: '#000000'}, 'Municípios Rio Grande do Sul',1);
Map.centerObject(area_estudo,7)
////////////////////////////COLEÇÃO DE IMAGEM PARA Evapotranspiração - SATÉLITE MODIS////// 2002 A 2020.....
var evapotranspiration = ee.ImageCollection("MODIS/006/MOD16A2")
                            .select('ET')
                            .filterDate(startdate, enddate)
                            .filterBounds(area_estudo);
/*******************************CALCULO DA EVAPOTRANSPIRAÇÃO ANUAL********************************/
var evapotranspiration_anual_acum = ee.ImageCollection.fromImages(//Retorna a coleção de imagens contendo as imagens fornecidas.
      years.map(function (year) {
     var annual = evapotranspiration.filter(ee.Filter.calendarRange(year, year, 'year'))
        .sum() // acumula os dados anuais
        .multiply(0.1) //Fator de Escala
        .clip(area_estudo);//recorte para área de estudo
    return annual
        .set('year', year) //atributo ano
        .set('system:time_start', ee.Date.fromYMD(year, 1, 1)) //atributo system time start
        ;
})
);
/******************************Gráfico evapotranspiração anual************************************/
var chartP_anual = ui.Chart.image.seriesByRegion({
    imageCollection: evapotranspiration_anual_acum,//coleção
    regions: area_estudo,  //minha região e featureCollection
    reducer: ee.Reducer.mean(), //Redutores
    band: 'ET', //Banda em caso de existir mais de uma você poderá escolher
    scale: 2500, //Escala para gerar o gráfico
    xProperty: 'system:time_start',  //propriedade ex: index, date ou system:time_start
    seriesProperty: 'NOME'})//Propriedade da Feature (Label, Nome, NOME, classe...etc)
    .setOptions({//opções para o gráfico
      title: 'Evapotranspiração acumulada anual por Município',
      hAxis: {title: 'Intervalo de tempo'},//eixo horizontal
      vAxis: {title: 'ET (mm)'},//eixo vertical
      lineWidth: 1,//largura da linha
      pointSize: 5,//tamanho do ponto
      series: {
         0:  {color: 'blue'},
          1: { color: 'DeepSkyBlue'},
          2: {color: 'SteelBlue'},
           3: { color: 'Green'}
          }}
      )
    .setChartType('ColumnChart');  //Estilo do gráfico tipos 'ScatterChart' e 'LineChart'...
print(chartP_anual)//imprimir o gráfico
/**************************************ADICIONANDO LAYERS*******************************/
var VisAnual = {opacity:1,
            bands:["ET"],
            min:612,
            max:1000,
            palette:['cyan','darkblue','orange','Magenta','DarkMagenta','DeepPink']};
Map.addLayer(evapotranspiration_anual_acum, VisAnual, 'Evapotranspiração Anual MOD16A2',1);
/*************************** CALCULO DA EVAPOTRANSPIRAÇÃO MENSAL **********************************/
var evapotranspiration_mensal_acum =  ee.ImageCollection.fromImages(
      years.map(function (y) {
      return months.map(function(m) {
      var evapotranspiration_month = evapotranspiration.filter(ee.Filter.calendarRange(y, y, 'year'))
                    .filter(ee.Filter.calendarRange(m, m, 'month'))
                    .sum()
                    .multiply(0.1)
                    .clip(area_estudo);
      return evapotranspiration_month.set('year', y)
              .set('month', m)
              .set('system:time_start', ee.Date.fromYMD(y, m, 1));
    });
  }).flatten()//empilha a coleção ano a ano, mês a mês
              //Nivela coleções de coleções.
);
/***************************Evapotranspiração Média Acumulada****************************/
var evapotranspiration_mensal_acum_mean =  ee.ImageCollection.fromImages(
    months.map(function (m) {
    var evapotranspiration_month = evapotranspiration_mensal_acum.filter(ee.Filter.eq('month', m))
                                     .mean()
                                     .clip(area_estudo);
    return evapotranspiration_month
            .set('month', m)
            .set('system:time_start',ee.Date.fromYMD(1, m, 1));
  }).flatten()
);
////////////////// FUNÇÃO PARA INSERIR GRÁFICO DE SÉRIES POR REGIÃO /////////////////////
var chartET = ui.Chart.image.seriesByRegion({
    imageCollection: evapotranspiration_mensal_acum,
    regions: area_estudo,
    reducer: ee.Reducer.mean(),
    band: 'ET',
    scale: 2500,
    xProperty: 'system:time_start',
    seriesProperty: 'NOME'})
    .setOptions({
      title: 'Evapotranspiração mensal acumulada por município ao longo dos anos',
      hAxis: {title: 'Intervalo de tempo'},
      vAxis: {title: 'ET (mm)'},
      lineWidth: 1,
      pointSize: 5,
      pointShape: 'square',
      series: {
          0:  {pointShape: 'circle',color: 'blue'},
          1: { pointShape: 'triangle', rotation: 180, color: 'DeepSkyBlue'},
          2: {pointShape: 'square' , color: 'SteelBlue'},
           3: {pointShape: 'square' , color: 'Green'}
          }}
      )
    .setChartType('ScatterChart');
print(chartET)
/****************************Evapotranspiração média mensal**********************************/
var chartMonthly = ui.Chart.image.seriesByRegion({
  imageCollection: evapotranspiration_mensal_acum_mean,
  regions: area_estudo,
  reducer: ee.Reducer.mean(),
  band: 'ET',
  scale: 2500,
  xProperty: 'month',
  seriesProperty: 'NOME'
}).setOptions({
      title: 'Evapotranspiração média mensal acumulada por Município',
      hAxis: {title: 'Intervalo de tempo'},
      vAxis: {title: 'ET (mm)'},
      lineWidth: 1,
      pointSize: 5,
      pointShape: 'square',
      series: {
         0:  {color: 'blue'},
          1: {color: 'DeepSkyBlue'},
          2: { color: 'SteelBlue'},
           3: {color: 'Green'}
          }}
      )
  .setChartType('ColumnChart');
print(chartMonthly);
/**************************************ADICIONANDO LAYERS*******************************/
var Vis = {opacity:1,
            bands:["ET"],
            min:49,
            max:150,
            palette:['red','orange','yellow','green','cyan','blue','darkblue']};
Map.addLayer(evapotranspiration_mensal_acum, Vis, 'Evapotranspiraçãõ Mensal MOD16A2',1);
/*************************Criando uma tabela com os dados anuais******************/
var years = ee.List.sequence(2002, 2020)
var yearlyEvapotranspirationall = function(year) {
      var startDate = ee.Date.fromYMD(year, 1, 1)
      //Crie uma nova data adicionando as unidades especificadas à data fornecida.
      var endDate = startDate.advance(1, 'year')
                      //minha coleção MOD16
      var filtered = evapotranspiration.filter(ee.Filter.date(startDate, endDate))
      var stats = filtered.sum().multiply(0.1).reduceRegion({
        reducer: ee.Reducer.mean(),
        geometry: area_estudo,
        scale: 2500,
        })
      var funcao_tabela = ee.Feature(null, {
          'year': year,
          'evapotranspiration': ee.Number(stats.get('ET')).format('%.2f')
          })
      return funcao_tabela
}
var EvapotranspirationallYears = ee.FeatureCollection(years.map(yearlyEvapotranspirationall))
print('Informações da Tabela',EvapotranspirationallYears)
Export.table.toDrive({
  collection: EvapotranspirationallYears,
  folder: 'TURMA_3',
  description:'Tabela_ET_anual',
  selectors: ['year','evapotranspiration'],
  fileNamePrefix: 'Dados_Evapotranspiracao_',
  fileFormat: 'CSV'})
/********************************Exportando Imagens em Loop***********************/
var years=ee.List.sequence(2002,2020).getInfo();
var month = ee.List.sequence(1,12).getInfo();
var serie_temporal=years.map(loop);//função para uma lista
function loop(year){
  var startdate = ee.Date.fromYMD(year, 1, 1)
  var enddate = ee.Date.fromYMD(year, 12, 31)
/*****************************************Coleção*********************************/
var evapotranspiration = ee.ImageCollection("MODIS/006/MOD16A2")
                                            .select('ET')
                                            .filterDate(startdate, enddate)
                                            .filterBounds(area_estudo)
var evapotranspiration_accum =  evapotranspiration.reduce(ee.Reducer.sum()).multiply(0.1)
/*rename substituir o ET_sum*/                          .rename('ET')
                                                        .clip(area_estudo)
/****************************************Adicionado Mapa de Classificação por ano***********/
Map.addLayer(evapotranspiration_accum, VisAnual, 'Evapotranspiração Anual MOD16A2'.concat(year),0);
/********************************Exportando Imagens Anual***********************/
Export.image.toDrive({
  image: evapotranspiration_accum,
  folder: 'TURMA_4',
  description: 'MOD16A2_'.concat(year),
  region: area_estudo,
  scale: 2500,
  maxPixels: 1e13
  })
}
/********************************Exportando Imagens Mensais***********************/
var size = evapotranspiration_mensal_acum_mean.size() //contar quantas imagens tem
print('1 - Quantas imagens existem:', size)
var list =evapotranspiration_mensal_acum_mean.toList(size)
// Definindo o intervalo e o download (lado do servidor)
for(var i=1;i < 12;++i)
{
// função de exportação onde foram definidos os seguintes parâmetros:
  var Name = ee.Image(list.get(i)).get('system:index').getInfo(); //nome da imagem
  Export.image.toDrive({
    image:list.get(i),
    description:'MODIS_mes_'+Name,
    region: area_estudo,
    folder:'TURMA_4', //pasta criada no Google Drive onde serão salvas as imagens
    scale:2500, //
    maxPixels:1e13  //neste tópico foram definidos o numero máximos de pixel que podem compor uma imagem. 1^13
  })
Map.addLayer(ee.Image(list.get(i)), Vis, 'Evapotranspiração Média Mensal MODIS'.concat(Name),0)
}
