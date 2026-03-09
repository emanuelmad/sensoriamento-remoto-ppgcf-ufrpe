/*****************************************************************************************************
//Unidade 2 - Redutores
//Referência: https://developers.google.com/earth-engine/guides
/******************************************UNIDADE 2**********************************************/
/***************************Importando coleção Landsat 8******************************************/
var l8 = ee.ImageCollection("LANDSAT/LC08/C02/T1_L2")
                            .filterDate('2013-01-01','2020-12-31')
                            .filterBounds(ponto)
                            .filterMetadata('CLOUD_COVER','less_than',20)
print('1 - Coleção Landsat 8', l8)
print('2 - Quantas imagens estou utilizando?',l8.size())
//Adicionando Layer
Map.addLayer(l8,{bands: ['SR_B4', 'SR_B3', 'SR_B2'], min: 7580, max: 15181},'L8 coleção')
/***************************Aplicando Redutores"*****************************************/
var median = l8.reduce(ee.Reducer.median()) //redutor de mediana
var mean = l8.reduce(ee.Reducer.mean()) //redutor de média
var stdev = l8.reduce(ee.Reducer.stdDev()) //desvio padrão
print('3 - Bandas da Mediana',median.bandNames())
print('4 - Bandas da Mean',mean.bandNames())
print('5 - Bandas da Desvio Padrão',stdev.bandNames())
//Adicionando Layer
Map.addLayer(median,{bands: ['SR_B4_median', 'SR_B3_median', 'SR_B2_median'], min: 7580, max: 15181},'Landsat 8 Mediana')
Map.addLayer(mean,{bands: ['SR_B4_mean', 'SR_B3_mean', 'SR_B2_mean'], min: 7580, max: 15181},'Landsat 8 Média')
Map.addLayer(stdev,{bands: ['SR_B4_stdDev', 'SR_B3_stdDev', 'SR_B2_stdDev'], min: 0, max: 3939},'Landsat 8 Des Padrão')
