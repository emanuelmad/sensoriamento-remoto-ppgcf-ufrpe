/*****************************************************************************************************
//Unidade 5 - Classificação de imagens
//Referência: https://developers.google.com/earth-engine/guides/best_practices
/******************************************UNIDADE 5**********************************/
/*******************************Definindo a área de estudo***************************/
//Importar shape para definir a ROI
var area_estudo = ee.FeatureCollection('projects/ee-emanuelufrpearima/assets/RS_Municipios_2022')
                                      .filter(ee.Filter.eq('NM_MUN','São Gabriel'))
var empty = ee.Image().byte();
//Contorno da feature
var contorno = empty.paint({
  featureCollection: area_estudo,
  color: 1,
  width: 2
});
Map.addLayer(contorno, {palette: 'Blue'}, 'Municipio');
//Map.setOptions("HYBRID")
Map.centerObject(area_estudo,10)
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
  return image.addBands([ndvi,evi,ndwi,ndwi_veg,mndwi]).clipToCollection(area_estudo)}
/******************Criando Função para classificação ano a ano***********************/
//datas
var inicio = 2013
var final = 2020
var data_inicial = ee.Date.fromYMD(inicio, 1, 1)
var data_final = ee.Date.fromYMD(final, 12, 31)
var years = ee.List.sequence(inicio, final);
var months = ee.List.sequence(1,12);
/*************************************Gráfico série temporal*************************/
var totalAreas=ee.List([]);
var Names = ee.List(['agua','vegetacao','agricultura','solo exposto','area urbana']);
var years=ee.List.sequence(inicio,final).getInfo();
var month = ee.List.sequence(1,12).getInfo();
print (years);
var serie_temporal=years.map(areaCalc);
function areaCalc(year){
//Intervalo de tempo do LOOP
var data_inicial = ee.Date.fromYMD(year, 1, 1)
var data_final = ee.Date.fromYMD(year, 12, 31)
/***************************Importando coleção Landsat 8******************************/
var l8 = ee.ImageCollection("LANDSAT/LC08/C02/T1_L2")
                            .filterDate(data_inicial, data_final)
                            .filterBounds(area_estudo)
                            .filterMetadata('CLOUD_COVER','less_than',1)
                            .map(maskL8sr)
//Adicionando Layers
Map.addLayer(l8.median().clip(area_estudo),{bands: ['SR_B4', 'SR_B3', 'SR_B2'], min: 0.0081, max: 0.19},'L8 '+year,0)
/******************************Aplicando os índices na coleção**********************************/
var l8_indices = l8.select("SR_B.").map(indices) //bandas B
/***********************************Classificação de Imagens***********************************/
//Redutores aplicados aos índices
var stdDev = l8_indices.reduce(ee.Reducer.stdDev())
var Percentil = l8_indices.reduce(ee.Reducer.percentile([95]))
//Definindo a coleção
var composite = l8_indices.median() //aplicamos um redutor de mediana para termos os "melhores" pixel.
composite = composite.addBands(stdDev).addBands(Percentil)
//Bandas da classificação
var bands = composite.bandNames() //Lista no nome das bandas
//Criando as amostras
//Criando amostras
//sampleRegions - Converte cada pixel de uma imagem (em uma determinada escala) que cruza uma
//ou mais regiões em um recurso, retornando-os como um FeatureCollection.
var amostrasAgua = composite.sampleRegions({
  collection: agua,
  scale: 30,
  geometries: true
}).randomColumn('random').limit(1000, 'random', false)
var amostrasVegetacao = composite.sampleRegions({
  collection: vegetacao,
  scale: 30,
  geometries: true
}).randomColumn('random').limit(1000, 'random', false)
var amostrasAgri = composite.sampleRegions({
  collection: agricultura,
  scale: 30,
  geometries: true
}).randomColumn('random').limit(1000, 'random', false)
var amostrasSolo = composite.sampleRegions({
  collection: solo,
  scale: 30,
  geometries: true
}).randomColumn('random').limit(1000, 'random', false)
var amostrasUrban = composite.sampleRegions({
  collection: urbana,
  scale: 30,
  geometries: true
}).randomColumn('random').limit(1000, 'random', false)
// Juntando as amostras em uma única feature
var labels = amostrasAgri.merge(amostrasVegetacao)
                                .merge(amostrasAgua)
                                .merge(amostrasUrban)
                                .merge(amostrasSolo)
//Adicionando uma coluna com valor aleatório na coleção de amostras
labels = labels.randomColumn('random')
// Sobreponha os pontos nas imagens para obter treinamento.
var data = composite.select(bands).sampleRegions({
  collection: labels,
  properties: ['classe'],
  scale: 30
});
// Ajuste o parâmetro minLeafPopulation.
var training = labels.filter(ee.Filter.lt('random', 0.7));
var testing = labels.filter(ee.Filter.gte('random', 0.7));
/*********************Aplicar a classificação de acordo com os parâmetros**************/
var trained = ee.Classifier.smileRandomForest({
 numberOfTrees: 250,
//variablesPerSplit: 10,
//bagFraction: 0.7,
//minLeafPopulation: 2,
seed: 123,
}).train(training,'classe',bands)
var classified = composite.classify(trained)
// Exibir as entradas e os resultados.
Map.addLayer(classified,
             {min: 0, max: 4, palette: ['blue', 'green', 'pink','yellow','red']},
             'Classificação RF'.concat(year));
/********************************************Gráfico de áreas**************************************************/
//Gráfico de área
/********************************************Gráfico de áreas**************************************************/
var nomes = ['agua','vegetacao','agricultura','solo exposto','area urbana'];
var renomeado = classified.eq([0,1,2,3,4]).rename(nomes);
var area = renomeado.multiply(ee.Image.pixelArea()).divide(1000000); //para converter para km2;
var area_por_classe = area.reduceRegion({
  reducer: ee.Reducer.sum(), //quero somar a área total
  geometry: area_estudo,
  scale:250,
 // crs:'EPSG: 4326',
  bestEffort: true,
  maxPixels:1e13});
var area_total = ee.Number(area_por_classe);
print('area total por classe: '+year,area_total);
/*Criando listas array*/
var a = ee.Array(area_por_classe.get('agua'));
var b = ee.Array(area_por_classe.get('vegetacao'));
var c = ee.Array(area_por_classe.get('agricultura'));
var d = ee.Array(area_por_classe.get('solo exposto'));
var e = ee.Array(area_por_classe.get('area urbana'));
var Areas = ee.Array.cat([a, b, c, d,e], 0);
var lista = ee.List([a,b,c,d,e]);
var Nomes = ee.List(nomes);
totalAreas=totalAreas.add(Areas)
//Exportando Imagens
Export.image.toDrive({
  image:classified,
  description:'landsatClassificada'+year,
  folder: 'TURMA_4',
  scale:30,
  region:area_estudo.geometry(),
  maxPixels:1e13
})
}
var chart = ui.Chart.array.values({
    array: totalAreas,
    axis: 0,
    xLabels: years,
    })
    .setSeriesNames(Names)
    .setOptions({
      title: 'Área em km²',
      hAxis: {title: 'Classes de Uso do Solo por Ano', format: '####'},
      vAxis: {title: 'Area (km²)', format: 'decimal'},
      legend:  Names,
      interpolateNulls: true,
      lineWidth: 1,
      pointSize: 3,
      series: {
      0: { color: 'blue'},//água
          1: { color: 'green'},//vegetacão
          2: { color: 'pink'}, //Agricultura
          3: { color: 'yellow'}, //Solo
          4: { color: 'red'}}// urbana
      })
      .setChartType('ColumnChart');
print(chart);
/*************************************TREINAMENTO PRÁTICO GEE*****************************************
******************************************************************************************************/
