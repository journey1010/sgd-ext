const ids = [
    "asu", "dir", "correo", "coUsuario", "sDeAsuM", "deAsu", "deObsDoc", "busAsunto", "sBuscAsunto", "coUsuariolabel",
    "dePass", "txtBusDependencia", "deSigla", "deCortaDepen",
  ];

// Función para aplicar el estilo
function applyStyleIfNeeded(id) {
  const el = document.getElementById(id);
  if (el) {
    el.style.textTransform = "none";
  }
}

// Aplicar a los que ya existen
ids.forEach(applyStyleIfNeeded);

// Observar el DOM para detectar elementos que se agregan después
const observer = new MutationObserver(() => {
  ids.forEach(applyStyleIfNeeded);
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});


document.addEventListener("keydown", function(event) {
    if (event.ctrlKey && event.key === "v") {
      event.stopPropagation(); 
    }
}, true);

(function () {
    const SELECTORS = {
        form: 'form[id="dependenciaBean"]',
        input: 'input[id="coDependencia"]'
    };

    function initListeners(form, input) {
        console.log('✅ Detectados form e input, iniciando listeners');

        async function fetchAndFill() {
            try {
                input.disabled = true;

                const res = await fetch('https://sgd-control.regionloreto.gob.pe/api/dependencia/last/co_dependencia', {
                    method: 'GET',
                    headers: { 'Accept': 'application/json' }
                });

                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                const value = typeof data === 'string' ? data : Object.values(data)[0];

                input.value = value || '';
                input.dispatchEvent(new Event('input', { bubbles: true }));

                console.log(`ℹ️ coDependencia autocompletado con: ${value}`);
            } catch (err) {
                console.error('Error al obtener coDependencia:', err);
            } finally {
                input.disabled = false;
            }
        }

        form.addEventListener('click', fetchAndFill);
        input.addEventListener('click', fetchAndFill);
    }

    function checkAndBind() {
        const form = document.querySelector(SELECTORS.form);
        const input = document.querySelector(SELECTORS.input);
        if (form && input) {
            initListeners(form, input);
            return true;
        }
        return false;
    }

    // Intento inicial
    if (!checkAndBind()) {
        // Observa cambios en el DOM hasta que aparezcan
        const obs = new MutationObserver(() => {
            if (checkAndBind()) {
                obs.disconnect();
            }
        });
        obs.observe(document, { childList: true, subtree: true });
    }
})();
