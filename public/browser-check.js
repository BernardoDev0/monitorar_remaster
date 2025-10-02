// Script de verificação de compatibilidade do navegador
// Executa antes do React para detectar navegadores incompatíveis

(function() {
  'use strict';
  
  // Verificações de compatibilidade essenciais
  var checks = {
    es6: function() {
      try {
        // Testa arrow functions, const/let, template literals
        eval('const test = () => `template`; let x = 1;');
        return true;
      } catch (e) {
        return false;
      }
    },
    
    fetch: function() {
      return typeof window.fetch === 'function';
    },
    
    localStorage: function() {
      try {
        var test = '__browser_test__';
        window.localStorage.setItem(test, '1');
        window.localStorage.removeItem(test);
        return true;
      } catch (e) {
        return false;
      }
    },
    
    promises: function() {
      return typeof Promise !== 'undefined' && typeof Promise.resolve === 'function';
    },
    
    modules: function() {
      // Verifica se o navegador suporta ES modules
      var script = document.createElement('script');
      return 'noModule' in script;
    }
  };
  
  // Executa verificações
  var results = {};
  var hasIssues = false;
  
  for (var check in checks) {
    results[check] = checks[check]();
    if (!results[check]) {
      hasIssues = true;
    }
  }
  
  // Se há problemas de compatibilidade, mostra aviso
  if (hasIssues) {
    console.warn('Problemas de compatibilidade detectados:', results);
    
    // Cria overlay de aviso
    var overlay = document.createElement('div');
    overlay.id = 'browser-compatibility-warning';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(15, 23, 42, 0.95);
      color: #f1f5f9;
      font-family: system-ui, -apple-system, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      padding: 2rem;
    `;
    
    var content = document.createElement('div');
    content.style.cssText = `
      max-width: 500px;
      background: #1e293b;
      padding: 2rem;
      border-radius: 8px;
      border: 1px solid #334155;
      text-align: center;
    `;
    
    var issues = [];
    if (!results.es6) issues.push('JavaScript moderno (ES6+)');
    if (!results.fetch) issues.push('API Fetch');
    if (!results.localStorage) issues.push('Armazenamento local');
    if (!results.promises) issues.push('Promises');
    if (!results.modules) issues.push('Módulos ES6');
    
    content.innerHTML = `
      <h2 style="margin: 0 0 1rem 0; color: #f59e0b;">⚠️ Navegador Incompatível</h2>
      <p style="margin: 0 0 1rem 0; color: #94a3b8;">
        Seu navegador não suporta algumas funcionalidades necessárias:
      </p>
      <ul style="text-align: left; color: #94a3b8; margin: 0 0 1.5rem 0;">
        ${issues.map(function(issue) { return '<li>' + issue + '</li>'; }).join('')}
      </ul>
      <p style="margin: 0 0 1.5rem 0; color: #94a3b8;">
        Para usar esta aplicação, atualize seu navegador ou use:
      </p>
      <div style="margin: 0 0 1.5rem 0; color: #94a3b8; font-size: 0.875rem;">
        • Chrome 60+ • Firefox 55+ • Safari 12+ • Edge 79+
      </div>
      <button onclick="this.parentElement.parentElement.style.display='none'" style="
        background: #3b82f6;
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.875rem;
        margin-right: 0.5rem;
      ">
        Continuar Mesmo Assim
      </button>
      <button onclick="window.location.reload()" style="
        background: #6b7280;
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.875rem;
      ">
        Recarregar
      </button>
    `;
    
    overlay.appendChild(content);
    
    // Adiciona o overlay quando o DOM estiver pronto
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        document.body.appendChild(overlay);
      });
    } else {
      document.body.appendChild(overlay);
    }
    
    // Remove o overlay após 10 segundos automaticamente
    setTimeout(function() {
      if (overlay.parentElement) {
        overlay.style.display = 'none';
      }
    }, 10000);
  }
  
  // Armazena resultados globalmente para debug
  window.__browserCompatibility = results;
})();