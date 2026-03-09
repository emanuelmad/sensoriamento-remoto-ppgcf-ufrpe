/*****************************************************************************************************
//Unidade 3 - Indices de Vegetação e Água
//Referência: https://developers.google.com/earth-engine/guides
/******************************************UNIDADE 3**********************************/
/*******************************Definindo a área de estudo***************************/
//Importar shape para definir a ROI
var area_estudo = ee.FeatureCollection('projects/ufsm-fapergs/assets/Bacia_Hidrografica')
                                      .filter(ee.Filter.eq('nome','Várzea'))
var empty = ee.Image().byte();
//Contorno da feature
var contorno = empty.paint({
  featureCollection: area_estudo,
  color: 1,
  width: 2
});
//Map.addLayer(area_estudo, {palette: 'Blue'}, 'Bacia Hidrográfica');
//Map.setOptions("SATELLITE")
Map.centerObject(area_estudo,10)
/***************Aplicando uma máscara de núvens na coleção landsat**********************/
function maskL8sr(image) {
  // Os bits 3 e 5 são sombra de nuvem e nuvem, respectivamente.
  var cloudShadowBitMask = 1 << 4; //informações obtidas nas propriedas e bandas
  var cloudsBitMask = 1 << 3;//informações obtidas nas propriedas e bandas
  //Obtenha a banda de QA do pixel.
  var qa = image.select('QA_PIXEL');
  // Ambos os sinalizadores devem ser definidos como zero, indicando condições claras.
  var mask = qa.bitwiseAnd(cloudShadowBitMask).eq(0)
      .and(qa.bitwiseAnd(cloudsBitMask).eq(0));
  // Retorne a imagem mascarada, dimensionada para refletir, sem as bandas de controle de qualidade.
  return image.updateMask(mask)
      .select('SR_B[1-7]')
      .multiply(2.75e-05).add(-0.2) //aplica o fator de escala em todas as bandas
      .copyProperties(image, image.propertyNames()) //copia a propriedade da coleção
}
/***************************Importando coleção Landsat 8******************************/
var l8 = ee.ImageCollection("LANDSAT/LC08/C02/T1_L2")
                            .filterDate('2013-01-01','2020-12-31')
                            .filterBounds(area_estudo)
                            .filterMetadata('CLOUD_COVER','less_than',1)
                            .map(maskL8sr)
print('1 - Coleção Landsat 8', l8)
print('2 - Quantas imagens estou utilizando?',l8.size())
//Adicionando Layers
Map.addLayer(l8,{bands: ['SR_B4', 'SR_B3', 'SR_B2'], min: 0.0081, max: 0.19},'L8')
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
var l8_indices = l8.map(indices)
print('3 - Landsat 8 indices', l8_indices)
print('4 - Nº Landsat 8 indices?',l8_indices.size())
/***********************************Adicionando Layers************************************************/
Map.addLayer(l8_indices.select('NDVI'), {min: -0.36, max: 0.90,
             palette: ['red','orange','yellow','green'] }, 'NDVI')
Map.addLayer(l8_indices.select('EVI'), {min: -0.06, max: 0.56,
             palette: ['red','orange','yellow','green'] }, 'EVI')
Map.addLayer(l8_indices.select('NDWI_VEG'), {min: -0.14, max: 0.75,
             palette: ['white','gray','cyan','blue'] }, 'NDWI_VEG')
Map.addLayer(l8_indices.select('NDWI'), {min: -0.84, max: 0.38,
             palette: ['white','gray','cyan','blue'] }, 'NDWI')
Map.addLayer(l8_indices.select('MNDWI'), {min: -0.64, max: 0.65,
             palette: ['white','gray','cyan','blue'] }, 'MNDWI')
/********************************Exportando Imagens***************************************************/
Map.addLayer(contorno, {palette: 'Blue'}, 'Bacia Hidrográfica');
Export.image.toDrive({
image: l8_indices.select('NDVI').mean(),
folder: 'Turma_4',
description: 'NDVI',
region: area_estudo,
scale: 30,
maxPixels: 1e13
})
Export.image.toDrive({
image: l8_indices.select('EVI').mean(),
folder: 'Turma_4',
description: 'EVI',
region: area_estudo,
scale: 30,
maxPixels: 1e13
})
Export.image.toDrive({
image: l8_indices.select('NDWI').mean(),
folder: 'Turma_4',
description: 'NDWI',
region: area_estudo,
scale: 30,
maxPixels: 1e13
})
Export.image.toDrive({
image: l8_indices.select('MNDWI').mean(),
folder: 'Turma_4',
description: 'MNDWI',
region: area_estudo,
scale: 30,
maxPixels: 1e13
})
/*************************************TREINAMENTO PRÁTICO GEE*****************************************
******************************************************************************************************/
