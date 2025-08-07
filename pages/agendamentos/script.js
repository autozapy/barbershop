const profissionais = [];
const agendamentos = [];
let codigoEstabelecimento = window.configGlobal.codigoEstabelecimento || null;
let baseUrl = window.configGlobal.baseUrl || null;

function carregarProfissionais() {

  if (profissionais && profissionais.length > 0) {
    profissionais.length = 0;
  }

  $.ajax({
    url: baseUrl + 'estabelecimentos/' + codigoEstabelecimento + '/profissionais',
    type: 'GET',
    dataType: 'json',
    success: function (response) {
      response.forEach(profissional => {
        profissionais.push({
          id: profissional.id,
          name: profissional.nome,
          icon: profissional.icone
        });
      });
      loadProfessionals();
    },
    error: function (error) {
      mostrarMensagem('error', 'Ops...', 'Não conseguimos carregar os profissionais agora. Tente novamente em instantes.');
    }
  });
}

function atualizarAgendamento(idAgendamento, status) {

  let urlAgendamento = `${baseUrl}estabelecimentos/${codigoEstabelecimento}/agendamentos`;

  const caminho = status === "cancelar" ? "/cancelar" : "/atendido";

  urlAgendamento = `${urlAgendamento}${caminho}?agendamentoId=${idAgendamento}`;

  $.ajax({
    url: urlAgendamento,
    type: 'PUT',
    dataType: 'json',
    success: function (response) {
      loadAppointments();

      if (status == "cancelar")
        mostrarMensagem('success', 'Agendamento cancelado com sucesso!');
      else
        mostrarMensagem('success', 'Atendimento realizado com sucesso!');

    },
    error: function (error) {
      mostrarMensagem('error', 'Ops...', 'Não conseguimos atualizar o agendamento agora. Tente novamente em instantes.');
    }
  });
}

function carregarAgendamentos(profissional, data) {

  if (agendamentos && agendamentos.length > 0) {
    agendamentos.length = 0;
  }

  $.ajax({
    url: baseUrl + 'estabelecimentos/' + codigoEstabelecimento + '/Agendamentos/ConsultarPorDataProfissional?profissional=' + profissional + '&data=' + data,
    type: 'GET',
    dataType: 'json',
    success: function (response) {
      response.forEach(agendamento => {
        agendamentos.push({
          id: agendamento.id,
          time: agendamento.horaInicio,
          clientName: agendamento.nomeCliente,
          service: agendamento.servico,
          status: agendamento.status,
          phone: agendamento.celular,
          categoria: agendamento.categoria,
          horaInicio: agendamento.horaInicio,
          horaFim: agendamento.horaFim,
        });
      });

      // Atualizar contador
      $('#appointments-count').text(`${agendamentos.length} agendamento${agendamentos.length !== 1 ? 's' : ''}`);

      const appointmentsList = $('#appointments-list');
      appointmentsList.empty();

      if (agendamentos.length === 0) {
        appointmentsList.html(`
      <div class="text-center py-5">
        <i class="bi bi-calendar-x text-muted mb-3" style="font-size: 3rem;"></i>
        <h5 class="text-muted">Nenhum agendamento para este dia</h5>
        <p class="text-muted">Não há agendamentos marcados para esta data.</p>
      </div>
    `);
        return;
      }

      // Ordenar por horário
      agendamentos.sort((a, b) => a.time.localeCompare(b.time));

      agendamentos.forEach(appointment => {
        if (appointment.categoria == "BLOQUEIO")
          appointmentsList.append(createBlockCard(appointment));
        else
          appointmentsList.append(createAppointmentCard(appointment));
      });

    },
    error: function (error) {
      mostrarMensagem('error', 'Ops...', 'Não conseguimos carregar os agendamentos agora. Tente novamente em instantes.');
    }
  });
}

