// contato.js - Página "Fale Conosco": interações exclusivas desta página.
// Header, menu mobile, dropdown e a revelação genérica (.reveal-on-scroll)
// continuam sob responsabilidade de script.js (carregado antes deste).
//
// Não existe backend/API/CRM para o formulário desta página: a única ação
// do envio é validar os campos no navegador e montar um link do WhatsApp.

document.addEventListener('DOMContentLoaded', () => {

  /* ------------------------------------------------------------------
     FAQ rápido de contato: accordion acessível (Enter/Space funcionam
     nativamente por já usarmos <button>), mesmo padrão já usado em
     como-funciona.js (aria-expanded + max-height animado via JS).
  ------------------------------------------------------------------ */
  const accordionTriggers = document.querySelectorAll('.contact-accordion-trigger');

  accordionTriggers.forEach((trigger) => {
    const panelId = trigger.getAttribute('aria-controls');
    const panel = panelId ? document.getElementById(panelId) : null;

    if (!panel) return;

    trigger.addEventListener('click', () => {
      const isOpen = trigger.getAttribute('aria-expanded') === 'true';

      trigger.setAttribute('aria-expanded', String(!isOpen));
      panel.style.maxHeight = isOpen ? '0px' : `${panel.scrollHeight}px`;
    });
  });

  /* ------------------------------------------------------------------
     Formulário / pré-atendimento: validação nativa + geração do link do
     WhatsApp via encodeURIComponent(). Não há envio automático; o
     redirecionamento só acontece quando o usuário clica no botão.
  ------------------------------------------------------------------ */
  const form = document.getElementById('contact-form');

  // TODO: substituir pelo WhatsApp oficial da Decolar
  const WHATSAPP_NUMBER = '5551999999999';

  if (form) {
    const fields = {
      nome: document.getElementById('contact-nome'),
      telefone: document.getElementById('contact-telefone'),
      email: document.getElementById('contact-email'),
      cidade: document.getElementById('contact-cidade'),
      estado: document.getElementById('contact-estado'),
      assunto: document.getElementById('contact-assunto'),
      mensagem: document.getElementById('contact-mensagem'),
      consentimento: document.getElementById('contact-consentimento')
    };

    const setFieldError = (field, message) => {
      if (!field) return;

      const wrapper = field.closest('.form-field');
      const errorId = `${field.id}-error`;
      const errorEl = document.getElementById(errorId);

      if (wrapper) wrapper.classList.add('has-error');

      if (errorEl) {
        errorEl.textContent = message;
      }
    };

    const clearFieldError = (field) => {
      if (!field) return;

      const wrapper = field.closest('.form-field');
      const errorId = `${field.id}-error`;
      const errorEl = document.getElementById(errorId);

      if (wrapper) wrapper.classList.remove('has-error');
      if (errorEl) errorEl.textContent = '';
    };

    const clearConsentError = () => {
      form.classList.remove('has-consent-error');
      const errorEl = document.getElementById('contact-consentimento-error');
      if (errorEl) errorEl.textContent = '';
    };

    const setConsentError = (message) => {
      form.classList.add('has-consent-error');
      const errorEl = document.getElementById('contact-consentimento-error');
      if (errorEl) errorEl.textContent = message;
    };

    // Limpa o erro de um campo assim que o usuário começa a corrigi-lo
    [fields.nome, fields.telefone, fields.cidade, fields.estado, fields.assunto, fields.mensagem].forEach((field) => {
      if (!field) return;
      field.addEventListener('input', () => clearFieldError(field));
      field.addEventListener('change', () => clearFieldError(field));
    });

    if (fields.consentimento) {
      fields.consentimento.addEventListener('change', clearConsentError);
    }

    const validateRequiredFields = () => {
      let firstInvalid = null;
      let isValid = true;

      const requiredTextFields = [
        { field: fields.nome, message: 'Informe seu nome completo.' },
        { field: fields.telefone, message: 'Informe um telefone ou WhatsApp para contato.' },
        { field: fields.cidade, message: 'Informe sua cidade.' },
        { field: fields.estado, message: 'Selecione seu estado.' },
        { field: fields.assunto, message: 'Selecione o que você procura.' },
        { field: fields.mensagem, message: 'Conte rapidamente como podemos ajudar.' }
      ];

      requiredTextFields.forEach(({ field, message }) => {
        if (!field) return;

        const value = field.value.trim();

        if (!value) {
          setFieldError(field, message);
          isValid = false;
          if (!firstInvalid) firstInvalid = field;
        } else {
          clearFieldError(field);
        }
      });

      if (fields.consentimento && !fields.consentimento.checked) {
        setConsentError('É necessário autorizar o contato para continuar.');
        isValid = false;
        if (!firstInvalid) firstInvalid = fields.consentimento;
      } else {
        clearConsentError();
      }

      return { isValid, firstInvalid };
    };

    const buildWhatsappMessage = () => {
      const nome = fields.nome.value.trim();
      const telefone = fields.telefone.value.trim();
      const cidade = fields.cidade.value.trim();
      const estado = fields.estado.value.trim();
      const assunto = fields.assunto.value.trim();
      const email = fields.email && fields.email.value.trim() ? fields.email.value.trim() : 'Não informado';
      const mensagem = fields.mensagem.value.trim();

      return [
        'Olá, quero falar com a Decolar Consórcios.',
        '',
        `Nome: ${nome}`,
        `Telefone/WhatsApp: ${telefone}`,
        `Cidade/UF: ${cidade} - ${estado}`,
        `Interesse: ${assunto}`,
        `E-mail: ${email}`,
        `Mensagem: ${mensagem}`
      ].join('\n');
    };

    form.addEventListener('submit', (event) => {
      event.preventDefault();

      const { isValid, firstInvalid } = validateRequiredFields();

      if (!isValid) {
        if (firstInvalid && typeof firstInvalid.focus === 'function') {
          firstInvalid.focus();
        }
        return;
      }

      const message = buildWhatsappMessage();
      const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

      window.open(whatsappUrl, '_blank', 'noopener');
    });
  }

  /* ------------------------------------------------------------------
     Modal reutilizável de envio de e-mail: qualquer link/botão com a
     classe .js-email-trigger e um atributo data-email abre o mesmo
     modal, já configurado com o destinatário correspondente.
  ------------------------------------------------------------------ */
  const emailModal = document.getElementById('email-modal');
  const emailTriggers = document.querySelectorAll('.js-email-trigger');

  if (emailModal && emailTriggers.length) {
    const emailOverlay = emailModal.querySelector('[data-email-modal-overlay]');
    const emailDialog = emailModal.querySelector('.contact-email-modal-dialog');
    const emailCloseBtn = emailModal.querySelector('[data-email-modal-close]');
    const emailAddressEl = document.getElementById('email-modal-address');
    const emailCopyBtn = document.getElementById('email-modal-copy');
    const emailGmailLink = document.getElementById('email-modal-gmail');
    const emailOutlookLink = document.getElementById('email-modal-outlook');
    const emailYahooLink = document.getElementById('email-modal-yahoo');
    const emailMailtoLink = document.getElementById('email-modal-mailto');

    const EMAIL_SUBJECTS_BY_RECIPIENT = {
      'atendimento@decolarconsorcios.com.br': 'Atendimento Decolar Consórcios',
      'contato@decolarconsorcios.com.br': 'Contato Institucional — Decolar Consórcios',
      'ouvidoria@decolarconsorcios.com.br': 'Ouvidoria — Decolar Consórcios'
    };
    const DEFAULT_EMAIL_SUBJECT = 'Atendimento Decolar Consórcios';

    const getEmailSubject = (email) => EMAIL_SUBJECTS_BY_RECIPIENT[email] || DEFAULT_EMAIL_SUBJECT;

    let lastEmailTrigger = null;
    let copyResetTimer = null;

    const fallbackCopyText = (text) => {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'absolute';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
      } catch (err) {
        // Falha silenciosa: o endereço continua visível e selecionável manualmente.
      }
      document.body.removeChild(textarea);
    };

    const resetCopyButton = () => {
      if (!emailCopyBtn) return;
      emailCopyBtn.textContent = emailCopyBtn.dataset.defaultLabel || 'Copiar e-mail';
      emailCopyBtn.classList.remove('is-copied');
    };

    const updateEmailModalLinks = (email) => {
      if (emailAddressEl) emailAddressEl.textContent = email;

      const encodedEmail = encodeURIComponent(email);
      const encodedSubject = encodeURIComponent(getEmailSubject(email));

      if (emailGmailLink) {
        emailGmailLink.href = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodedEmail}&su=${encodedSubject}`;
      }
      if (emailOutlookLink) {
        emailOutlookLink.href = `https://outlook.live.com/mail/0/deeplink/compose?to=${encodedEmail}&subject=${encodedSubject}`;
      }
      if (emailYahooLink) {
        emailYahooLink.href = `https://compose.mail.yahoo.com/?to=${encodedEmail}&subject=${encodedSubject}`;
      }
      if (emailMailtoLink) {
        emailMailtoLink.href = `mailto:${email}?subject=${encodedSubject}`;
      }
    };

    const getFocusableElements = () => {
      if (!emailDialog) return [];
      return Array.from(emailDialog.querySelectorAll('a[href], button:not([disabled])'));
    };

    const onEmailModalKeydown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeEmailModal();
        return;
      }

      if (event.key === 'Tab') {
        const focusable = getFocusableElements();
        if (!focusable.length) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    function openEmailModal(trigger) {
      const email = trigger.getAttribute('data-email');
      if (!email) return;

      lastEmailTrigger = trigger;
      updateEmailModalLinks(email);
      resetCopyButton();

      emailModal.classList.add('is-open');
      emailModal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('email-modal-open');

      if (emailDialog && typeof emailDialog.focus === 'function') {
        emailDialog.focus();
      }

      document.addEventListener('keydown', onEmailModalKeydown);
    }

    function closeEmailModal() {
      if (!emailModal.classList.contains('is-open')) return;

      emailModal.classList.remove('is-open');
      emailModal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('email-modal-open');
      resetCopyButton();

      if (copyResetTimer) {
        clearTimeout(copyResetTimer);
        copyResetTimer = null;
      }

      document.removeEventListener('keydown', onEmailModalKeydown);

      if (lastEmailTrigger && typeof lastEmailTrigger.focus === 'function') {
        lastEmailTrigger.focus();
      }
      lastEmailTrigger = null;
    }

    emailTriggers.forEach((trigger) => {
      trigger.addEventListener('click', (event) => {
        event.preventDefault();
        openEmailModal(trigger);
      });
    });

    if (emailCloseBtn) emailCloseBtn.addEventListener('click', closeEmailModal);
    if (emailOverlay) emailOverlay.addEventListener('click', closeEmailModal);

    if (emailCopyBtn) {
      emailCopyBtn.addEventListener('click', () => {
        const email = emailAddressEl ? emailAddressEl.textContent.trim() : '';
        if (!email) return;

        const showCopiedFeedback = () => {
          emailCopyBtn.textContent = emailCopyBtn.dataset.copiedLabel || 'E-mail copiado!';
          emailCopyBtn.classList.add('is-copied');
          if (copyResetTimer) clearTimeout(copyResetTimer);
          copyResetTimer = setTimeout(resetCopyButton, 1800);
        };

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(email).then(showCopiedFeedback).catch(() => {
            fallbackCopyText(email);
            showCopiedFeedback();
          });
        } else {
          fallbackCopyText(email);
          showCopiedFeedback();
        }
      });
    }
  }

});
