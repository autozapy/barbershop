const services = [];
const profissionais = [];
const dias = [];
const horarios = [];
let currentStep = 1;
const totalSteps = 6;
let codigoEstabelecimento;
const agendamentosCliente = [];

// Dados da aplicação
const bookingData = {
  name: '',
  phone: '',
  service: null,
  profissional: null,
  date: '',
  time: ''
};

// Configurações dos passos
const steps = [
  'Dados Pessoais',
  'Serviço',
  'Profissional',
  'Data',
  'Horário',
  'Confirmação'
];


function cancelarAgendamento(idAgendamento) {

    return new Promise((resolve, reject) => {
    $.ajax({
      url: `${baseUrl}estabelecimentos/${codigoEstabelecimento}/agendamentos/cancelar?agendamentoId=${idAgendamento}`,
      method: 'PUT',
      dataType: 'json',
      success: function () {

        const phone = $('#search-phone').val();

        if (phone) {
          searchAppointments(phone);
        }

        // Mostrar sucesso
        mostrarMensagem('success', 'Sucesso','Agendamento cancelado com sucesso!');

        resolve();
      },
      error: function (xhr, status, error) {
        mostrarMensagem('error', 'Erro', 'Erro ao cancelar agendamento. Tente novamente.');
        
        reject(error); // não avança o passo
      }
    });
   });
}

function carregarServicos(stepContent) {

  if (services && services.length > 0) {
    services.length = 0;
  }

  return new Promise((resolve, reject) => {

    $.ajax({
      url: baseUrl + 'estabelecimentos/' + codigoEstabelecimento + '/servicos',
      type: 'GET',
      dataType: 'json',
      success: function (response) {

        if (response.length === 0) {

          mostrarMensagem('error', 'Ops!', 'No momento, não temos serviços disponíveis. Estamos trabalhando para resolver isso o quanto antes!');

          reject(new Error('Nenhum serviço encontrado'));

          return;
        }

        response.forEach(service => {
          services.push({
            id: service.id,
            name: service.nome,
            description: service.descricao,
            price: service.preco,
            duration: service.duracaoMinutos,
            icon: service.icone
          });
        });

        renderServiceSelection(stepContent);

        resolve();
      },
      error: function (error) {

        mostrarMensagem('error', 'Ops...', 'Não conseguimos carregar os serviços agora. Tente novamente em instantes.');

        reject(error); // não avança o passo

      }
    });
  });
}

function carregarProfissionais(stepContent) {

  if (profissionais && profissionais.length > 0) {
    profissionais.length = 0;
  }

  return new Promise((resolve, reject) => {

    $.ajax({
      url: baseUrl + 'estabelecimentos/' + codigoEstabelecimento + '/profissionais?servicoId=' + bookingData.service.id,
      type: 'GET',
      dataType: 'json',
      success: function (response) {

        if (response.length === 0) {

          mostrarMensagem('error', 'Ops!', 'Parece que não há profissionais disponíveis para esse serviço no momento. Que tal tentar outro?');

          reject(new Error('Nenhum profissional encontrado'));

          return;

        }
        response.forEach(profissional => {
          profissionais.push({
            id: profissional.id,
            name: profissional.nome,
            icon: profissional.icone
          });
        });

        renderBarberSelection(stepContent);

        resolve();

      },
      error: function (error) {
        mostrarMensagem('error', 'Ops...', 'Não conseguimos carregar os profissionais  agora. Tente novamente em instantes.');

        reject(error); // não avança o passo
      }
    });
  });
}

function carregarAgendamentosCliente(celular) {

  $('#appointments-list').html('');
  
  if (agendamentosCliente && agendamentosCliente.length > 0) {
    agendamentosCliente.length = 0;
  }

  return new Promise((resolve, reject) => {

    $.ajax({
      url: baseUrl + 'estabelecimentos/' + codigoEstabelecimento + '/agendamentos/consultartodosativosporcelular?celular=' + celular,
      type: 'GET',
      dataType: 'json',
      success: function (response) {

        if (response.length === 0) {

          mostrarMensagem('error', 'Ops!', 'Não há agendamentos abertos para este contato!');

          reject(new Error('Nenhum agendamento encontrado'));

          return;

        }

        response.forEach(agendamento => {
          agendamentosCliente.push({
                  id: agendamento.id,
                  time: agendamento.hora,
                  clientName: agendamento.nomeCliente,
                  service: agendamento.servico,
                  status: agendamento.status,
                  phone: agendamento.celular,
                  profissional : agendamento.profissional,
                  data : agendamento.data
          });
        });

        displayAppointments(agendamentosCliente, celular);        

        resolve();

      },
      error: function (error) {
        mostrarMensagem('error', 'Ops...', 'Não conseguimos carregar os agendamentos agora. Tente novamente em instantes.');

        reject(error); // não avança o passo
      }
    });
  });
}

