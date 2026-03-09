//Unidade 1.2 - Definido variáveis, objetos e funções
//Referência: https://developers.google.com/earth-engine/guides
/*******************************Trabalhando com números*****************************************/
//Número do lado do Cliente
var a = 1
var b = 2
print ('1 - soma', a+b)
//print ('soma', a.add(b)) //causando erro intencional
//Convertendo para número
var number_a = ee.Number(a)
var number_b = ee.Number(b)
print('2 - soma após conversão', number_a.add(number_b))
//Número do lado do Servidor
var numero_servidor = ee.Number(Math.E)// Math.E cria um valor constante
print('3 - e=', numero_servidor) //Método ee.String() e ee.Number() são construtores.
//Use uma função embutida para realizar uma operação no número.
var logE = numero_servidor.log ();
print('4 - log (e) =', logE);
/**********************************Criando uma lista************************************/
var lista_de_numeros = [1,2,3,4,5]
print('5 - lista de números: ', lista_de_numeros)
var lista_de_strings = ['1','2','3','4','5']
print('6 - lista de strings: ', lista_de_strings)
//Sequencia de uma lista
var sequencia = ee.List.sequence(1,100);
print('7 - Sequencia:', sequencia);
//Selecione o número qualquer da lista
var valor= sequencia.get(1); //extrair informação
print('8 - Valor indexado 1:', valor);
//Converta o valor de retorno de get () em um número.
print('9 - Somando 3 é igual a:', ee.Number(valor).add(3));
//Criando um dicionário
var objeto = {
  a: 'letra',
  b: 13,
  lista: ['a','c','lista']
};
print('10 - Dicionário:', objeto)
print('11 - Somente a: ', objeto['a'])
print('12 - Somente lista: ', objeto.lista)
print('13 - Somente b: ', objeto['b'])
