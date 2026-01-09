// src/paste-blocker.js
export function initPasteBlocker() {
    // Intercepta eventos paste en fase de captura
    document.addEventListener("paste", function(event) {
        // Previene que otros listeners bloqueen el paste
        event.stopImmediatePropagation();
        
        // Obtiene el texto del portapapeles
        const pastedText = (event.clipboardData || window.clipboardData).getData('text');
        
        if (pastedText) {
            const activeElement = document.activeElement;
            
            // Verifica si es un elemento editable
            if (activeElement && 
                (activeElement.tagName === 'INPUT' || 
                 activeElement.tagName === 'TEXTAREA' || 
                 activeElement.isContentEditable)) {
                
                event.preventDefault();
                
                // Para input y textarea
                if (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA') {
                    const start = activeElement.selectionStart;
                    const end = activeElement.selectionEnd;
                    const currentValue = activeElement.value;
                    
                    // Inserta el texto en la posición del cursor
                    activeElement.value = currentValue.substring(0, start) + 
                                         pastedText + 
                                         currentValue.substring(end);
                    
                    // Reposiciona el cursor después del texto pegado
                    const newPosition = start + pastedText.length;
                    activeElement.selectionStart = newPosition;
                    activeElement.selectionEnd = newPosition;
                    
                    // Dispara evento input para frameworks reactivos
                    activeElement.dispatchEvent(new Event('input', { bubbles: true }));
                }
                // Para elementos contentEditable
                else if (activeElement.isContentEditable) {
                    document.execCommand('insertText', false, pastedText);
                }
            }
        }
    }, true);
    
    // Intercepta Ctrl+V en fase de captura
    document.addEventListener("keydown", function(event) {
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "v") {
            // Detiene la propagación para prevenir bloqueos
            event.stopImmediatePropagation();
        }
    }, true);
    
    // También intercepta el evento contextmenu para el clic derecho
    document.addEventListener("contextmenu", function(event) {
        // Permite que el menú contextual se abra normalmente
        event.stopImmediatePropagation();
    }, true);
    
    console.log("Paste blocker inicializado - Ctrl+V y clic derecho → pegar habilitados");
}