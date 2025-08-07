//var baseUrl = "http://localhost:5097/api/";
//var baseUrl = "https://hmg-autozap-gudqdafyhhgyb3h5.brazilsouth-01.azurewebsites.net/api/";
var rota;

window.configGlobal = {
  codigoEstabelecimento: null,
  // baseUrl: 'https://api.agendamento360.com.br/api/'
  baseUrl: 'http://localhost:5097/api/'
};

import { rotas } from './router.js';

window.mostrarMensagem = function(tipo, titulo, mensagem) {
  Swal.fire({
    icon: tipo,
    title: titulo,
    text: mensagem
  });
};

function carregarPagina(config) {

  // Carrega HTML
  fetch(config.html)
    .then(res => res.text())
    .then(html => {
      document.getElementById('conteudo').innerHTML = html;

      // Carrega CSS se houver
      if (config.css) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = config.css;
        document.head.appendChild(link);
      }

      // Carrega script se houver
      if (config.script) {

        const script = document.createElement('script');
        script.src = config.script;
        script.defer = true;

        // Quando o JS for carregado, tenta executar a função inicializadora
        script.onload = () => {
          const nomeFuncao = `inicializar${config.nome.charAt(0).toUpperCase() + config.nome.slice(1)}`;
          
          const funcaoInit = window[nomeFuncao];

          if (typeof funcaoInit === 'function') {
            funcaoInit(); // Chama a função dinamicamente
          } else {
            console.warn(`Função ${nomeFuncao} não encontrada.`);
          }
        };

        document.body.appendChild(script);
      }
    });
}

$(document).ready(function () {

  const isLocal = location.hostname === 'localhost';

  if (isLocal) {
    const params = new URLSearchParams(window.location.search);

    window.configGlobal.codigoEstabelecimento = params.get('codigo');
    rota = params.get('rota') || 'home';

  } else {

    const partes = location.pathname.split('/').filter(Boolean);
    window.configGlobal.codigoEstabelecimento = partes[0];
    rota = partes[1] || 'home';
  }

  if (rotas[rota]) {
    document.title = rotas[rota].titulo;
    carregarPagina(rotas[rota]);
  } else {
    $('body').html('<h1>404 - Página não encontrada</h1>');
  }

});