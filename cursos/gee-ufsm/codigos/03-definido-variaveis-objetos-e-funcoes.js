//Unidade 1.3 - Definido variáveis, objetos e funções
//Referência: https://developers.google.com/earth-engine/guides
/**************************************Criando funções*****************************************/
/*Funções
As funções são outra maneira de melhorar a legibilidade e a reutilização do código,
agrupando conjuntos de operações. Defina uma função com a functionpalavra - chave.
Os nomes das funções começam com uma letra e têm um par de parênteses no final.
As funções geralmente usam parâmetros que dizem à função o que fazer.
Esses parâmetros estão entre parênteses ().
O conjunto de instruções que constituem a função fica entre colchetes.
A return é palavra-chave indica qual é a saída da função.
Existem várias maneiras de declarar uma função, mas aqui usaremos algo assim: */
var funcao = function(parameter1, parameter2, parameter3) {
  demonstracao;
  demonstracao;
  demonstracao;
  return demonstracao;
};
print('1- funcão de exemplo:',funcao)
//Exemplo de funções
var desejo = function(elemento) {
  //Retorne o Argumento
  return elemento;
}
print('2 -Um bom dia para você!', desejo('Igualmente para você!'))
// Faça um dicionário no servidor.
var dictionary = ee.Dictionary ({
   e: Math.E, // é uma constante matemática que é a base dos logaritmos naturais.
   pi: Math.PI, // pi é uma proporção numérica definida pela relação entre o perímetro de uma circunferência e seu diâmetro
   phi: (1 + Math.sqrt (5)) / 2 //sqrt - Calcula a raiz quadrada da entrada.
});
// Obtenha alguns valores do dicionário.
print ('3 - Euler:', dictionary.get ('e'));
print ('4 - Pi:', dictionary.get ('pi'));
print ('5 - Proporção áurea:', dictionary.get ('phi'));//a proporção áurea quando dividimos uma reta em duas partes não iguais.
// Obtenha todas as chaves:
print('6 - Chaves:', dictionary.keys());
/****************************Definindo Datas********************************************************/
// Defina uma data no Earth Engine.
var data = ee.Date('2015-12-31');
print('7 - Data:', data);
// Obtenha a hora atual usando o método JavaScript Date.now ().
var agora = Date.now ();
print('8 - Milissegundos desde 1 de janeiro de 1970', agora);
// Inicializa um objeto ee.Date.
var eeNow = ee.Date(agora);
print('9 - Agora:', eeNow);
var aDate = ee.Date.fromYMD(2020, 5, 8);
print('10 - Date:', aDate);
// passar os parâmetros por nome, em qualquer ordem.
var theDate = ee.Date.fromYMD({
  day: 13,
  month: 1,
  year: 2017
});
print('11 - theDate:', theDate);
