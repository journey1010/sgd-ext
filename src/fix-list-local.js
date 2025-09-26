// auto-code-dependencia.js

// Usa una constante para los selectores.
const SELECTORS = {
    modal: '#dragmodal .panel-heading', // Corregido: antes era '#dragmodal.panel-heading'
    tableBody: '#tlbLocalConsDocExtModal > tbody'
};

/**
 * Realiza la llamada a la API y maneja posibles errores.
 * @returns {Promise<Array|null>} Un array de objetos con los datos o null si falla.
 */
async function fetchData() {
    try {
        const response = await fetch('https://sgd-control.regionloreto.gob.pe/api/dependencia/local');
        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.status} - ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error: No se pudo obtener la data del endpoint.', error);
        return null;
    }
}

// La fila original con "[TODOS]"
const firstRowHTML = `
    <tr tabindex="0" class="ui-datatable-odd row_selected">
        <td width="450">[TODOS]</td>
        <td style="display:none"></td>
    </tr>
`;

/**
 * Crea filas HTML de la tabla a partir de los datos.
 * @param {Array} data - El array de objetos con los datos de las dependencias.
 * @returns {string} El HTML de las filas de la tabla.
 */
function createTableRows(data) {
    if (!Array.isArray(data) || data.length === 0) {
        // Devuelve solo la fila original si no hay datos.
        return firstRowHTML;
    }

    // Genera las filas de la API.
    const newRowsHTML = data.map((item, index) => `
        <tr tabindex="0" class="ui-datatable-${index % 2 === 0 ? 'odd' : 'even'}">
            <td width="450">${item.nombre_local}</td>
            <td style="display:none">${item.ccod_local}</td>
        </tr>
    `).join('');

    // Devuelve la fila original seguida de las nuevas filas.
    return firstRowHTML + newRowsHTML;
}

/**
 * Observa el DOM para detectar la aparición del modal y cargar los datos.
 */
function watchModalAndFillTable() {
    const observer = new MutationObserver((mutationsList, obs) => {
        const modalElement = document.querySelector(SELECTORS.modal);

        if (modalElement) {
            console.log('Modal detectado. Iniciando carga de datos...');
            obs.disconnect(); // Desconecta el observador para evitar llamadas duplicadas.

            // Llama a la API y, si los datos son válidos, actualiza la tabla.
            fetchData().then(data => {
                if (data) {
                    const tableBody = document.querySelector(SELECTORS.tableBody);
                    if (tableBody) {
                        const rowsHTML = createTableRows(data);
                        tableBody.innerHTML = rowsHTML;
                        console.log('Tabla actualizada exitosamente.');
                    } else {
                        console.error('Error: No se encontró el cuerpo de la tabla (tbody) con el selector:', SELECTORS.tableBody);
                    }
                }
            });
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
}

/**
 * Función de inicialización principal.
 */
export function initFixLocal() {
    watchModalAndFillTable();
}
