/*****************************************************************************************************
//Unidade 3 - Desmatamento
//Referência: https://developers.google.com/earth-engine/guides
//Elaborado e adaptado por: Christhian Santana Cunha
//Gestor Ambiental, Mestre em Eng.Civil (UFSM), Doutorando em Sensoriamento Remoto (UFRGS)
/**************************************UNIDADE 3.4**********************************/
/*******************************Definindo a área de estudo***************************/
//Importar shape para definir a ROI
var area_estudo =  ee.FeatureCollection('projects/ufsm-fapergs/assets/Bacia_Hidrografica')
                                      .filter(ee.Filter.eq('nome','Várzea'))
var empty = ee.Image().byte();
//Contorno da feature
var contorno = empty.paint({
  featureCollection: area_estudo,
  color: 1,
  width: 2
});
Map.addLayer(contorno, {palette: 'Blue'}, 'Bacia Hidrográfica');
//Map.setOptions("HYBRID")
Map.centerObject(area_estudo,6)
/***************Aplicando uma máscara de núvens na coleção landsat**********************/
/******************************Landsat 5 ***********************************************/
function maskL5sr(image) {
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
        .addBands(thermalBands, null, true)
        .updateMask(qaMask)
        .updateMask(saturationMask)
}
/******************************Landsat 8 ***********************************************/
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
/*************************Importanto coleção Landsat 5 *******************************/
var l5 = ee.ImageCollection("LANDSAT/LT05/C02/T1_L2")
                            .filterDate('1990-01-01','1990-12-31')
                            .filterBounds(area_estudo)
                            .filterMetadata('CLOUD_COVER','less_than',10)
                            .map(maskL5sr)
print('1 - Coleção Landsat 5', l5)
print('2 - Quantas imagens estou utilizando?',l5.size())
//Adicionando Layers
Map.addLayer(l5.median().clip(area_estudo),{bands: ['SR_B3', 'SR_B2', 'SR_B1'], min: 0.0081, max: 0.19},'L5')
/***************************Importando coleção Landsat 8******************************/
var l8 = ee.ImageCollection("LANDSAT/LC08/C02/T1_L2")
                            .filterDate('2020-01-01','2020-12-31')
                            .filterBounds(area_estudo)
                            .filterMetadata('CLOUD_COVER','less_than',5)
                            .map(maskL8sr)
print('3 - Coleção Landsat 8', l8)
print('4 - Quantas imagens estou utilizando?',l8.size())
//Adicionando Layers
Map.addLayer(l8.median().clip(area_estudo),{bands: ['SR_B4', 'SR_B3', 'SR_B2'], min: 0.0081, max: 0.19},'L8')
/***************************************Índices para coleção ****************************************/
var ndvi_1990 =  l5.median()
                   .normalizedDifference(['SR_B4', 'SR_B3']).rename('NDVI')// Rouse 1973
                   .clip(area_estudo)
Map.addLayer(ndvi_1990, {min: -0.17, max: 0.89, palette: ['red','orange','yellow','green'] }, 'NDVI 1990',0)
var ndvi_2020 =  l8.median()
                   .normalizedDifference(['SR_B5', 'SR_B4']).rename('NDVI')// Rouse 1973
                   .clip(area_estudo)
Map.addLayer(ndvi_2020, {min: 0, max: 0.89, palette: ['red','orange','yellow','green'] }, 'NDVI 2020',0)
/*******************************APlicando máscaras a coleção de imagens***************************/
//Diferença entre duas coleções
var diferenca = ndvi_2020.subtract(ndvi_1990).rename('Diferença')
Map.addLayer(diferenca, {min: -0.50, max: 0.38,palette: ['red','orange','yellow','green',]}, 'Diferença',0)
//Criando limiares para vegetação acima 0.7
var NDVI_1990_limiar = ndvi_1990.gt(0.7).selfMask() //limiar pré definido
var NDVI_2020_limiar = ndvi_2020.gt(0.7).selfMask() //limiar pré definido
//Layers
Map.addLayer(NDVI_1990_limiar, {palette: ['green']}, '1990',0)
Map.addLayer(NDVI_2020_limiar, {palette: ['red']}, '2020',0)
/********************************Cálculo de área ****************************************************/
/******************************1990***************************************/
var area_1990 = NDVI_1990_limiar.multiply(ee.Image.pixelArea()).divide(1e6)
//para converter para km²
var area_ndvi_mask_1990= area_1990.reduceRegion({
  reducer: ee.Reducer.sum(), //quero somar a área total
  geometry: area_estudo,
  scale:30,
  crs:'EPSG: 31982',//SIRGAS 2000 22S
 // bestEffort: true,
  maxPixels:1e13})
var area_total_1990= ee.Number(area_ndvi_mask_1990.get('NDVI')).format('%.2f')
print('5 - Área total por classe 1990',area_total_1990)
/******************************2020***************************************/
var area_2020 = NDVI_2020_limiar.multiply(ee.Image.pixelArea()).divide(1e6)
//para converter para km²
var area_ndvi_mask_2020= area_2020.reduceRegion({
  reducer: ee.Reducer.sum(), //quero somar a área total
  geometry: area_estudo,
  scale:30,
  crs:'EPSG: 31982',//SIRGAS 2000 22S
 // bestEffort: true,
  maxPixels:1e13})
var area_total_2020= ee.Number(area_ndvi_mask_2020.get('NDVI')).format('%.2f')
print('6 - Área total por classe 2020',area_total_2020)
var diferenca = ee.Number(area_ndvi_mask_2020.get('NDVI')).subtract(ee.Number(area_ndvi_mask_1990.get('NDVI')))
print('7 - Perda de área:',diferenca)
print('8 - Área do Estado', area_estudo.geometry().area().divide(1000000).format('%.2f'))
/********************************Exportando Imagens***************************************************/
Export.image.toDrive({
image: ndvi_1990,
folder: 'Turma_4',
description: 'NDVI_1990',
region: area_estudo,
scale: 30,
maxPixels: 1e13
})
Export.image.toDrive({
image: ndvi_2020,
folder: 'Turma_4',
description: 'NDVI_2020',
region: area_estudo,
scale: 30,
maxPixels: 1e13
})
/*************************************TREINAMENTO PRÁTICO GEE*****************************************
******************************************************************************************************/
