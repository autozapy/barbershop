// ============= GLOBAL LOADING SYSTEM =============
// Contador de requisições ativas
let activeRequests = 0;

// Função para mostrar o loading
function showGlobalLoading() {
  activeRequests++;
  if (activeRequests === 1) {
    const overlay = document.getElementById('global-loading-overlay');
    overlay.classList.remove('d-none');
    // Força o reflow para garantir que a animação funcione
    overlay.offsetHeight;
    overlay.classList.add('show');
  }
}

// Função para esconder o loading
function hideGlobalLoading() {
  activeRequests--;
  if (activeRequests <= 0) {
    activeRequests = 0; // Garantir que não vá negativo
    const overlay = document.getElementById('global-loading-overlay');
    overlay.classList.remove('show');
    
    // Aguardar a animação terminar antes de esconder completamente
    setTimeout(() => {
      if (activeRequests === 0) {
        overlay.classList.add('d-none');
      }
    }, 300);
  }
}

// Interceptar XMLHttpRequest
(function() {
  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;
  
  XMLHttpRequest.prototype.open = function(...args) {
    this._startTime = Date.now();
    return originalOpen.apply(this, args);
  };
  
  XMLHttpRequest.prototype.send = function(...args) {
    // Mostrar loading no início da requisição
    showGlobalLoading();
    
    // Interceptar os eventos de finalização
    const originalOnLoad = this.onload;
    const originalOnError = this.onerror;
    const originalOnTimeout = this.ontimeout;
    const originalOnAbort = this.onabort;
    
    this.onload = function(...loadArgs) {
      hideGlobalLoading();
      if (originalOnLoad) {
        return originalOnLoad.apply(this, loadArgs);
      }
    };
    
    this.onerror = function(...errorArgs) {
      hideGlobalLoading();
      if (originalOnError) {
        return originalOnError.apply(this, errorArgs);
      }
    };
    
    this.ontimeout = function(...timeoutArgs) {
      hideGlobalLoading();
      if (originalOnTimeout) {
        return originalOnTimeout.apply(this, timeoutArgs);
      }
    };
    
    this.onabort = function(...abortArgs) {
      hideGlobalLoading();
      if (originalOnAbort) {
        return originalOnAbort.apply(this, abortArgs);
      }
    };
    
    // Listener para mudanças de estado
    this.addEventListener('readystatechange', function() {
      if (this.readyState === 4) {
        hideGlobalLoading();
      }
    });
    
    return originalSend.apply(this, args);
  };
})();

// Interceptar fetch()
(function() {
  const originalFetch = window.fetch;
  
  window.fetch = function(...args) {
    showGlobalLoading();
    
    return originalFetch.apply(this, args)
      .then(response => {
        hideGlobalLoading();
        return response;
      })
      .catch(error => {
        hideGlobalLoading();
        throw error;
      });
  };
})();

// Interceptar jQuery.ajax() se o jQuery estiver disponível
document.addEventListener('DOMContentLoaded', function() {
  if (window.jQuery) {
    // Configurar eventos globais do jQuery
    $(document).ajaxStart(function() {
      showGlobalLoading();
    });
    
    $(document).ajaxStop(function() {
      hideGlobalLoading();
    });
    
    $(document).ajaxError(function() {
      hideGlobalLoading();
    });
  }
});

// ============= FIM DO SISTEMA DE LOADING =============