// Dados de exemplo de agendamentos
const appointmentsData = {
  'carlos': {
    '2025-07-29': [
      {
        id: 1,
        time: '09:00',
        clientName: 'João Silva',
        service: 'Corte Masculino',
        status: 'agendado',
        phone: '(11) 99999-1111'
      },
      {
        id: 2,
        time: '10:30',
        clientName: 'Pedro Santos',
        service: 'Corte + Barba',
        status: 'agendado',
        phone: '(11) 99999-2222'
      },
      {
        id: 3,
        time: '14:00',
        clientName: 'Carlos Oliveira',
        service: 'Barba Completa',
        status: 'realizado',
        phone: '(11) 99999-3333'
      },
      {
        id: 4,
        time: '15:30',
        clientName: 'Lucas Costa',
        service: 'Corte Masculino',
        status: 'agendado',
        phone: '(11) 99999-4444'
      },
      {
        id: 5,
        time: '17:00',
        clientName: 'Rafael Lima',
        service: 'Sobrancelha',
        status: 'agendado',
        phone: '(11) 99999-5555'
      }
    ],
    '2025-07-28': [
      {
        id: 6,
        time: '09:30',
        clientName: 'Anderson Silva',
        service: 'Corte + Barba',
        status: 'realizado',
        phone: '(11) 99999-6666'
      },
      {
        id: 7,
        time: '11:00',
        clientName: 'Fernando Costa',
        service: 'Corte Masculino',
        status: 'cancelado',
        phone: '(11) 99999-7777'
      }
    ]
  },
  'miguel': {
    '2025-07-29': [
      {
        id: 8,
        time: '08:30',
        clientName: 'Roberto Alves',
        service: 'Corte Moderno',
        status: 'agendado',
        phone: '(11) 99999-8888'
      },
      {
        id: 9,
        time: '16:00',
        clientName: 'Gabriel Santos',
        service: 'Degradê',
        status: 'agendado',
        phone: '(11) 99999-9999'
      }
    ]
  },
  'pedro': {
    '2025-07-29': [
      {
        id: 10,
        time: '10:00',
        clientName: 'Bruno Ferreira',
        service: 'Corte Jovem',
        status: 'agendado',
        phone: '(11) 99999-0000'
      }
    ]
  }
};

// Variáveis globais
let selectedProfessional = null;
let currentDate = new Date();

// Inicialização
function inicializarAgendamentos() {

  flatpickr("#blockDate", {
    locale: "pt",
    dateFormat: "d/m/Y",
    minDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Amanhã
  });

  flatpickr("#blockStartTime", {
    enableTime: true,
    noCalendar: true,
    time_24hr: true,
    dateFormat: "H:i",
    locale: "pt"
  });

  flatpickr("#blockEndTime", {
    enableTime: true,
    noCalendar: true,
    time_24hr: true,
    dateFormat: "H:i",
    locale: "pt"
  });

  if (!codigoEstabelecimento) {
    return estabelecimentoNaoEncontrado();
  }

  const url = baseUrl + `estabelecimentos/${codigoEstabelecimento}`;

  $.get(url)
    .done(function (data) {
      if (!data || !data.nome) {
        return estabelecimentoNaoEncontrado();
      }

      document.title = data.nome + " - Ver Agendamentos";

      initializeApp();
    })
    .fail(function () {
      estabelecimentoNaoEncontrado();
    });

  function estabelecimentoNaoEncontrado() {

    $('#estabelecimento-nao-encontrado').removeClass('d-none');
    $('#professional-selection').addClass('d-none');
    $('#appointments-view').hide();
  }
};

function initializeApp() {

  $('#estabelecimento-nao-encontrado').addClass('d-none');
  $('#professional-selection').removeClass('d-none');

  carregarProfissionais();

  setupDateNavigation();

  // Formatar data inicial
  updateDateDisplay();
}

function loadProfessionals() {

  $('#professionals-grid').empty();

  profissionais.forEach(professional => {
    const professionalCard = $(`
    <div>
      <div class="professional-card card h-100 border-2 barber-hover-gold" 
           data-professional-id="${professional.id}">
        <div class="card-body text-center p-3">
          <div class="fs-1 mb-3">${professional.icon}</div>
          <h5 class="fw-bold fs-6">${professional.name}</h5>
          
          <button class="btn btn-barber-primary btn-sm">
            <i class="bi bi-calendar3 me-2"></i>
            Ver Agendamentos
          </button>
        </div>
      </div>
    </div>
  `);

    $('#professionals-grid').append(professionalCard);
  });

  // Event listeners para seleção de profissional
  $('.professional-card').on('click', function () {
    const professionalId = $(this).data('professional-id');
    selectProfessional(professionalId);
  });
}

function selectProfessional(professionalId) {
  selectedProfessional = profissionais.find(p => p.id === professionalId);

  if (selectedProfessional) {
    // Atualizar informações do profissional na header
    $('#professional-avatar').text(selectedProfessional.icon);
    $('#professional-name').text(selectedProfessional.name);

    // Mostrar seção de agendamentos
    $('#professional-selection').addClass('d-none');
    $('#appointments-view').removeClass('d-none');

    // Carregar agendamentos do dia atual
    loadAppointments();
  }
}

