// scripts.js
document.addEventListener('DOMContentLoaded', () => {
  // Atualiza anos no rodapé
  const y = new Date().getFullYear();
  document.getElementById('year')?.textContent = y;
  document.getElementById('year-2')?.textContent = y;
  document.getElementById('year-3')?.textContent = y;

  // FORMULÁRIO: auxiliares de máscara
  const cpfInput = document.getElementById('cpf');
  const telInput = document.getElementById('telefone');
  const cepInput = document.getElementById('cep');

  if (cpfInput) {
    const cpfHandler = (e) => {
      const input = e.target;
      let v = input.value.replace(/\D/g,'').slice(0,11);
      v = v.replace(/(\d{3})(\d)/,'$1.$2');
      v = v.replace(/(\d{3})(\d)/,'$1.$2');
      v = v.replace(/(\d{3})(\d{1,2})$/,'$1-$2');
      input.value = v;
      // definir validade para padrão e aria-invalid
      const valid = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(v);
      if (!valid) {
        input.setCustomValidity('CPF deve ter o formato 000.000.000-00');
        input.setAttribute('aria-invalid', 'true');
      } else {
        input.setCustomValidity('');
        input.setAttribute('aria-invalid', 'false');
      }
    };
    cpfInput.addEventListener('input', cpfHandler);
    // pasta desinfetante
    cpfInput.addEventListener('paste', (e) => {
      const pasted = (e.clipboardData || window.clipboardData).getData('text');
      const digits = pasted.replace(/\D/g, '').slice(0,11);
      if (digits) {
        e.preventDefault();
        // formatar e configurar
        let v = digits;
        v = v.replace(/(\d{3})(\d)/,'$1.$2');
        v = v.replace(/(\d{3})(\d)/,'$1.$2');
        v = v.replace(/(\d{3})(\d{1,2})$/,'$1-$2');
        cpfInput.value = v;
        cpfInput.dispatchEvent(new Event('input'));
      }
    });
    // Validar ao perder o foco (limpa a mensagem se for válida)
    cpfInput.addEventListener('blur', (e) => {
      if (!e.target.validationMessage) return;
      if (e.target.checkValidity()) e.target.setCustomValidity('');
    });
  }

  if (telInput) {
    const telHandler = (e) => {
      const input = e.target;
      let v = input.value.replace(/\D/g,'').slice(0,11);
      // formata (99) 9 9999-9999 ou (99) 9999-9999
      if (v.length > 10) {
        v = v.replace(/(\d{2})(\d{1})(\d{4})(\d{4})/,'($1) $2 $3-$4');
      } else {
        v = v.replace(/(\d{2})(\d{4})(\d{0,4})/,'($1) $2-$3').replace(/-$/,'');
      }
      input.value = v;
      // Marque aria-invalid se for muito curto e obrigatório
      if (input.hasAttribute('required')) {
        const digits = input.value.replace(/\D/g,'');
        if (digits.length < 10) input.setAttribute('aria-invalid','true'); else input.setAttribute('aria-invalid','false');
      }
    };
    telInput.addEventListener('input', telHandler);
    telInput.addEventListener('paste', (e) => {
      const pasted = (e.clipboardData || window.clipboardData).getData('text');
      const digits = pasted.replace(/\D/g,'').slice(0,11);
      if (digits) {
        e.preventDefault();
        // format quickly
        let v = digits;
        if (v.length > 10) v = v.replace(/(\d{2})(\d{1})(\d{4})(\d{4})/,'($1) $2 $3-$4');
        else v = v.replace(/(\d{2})(\d{4})(\d{0,4})/,'($1) $2-$3').replace(/-$/,'');
        telInput.value = v;
        telInput.dispatchEvent(new Event('input'));
      }
    });
  }

  if (cepInput) {
    const cepHandler = (e) => {
      const input = e.target;
      let v = input.value.replace(/\D/g,'').slice(0,8);
      if (v.length > 5) v = v.replace(/(\d{5})(\d{1,3})/,'$1-$2');
      input.value = v;
      const valid = /^\d{5}-\d{3}$/.test(v);
      if (!valid) {
        input.setCustomValidity('CEP deve ter o formato 00000-000');
        input.setAttribute('aria-invalid','true');
      } else {
        input.setCustomValidity('');
        input.setAttribute('aria-invalid','false');
      }
    };
    cepInput.addEventListener('input', cepHandler);
    cepInput.addEventListener('paste', (e) => {
      const pasted = (e.clipboardData || window.clipboardData).getData('text');
      const digits = pasted.replace(/\D/g, '').slice(0,8);
      if (digits) {
        e.preventDefault();
        let v = digits;
        if (v.length > 5) v = v.replace(/(\d{5})(\d{1,3})/,'$1-$2');
        cepInput.value = v;
        cepInput.dispatchEvent(new Event('input'));
      }
    });
  }

  // manipulador básico de envio de formulário (demonstração)
  const form = document.getElementById('cadastroForm');
  if (form) {
    form.addEventListener('submit', (ev) => {
      ev.preventDefault();
      // native checkValidity gives browser message; we can enhance feedback
      if (!form.checkValidity()) {
        // find first invalid and focus
        const firstInvalid = form.querySelector(':invalid');
        if (firstInvalid) {
          firstInvalid.focus();
          firstInvalid.scrollIntoView({behavior:'smooth', block:'center'});
        }
        // also set aria-live message
        const status = document.getElementById('formStatus');
        if (status) {
          status.classList.remove('sr-only');
          status.textContent = 'Existem campos inválidos. Por favor, verifique o formulário.';
        }
        return;
      }

      // Coletar dados do formulário (exemplo)
      const data = new FormData(form);
      const payload = Object.fromEntries(data.entries());
      // Here in real app you'd POST to server. We'll simulate success.
      console.log('Simular envio:', payload);

      // Forneça confirmação acessível e concentre-se nela.
      const status = document.getElementById('formStatus');
      if (status) {
        status.classList.remove('sr-only');
        status.textContent = 'Cadastro enviado com sucesso. Obrigado!';
        status.setAttribute('role','status');
        status.focus?.();
      }
      // Redefina ou mantenha o formulário conforme necessário:
      form.reset();
    });
  }

});