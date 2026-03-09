/*****************************************************************************************************
//Unidade 4 - Classificação de imagens
//Referência: https://developers.google.com/earth-engine/guides/best_practices
/******************************************UNIDADE 4**********************************/
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
/***************************Importando coleção Landsat 8******************************/
var l8 = ee.ImageCollection("LANDSAT/LC08/C02/T1_L2")
                            .filterDate('2020-01-01','2020-12-31')
                            .filterBounds(area_estudo)
                            .filterMetadata('CLOUD_COVER','less_than',100)
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
  return image.addBands([ndvi,evi,ndwi,ndwi_veg,mndwi]).clipToCollection(area_estudo)}
/******************************Aplicando os índices na coleção**********************************/
var l8_indices = l8.select("SR_B.").map(indices) //bandas B
print('3 - Landsat 8 indices', l8_indices)
print('4 - Nº Landsat 8 indices?',l8_indices.size())
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
/***********************************Classificação de Imagens***********************************/
//Definindo a coleção
var composite = l8_indices.median() //aplicamos um redutor de mediana para termos os "melhores" pixel.
//Bandas da classificação
var bands = composite.bandNames() //Lista no nome das bandas
print('5 - Bandas da coleção',composite )
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
print('6 - Quantas amostras temos?',labels)
// Sobreponha os pontos nas imagens para obter treinamento.
var data = composite.select(bands).sampleRegions({
  collection: labels,
  properties: ['classe'],
  scale: 30
});
// Ajuste o parâmetro minLeafPopulation.
var training = labels.filter(ee.Filter.lt('random', 0.7));
var testing = labels.filter(ee.Filter.gte('random', 0.7));
//**************************************************************************
// Hyperparameter Tuning
//**************************************************************************
// Train a classifier.
var classifier = ee.Classifier.smileRandomForest(50)
.train({
  features: training,
  classProperty: 'classe',
  inputProperties: bands
});
var test = composite.sampleRegions({
  collection: testing,
  properties: ['classe'],
  scale: 30,
  tileScale: 16
});
// Ajuste o parâmetro de número de árvores.
var numTreesList = ee.List.sequence(50, 1000, 50);
var accuracies = numTreesList.map(function(n) {
  var classifier = ee.Classifier.smileRandomForest({numberOfTrees:n,
      maxNodes:n})
      .train({
        features: training,
        classProperty: 'classe',
        inputProperties: bands
      });
  // Aqui estamos classificando uma table em vez de uma imagem
   // Classificadores funcionam em imagens e tabelas
  return test
    .classify(classifier)
    .errorMatrix('classe', 'classification')
    .accuracy();
});
var chart = ui.Chart.array.values({
  array: ee.Array(accuracies),
  axis: 0,
  xLabels: numTreesList
  }).setOptions({
      title: 'Ajuste de hiperparâmetros para o número de parâmetros de árvores',
      vAxis: {title: 'Precisão de validação'},
      hAxis: {title: 'Número de Árvores', gridlines: {count: 15}}
  });
print(chart)
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
             'Classificação RF');
/********************************************Gráfico de áreas**************************************************/
//Gráfico de área
/********************************************Gráfico de áreas**************************************************/
var nomes = ['agua','vegetacao','agricultura','solo exposto','area urbana'];
var renomeado = classified.eq([0,1,2,3,4]).rename(nomes);
print('classes', renomeado);
var area = renomeado.multiply(ee.Image.pixelArea()).divide(1000000); //para converter para km2;
var area_por_classe = area.reduceRegion({
  reducer: ee.Reducer.sum(), //quero somar a área total
  geometry: area_estudo,
  scale:250,
 // crs:'EPSG: 4326',
  bestEffort: true,
  maxPixels:1e13});
