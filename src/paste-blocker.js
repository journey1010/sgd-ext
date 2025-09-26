// src/paste-blocker.js

export function initPasteBlocker() {
    // Agrega un listener en la fase de captura para detener la propagación del evento.
    document.addEventListener("paste", function(event) {
        // Si la acción predeterminada del evento ha sido impedida
        if (event.defaultPrevented) {
            // Obtenemos los datos del portapapeles.
            const pastedText = (event.clipboardData || window.clipboardData).getData('text');
            
            if (pastedText) {
                // Aquí puedes pegar el texto manualmente en el elemento activo (ej. un input).
                // Esto solo es necesario si el bloqueo es muy agresivo.
                const activeElement = document.activeElement;
                if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
                    activeElement.value += pastedText;
                }
            }
        }
        // Asegura que la propagación del evento no se detenga.
        event.stopPropagation();
    }, true); // El 'true' es para que el listener se ejecute en la fase de captura.

    document.addEventListener("keydown", function(event) {
        if (event.ctrlKey && event.key === "v") {
            event.stopPropagation();
        }
    }, true);
}