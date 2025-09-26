// src/style-fix.js

// Lista de IDs de los elementos a modificar.
const ids = [
    "asu", "dir", "correo", "coUsuario", "sDeAsuM", "deAsu", "deObsDoc", "busAsunto", "sBuscAsunto", "coUsuariolabel",
    "dePass", "txtBusDependencia", "deSigla", "deCortaDepen",
];

// Función para aplicar el estilo a un elemento por su ID.
function applyStyleIfNeeded(id) {
    const el = document.getElementById(id);
    if (el) {
        el.style.textTransform = "none";
    }
}

// Función principal que inicializa la funcionalidad.
export function initStyleFix() {
    // Aplica el estilo a los elementos que ya existen al cargar la página.
    ids.forEach(applyStyleIfNeeded);

    // Observa el DOM para detectar y modificar elementos que se agregan dinámicamente.
    const observer = new MutationObserver(() => {
        ids.forEach(applyStyleIfNeeded);
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}