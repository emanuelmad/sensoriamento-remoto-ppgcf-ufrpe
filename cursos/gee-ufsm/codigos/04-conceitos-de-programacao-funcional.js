//Unidade 1.4 - Conceitos de programação funcional
//Referência: https://developers.google.com/earth-engine/guides
/****************************Conceitos de programação funcional******************************************/
// Gera uma lista de números de 1 a 10.
var myList = ee.List.sequence (1, 10);
print('0 - Minha lista', myList)
// A operação map () tem uma função que funciona em cada elemento independentemente
// e retorna um valor. Você define uma função que pode ser aplicada à entrada.
var computeSquares = function(numero) {
   // Definimos a operação usando a API EE.
   return ee.Number(numero).pow(2);
};
// Aplique sua função a cada item da lista usando a função map ().
var square = myList.map(computeSquares);
print('1 - Resultado dos número elevado ao quadrado:', square); // [1, 4, 9, 16, 25, 36, 49, 64, 81]
//Condições If/Else no caso 'se' ou 'se não'
// A função a seguir determina se um número é par ou ímpar. O mod (2)
// a função devolve 0 se o número for par e 1 se for ímpar (o resto
// depois de dividir por 2). A entrada é multiplicada por este resto, então mesmo
// os números são definidos como 0 e os números ímpares permanecem inalterados.
var obter_numero_impares = function (numero) {
   numero = ee.Number(numero); // Converta a entrada em um número para que possamos usar o mod.
   var resto = numero.mod(2); //define os números entre 0 e 1
   return numero.multiply(resto);
};
var newList = myList.map(obter_numero_impares);
// Remova os valores 0.
var numeros_impares = newList.removeAll([0]);
var square = numeros_impares.map(computeSquares);
print('2 - Números ímpares ',square); // [1, 9, 25, 49, 81]
/*********************************LOOPS****************************************************/
//Maneira não recomendada
var clientList = [];
for(var i = 0; i < 8; i++) {
  clientList.push(i+1);
}
print('3- lista do lado do cliente',clientList);
var toServerList = ee.List(clientList);
print('4 - lista do cliente convertida:', toServerList)
//Maneira correta
var serverList = ee.List.sequence(0, 7);
serverList = serverList.map(function(n) {
  return ee.Number(n).add(1); // n + add equivale a i + 1
});
print('5 - Lista criada com Loop .map() no servidor',serverList);
/*********************************Condicionais*********************************************/
var myList = ee.List([1, 2, 3]);
var serverBoolean = myList.contains(5);
print('6 - Contem o 5 ?',serverBoolean);  // false
//Maneira errada
var clientConditional;
if (serverBoolean) {
  clientConditional = true;
} else {
  clientConditional = false;
}
print('7 - Deve ser falso:', clientConditional);  // True!
//Correta
var serverConditional = ee.Algorithms.If(serverBoolean, 'True!', 'False!');
print('8 - Dever ser falso, é falso?', serverConditional);  // False!
//Loop encontrando um valor
//Maneira errada
var A1 = 1
for(var A2 = 0;A2 <= 5;A2++){
    print('A1='+A1)
    print('A2='+A2)
    print('A1='+(A1+A2 == 3))
    if (A1 + A2 == 5){
      print("Achei o 5!")
      break;
    }else{
      print("Deu ruim!")
  }
}
//Maneira correta
var lista = ee.List([1,2,3,4,5]);
var serverBoolean = lista.contains(5);
print('9 - Contem o 5 ?',serverBoolean);  // false
//Correta
var serverConditional = ee.Algorithms.If(serverBoolean, 'Achei!', 'Deu Ruim!');
print('10 - Você achou o número?', serverConditional);  // False!
/*************************************TREINAMENTO PRÁTICO GEE*****************************************
******************************************************************************************************/