function backToProfessionalSelection() {
  $('#appointments-view').addClass('d-none');
  $('#professional-selection').removeClass('d-none');
  selectedProfessional = null;
}

function setupDateNavigation() {
  $('#prev-day-btn').on('click', function () {
    currentDate.setDate(currentDate.getDate() - 1);
    updateDateDisplay();
    loadAppointments();
  });

  $('#next-day-btn').on('click', function () {
    currentDate.setDate(currentDate.getDate() + 1);
    updateDateDisplay();
    loadAppointments();
  });
}

function updateDateDisplay() {
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };

  const dateString = currentDate.toLocaleDateString('pt-BR', options);
  const weekdayOptions = { weekday: 'long' };
  const weekday = currentDate.toLocaleDateString('pt-BR', weekdayOptions);

  // Capitalizar primeira letra
  const formattedDate = dateString.charAt(0).toUpperCase() + dateString.slice(1);
  const formattedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);

  $('#current-date').text(formattedDate);
  $('#current-weekday').text(formattedWeekday);
}

function loadAppointments() {
  if (!selectedProfessional) return;

  const dateKey = getLocalDateISO(currentDate);

  carregarAgendamentos(selectedProfessional.id, dateKey);
}

function createAppointmentCard(appointment) {
  const statusClass = getStatusClass(appointment.status);
  const statusText = getStatusText(appointment.status);
  const canCancel = appointment.status === 'CONFIRMADO';
  const canComplete = appointment.status === 'CONFIRMADO';

  return $(`
    <div class="appointment-item border-bottom p-3" data-appointment-id="${appointment.id}">
      <!-- Mobile Layout -->
      <div class="d-md-none">
        <div class="row">
          <div class="col-6">
            <div class="fw-bold fs-5 barber-gold mb-2">${appointment.time}</div>
          </div>
          <div class="col-6 text-end">
            <span class="badge ${statusClass}">${statusText}</span>
          </div>
        </div>
        
        <div class="mb-3">
          <h6 class="fw-bold mb-1">
            <i class="bi bi-person-fill me-2"></i>
            ${appointment.clientName}
          </h6>
          <p class="text-muted small mb-2">
            <i class="bi bi-phone me-1"></i>
            ${appointment.phone}
          </p>
          <div class="mb-3">
            <span class="badge bg-light text-dark">
              <i class="bi bi-scissors me-1"></i>
              ${appointment.service}
            </span>
          </div>
        </div>
        
        <div class="d-flex gap-2 flex-wrap">
          ${canComplete ? `
            <button class="btn btn-success btn-sm flex-fill" onclick="showConfirmation('complete', ${appointment.id}, '${appointment.clientName}')">
              <i class="bi bi-check-circle me-1"></i>
              Realizado
            </button>
          ` : ''}
          ${canCancel ? `
            <button class="btn btn-danger btn-sm flex-fill" onclick="showConfirmation('cancel', ${appointment.id}, '${appointment.clientName}')">
              <i class="bi bi-x-circle me-1"></i>
              Cancelar
            </button>
          ` : ''}
          <a href="tel:${appointment.phone}" class="btn btn-primary btn-sm flex-fill">
            <i class="bi bi-telephone me-1"></i>
            Ligar
          </a>
        </div>
      </div>

      <!-- Desktop Layout -->
      <div class="d-none d-md-block">
        <div class="row align-items-center">
          <div class="col-md-2">
            <div class="text-center">
              <div class="fw-bold fs-4 barber-gold">${appointment.time}</div>
            </div>
          </div>
          <div class="col-md-4">
            <div>
              <h6 class="fw-bold mb-1">
                <i class="bi bi-person-fill me-2"></i>
                ${appointment.clientName}
              </h6>
              <p class="text-muted small mb-0">
                <i class="bi bi-phone me-1"></i>
                ${appointment.phone}
              </p>
            </div>
          </div>
          <div class="col-md-3">
            <div>
              <span class="badge bg-light text-dark">
                <i class="bi bi-scissors me-1"></i>
                ${appointment.service}
              </span>
            </div>
          </div>
          <div class="col-md-2">
            <span class="badge ${statusClass}">${statusText}</span>
          </div>
          <div class="col-md-1">
            <div class="dropdown">
              <button class="btn btn-outline-secondary btn-sm dropdown-toggle" 
                      type="button" 
                      data-bs-toggle="dropdown">
                <i class="bi bi-three-dots-vertical"></i>
              </button>
              <ul class="dropdown-menu">
                ${canComplete ? `
                  <li>
                    <a class="dropdown-item" href="#" onclick="showConfirmation('complete', ${appointment.id}, '${appointment.clientName}')">
                      <i class="bi bi-check-circle text-success me-2"></i>
                      Marcar como Realizado
                    </a>
                  </li>
                ` : ''}
                ${canCancel ? `
                  <li>
                    <a class="dropdown-item" href="#" onclick="showConfirmation('cancel', ${appointment.id}, '${appointment.clientName}')">
                      <i class="bi bi-x-circle text-danger me-2"></i>
                      Cancelar
                    </a>
                  </li>
                ` : ''}
                <li>
                  <a class="dropdown-item" href="tel:${appointment.phone}">
                    <i class="bi bi-telephone text-primary me-2"></i>
                    Ligar para Cliente
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  `);
}

