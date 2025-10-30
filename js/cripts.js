// scripts.js
document.addEventListener('DOMContentLoaded', () => {
  // Atualiza anos no rodapé
  const y = new Date().getFullYear();
  document.getElementById('year')?.textContent = y;
  document.getElementById('year-2')?.textContent = y;
  document.getElementById('year-3')?.textContent = y;

  // FORM: mask helpers
  const cpfInput = document.getElementById('cpf');
  const telInput = document.getElementById('telefone');
  const cepInput = document.getElementById('cep');

  if (cpfInput) {
    cpfInput.addEventListener('input', e => {
      let v = e.target.value.replace(/\D/g,'').slice(0,11);
      v = v.replace(/(\d{3})(\d)/,'$1.$2');
      v = v.replace(/(\d{3})(\d)/,'$1.$2');
      v = v.replace(/(\d{3})(\d{1,2})$/,'$1-$2');
      e.target.value = v;
      // set validity for pattern
      if (!/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(v)) {
        e.target.setCustomValidity('CPF deve ter o formato 000.000.000-00');
      } else {
        e.target.setCustomValidity('');
      }
    });
  }

  if (telInput) {
    telInput.addEventListener('input', e => {
      let v = e.target.value.replace(/\D/g,'').slice(0,11);
      // formata (99) 9 9999-9999 ou (99) 9999-9999
      if (v.length > 10) {
        v = v.replace(/(\d{2})(\d{1})(\d{4})(\d{4})/,'($1) $2 $3-$4');
      } else {
        v = v.replace(/(\d{2})(\d{4})(\d{0,4})/,'($1) $2-$3').replace(/-$/,'');
      }
      e.target.value = v;
    });
  }

  if (cepInput) {
    cepInput.addEventListener('input', e => {
      let v = e.target.value.replace(/\D/g,'').slice(0,8);
      if (v.length > 5) v = v.replace(/(\d{5})(\d{1,3})/,'$1-$2');
      e.target.value = v;
      if (!/^\d{5}-\d{3}$/.test(v)) {
        e.target.setCustomValidity('CEP deve ter o formato 00000-000');
      } else {
        e.target.setCustomValidity('');
      }
    });
  }

  // basic form submit handler (demo)
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

      // Gather form data (example)
      const data = new FormData(form);
      const payload = Object.fromEntries(data.entries());
      // Here in real app you'd POST to server. We'll simulate success.
      console.log('Simular envio:', payload);

      // Provide accessible confirmation
      const status = document.getElementById('formStatus');
      if (status) {
        status.classList.remove('sr-only');
        status.textContent = 'Cadastro enviado com sucesso. Obrigado!';
      }
      // reset or keep form as needed:
      form.reset();
    });
  }

});