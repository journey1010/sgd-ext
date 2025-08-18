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


// Obtiene el código que le corresponde a una nueva dependencia
(function () {
    const SELECTORS = {
        form: 'form#dependenciaBean',
        input: 'input#coDependencia'
    };

    async function fetchAndFill(input) {
        if (!input) return;
        if (input.dataset.filled === "1") return; // evitar múltiples ejecuciones

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
                input.dataset.filled = "1"; // marcar que ya fue llenado
            }

        } catch (err) {
            console.error('Error al obtener coDependencia:', err);
        } finally {
            input.disabled = false;
        }
    }

    function watchDOM() {
        const observer = new MutationObserver(() => {
            const input = document.querySelector(SELECTORS.input);
            if (input && !input.dataset.watched) {
                input.dataset.watched = "1"; // evitar múltiples observaciones
                fetchAndFill(input);
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    watchDOM();
})();

//Obtiene el nivel de una dependencia
(function () {
    const FORM_ID = 'dependenciaBean';       // id del formulario
    const INPUT_PADRE_ID = 'deDepenPadre';   // id del input padre
    const INPUT_NIVEL_ID = 'coNivel';        // id del input hijo

    let lastNivel = ""; // memoria global para restaurar valor

    function initWatcher(inputPadre, inputNivel) {
        let lastVal = inputPadre.value;

        async function fetchNivel() {
            const valor = inputPadre.value.trim();
            if (!valor) return;

            try {
                inputNivel.disabled = true;

                const url = `https://sgd-control.regionloreto.gob.pe/api/dependencia/nivel/father?des_dep=${encodeURIComponent(valor)}`;
                const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);

                const data = await res.json();

                // Detectar valor según la forma de respuesta
                let value = '';
                if (typeof data === 'number' || typeof data === 'string') {
                    value = data;
                } else if (data && typeof data === 'object') {
                    value = data.nivel ?? data.coNivel ?? Object.values(data)[0] ?? '';
                }

                if (value != null && String(value).trim() !== '') {
                    inputNivel.value = value;
                    lastNivel = value; // 🔥 guardar en memoria global

                    ['input', 'change'].forEach(evt =>
                        inputNivel.dispatchEvent(new Event(evt, { bubbles: true }))
                    );
                    console.log(`✅ coNivel autocompletado con: ${value}`);
                }
            } catch (err) {
                console.error('❌ Error al obtener coNivel:', err);
            } finally {
                inputNivel.disabled = false;
            }
        }

        // Escucha cambios "normales"
        inputPadre.addEventListener('input', () => {
            lastVal = inputPadre.value;
            fetchNivel();
        });
        inputPadre.addEventListener('change', () => {
            lastVal = inputPadre.value;
            fetchNivel();
        });

        // Polling por cambios hechos por JS
        setInterval(() => {
            if (inputPadre.value !== lastVal) {
                lastVal = inputPadre.value;
                fetchNivel();
            }
        }, 500);

        // 🔥 Restaurar valor si ya existía
        if (lastNivel && !inputNivel.value) {
            inputNivel.value = lastNivel;
            ['input', 'change'].forEach(evt =>
                inputNivel.dispatchEvent(new Event(evt, { bubbles: true }))
            );
        }
    }

    function checkAndBind() {
        const form = document.getElementById(FORM_ID);
        if (!form) return false;

        const inputPadre = form.querySelector(`#${INPUT_PADRE_ID}`);
        const inputNivel = form.querySelector(`#${INPUT_NIVEL_ID}`);

        if (inputPadre && inputNivel && !inputPadre.dataset.watched) {
            inputPadre.dataset.watched = "1";
            initWatcher(inputPadre, inputNivel);
            return true;
        }
        return false;
    }

    // Intento inicial + observar DOM dinámico
    if (!checkAndBind()) {
        const obs = new MutationObserver(() => {
            checkAndBind();
        });
        obs.observe(document.body, { childList: true, subtree: true });
    }

    // Re-bindeo para AJAX parcial (PrimeFaces / JSF)
    if (window.PF) {
        $(document).on('pfAjaxComplete', () => {
            checkAndBind();
        });
    }
})();