function carregarDias(stepContent) {

  if (dias && dias.length > 0) {
    dias.length = 0;
  }

  return new Promise((resolve, reject) => {

    $.ajax({
      url: baseUrl + 'estabelecimentos/' + codigoEstabelecimento + '/disponibilidade/dias?profissionalId=' + bookingData.profissional.id + '&servicoId=' + bookingData.service.id + '&quantidadeDias=14',
      type: 'GET',
      dataType: 'json',
      success: function (response) {
        response.forEach(dia => {
          dias.push({
            data: dia.data,
            dataFormatada: dia.dataFormatada
          });
        });
        console.log(dias);
        renderDateSelection(stepContent);

        resolve();
      },
      error: function (error) {

        mostrarMensagem('error', 'Ops...', 'Não conseguimos carregar os dias disponiveis agora. Tente novamente em instantes.');

        reject(error); // não avança o passo
      }
    });
  });
}

function carregarHorarios(stepContent) {

  if (horarios && horarios.length > 0) {
    horarios.length = 0;
  }

  return new Promise((resolve, reject) => {

    $.ajax({
      url: baseUrl + 'estabelecimentos/' + codigoEstabelecimento + '/disponibilidade/horarios?profissionalId=' + bookingData.profissional.id + '&servicoId=' + bookingData.service.id + '&data=' + bookingData.date,
      type: 'GET',
      dataType: 'json',
      success: function (response) {
        response.forEach(horario => {
          horarios.push({
            time: horario,
            available: true
          });
        });

        renderTimeSelection(stepContent);

        resolve();
      },
      error: function (error) {

        mostrarMensagem('error', 'Ops...', 'Não conseguimos carregar os horarios disponiveis agora. Tente novamente em instantes.');

        reject(error); // não avança o passo
      }
    });
  });
}

function adicionarAgendamento(stepContent) {

  const dadosAgendamento = {
    profissionalId: bookingData.profissional.id,
    servicoId: bookingData.service.id,
    nomeCliente: bookingData.name,
    celular: bookingData.phone,
    dataHora: bookingData.date + 'T' + bookingData.time
  };

  $.ajax({
    url: baseUrl + 'estabelecimentos/' + codigoEstabelecimento + '/agendamentos/adicionar',
    type: 'POST',
    dataType: 'json',
    contentType: 'application/json',
    data: JSON.stringify(dadosAgendamento),
    success: function (response) {

      stepContent.html(`
            <div class="card shadow-sm border-success">
              <div class="card-body p-5 text-center">
                <i class="bi bi-check-circle text-success mb-4" style="font-size: 5rem;"></i>
                <h2 class="fw-bold text-success mb-3">
                  Agendamento Confirmado!
                </h2>
                <p class="lead mb-4">
                  Seu horário foi reservado com sucesso. Você receberá uma confirmação no WhatsApp.
                </p>
                <div class="alert alert-success">
                  <strong>📱 WhatsApp:</strong> ${bookingData.phone}<br />
                  <strong>📅 Data:</strong> ${formatDate(bookingData.date)} às ${bookingData.time}
                </div>
                <button id="voltar-inicio-btn" class="btn btn-barber-outline mt-3">
                  <i class="bi bi-arrow-left me-2"></i> Voltar para o início
                </button>
              </div>
            </div>
          `);

      currentStep++;
      updateProgressSteps();

      $('#voltar-inicio-btn').on('click', function () {
        backToHome();
      });

    },
    error: function (error) {
      mostrarMensagem('error', 'Ops...', error.responseJSON.mensagem);
    }
  });
}

$(document).ready(function () {

  codigoEstabelecimento = obterCodigoEstabelecimento();

  if (!codigoEstabelecimento) {
    return estabelecimentoNaoEncontrado();

  } else {
    initializeApp();
  }

  function estabelecimentoNaoEncontrado() {

    $('#hero-section h1').text('Estabelecimento não encontrado');

    // Substitui a descrição
    $('#hero-section p.lead').html(`
      Não encontramos nenhum estabelecimento para este link.<br>
      Verifique se a URL está correta ou entre em contato com a barbearia.
    `);

    // Opcional: desabilita o botão de agendamento
    $('#start-booking-btn').hide();

    $('.destaques-estabelecimento').hide();

    return;
  }
});

function initializeApp() {

  $('#start-booking-btn').on('click', startBooking);
  $('#back-to-home-btn').on('click', backToHome);
  $('#check-appointments-btn').on('click', showCheckAppointments);
  $('#back-from-check-btn').on('click', backToHome);

  initializeProgressSteps();
}

function startBooking() {

  $('#hero-section').addClass('d-none');
  $('#booking-section').removeClass('d-none');

  currentStep = 1;
  updateProgressSteps();
  renderStep();
}

function backToHome() {

  $('#booking-section').addClass('d-none');
  $('#hero-section').removeClass('d-none');
  $('#check-appointments-section').addClass('d-none');
  
  // Reset dados
  Object.keys(bookingData).forEach(function (key) {
    if (typeof bookingData[key] === 'object' && bookingData[key] !== null) {
      bookingData[key] = null;
    } else {
      bookingData[key] = '';
    }
  });

  currentStep = 1;


}

