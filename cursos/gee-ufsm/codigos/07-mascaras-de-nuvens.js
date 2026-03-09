//Unidade 2 - Máscaras de Nuvens
//Referência: https://developers.google.com/earth-engine/guides
/******************************************UNIDADE 2**********************************/
/***************************Importando coleção Landsat 8******************************/
var l8 = ee.ImageCollection("LANDSAT/LC08/C02/T1_L2")
                            .filterDate('2013-01-01','2020-12-31')
                            .filterBounds(ponto)
print('1 - Coleção Landsat 8', l8)
print('2 - Quantas imagens estou utilizando?',l8.size())
//Adicionando Layer
Map.addLayer(l8.first(),{bands: ['SR_B4', 'SR_B3', 'SR_B2'], min: 7580, max: 15181},'L8 coleção')
Map.addLayer(l8.median(),{bands: ['SR_B4', 'SR_B3', 'SR_B2'], min: 6224, max: 23891},'L8 coleção Median')
Map.centerObject(ponto,8) //Centralizar a imagem
/***************************Máscara de nuvens*****************************************/
/****************************Aplicando uma máscara de núvens na coleção landsat**********************/
function maskL8sr(image) {
  // Os bits 4 e 3 são sombra de nuvem e nuvem, respectivamente.
  var cloudShadowBitMask = 1 << 4; //informações obtidas nas propriedas e bandas
  var cloudsBitMask = 1 << 3;//informações obtidas nas propriedas e bandas
  //Obtenha a banda de QA do pixel.
  var qa = image.select('QA_PIXEL');
  // Ambos os sinalizadores devem ser definidos como zero, indicando condições claras.
  var mask = qa.bitwiseAnd(cloudShadowBitMask).eq(0)
      .and(qa.bitwiseAnd(cloudsBitMask).eq(0));
  // Retorne a imagem mascarada, dimensionada para refletir, sem as bandas de controle de qualidade.
  return image.updateMask(mask).select('SR_B[1-7]')
      .multiply(2.75e-05).add(-0.2) //aplica o fator de escala em todas as bandas
      .copyProperties(image, image.propertyNames()) //copia a propriedade da coleção
}
/******************************Aplicando a função na coleção********************************************/
var collection_cloud_mask = l8.map(maskL8sr)
print('3 - Coleção DN to Reflectância', collection_cloud_mask)
print('4 - Nº de imagens após a máscara?',collection_cloud_mask.size())
//Adicionando Layers
Map.addLayer(collection_cloud_mask.first(),{bands: ['SR_B4', 'SR_B3', 'SR_B2'], min: 0.0081, max: 0.19},'L8 Máscara')
Map.addLayer(collection_cloud_mask.median(),{bands: ['SR_B4', 'SR_B3', 'SR_B2'], min: 0.0081, max: 0.31},'L8 Máscara Median')
/*************************************TREINAMENTO PRÁTICO GEE*****************************************
******************************************************************************************************/
