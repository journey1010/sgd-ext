// src/auto-code-dependencia.js

const SELECTORS = {
    form: 'form#dependenciaBean',
    input: 'input#coDependencia'
};

async function fetchAndFill(input) {
    if (!input || input.dataset.filled === "1") return; // Evitar múltiples ejecuciones

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
            input.dataset.filled = "1"; // Marcar como llenado
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
            input.dataset.watched = "1"; // Evitar múltiples observaciones
            fetchAndFill(input);
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
}

export function initAutoCodeDependencia() {
    watchDOM();
}