function showCheckAppointments() {

  $('#hero-section').addClass('d-none');
  $('#check-appointments-section').removeClass('d-none');

  // Reset da seção de consulta
  $('#phone-search-section').removeClass('d-none');
  $('#appointments-results-section').addClass('d-none');
  $('#search-phone').val('');

  initializePhoneSearch();
}

function initializeProgressSteps() {

  const $desktopProgress = $('#progress-desktop');

  steps.forEach((step, index) => {

    const stepNumber = index + 1;

    const $stepElement = $('<div>')
      .addClass('d-flex flex-column align-items-center')
      .html(`
        <div class="progress-step d-flex align-items-center justify-content-center rounded-circle fw-bold bg-light text-muted" 
             style="width: 40px; height: 40px;" 
             data-step="${stepNumber}">
          ${stepNumber}
        </div>
        <small class="mt-2 text-center text-muted" data-step-label="${stepNumber}">
          ${step}
        </small>
      `);

    $desktopProgress.append($stepElement);
  });
}


function updateProgressSteps() {

  // Desktop progress
  $('.progress-step[data-step]').each(function () {
    const $step = $(this);
    const stepNumber = parseInt($step.data('step'));
    const $label = $(`[data-step-label="${stepNumber}"]`);

    $step.attr('class', 'progress-step d-flex align-items-center justify-content-center rounded-circle fw-bold');

    if (stepNumber === currentStep) {
      $step.addClass('active').text(stepNumber);
      if ($label.length) {
        $label.addClass('fw-semibold').removeClass('text-muted');
      }
    } else if (stepNumber < currentStep) {
      $step.addClass('completed').html('✓');
      if ($label.length) {
        $label.removeClass('fw-semibold').addClass('text-muted');
      }
    } else {
      $step.addClass('bg-light text-muted').text(stepNumber);
      if ($label.length) {
        $label.removeClass('fw-semibold').addClass('text-muted');
      }
    }
  });

  // Mobile progress
  $('#mobile-step-number').text(currentStep);
  $('#mobile-step-title').text(steps[currentStep - 1]);
  $('#mobile-step-counter').text(`Passo ${currentStep} de ${totalSteps}`);

  // Progress bar
  const progressPercentage = (currentStep / totalSteps) * 100;
  $('#progress-bar').css('width', `${progressPercentage}%`);
}

function renderStep() {

  const $stepContent = $('#step-content');

  let stepPromise;

  switch (currentStep) {
    case 1:
      renderPersonalInfo($stepContent);
      stepPromise = Promise.resolve();
      break;
    case 2:
      stepPromise = carregarServicos($stepContent);
      break;
    case 3:
      stepPromise = carregarProfissionais($stepContent);
      break;
    case 4:
      stepPromise = carregarDias($stepContent);
      break;
    case 5:
      stepPromise = carregarHorarios($stepContent);
      break;
    case 6:
      renderBookingSummary($stepContent);
      break;
  }

  // Atualiza progresso apenas após o carregamento bem-sucedido
  stepPromise
    .then(() => {
      updateProgressSteps();
    })
    .catch(() => {

      currentStep--; // Reverte o passo em caso de erro

      console.warn('Erro ao carregar dados do step ' + currentStep);
    });
}


function renderPersonalInfo($container) {

  $container.html(`
    <div class="card shadow-sm">
      <div class="card-body p-5">
        <div class="text-center mb-4">
          <i class="bi bi-person barber-gold mb-3" style="font-size: 3rem;"></i>
          <h3 class="fw-bold">Seus Dados</h3>
          <p class="text-muted">Para começarmos, precisamos de algumas informações</p>
        </div>

        <form id="personal-info-form">
          <div class="mb-4">
            <label for="name" class="form-label fw-semibold">
              <i class="bi bi-person me-2"></i>
              Nome Completo *
            </label>
            <input
              type="text"
              id="name"
              class="form-control form-control-lg"
              placeholder="Digite seu nome completo"
              value="${bookingData.name}"
            />
            <div class="invalid-feedback">
              <i class="bi bi-exclamation-circle me-1"></i>
              Por favor, informe seu nome para continuar
            </div>
          </div>

          <div class="mb-5">
            <label for="phone" class="form-label fw-semibold">
              <i class="bi bi-phone me-2"></i>
              Telefone *
            </label>
            <input
              type="tel"
              id="phone"
              class="form-control form-control-lg"
              placeholder="(11) 99999-9999"
              value="${bookingData.phone}"
              maxlength="15"
            />
            <div class="invalid-feedback">
              <i class="bi bi-exclamation-circle me-1"></i>
              Digite um telefone válido no formato (11) 99999-9999
            </div>
          </div>

          <div class="d-grid">
            <button
              type="submit"
              class="btn btn-barber-primary btn-lg"
            >
              Continuar
            </button>
          </div>
        </form>
      </div>
    </div>
  `);

  // Event listeners com jQuery
  $('#name').on('input', function () {
    bookingData.name = $(this).val();
    validatePersonalInfo();
  });

  $('#phone').on('input', function () {
    bookingData.phone = formatPhone($(this).val());
    $(this).val(bookingData.phone);
    validatePersonalInfo();
  });

  $('#personal-info-form').on('submit', function (e) {
    e.preventDefault();
    if (validatePersonalInfo()) {
      nextStep();
    }
  });
}

