/*****************************************************************************************************
//Unidade 2 - Importando Coleção de Imagens e Selecionando uma imagem
//Referência: https://developers.google.com/earth-engine/guides
/******************************************UNIDADE 2**********************************************/
/***************************Importando coleção Landsat 8******************************************/
var l8 = ee.ImageCollection("LANDSAT/LC08/C02/T1_L2")
                           .filterDate('2013-01-01','2020-12-31')
                           .filterBounds(Ponto)
                          .filterMetadata('CLOUD_COVER','less_than',5)
print('1 - Coleção Landsat 8', l8)
print('2 - Quantas imagens estou utilizando?',l8.size())
//Adicionando Layer
Map.addLayer(l8,{bands: ['SR_B4', 'SR_B3', 'SR_B2'], min: 7580, max: 15181},'L8 coleção')
/***************************Definindo a "melhor imagem"*****************************************/
var image_l8 = l8.sort('CLOUD_COVER')
print('3 - Ordem de imagen com menor % de nuvem', image_l8)
print('4 - ID da "melhor" imagem', image_l8.first().get('system:id'))
/**************************Selecionando uma imagem**********************************************/
 //Selecionado uma imagem
var first_image = image_l8.first().get('system:id')
var image = ee.Image('LANDSAT/LC08/C02/T1_L2/LC08_223079_20130422') //id veio do print 4
print('5 - Propriedades',image.propertyNames())
print('6 - Bands',image.bandNames())
print('7 - Type',image.bandTypes())
print('8 - Projection', image.projection())
print('9 - Extrair propriedade', image.get('system:id'))
print('10 - Extrair propriedade', image.get('WRS_PATH'))
print('11 - Extrair propriedade', image.get('WRS_ROW'))
print('12 - Extrair propriedade', image.get('CLOUD_COVER'))
//Adicionando Layer
Map.addLayer(image,{bands: ['SR_B4', 'SR_B3', 'SR_B2'], min: 7580, max: 15181},'Landsat 8 única')
/*************************************TREINAMENTO PRÁTICO GEE*****************************************
******************************************************************************************************/