var area_total = ee.Number(area_por_classe);
print('area total por classe',area_total);
/*Criando listas array*/
var a = ee.Array(area_por_classe.get('agua'));
var b = ee.Array(area_por_classe.get('vegetacao'));
var c = ee.Array(area_por_classe.get('agricultura'));
var d = ee.Array(area_por_classe.get('solo exposto'));
var e = ee.Array(area_por_classe.get('area urbana'));
var Areas = ee.Array.cat([a, b, c, d,e], 0);
var lista = ee.List([a,b,c,d,e]);
var Nomes = ee.List(nomes);
var grafico_area = ui.Chart.array.values(lista,0, Nomes)
.setChartType('PieChart')
.setOptions(
  {width: 250,
  height: 350,
  title: 'Area por classe (km²)',
  hAxis: {title: 'Classes'},
  vAxis: {title: 'Area Km²'},
  is3D: true,
  colors: ['blue', 'green', 'pink','yellow','red']
})
print(grafico_area)
/********************************************Gráfico de áreas**************************************************/
var areaImage = ee.Image.pixelArea().divide(1e6).addBands(classified);
// Calculo de área por classe
// Usando um Redutor Agrupado
var areas = areaImage.reduceRegion({
//Agrupa os registros do redutor pelo valor de uma determinada entrada e reduz
//cada grupo com o redutor fornecido.
      reducer: ee.Reducer.sum().group({
      groupField: 1,
      groupName: 'classification',
    }),
    geometry: area_estudo,
    scale: 250,
    bestEffort: true,
    maxPixels: 1e13
    });
var classAreas = ee.List(areas.get('groups'))
print('áreas classificadas em km²',classAreas)
//Gráfico por classe
var areaChart = ui.Chart.image.byClass({
  image: areaImage,
  classBand: 'classification',
  region: area_estudo,
  scale: 250,
  reducer: ee.Reducer.sum(),
  classLabels: ['agua','vegetacao','agricultura','solo exposto','area urbana'],
}).setOptions({
  hAxis: {title: 'Classes'},
  vAxis: {title: 'Area km²'},
  title: 'Area por classe',
  series: {
     0: { color: 'blue'},//água
          1: { color: 'green'},//vegetacão
          2: { color: 'pink'},//agricultura
          3: { color: 'yellow'}, //solo
          4: { color: 'red'}}// urbana
  });
print(areaChart);
//Acurácia do Classficador
var acuraciaClassificador = testing.classify(trained)
var matrizConfucao = acuraciaClassificador.errorMatrix('classe','classification')
print('Matriz Confusao',matrizConfucao)
print('Acuracia Geral',matrizConfucao.accuracy())
print('Acuracia Consumidor',matrizConfucao.consumersAccuracy())
print('Acuracia Produtor',matrizConfucao.producersAccuracy())
print('RF error matrix_training: ', trained.confusionMatrix());
print('RF accuracy_training: ', trained.confusionMatrix().accuracy());
/***********************Testando suavização*************************************************/
// Filtro de ruído speckle
//Este filtro olha para cada pixel e seus pixels vizinhos e obtém a mediana.
//Em seguida, mapeamos esse processo mediano focal em todas as imagens da coleção.
var classification_smoothed = classified.focalMedian(
                              {radius:100,//O raio do kernel a ser usado.
                              kernelType:'plus', //O tipo de kernel a ser usado. As opções incluem:
                              //'circle', 'square', 'cross', 'plus', octagon 'e' diamond '.
                              units:'meters',//Se um kernel não for especificado, isso determina
                              //se o kernel está em metros ou pixels.
                              iterations:1, //O número de vezes para aplicar o kernel fornecido
                              kernel:null}) //Um kernel personalizado. Se usado, kernelType e radius são ignorados.
                              .rename('Classification_filtered') //Aplicar um filtro mediano focal
Map.addLayer(classification_smoothed,{palette:['blue', 'green', 'pink','yellow','red'], min:0, max:4},'Classificação Suavizada')
/*************************************TREINAMENTO PRÁTICO GEE*****************************************
******************************************************************************************************/
