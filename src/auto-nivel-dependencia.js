// src/auto-nivel-dependencia.js

const FORM_ID = 'dependenciaBean';       // id del formulario
const INPUT_PADRE_ID = 'deDepenPadre';   // id del input padre
const INPUT_NIVEL_ID = 'coNivel';        // id del input hijo

let lastNivel = ""; // Memoria para restaurar el valor si es necesario

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

            let value = '';
            if (typeof data === 'number' || typeof data === 'string') {
                value = data;
            } else if (data && typeof data === 'object') {
                value = data.nivel ?? data.coNivel ?? Object.values(data)[0] ?? '';
            }

            if (value != null && String(value).trim() !== '') {
                inputNivel.value = value;
                lastNivel = value; // Guardar en memoria
                ['input', 'change'].forEach(evt => inputNivel.dispatchEvent(new Event(evt, { bubbles: true })));
                console.log(`✅ coNivel autocompletado con: ${value}`);
            }
        } catch (err) {
            console.error('❌ Error al obtener coNivel:', err);
        } finally {
            inputNivel.disabled = false;
        }
    }

    inputPadre.addEventListener('change', () => {
        lastVal = inputPadre.value;
        fetchNivel();
    });

    // Polling para cambios hechos por otros scripts (como autocompletadores)
    setInterval(() => {
        if (inputPadre.value !== lastVal) {
            lastVal = inputPadre.value;
            fetchNivel();
        }
    }, 500);

    // Restaurar valor si se borró
    if (lastNivel && !inputNivel.value) {
        inputNivel.value = lastNivel;
        ['input', 'change'].forEach(evt => inputNivel.dispatchEvent(new Event(evt, { bubbles: true })));
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

export function initAutoNivelDependencia() {
    // Intento inicial y observador para contenido dinámico
    if (!checkAndBind()) {
        const obs = new MutationObserver(checkAndBind);
        obs.observe(document.body, { childList: true, subtree: true });
    }

    // Compatibilidad con PrimeFaces/JSF
    if (window.PF && typeof $ === 'function') {
        $(document).on('pfAjaxComplete', checkAndBind);
    }
}