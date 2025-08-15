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

//Obtiene el código que le corresponde a una nueva dependencia
(function () {
    const SELECTORS = {
        form: 'form#dependenciaBean',
        input: 'input#coDependencia'
    };

    // Guarda inputs ya autocompletados para no repetir
    const filledInputs = new WeakSet();

    async function fetchAndFill(input) {
        // Evita llamadas innecesarias
        if (!input || filledInputs.has(input)) return;
        if (input.value && input.value.trim() !== '') {
            filledInputs.add(input);
            return; // ya tiene valor, no lo pisamos
        }

        try {
            input.disabled = true;

            const res = await fetch('https://sgd-control.regionloreto.gob.pe/api/dependencia/last/co_dependencia', {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            const value = typeof data === 'string' ? data : Object.values(data)[0];

            if (value != null && String(value).trim() !== '') {
                input.value = value;
                input.dispatchEvent(new Event('input', { bubbles: true }));
                input.dispatchEvent(new Event('change', { bubbles: true }));
  
            }

            filledInputs.add(input);
        } catch (err) {
            console.error('Error al obtener coDependencia:', err);
        } finally {
            input.disabled = false;
        }
    }

    function scheduleFill(input) {
        // Pequeño delay para permitir que el DOM u otros scripts seteen valores primero
        if (!input) return;
        if (typeof requestIdleCallback === 'function') {
            requestIdleCallback(() => fetchAndFill(input), { timeout: 500 });
        } else {
            setTimeout(() => fetchAndFill(input), 80);
        }
    }

    function bindOnce(form) {
        const input = form.querySelector(SELECTORS.input);
        if (!input) return;

        // Autocompletar una sola vez si está vacío
        scheduleFill(input);

        // Vigila si el input se reemplaza dinámicamente; autocompleta solo la nueva instancia
        const mo = new MutationObserver(() => {
            const current = form.querySelector(SELECTORS.input);
            if (current && !filledInputs.has(current)) {
                scheduleFill(current);
            }
        });
        mo.observe(form, { childList: true, subtree: true });
    }

    function init() {
        const form = document.querySelector(SELECTORS.form);
        if (form) {
            bindOnce(form);
            return true;
        }
        return false;
    }

    // Intento inicial + espera por DOM dinámico
    if (!init()) {
        const obs = new MutationObserver(() => {
            if (init()) obs.disconnect();
        });
        obs.observe(document, { childList: true, subtree: true });
    }
})();


//Obtiene el nivel de una dependencia
(function () {
    const FORM_ID = 'dependenciaBean';       // id del formulario
    const INPUT_PADRE_ID = 'deDepenPadre';   // id del input padre
    const INPUT_NIVEL_ID = 'coNivel';        // id del input hijo

    function initWatcher(inputPadre, inputNivel) {
        let lastVal = inputPadre.value;

        async function fetchNivel() {
            const valor = inputPadre.value.trim();
            if (!valor) return; // nada que buscar

            try {
                inputNivel.disabled = true;

                const url = `https://sgd-control.regionloreto.gob.pe/api/dependencia/nivel/father?des_dep=${encodeURIComponent(valor)}`;
                const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);

                const data = await res.json();
                const value = typeof data === 'number' ? data : Object.values(data)[0] ?? '';

                inputNivel.value = value;

                // Dispara eventos para que el frontend lo detecte
                ['input', 'change'].forEach(evt =>
                    inputNivel.dispatchEvent(new Event(evt, { bubbles: true }))
                );

                console.log(`ℹ️ coNivel autocompletado con: ${value}`);
            } catch (err) {
                console.error('Error al obtener coNivel:', err);
            } finally {
                inputNivel.disabled = false;
            }
        }

        // Escucha cambios por interacción normal
        inputPadre.addEventListener('input', fetchNivel);
        inputPadre.addEventListener('change', fetchNivel);

        // Polling para cambios hechos por JS sin eventos
        setInterval(() => {
            if (inputPadre.value !== lastVal) {
                lastVal = inputPadre.value;
                fetchNivel();
            }
        }, 400);
    }

    function checkAndBind() {
        const form = document.getElementById(FORM_ID);
        if (!form) return false;

        const inputPadre = form.querySelector(`#${INPUT_PADRE_ID}`);
        const inputNivel = form.querySelector(`#${INPUT_NIVEL_ID}`);

        if (inputPadre && inputNivel) {
            initWatcher(inputPadre, inputNivel);
            return true;
        }
        return false;
    }

    // Intento inicial + espera si los inputs aparecen luego
    if (!checkAndBind()) {
        const obs = new MutationObserver(() => {
            if (checkAndBind()) obs.disconnect();
        });
        obs.observe(document, { childList: true, subtree: true });
    }

    // Si usas PrimeFaces o AJAX parcial, re-enlaza después del render
    if (window.PF) {
        $(document).on('pfAjaxComplete', () => {
            checkAndBind();
        });
    }
})();
