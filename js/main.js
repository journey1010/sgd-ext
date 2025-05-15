const ids = ["asu", "dir", "correo", "coUsuario", "sDeAsuM", "deAsu", "deObsDoc", "busAsunto"]; 
ids.forEach(id => {
  const el = document.getElementById(id);
  if (el) {
    el.style.textTransform = "none";
  }
});

document.addEventListener("keydown", function(event) {
    if (event.ctrlKey && event.key === "v") {
    event.stopPropagation(); 
    }
}, true);