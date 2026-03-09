/*****************************************************************************************************
//Unidade 4.1 - Gráficos
//Referência: https://developers.google.com/earth-engine/guides
/******************************************UNIDADE 4***************************************************/
var area_estudo = ee.FeatureCollection('projects/ufsm-fapergs/assets/Bacia_Hidrografica')
                                      .filter(ee.Filter.eq('nome','Várzea'))
var empty = ee.Image().byte();
var contorno = empty.paint({
  featureCollection: area_estudo,
  color: 1,
  width: 2
});
Map.addLayer(contorno, {palette: 'Blue'}, 'Bacia Hidrográfica');
//Map.setOptions('HYBRID')
Map.centerObject(area_estudo,8)
/***************Aplicando uma máscara de núvens na coleção landsat**********************/
function maskL8sr(image){
    // Bit 0 - Fill
    // Bit 1 - Dilated Cloud
    // Bit 2 - Cirrus
    // Bit 3 - Cloud
    // Bit 4 - Cloud Shadow
    // Bit 5 - Snow
    var qaMask = image.select(['QA_PIXEL']).bitwiseAnd(parseInt('111111', 2)) //analisar
                                          .eq(0) //2 = Unused //eq = 0 condições claras
    var saturationMask = image.select("QA_RADSAT").eq(0) //Radiometric saturation QA
    // Apply the scaling factors to the appropriate bands
    var opticalBands = image.select("SR_B.").multiply(0.0000275).add(-0.2)
    var thermalBands = image.select("ST_B.*").multiply(0.00341802).add(149.0)
    // Replace the original bands with the scaled ones and apply the masks.
    return image
        .addBands(opticalBands, null, true)
      //.addBands(thermalBands, null, true)
        .updateMask(qaMask)
        .updateMask(saturationMask)
        .copyProperties(image, image.propertyNames()) //copia a propriedade da coleção
}
/***************************Importando coleção Landsat 8******************************/
var l8 = ee.ImageCollection("LANDSAT/LC08/C02/T1_L2")
                            .filterDate('2013-01-01','2021-12-31')
                            .filterBounds(area_estudo)
                            .filterMetadata('CLOUD_COVER','less_than',5)
                            .map(maskL8sr)
