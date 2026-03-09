/*****************************************************************************************************
//Unidade 3 - Máscara de Vegetação
//Referência: https://developers.google.com/earth-engine/guides
/**************************************UNIDADE 3.2**********************************/
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
Map.addLayer(contorno, {palette: 'Blue'}, 'Bacia Hidrográfica');
//Map.setOptions("HYBRID")
Map.centerObject(area_estudo,10)
/***************Aplicando uma máscara de núvens na coleção landsat**********************/
/******************************Landsat 5 ***********************************************/
function maskL457sr(image) {
  // Bit 0 - Fill
  // Bit 1 - Dilated Cloud
  // Bit 2 - Unused
  // Bit 3 - Cloud
  // Bit 4 - Cloud Shadow
  var qaMask = image.select('QA_PIXEL').bitwiseAnd(parseInt('11111', 2))//analisar
                                                    .eq(0);//2 = Unused //eq = 0 condições claras
  var saturationMask = image.select('QA_RADSAT').eq(0);
  //Aplique os fatores de escala às bandas apropriadas.
  var opticalBands = image.select('SR_B.').multiply(0.0000275).add(-0.2);
  var thermalBand = image.select('ST_B6').multiply(0.00341802).add(149.0);
  //Substitua as bandas originais pelas escalonadas e aplique as máscaras.
  return image.addBands(opticalBands, null, true)
      .addBands(thermalBand, null, true)
      .updateMask(qaMask)
      .updateMask(saturationMask);
}
/******************************Landsat 8 ***********************************************/
function maskL8sr(image) {
    // Bit 0 - Fill
    // Bit 1 - Dilated Cloud
    // Bit 2 - Cirrus
    // Bit 3 - Cloud
    // Bit 4 - Cloud Shadow
    // Bit 5 - Snow
    var qaMask = image.select(['QA_PIXEL']).bitwiseAnd(parseInt('111111', 2)) //analisar
                                          .eq(0) //2 = Cirrus //eq = 0 condições claras
    var saturationMask = image.select("QA_RADSAT").eq(0) //Radiometric saturation QA
    //Aplique os fatores de escala às bandas apropriadas.
    var opticalBands = image.select("SR_B.").multiply(0.0000275).add(-0.2)
    var thermalBands = image.select("ST_B.*").multiply(0.00341802).add(149.0)
    //Substitua as bandas originais pelas escalonadas e aplique as máscaras.
    return image
        .addBands(opticalBands, null, true)
        .addBands(thermalBands, null, true)
        .updateMask(qaMask)
        .updateMask(saturationMask)
}
/*************************Importanto coleção Landsat 5 *******************************/
var l5 = ee.ImageCollection("LANDSAT/LT05/C02/T1_L2")
                            .filterDate('1990-01-01','1990-12-31')
                            .filterBounds(area_estudo)
                            .filterMetadata('CLOUD_COVER','less_than',5)
                            .map(maskL457sr)
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
Map.addLayer(ndvi_1990, {min: 0, max: 0.84, palette: ['red','orange','yellow','green'] }, 'NDVI 1990',0)
var ndvi_2020 =  l8.median()
                   .normalizedDifference(['SR_B5', 'SR_B4']).rename('NDVI')// Rouse 1973
                   .clip(area_estudo)
Map.addLayer(ndvi_2020, {min: 0, max: 0.89, palette: ['red','orange','yellow','green'] }, 'NDVI 2020',0)
/*******************************APlicando máscaras a coleção de imagens***************************/
//Diferença entre duas coleções
var diferenca = ndvi_2020.subtract(ndvi_1990).rename('Diferença')
Map.addLayer(diferenca, {min: -0.50, max: 0.38,palette: ['red','orange','yellow','green',]}, 'Diferença',0)
//Criando fatiamento e mascaras de NDVI
var NDVI_1990_limiar = ndvi_1990.gt(0.7).selfMask() //limiar pré definido
var NDVI_2020_limiar = ndvi_2020.gt(0.7).selfMask() //limiar pré definido
//Layers
Map.addLayer(NDVI_2020_limiar, {palette: ['green']}, '2020',0)
Map.addLayer(NDVI_1990_limiar, {palette: ['red']}, '1990',0)
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
var area_total_1990= ee.Number(area_ndvi_mask_1990)
print('Área total por classe 1990',area_total_1990)
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
var area_total_2020= ee.Number(area_ndvi_mask_2020)
print('Área total por classe 2020',area_total_2020)
/*************************************TREINAMENTO PRÁTICO GEE*****************************************
******************************************************************************************************/