function getStatusClass(status) {
  switch (status) {
    case 'CONFIRMADO':
      return 'bg-primary text-white';
    case 'ATENDIDO':
      return 'bg-success text-white';
    case 'CANCELADO':
      return 'bg-danger text-white';
    default:
      return 'bg-secondary text-white';
  }
}

function getStatusText(status) {
  switch (status) {
    case 'CONFIRMADO':
      return 'Agendado';
    case 'ATENDIDO':
      return 'Atendido';
    case 'CANCELADO':
      return 'Cancelado';
    default:
      return 'Desconhecido';
  }
}

function showConfirmation(action, appointmentId, clientName) {
  let title, message, actionText;

  if (action === 'complete') {
    title = 'Marcar como Realizado';
    message = `Confirma que o atendimento de <strong>${clientName}</strong> foi realizado?`;
    actionText = 'Marcar como Realizado';
  } else if (action === 'cancel') {
    title = 'Cancelar Agendamento';
    message = `Tem certeza que deseja cancelar o agendamento de <strong>${clientName}</strong>?`;
    actionText = 'Cancelar Agendamento';
  }

  $('#modal-title').text(title);
  $('#modal-body').html(message);
  $('#confirm-action-btn').text(actionText);

  // Remover event listeners anteriores e adicionar novo
  $('#confirm-action-btn').off('click').on('click', function () {
    if (action === 'complete') {
      completeAppointment(appointmentId);
    } else if (action === 'cancel') {
      cancelAppointment(appointmentId);
    }
    $('#confirmationModal').modal('hide');
  });

  $('#confirmationModal').modal('show');
}

function completeAppointment(appointmentId) {
  atualizarAgendamento(appointmentId, 'atendido');
}

function cancelAppointment(appointmentId) {
  atualizarAgendamento(appointmentId, 'cancelar');
}

function updateAppointmentStatus(appointmentId, newStatus) {
  const dateKey = currentDate.toISOString().split('T')[0];
  const professionalAppointments = appointmentsData[selectedProfessional.id];

  if (professionalAppointments && professionalAppointments[dateKey]) {
    const appointment = professionalAppointments[dateKey].find(apt => apt.id === appointmentId);
    if (appointment) {
      appointment.status = newStatus;
    }
  }
}

