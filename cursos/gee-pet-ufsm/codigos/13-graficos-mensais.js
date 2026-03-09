/*****************************************************************************************************
//Unidade 4.2 - Gráficos mensais
//Referência: https://developers.google.com/earth-engine/guides
/******************************************UNIDADE 4.2***************************************************/
var area_estudo = ee.FeatureCollection('projects/ufsm-fapergs/assets/Bacia_Hidrografica')
                                      .filter(ee.Filter.or(ee.Filter.eq('nome','Santa Maria'),
                                      ee.Filter.eq('nome','Várzea')))
var empty = ee.Image().byte();
var contorno = empty.paint({
  featureCollection: area_estudo,
  color: 1,
  width: 2
});
Map.addLayer(contorno, {palette: 'Blue'}, 'Bacia Hidrográfica');
//Map.setOptions('HYBRID')
Map.centerObject(area_estudo,9)
//Importar a coleção e selecionar a banda
var EVI= ee.ImageCollection("MODIS/006/MOD13A1").select('EVI');
print('1- Primeira imagem da coleção', EVI.first())
//Criar uma lista para o período
var YEARS = ee.List.sequence(2010, 2020);
//Criar uma lista de meses
var MONTHS = ee.List.sequence(1, 12);
// Criando uma coleção de imagens mensais
var MONTHLY_EVI =  ee.ImageCollection.fromImages(
  YEARS.map(function (y) { //cria a função do ano
    return MONTHS.map(function(m) { //retorno a função do ano e "aninha" os meses
      var EVI_MONTHS = EVI.filter(ee.Filter.calendarRange(y, y, 'year')) //criando a variável de imagens anuais
                    .filter(ee.Filter.calendarRange(m, m, 'month')) //atribuíndo os meses
                    .mean() //média
                    .clip(area_estudo) //recortando para nossa área de estudo
      EVI_MONTHS = EVI_MONTHS.multiply(0.0001); //aplicando o fator de escala pré definido na coleção
      return EVI_MONTHS.set('year', y) //encerrando a função da coleção mensal
              .set('month', m) //setando a informação de mês
              .set('date', ee.Date.fromYMD(y,m,1)) // atribuíndo a informação de data no formato ano,mês e dia
              .set('system:time_start', ee.Date.fromYMD(y, m, 1)); //utilizando a informação system:time_start (data)
     });
  }).flatten()//empilhar a coleção e nivela os dados
);
print('2 - Coleção mensal',MONTHLY_EVI )
//Adicionar o Layer
Map.addLayer(MONTHLY_EVI, {min: 0.27,max: 0.51,
                palette: ['red','orange','yellow','green'] },
                'EVI')
/*****************************Criando um gráfico***********************/
var title = {
  title: 'EVI Mensal',
  hAxis: {title: 'Data'},
  vAxis: {title: 'EVI'},
};
var chartMonthly = ui.Chart.image.seriesByRegion({
  imageCollection: MONTHLY_EVI,
  regions: area_estudo,
  reducer: ee.Reducer.mean(),
  band: 'EVI',
  scale: 1000,
  xProperty: 'system:time_start',
  seriesProperty: 'Nome' //vem do meu shape
}).setOptions(title)
  .setChartType('LineChart');
print(chartMonthly);
/**********************Aplicando um redutor a coleção de imagens*******/
var reduce = function(image) {
   var serie_reduce = image.reduceRegions({ //redutor de regions, pega nos
   //dados e calcula a média, por exemplo, para a ROI;
                        collection:area_estudo, //região de interesse
                        reducer: ee.Reducer.mean().combine({
                        reducer2: ee.Reducer.stdDev(), //redutor desvio padrão
                                    sharedInputs: true}).combine({
                        reducer2: ee.Reducer.max(),
                                    sharedInputs: true}), // redutor de mínimo e máximo
                        scale: 1000
                        })
  serie_reduce = serie_reduce.map(function(f) { return f
              .set({date: image.get('date')}) })
   return serie_reduce.copyProperties(image)
};
var finalEVI = MONTHLY_EVI.map(reduce).flatten()
                         .sort('date', false)
                          .select(['Nome','mean','stdDev','max','date'])
print('3- Indice EVI Tabela',finalEVI)
/************Exportando Tabela************************/
Export.table.toDrive({
    collection:finalEVI,
    description:'EVI_estatisticas',
    folder:'TURMA 4',
    fileFormat:'CSV'
    })
           /*************************************TREINAMENTO PRÁTICO GEE*****************************************
******************************************************************************************************/
