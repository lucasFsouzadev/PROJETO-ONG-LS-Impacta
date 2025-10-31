document.addEventListener('DOMContentLoaded', () => {
  // Prefira o ID do formulário explícito, se disponível
  const form = document.getElementById('cadastroForm') || document.querySelector('form');
  const statusRegion = document.getElementById('formStatus');

  if (!form) return;

  const setStatus = (msg, isError = false) => {
    if (statusRegion) {
      statusRegion.textContent = msg;
    }
    if (isError) {
      statusRegion && statusRegion.classList.remove('sr-only');
    }
  };

  const getFeedbackEl = (input) => {
    // Prefira um elemento irmão .feedback explícito; caso contrário, crie um.
    let fb = input.parentElement && input.parentElement.querySelector('.feedback');
    if (!fb) {
      fb = document.createElement('span');
      fb.className = 'feedback';
      input.insertAdjacentElement('afterend', fb);
    }
    return fb;
  };

  const emailRE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRE = /^\(?\d{2,3}\)?\s?9?\d{4}-?\d{4}$/; // permissivo BR celular/fixo
  const cepRE = /^\d{5}-?\d{3}$/;
  const cpfDigitsRE = /\d{11}/;

  function onlyDigits(str) {
    return (str || '').replace(/\D/g, '');
  }

  // Validar CPF usando algoritmo (básico, lida com invalidação de dígitos repetidos)
  function isValidCPF(value) {
    const cpf = onlyDigits(value);
    if (!cpfDigitsRE.test(cpf) || cpf.length !== 11) return false;
    // reject known invalid CPFs like 00000000000
    if (/^(\d)\1{10}$/.test(cpf)) return false;

    const calc = (t) => {
      let sum = 0;
      for (let i = 0; i < t - 1; i++) sum += parseInt(cpf.charAt(i)) * (t - i);
      const r = (sum * 10) % 11;
      return r === 10 ? 0 : r;
    };
    return calc(10) === parseInt(cpf.charAt(9)) && calc(11) === parseInt(cpf.charAt(10));
  }

  function validateField(input) {
    const value = input.value.trim();
    const name = input.name || input.id || '';
    const fb = getFeedbackEl(input);
    let ok = true;
    fb.textContent = '';
    input.classList.remove('invalid');

    if (input.hasAttribute('required')) {
      if (input.type === 'checkbox') {
        if (!input.checked) {
          fb.textContent = 'Campo obrigatório.';
          ok = false;
        }
      } else if (!value) {
        fb.textContent = 'Campo obrigatório.';
        ok = false;
      }
    }

    if (ok && value) {
      if (name.toLowerCase().includes('email') || input.type === 'email') {
        if (!emailRE.test(value)) {
          fb.textContent = 'Email inválido.';
          ok = false;
        }
      }

      if (name.toLowerCase().includes('cpf')) {
        if (!isValidCPF(value)) {
          fb.textContent = 'CPF inválido.';
          ok = false;
        }
      }

      if (name.toLowerCase().includes('tel') || name.toLowerCase().includes('phone')) {
        if (!phoneRE.test(value)) {
          fb.textContent = 'Telefone inválido. Ex: (11) 9 9999-9999';
          ok = false;
        }
      }

      if (name.toLowerCase().includes('cep')) {
        if (!cepRE.test(value)) {
          fb.textContent = 'CEP inválido. Formato: 00000-000';
          ok = false;
        }
      }
    }

    if (!ok) input.classList.add('invalid');
    return ok;
  }

  // Live validation on input/change
  form.querySelectorAll('input, textarea, select').forEach(el => {
    const ev = (el.tagName.toLowerCase() === 'select' || el.type === 'checkbox') ? 'change' : 'input';
    el.addEventListener(ev, () => {
      validateField(el);
    });
  });

  // Preenchimento automático do ViaCEP: quando o usuário desfoca o campo CEP e ele parece válido, busque o endereço.
  const cepInput = form.querySelector('#cep');
  if (cepInput) {
    cepInput.addEventListener('blur', async () => {
      const raw = onlyDigits(cepInput.value);
      // require 8 digits
      if (!/^\d{8}$/.test(raw)) return;
      cepInput.setAttribute('aria-busy', 'true');
      const fb = getFeedbackEl(cepInput);
      fb.textContent = '';
      try {
        const res = await fetch(`https://viacep.com.br/ws/${raw}/json/`);
        if (!res.ok) throw new Error('Network error');
        const data = await res.json();
        if (data.erro) {
          fb.textContent = 'CEP não encontrado.';
          return;
        }
        // Fill address fields if present
        const enderecoEl = form.querySelector('#endereco');
        const cidadeEl = form.querySelector('#cidade');
        const estadoEl = form.querySelector('#estado');
        if (enderecoEl && data.logradouro) enderecoEl.value = data.logradouro;
        if (cidadeEl && data.localidade) cidadeEl.value = data.localidade;
        if (estadoEl && data.uf) {
          // if option exists, set it; otherwise leave as-is
          const hasOption = Array.from(estadoEl.options).some(o => o.value === data.uf || o.textContent === data.uf);
          if (hasOption) {
            estadoEl.value = data.uf;
          }
        }
        // validate the filled fields visually
        if (enderecoEl) validateField(enderecoEl);
        if (cidadeEl) validateField(cidadeEl);
        if (estadoEl) validateField(estadoEl);
      } catch (err) {
        fb.textContent = 'Não foi possível buscar o CEP. Verifique sua conexão.';
      } finally {
        cepInput.removeAttribute('aria-busy');
      }
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const controls = Array.from(form.querySelectorAll('input, textarea, select'));
    let allValid = true;

    controls.forEach(c => {
      const isValid = validateField(c);
      if (!isValid) allValid = false;
    });

    if (!allValid) {
      setStatus('Existem campos com erros. Corrija-os antes de enviar.', true);
      // move focus to first invalid field for accessibility
      const firstInvalid = form.querySelector('.invalid');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

  // Se válido, você pode enviar os dados via fetch ou recorrer a form.submit()
// Por enquanto, mostramos uma mensagem amigável e redefinimos o formulário
    setStatus('Cadastro realizado com sucesso! Obrigado por contribuir.');
    form.reset();
    // clear feedbacks
    form.querySelectorAll('.feedback').forEach(f => f.textContent = '');
  });
});