function formatPhone(value) {
  const numbers = value.replace(/\D/g, '');

  if (numbers.length <= 2) {
    return numbers;
  } else if (numbers.length <= 7) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  } else if (numbers.length <= 11) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
  } else {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  }
}

function validatePersonalInfo() {

  const $nameInput = $('#name');
  const $phoneInput = $('#phone');
  const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;

  let isValid = true;

  if (!bookingData.name.trim()) {
    $nameInput.addClass('is-invalid').removeClass('is-valid');
    isValid = false;
  } else {
    $nameInput.removeClass('is-invalid').addClass('is-valid');
  }

  if (!phoneRegex.test(bookingData.phone)) {
    $phoneInput.addClass('is-invalid').removeClass('is-valid');
    isValid = false;
  } else {
    $phoneInput.removeClass('is-invalid').addClass('is-valid');
  }

  return isValid;
}

function renderServiceSelection($container) {

  $container.html(`
    <div class="card shadow-sm">
      <div class="card-body p-5">
        <div class="text-center mb-4">
          <i class="bi bi-scissors barber-gold mb-3" style="font-size: 3rem;"></i>
          <h3 class="fw-bold">Escolha o Serviço</h3>
          <p class="text-muted">Selecione o serviço desejado</p>
        </div>

        <div class="row g-3 mb-5">
          ${services.map(service => `
            <div class="col-md-6">
              <div class="service-card card h-100 border-2 ${bookingData.service?.id === service.id ? 'selected' : ''}" 
                   data-service-id="${service.id}">
                <div class="card-body text-center">
                  <div class="display-4 mb-3">${service.icon}</div>
                  <h5 class="fw-bold">${service.name}</h5>
                  <p class="text-muted small mb-3">${service.description}</p>
                  <div class="d-flex justify-content-between align-items-center">
                    <span class="fw-bold barber-gold fs-5">R$ ${service.price}</span>
                    <small class="text-muted">${service.duration} min</small>
                  </div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="d-flex gap-3">
          <button class="btn btn-barber-outline flex-fill" onclick="previousStep()">
            <i class="bi bi-arrow-left me-2"></i>
            Voltar
          </button>
          <button id="service-continue-btn" class="btn btn-barber-primary flex-fill" disabled>
            Continuar
          </button>
        </div>
      </div>
    </div>
  `);

  // Event listeners com jQuery
  $('.service-card').on('click', function () {
    const serviceId = $(this).data('service-id');
    const service = services.find(s => s.id === serviceId);

    bookingData.service = service;


    $('.service-card').removeClass('selected');
    $(this).addClass('selected');

    $('#service-continue-btn').prop('disabled', false);
  });

  $('#service-continue-btn').on('click', nextStep);
}

function renderBarberSelection($container) {
  $container.html(`
    <div class="card shadow-sm">
      <div class="card-body p-5">
        <div class="text-center mb-4">
          <i class="bi bi-people barber-gold mb-3" style="font-size: 3rem;"></i>
          <h3 class="fw-bold">Escolha o Profissional</h3>
          <p class="text-muted">
            Selecione seu barbeiro preferido para o serviço: 
            <strong class="barber-gold">${bookingData.service?.name}</strong>
          </p>
        </div>

        <div class="row g-3 mb-5">
          ${profissionais.map(profissional => `
            <div class="col-md-6">
              <div class="barber-card card h-100 border-2 ${profissional.barber?.id === profissional.id ? 'selected' : ''}" 
                   data-barber-id="${profissional.id}">
                <div class="card-body text-center">
                  <div class="display-4 mb-3">${profissional.icon}</div>
                  <h5 class="fw-bold">${profissional.name}</h5>
                </div>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="d-flex gap-3">
          <button class="btn btn-barber-outline flex-fill" onclick="previousStep()">
            <i class="bi bi-arrow-left me-2"></i>
            Voltar
          </button>
          <button id="barber-continue-btn" class="btn btn-barber-primary flex-fill" disabled>
            Continuar
          </button>
        </div>
      </div>
    </div>
  `);

  // Event listeners com jQuery
  $('.barber-card').on('click', function () {
    const barberId = $(this).data('barber-id');
    const barber = profissionais.find(b => b.id === barberId);

    bookingData.profissional = barber;

    $('.barber-card').removeClass('selected');
    $(this).addClass('selected');

    $('#barber-continue-btn').prop('disabled', false);
  });

  $('#barber-continue-btn').on('click', nextStep);
}

function renderDateSelection($container) {
  const currentMonth = new Date();
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  $container.html(`
    <div class="card shadow-sm">
      <div class="card-body p-5">
        <div class="text-center mb-4">
          <i class="bi bi-calendar barber-gold mb-3" style="font-size: 3rem;"></i>
          <h3 class="fw-bold">Escolha a Data</h3>
          <p class="text-muted">
            Serviço: <strong class="barber-gold">${bookingData.service?.name}</strong> com 
            <strong class="barber-gold">${bookingData.profissional?.name}</strong>
          </p>
        </div>

        <div class="calendar-container mb-5">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <button id="prev-month" class="btn btn-outline-secondary">
              <i class="bi bi-chevron-left"></i>
            </button>
            <h4 id="current-month" class="fw-bold mb-0">
              ${monthNames[currentMonth.getMonth()]} ${currentMonth.getFullYear()}
            </h4>
            <button id="next-month" class="btn btn-outline-secondary">
              <i class="bi bi-chevron-right"></i>
            </button>
          </div>

          <div class="calendar-grid">
            <div class="row g-1 mb-2">
              <div class="col text-center"><small class="fw-semibold text-muted">Dom</small></div>
              <div class="col text-center"><small class="fw-semibold text-muted">Seg</small></div>
              <div class="col text-center"><small class="fw-semibold text-muted">Ter</small></div>
              <div class="col text-center"><small class="fw-semibold text-muted">Qua</small></div>
              <div class="col text-center"><small class="fw-semibold text-muted">Qui</small></div>
              <div class="col text-center"><small class="fw-semibold text-muted">Sex</small></div>
              <div class="col text-center"><small class="fw-semibold text-muted">Sáb</small></div>
            </div>
            <div id="calendar-days"></div>
          </div>

          <div class="mt-3">
            <small class="text-muted">
              <span class="me-3">📅 Fechado aos domingos</span>
              <span>⚠️ Datas passadas indisponíveis</span>
            </small>
          </div>
        </div>

        <div class="d-flex gap-3">
          <button class="btn btn-barber-outline flex-fill" onclick="previousStep()">
            <i class="bi bi-arrow-left me-2"></i>
            Voltar
          </button>
          <button id="date-continue-btn" class="btn btn-barber-primary flex-fill" disabled>
            Continuar
          </button>
        </div>
      </div>
    </div>
  `);

  // Render calendar e configurar eventos
  renderCalendar(currentMonth);

  $('#date-continue-btn').on('click', nextStep);
}

function renderCalendar() {

  const $daysContainer = $('#calendar-days');
  $daysContainer.empty();

  // Converte os dias retornados pela API em Date
  const diasDisponiveis = dias.map(d => {
    const [ano, mes, dia] = d.data.split('T')[0].split('-').map(Number);
    return new Date(ano, mes - 1, dia);
  });

  if (diasDisponiveis.length === 0) return;

  // Gera todos os dias consecutivos entre o primeiro e o último
  const dataInicio = new Date(diasDisponiveis[0]);
  const dataFim = new Date(diasDisponiveis[diasDisponiveis.length - 1]);

  const diasIntervalo = [];
  let cursor = new Date(dataInicio);
  while (cursor <= dataFim) {
    diasIntervalo.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  let $row = $('<div>').addClass('row g-1 mb-1');

  const firstDayOfWeek = diasIntervalo[0].getDay(); // 0 = domingo

  // Preenche espaços vazios no início da 1ª semana
  for (let i = 0; i < firstDayOfWeek; i++) {
    $row.append($('<div class="col"></div>'));
  }

  diasIntervalo.forEach(date => {
    const formatted = formatDateInteira(date);
    const isAvailable = dias.some(d => d.dataFormatada === formatted);
    const isDisabled = !isAvailable || isPastDate(date) || isSunday(date);
    const isSelected = bookingData.date === date.toISOString().split('T')[0];
    const isToday = date.toDateString() === new Date().toDateString();

    const $button = $('<button>')
      .addClass('calendar-day btn w-100 p-2 border')
      .toggleClass('selected', isSelected)
      .toggleClass('btn-outline-light', !isSelected)
      .toggleClass('dias-calendario', !isSelected)
      .toggleClass('text-muted', !isAvailable)
      .toggleClass('border-warning', isToday && !isSelected)
      .toggleClass('text-warning', isToday && !isSelected)
      .toggleClass('indisponivel', isDisabled)
      .attr('data-date', date.toISOString().split('T')[0])
      .prop('disabled', isDisabled)
      .text(date.getDate());

    const $col = $('<div>').addClass('col').append($button);
    $row.append($col);

    if ($row.find('.col').length === 7) {
      $daysContainer.append($row);
      $row = $('<div>').addClass('row g-1 mb-1');
    }
  });

  // Preenche o final da última linha, se necessário
  if ($row.children().length > 0) {
    const colunasFaltando = 7 - $row.children().length;
    for (let i = 0; i < colunasFaltando; i++) {
      $row.append($('<div class="col"></div>'));
    }
    $daysContainer.append($row);
  }

  // Evento de clique para seleção
  $daysContainer.find('.calendar-day:not(:disabled)').on('click', function () {
    bookingData.date = $(this).data('date');

    $daysContainer.find('.calendar-day').removeClass('selected').addClass('dias-calendario');
    $(this).addClass('selected').removeClass('dias-calendario');

    $('#date-continue-btn').prop('disabled', false);
  });
}


function getNextSevenDays() {
  const days = [];
  const today = new Date();  // Data atual
  const currentDate = new Date(today);  // Cria uma cópia da data atual

  for (let i = 0; i < 7; i++) {
    days.push(new Date(currentDate));  // Adiciona o dia atual à lista
    currentDate.setDate(currentDate.getDate() + 1);  // Avança para o próximo dia
  }
  console.log(days);
  return days;
}

function isPastDate(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

function isSunday(date) {
  return date.getDay() === 0;
}

function validarData(currentDate) {
  const formattedCurrentDate = formatDateInteira(currentDate);
  const resultado = dias.filter(item => item.dataFormatada === formattedCurrentDate);

  return resultado.length > 0;
}

function formatDateInteira(date) {
  if (!(date instanceof Date) || isNaN(date)) {
    throw new Error('Invalid date');
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  const formattedDate = `${day}/${month}/${year}`;

  return formattedDate;
}

function renderTimeSelection($container) {
  const formatDate = (dateString) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  $container.html(`
    <div class="card shadow-sm">
      <div class="card-body p-5">
        <div class="text-center mb-4">
          <i class="bi bi-clock barber-gold mb-3" style="font-size: 3rem;"></i>
          <h3 class="fw-bold">Escolha o Horário</h3>
          <p class="text-muted">
            <strong class="barber-gold">${bookingData.service?.name}</strong> com 
            <strong class="barber-gold">${bookingData.profissional?.name}</strong>
          </p>
          <p class="text-muted">
            📅 ${formatDate(bookingData.date)}
          </p>
        </div>

        <div class="mb-4">
          <div class="alert alert-info">
            <div class="d-flex align-items-center">
              <i class="bi bi-clock me-2"></i>
              <small>
                Duração estimada: <strong>${bookingData.service?.duration} minutos</strong>
              </small>
            </div>
          </div>
        </div>

        <div class="mb-4">
          <h6 class="fw-semibold mb-3">🌅 Manhã</h6>
          <div class="row g-2">
            ${horarios.filter(slot => parseInt(slot.time.split(':')[0]) < 12).map(slot => `
              <div class="col-6 col-md-3">
                <button class="time-slot btn w-100 border ${bookingData.time === slot.time ? 'selected' : ''
    } ${!slot.available ? 'disabled btn-outline-secondary' : 'btn-outline-primary'}"
                data-time="${slot.time}" ${!slot.available ? 'disabled' : ''}>
                  ${slot.time}
                </button>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="mb-5">
          <h6 class="fw-semibold mb-3">☀️ Tarde</h6>
          <div class="row g-2">
            ${horarios.filter(slot => parseInt(slot.time.split(':')[0]) >= 12).map(slot => `
              <div class="col-6 col-md-3">
                <button class="time-slot btn w-100 border ${bookingData.time === slot.time ? 'selected' : ''
      } ${!slot.available ? 'disabled btn-outline-secondary' : 'btn-outline-primary'}"
                data-time="${slot.time}" ${!slot.available ? 'disabled' : ''}>
                  ${slot.time}
                </button>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="mb-4">
          <small class="text-muted">
            <span class="me-3">⏰ Horários disponíveis</span>
            <span>❌ Horários ocupados</span>
          </small>
        </div>

        <div class="d-flex gap-3">
          <button class="btn btn-barber-outline flex-fill" onclick="previousStep()">
            <i class="bi bi-arrow-left me-2"></i>
            Voltar
          </button>
          <button id="time-continue-btn" class="btn btn-barber-primary flex-fill" disabled>
            Continuar
          </button>
        </div>
      </div>
    </div>
  `);

  // Event listeners com jQuery
  $container.find('.time-slot:not([disabled])').on('click', function () {
    bookingData.time = $(this).data('time');

    $container.find('.time-slot').removeClass('selected');
    $(this).addClass('selected');

    $('#time-continue-btn').prop('disabled', false);
  });

  $('#time-continue-btn').on('click', nextStep);
}

function renderBookingSummary($container) {

  const formatDate = (dateString) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  $container.html(`
    <div class="card shadow-sm">
      <div class="card-body p-5">
        <div class="text-center mb-4">
          <i class="bi bi-check-circle barber-gold mb-3" style="font-size: 3rem;"></i>
          <h3 class="fw-bold">Confirmar Agendamento</h3>
          <p class="text-muted">Revise os dados do seu agendamento</p>
        </div>

        <div class="row g-4 mb-5">
          <div class="col-md-6">
            <div class="border rounded p-4 h-100">
              <h6 class="fw-semibold mb-3 d-flex align-items-center">
                <i class="bi bi-person barber-gold me-2"></i>
                Dados Pessoais
              </h6>
              <p class="mb-2">
                <strong>Nome:</strong> ${bookingData.name}
              </p>
              <p class="mb-0">
                <i class="bi bi-phone me-1"></i>
                ${bookingData.phone}
              </p>
            </div>
          </div>

          <div class="col-md-6">
            <div class="border rounded p-4 h-100">
              <h6 class="fw-semibold mb-3 d-flex align-items-center">
                <i class="bi bi-scissors barber-gold me-2"></i>
                Serviço
              </h6>
              <p class="mb-2">
                <strong>${bookingData.service?.name}</strong>
              </p>
              <p class="mb-0">
                <i class="bi bi-clock me-1"></i>
                ${bookingData.service?.duration} minutos
              </p>
            </div>
          </div>

          <div class="col-md-6">
            <div class="border rounded p-4 h-100">
              <h6 class="fw-semibold mb-3 d-flex align-items-center">
                <i class="bi bi-people barber-gold me-2"></i>
                Profissional
              </h6>
              <p class="mb-0">
                <strong>${bookingData.profissional?.name}</strong>
              </p>
            </div>
          </div>

          <div class="col-md-6">
            <div class="border rounded p-4 h-100">
              <h6 class="fw-semibold mb-3 d-flex align-items-center">
                <i class="bi bi-calendar barber-gold me-2"></i>
                Data e Horário
              </h6>
              <p class="mb-2">
                ${formatDate(bookingData.date)}
              </p>
              <p class="mb-0">
                <i class="bi bi-clock me-1"></i>
                ${bookingData.time}
              </p>
            </div>
          </div>
        </div>

        <div class="alert alert-warning mb-4">
          <div class="d-flex justify-content-between align-items-center">
            <span class="fw-semibold d-flex align-items-center">
              <i class="bi bi-currency-dollar me-2"></i>
              Valor Total:
            </span>
            <span class="fs-4 fw-bold barber-gold">
              R$ ${bookingData.service?.price}
            </span>
          </div>
        </div>

        <div class="alert alert-info mb-4">
          <h6 class="fw-semibold mb-2">📋 Informações Importantes:</h6>
          <ul class="mb-0 small">
            <li>Chegue com 10 minutos de antecedência</li>
            <li>Em caso de atraso superior a 15 minutos, o horário poderá ser reagendado</li>
            <li>Para cancelar ou reagendar, entre em contato com pelo menos 2 horas de antecedência</li>
            <li>Pagamento no local (dinheiro, cartão ou PIX)</li>
          </ul>
        </div>

        <div class="d-flex gap-3">
          <button class="btn btn-barber-outline flex-fill" onclick="previousStep()">
            <i class="bi bi-arrow-left me-2"></i>
            Voltar
          </button>
          <button id="confirm-btn" class="btn btn-barber-primary flex-fill">
            <i class="bi bi-check-circle me-2"></i>
            Confirmar Agendamento
          </button>
        </div>
      </div>
    </div>
  `);

  $('#confirm-btn').on('click', confirmBooking);
}

function confirmBooking() {
  const $confirmBtn = $('#confirm-btn');
  const $stepContent = $('#step-content');

  // Mostrar loading
  $confirmBtn.html(`
    <span class="spinner-border spinner-border-sm me-2"></span>
    Confirmando...
  `);
  $confirmBtn.prop('disabled', true);

  adicionarAgendamento($stepContent);

}


function formatDate(dateString) {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function nextStep() {
  if (currentStep < totalSteps) {
    currentStep++;
    renderStep();
  }
}

function previousStep() {
  if (currentStep > 1) {
    currentStep--;
    renderStep();
  }
}

// ============= SISTEMA DE CONSULTA DE AGENDAMENTOS =============

function initializePhoneSearch() {

  const $phoneInput = $('#search-phone');
  const $form = $('#phone-search-form');
  const $newSearchBtn = $('#new-search-btn');

  // Formatar telefone enquanto digita
  $phoneInput.on('input', function () {
    $(this).val(formatPhone($(this).val()));
    validatePhoneSearch();
  });

  // Submit do formulário de busca
  $form.on('submit', function (e) {
    e.preventDefault();
    if (validatePhoneSearch()) {
      searchAppointments($phoneInput.val());
    }
  });

  // Botão de nova pesquisa
  $newSearchBtn.on('click', function () {
    $('#phone-search-section').removeClass('d-none');
    $('#appointments-results-section').addClass('d-none');
    $phoneInput.val('').focus();
  });
}


function validatePhoneSearch() {

  const $phoneInput = $('#search-phone');
  const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;

  if (!phoneRegex.test($phoneInput.val())) {
    $phoneInput.addClass('is-invalid').removeClass('is-valid');
    return false;
  } else {
    $phoneInput.removeClass('is-invalid').addClass('is-valid');
    return true;
  }
}

function searchAppointments(phone) {

  carregarAgendamentosCliente(phone);
}

function displayAppointments(phone) {
  const $phoneSection = $('#phone-search-section');
  const $resultsSection = $('#appointments-results-section');
  const $appointmentsList = $('#appointments-list');
  $appointmentsList.html('');

  $phoneSection.addClass('d-none');
  $resultsSection.removeClass('d-none');

  if (agendamentosCliente.length === 0) {
    $appointmentsList.html(`
      <div class="text-center py-5">
        <i class="bi bi-calendar-x text-muted" style="font-size: 4rem;"></i>
        <h4 class="mt-3">Nenhum agendamento encontrado</h4>
        <p class="text-muted">Não foram encontrados agendamentos para o número ${phone}</p>
        <button class="btn btn-barber-primary" onclick="$('#new-search-btn').click()">
          <i class="bi bi-search me-2"></i>
          Tentar outro número
        </button>
      </div>
    `);
    return;
  }

  $appointmentsList.html(agendamentosCliente.map(appointment => {
    const appointmentDate = new Date(appointment.data + 'T' + appointment.time);
    const now = new Date();
    const canCancel = appointment.status === 'CONFIRMADO' && appointmentDate > now;

    return `
      <div class="appointment-card card mb-3 shadow-sm">
        <div class="card-body p-4">
          <!-- Header com status e botão -->
          <div class="d-flex justify-content-between align-items-center mb-3">
            <div class="d-flex align-items-center">
              <i class="bi bi-scissors me-2 barber-gold"></i>
              <h5 class="fw-bold mb-0 text-dark">${appointment.service}</h5>
            </div>

            <div class="d-flex align-items-center gap-2">
              <span class="badge status-badge ${appointment.status} fs-6">
                ${getStatusText(appointment.status)}
              </span>
              ${canCancel ? `
                <button 
                  class="btn btn-outline-danger btn-sm"
                  onclick="confirmCancelAppointment(${appointment.id}, '${appointment.service}', '${appointment.data}', '${appointment.time}')"
                  title="Cancelar agendamento"
                >
                  <i class="bi bi-x-circle me-1"></i>
                  <span class="d-none d-sm-inline">Cancelar</span>
                </button>
              ` : ''}
            </div>
          </div>
          
          <!-- Informações principais -->
          <div class="row g-3">
            <!-- Profissional -->
            <div class="col-12 col-md-6">
              <div class="d-flex align-items-center">
                <div class="flex-shrink-0 me-3">
                  <div class="bg-light rounded-circle d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
                    <i class="bi bi-person-fill barber-gold"></i>
                  </div>
                </div>
                <div>
                  <p class="mb-0 fw-semibold text-dark">${appointment.profissional}</p>
                  <small class="text-muted">Profissional</small>
                </div>
              </div>
            </div>
            
            <!-- Data e Hora -->
            <div class="col-12 col-md-6">
              <div class="d-flex align-items-center">
                <div class="flex-shrink-0 me-3">
                  <div class="bg-light rounded-circle d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
                    <i class="bi bi-calendar-event barber-gold"></i>
                  </div>
                </div>
                <div>
                  <p class="mb-0 fw-semibold text-dark">${formatAppointmentDate(appointment.data)}</p>
                  <small class="text-muted">
                    <i class="bi bi-clock me-1"></i>
                    ${appointment.time}
                  </small>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Informações adicionais no mobile -->
          <div class="d-md-none mt-3 pt-3 border-top">
            <div class="d-flex justify-content-between align-items-center">
              <small class="text-muted">
                <i class="bi bi-person me-1"></i>
                Cliente: ${appointment.clientName}
              </small>
              ${canCancel ? `
                <button 
                  class="btn btn-outline-danger btn-sm"
                  onclick="confirmCancelAppointment(${appointment.id}, '${appointment.service}', '${appointment.date}', '${appointment.time}')"
                >
                  <i class="bi bi-x-circle me-1"></i>
                  Cancelar
                </button>
              ` : ''}
            </div>
          </div>
        </div>
      </div>
    `;
  }).join(''));
}

function formatAppointmentDate(dateString) {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function getStatusText(status) {
  const statusMap = {
    'agendado': 'Agendado',
    'realizado': 'Realizado',
    'cancelado': 'Cancelado'
  };
  return statusMap[status] || status;
}

function confirmCancelAppointment(appointmentId, serviceName, date, time) {

  const formattedDate = formatAppointmentDate(date);

  askConfirmation({ appointmentId, serviceName, formattedDate, time });

  $('#confirm-action-btn').on('click', function () {
    const appointmentId = $(this).data('appointment-id');

    // Fecha o modal
    const modalEl = document.getElementById('confirmationModal');
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    modalInstance.hide();

    // Executa a ação
    cancelarAgendamento(appointmentId);
  });
}

function askConfirmation({ appointmentId, serviceName, formattedDate, time }) {

  // Define o conteúdo do modal
  $('#modal-title').text('Confirmar Cancelamento');
  $('#modal-body').html(`
    <p>Tem certeza que deseja cancelar o agendamento?</p>
    <ul>
      <li><strong>Serviço:</strong> ${serviceName}</li>
      <li><strong>Data:</strong> ${formattedDate}</li>
      <li><strong>Horário:</strong> ${time}</li>
    </ul>
    <p class="text-danger"><strong>Esta ação não pode ser desfeita.</strong></p>
  `);

  // Armazena o ID do agendamento no botão
  $('#confirm-action-btn').data('appointment-id', appointmentId);

  // Mostra o modal
  const modal = new bootstrap.Modal(document.getElementById('confirmationModal'));
  
  modal.show();

}