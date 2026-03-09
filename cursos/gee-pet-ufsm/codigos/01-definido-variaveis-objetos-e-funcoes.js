/*****************************************************************************************************
// Unidade 1.1 - Definido variáveis, objetos e funções
// Referência: https://developers.google.com/earth-engine/guides
// Prof. Dr. Emanuel Araújo Silva
/******************************************UNIDADE 1***************************************************/
//Objetos em JavaScript são dicionários de
//Faça um objeto (ou dicionário) usando chaves {}, por exemplo:
//1 - Definição de variável  - Não é um objeto "proxy"
var mundo = 'Olá Mundo'
print ('1 - Variável', mundo)
//2 - Print sem definir variável
print('2 - Olá mundo de outra forma')
//3 - String definida e enviada ao servidor - "Embrulhando" nossa variável em um contêiner (objeto proxy)
//e enviar ao google. Observe na saída do console que ee.Stringé um object, NÃO um string
var umaString = 'Olha a nuvem!'
var eeString = ee.String(umaString)
print('3 - Olhar o que?', eeString)
/***********************************Cliente Servidor************************************************/
//4 - Definindo uma string
var clientString = 'Eu sou uma String';
print('4 - O que eu sou? '+ 'Eu sou uma', typeof clientString);  // string
var serverString = ee.String('Eu não sou uma String!');
print('5 - O que eu sou? ',typeof serverString);  // objeto - porque utilizamos a função ee.String()
print('6 - Isso é um objeto?', serverString instanceof ee.ComputedObject);  // true //instancia de
print('7 - ', serverString);  // I am not a String
print('8 - ',serverString.toString());  // ee.String("Eu não sou uma String, sou um objeto!")
var someString = serverString.getInfo();
var strings = someString + '  Eu sou?';
print('9 - ', strings);  // Eu não sou uma string!  Eu sou?
//Você não deve usar a getInfo()menos que seja absolutamente necessário.
//Se você chamar getInfo()seu código, o Earth Engine abrirá o contêiner e informará
//o que está dentro, mas bloqueará o restante do seu código até que seja feito.
//Definindo a string primeiro
var String_servidor = ee.String('Esta string esta do lado do servidor');
print('10 - String do servidor?', String_servidor)
//Somando string
var a_1 = '1'
var b_2 = '2'
print ('11 - soma de Strings', a_1+b_2)
