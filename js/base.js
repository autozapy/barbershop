// var baseUrl = "https://localhost:44326/api/";
var baseUrl = "https://hmg-autozap-gudqdafyhhgyb3h5.brazilsouth-01.azurewebsites.net/api/";

function mostrarMensagem(tipo, titulo, mensagem) {
  Swal.fire({
    icon: tipo,
    title: titulo,
    text: mensagem
  });
}

function obterCodigoEstabelecimento() {

  const urlParams = new URLSearchParams(window.location.search);

  return urlParams.get('code');
}