function showToast(message, type = 'info') {
  // Criar toast simples
  const toastClass = type === 'success' ? 'bg-success' : type === 'danger' ? 'bg-danger' : 'bg-info';

  const toast = $(`
    <div class="toast align-items-center text-white ${toastClass} border-0 position-fixed" 
         style="top: 20px; right: 20px; z-index: 9999;" 
         role="alert">
      <div class="d-flex">
        <div class="toast-body">
          ${message}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" 
                onclick="$(this).closest('.toast').remove()"></button>
      </div>
    </div>
  `);

  $('body').append(toast);

  // Auto remove após 3 segundos
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// ===== FUNCIONALIDADES DE BLOQUEIO =====

function showBlockModal() {
  // Definir data mínima como amanhã
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  $('#blockDate').attr('min', minDate);
  $('#blockDate').val('');
  $('#blockStartTime').val('');
  $('#blockEndTime').val('');

  // Limpar erros
  $('.form-control').removeClass('is-invalid');
  $('.invalid-feedback').text('');

  $('#blockModal').modal('show');
}

function createBlock() {

  const date = $('#blockDate').val();
  const startTime = $('#blockStartTime').val();
  const endTime = $('#blockEndTime').val();

  // Validar campos
  if (!validateBlockForm(date, startTime, endTime)) {
    return;
  }

  const dataHoraInicioISO = formatarDataParaISO(date, startTime);
  const dataHoraFimISO = formatarDataParaISO(date, endTime);

  const url = baseUrl + 'estabelecimentos/' + codigoEstabelecimento + '/Agendamentos/bloquear?profissionalId=' + selectedProfessional.id + `&dataHoraInicio=${encodeURIComponent(dataHoraInicioISO)}&dataHoraFim=${encodeURIComponent(dataHoraFimISO)}`;

  $.ajax({
    url: url,
    method: 'POST',
    success: function () {
      $('#blockModal').modal('hide');

      mostrarMensagem('success', 'Bloqueio criado com sucesso!');

      // Recarregar se for o dia atual
      if (date === currentDate.toISOString().split('T')[0]) {
        loadAppointments();
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {

      let mensagemErro = 'Erro ao criar bloqueio. Tente novamente.';

      // Tenta extrair mensagem de erro da API (formato JSON)
      if (jqXHR.responseJSON && jqXHR.responseJSON.message) {
        mensagemErro = jqXHR.responseJSON.message;
      }
      // Alternativa: se a API retorna um texto plano
      else if (jqXHR.responseText) {
        mensagemErro = jqXHR.responseText;
      }

      mostrarMensagem('error', 'Erro ao criar bloqueio', mensagemErro);
    }
  });
}

function validateBlockForm(date, startTime, endTime) {

  let isValid = true;

  // Limpar erros
  $('.form-control').removeClass('is-invalid');
  $('.invalid-feedback').text('');

  // Validar data
  if (!date) {
    $('#blockDate').addClass('is-invalid');
    $('#blockDateError').text('Data é obrigatória');
    isValid = false;
  } else {
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate <= today) {
      $('#blockDate').addClass('is-invalid');
      $('#blockDateError').text('Só é possível criar bloqueios para datas futuras');
      isValid = false;
    }
  }

  // Validar horários
  if (!startTime) {
    $('#blockStartTime').addClass('is-invalid');
    $('#blockStartTimeError').text('Hora início é obrigatória');
    isValid = false;
  }

  if (!endTime) {
    $('#blockEndTime').addClass('is-invalid');
    $('#blockEndTimeError').text('Hora fim é obrigatória');
    isValid = false;
  }

  if (startTime && endTime && startTime >= endTime) {
    $('#blockEndTime').addClass('is-invalid');
    $('#blockEndTimeError').text('Hora fim deve ser maior que hora início');
    isValid = false;
  }

  return isValid;
}

function createBlockCard(block) {
  return $(`
    <div class="block-item border-bottom p-3 bg-light bg-opacity-50">
      <!-- Mobile Layout -->
      <div class="d-md-none">
        <div class="row">
          <div class="col-8">
            <div class="fw-bold fs-5 text-danger mb-2">
              <i class="bi bi-calendar-x me-2"></i>
              ${block.horaInicio} - ${block.horaFim}
            </div>
          </div>
          <div class="col-4 text-end">
            <span class="badge bg-danger">Bloqueado</span>
          </div>
        </div>
        
        <div class="mb-2">
          <p class="text-muted small mb-0">
            <i class="bi bi-info-circle me-1"></i>
            Horário indisponível para agendamentos
          </p>
        </div>
      </div>

      <!-- Desktop Layout -->
      <div class="d-none d-md-block">
        <div class="row align-items-center">
          <div class="col-md-3">
            <div class="text-center">
              <div class="fw-bold fs-4 text-danger">
                <i class="bi bi-calendar-x me-2"></i>
                ${block.horaInicio} - ${block.horaFim}
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div>
              <h6 class="fw-bold mb-1 text-muted">
                <i class="bi bi-lock-fill me-2"></i>
                Horário Bloqueado
              </h6>
              <p class="text-muted small mb-0">
                Período indisponível para novos agendamentos
              </p>
            </div>
          </div>
          <div class="col-md-2">
            <span class="badge bg-danger">Bloqueado</span>
          </div>
          <div class="col-md-1">
            <div class="text-muted">
              <i class="bi bi-calendar-x fs-4"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  `);
}

function getLocalDateISO(currentDate) {

  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const day = String(currentDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;

}

function formatarDataParaISO(dataPtBr, hora) {
  const [dia, mes, ano] = dataPtBr.split('/');
  return `${ano}-${mes}-${dia}T${hora}`;
}