print('1 - Coleção Landsat 8', l8)
print('2 - Quantas imagens estou utilizando?',l8.size())
//Adicionando Layers
Map.addLayer(l8.median().clip(area_estudo),{bands: ['SR_B4', 'SR_B3', 'SR_B2'], min: 0.0081, max: 0.19},'L8',0)
/***************************************Índices para coleção ****************************************/
function indices (image) {
  //Indices de Vegetação
  var ndvi =  image.normalizedDifference(['SR_B5', 'SR_B4']).rename('NDVI');// Rouse 1973
  var evi = image.expression('2.5 * ((N - R) / (N + (6 * R) - (7.5 * B) + 1))',
  { //Huete 2002
        'N': image.select('SR_B5'), 'R': image.select('SR_B4'), 'B': image.select('SR_B2')}).rename('EVI');
    //Índices de Água
  var ndwi = image.normalizedDifference(['SR_B3', 'SR_B5']).rename ('NDWI'); //Mc Feeters 1996
  var ndwi_veg = image.normalizedDifference(['SR_B5', 'SR_B6']).rename ('NDWI_VEG'); //Gao 1996
  var mndwi = image.normalizedDifference(['SR_B3', 'SR_B6']).rename('MNDWI'); // Xu 2006
  return image.addBands([ndvi,evi,ndwi,ndwi_veg,mndwi]).clipToCollection(area_estudo)
              .copyProperties(image, image.propertyNames())
              .set('date', image.date().format('YYYY-MM-dd'))
}
/******************************Aplicando os índices na coleção**********************************/
var l8_indices = l8.select("SR_B.").map(indices) //bandas B
print('3 - Landsat 8 indices', l8_indices)
print('4 - Nº Landsat 8 indices?',l8_indices.size())
/***************************************Aplicando os índices a coleção*******************************/
//As bandas dos índices foram adicionadas a coleção landsat?
var image = ee.Image(l8_indices.median())
var bandNames = image.bandNames();
print('5 - Bandas',bandNames)
//Aplique um redutor a cada elemento de uma coleção, usando os seletores fornecidos para determinar as entradas.
//Retorna um dicionário de resultados, codificado com os nomes de saída.
var range = l8_indices.reduceColumns(ee.Reducer.minMax(), ["system:time_start"])
print('6 - Intervalo de datas: ', ee.Date(range.get('min')), ee.Date(range.get('max')))
/******************************************Criando Gráficos*******************************************/
var amostras = agua.merge(urbana).merge(vegetacao).merge(agricultura)
// Análise de resposta ao NDVI
var ndvichart = ui.Chart.image.seriesByRegion({
    imageCollection:l8_indices.select('NDVI'),
    regions:amostras,
    reducer: ee.Reducer.mean(),
    band:'NDVI',
    scale:30,
    xProperty:'system:time_start',
    seriesProperty:'label'})
    .setChartType('ScatterChart')
    .setOptions({
          title: 'NDVI dos Alvos ao longo dos Anos',
          vAxis: {title: 'NDVI'},
          lineWidth: 1,
          pointSize: 5,
          series: {
          0:  {pointShape: 'circle',color: 'blue'},//considera o valor da ordem merge
          1: { pointShape: 'triangle', rotation: 180, color: 'red'},//considera o valor da ordem merge
          2: {pointShape: 'square' , color: 'green'},//considera o valor da ordem merge
          3: {pointShape: 'diamond', color: 'pink'}//considera o valor da ordem merge
}});
print(ndvichart)
//Comportamento dos alvos para diferentes bandas
var l8_redutor = l8_indices.select(['SR_B7','SR_B6','SR_B5','SR_B4','SR_B3', 'SR_B2']).median()
var desvio_padrao = l8_indices.select('NDVI','NDWI','MNDWI','NDWI_VEG','EVI').reduce(ee.Reducer.stdDev())
var bandChart = ui.Chart.image.regions({
  image: desvio_padrao,
  regions: amostras,
  scale: 30,
  seriesProperty: 'label'
});
bandChart.setChartType('LineChart');
bandChart.setOptions({
  title: 'Resposta espectral dos alvos',
  hAxis: {
    title: 'Banda'
  },
  vAxis: {
    title: 'Reflectância (%)'
  },
  lineWidth: 1,
  pointSize: 5,
  pointShape: 'square',
  series: {
     0: {lineWidth: 2, color: 'blue', lineDashStyle: [4, 4]},
          1: {color: 'red'},
          2: {color: 'green'},
          3: {color: 'pink'}
  }
});
print(bandChart)
var bandChart_ = ui.Chart.image.regions({
  image: l8_redutor,
  regions: amostras,
  scale: 30,
  seriesProperty: 'label'
});
bandChart_.setChartType('LineChart');
bandChart_.setOptions({
  title: 'Resposta espectral dos alvos',
  hAxis: {
    title: 'Banda'
  },
  vAxis: {
    title: 'Reflectância (%)'
  },
  lineWidth: 1,
  pointSize: 5,
  pointShape: 'square',
  series: {
     0: {color: 'blue'},
          1: {color: 'red'},
          2: {color: 'green'},
          3: {color: 'pink'}
  }
});
print(bandChart_)
/***************************************COMBO CHART************************************************/
var chart = ui.Chart.image.series(l8_indices.select(['NDVI','NDWI','MNDWI','NDWI_VEG','EVI'])
    ,teste, ee.Reducer.mean(), 30, 'system:time_start')
    .setChartType('ComboChart')
    .setSeriesNames(['NDVI','NDWI','MNDWI','NDWI_VEG','EVI'])
    .setOptions({
      title: 'Comparativo entre diferentes índices',
      seriesType: "line",
      series: {
       0: {targetAxisIndex: 0,
          color: 'green'},
       1: {
           targetAxisIndex: 0,
           type: 'line',
           color: 'blue'},
       2: {
           targetAxisIndex: 0,
           type: 'line',
           color: 'red'},
      3: {
           targetAxisIndex: 0,
           type: 'line',
           color: 'cyan'},
      4: {
           targetAxisIndex: 0,
           type: 'line',
           color: 'purple'}
      },
      vAxes: {
        0: {title: ' Indices'},
        },
      hAxes: {
        0: {
          title: 'Intervalo de Tempo',
                        }
                },
     lineWidth: 1,
     pointSize: 0,
      bar: {groupWidth: '100%'}
      });
print(chart)
/***********************************Histograma********************************************/
var histogram = ui.Chart.image.histogram({
  image:l8_indices.select(['NDVI','EVI']).reduce(ee.Reducer.percentile([95])),
  region:area_estudo,
  scale:30,
  //minBucketWidth:0.05
}).setOptions({
  title: 'Histograma percentil 95 NDVI e EVI',
  fontSize: 10,
  hAxis: {title: 'Índices'},
  vAxis: {title: 'Frequencia'},
  chartArea: {backgroundColor: '#f8f8ff'}
})
print(histogram)
/***********************************Adicionando Layers******************************************/
Map.addLayer(l8_indices.select('NDVI').median(), {min: -0.36, max: 0.90,
             palette: ['red','orange','yellow','green'] }, 'NDVI',0)
Map.addLayer(l8_indices.select('EVI').median(), {min: -0.06, max: 0.56,
             palette: ['red','orange','yellow','green'] }, 'EVI',0)
Map.addLayer(l8_indices.select('NDWI_VEG').median(), {min: -0.14, max: 0.75,
             palette: ['white','gray','cyan','blue'] }, 'NDWI_VEG',0)
Map.addLayer(l8_indices.select('NDWI').median(), {min: -0.84, max: 0.38,
             palette: ['white','gray','cyan','blue'] }, 'NDWI',0)
Map.addLayer(l8_indices.select('MNDWI').median(), {min: -0.64, max: 0.65,
             palette: ['white','gray','cyan','blue'] }, 'MNDWI',0)
/*************************************TREINAMENTO PRÁTICO GEE*****************************************
******************************************************************************************************/
