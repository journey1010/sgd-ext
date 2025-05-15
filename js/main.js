const ids = ["asu", "dir", "correo", "coUsuario", "sDeAsuM", "deAsu", "deObsDoc", "busAsunto", "sBuscAsunto"];

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