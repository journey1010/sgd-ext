// src/main.js

import { initStyleFix } from './style-fix.js';
import { initPasteBlocker } from './paste-blocker.js';
import { initAutoCodeDependencia } from './auto-code-dependencia.js';
import { initAutoNivelDependencia } from './auto-nivel-dependencia.js';
import {initFixLocal} from './fix-list-local.js';

// Función que se ejecuta cuando el DOM está listo
function run() {
    console.log("Extensión iniciada.");
    initStyleFix();
    initPasteBlocker();
    initAutoCodeDependencia();
    initAutoNivelDependencia();
    initFixLocal();
}

// Asegurarse de que el script se ejecute después de que el contenido de la página se haya cargado.
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
} else {
    run();
}