import _ from "lodash";

export default {
  transform: (rE) => {
    // Enlever les éléments qui ne sont pas nécessaires
    _.each(rE.querySelectorAll(".MuiInputBase-root"), (el) => {
      el.classList.remove(
        "MuiInputBase-root",
        "MuiOutlinedInput-root",
        "MuiInputBase-formControl",
        "MuiInputBase-multiline",
        "MuiOutlinedInput-multiline",
        "MuiInput-root",
        "MuiInput-underline",
        "MuiInput-formControl"
      );
      el.querySelectorAll("fieldset")[0] &&
        el.querySelectorAll("fieldset")[0].remove(); // Contour de l'input
      _.each(el.querySelectorAll("svg"), (svgEl) => {
        svgEl.remove();
      });
      // Transformer les input / textarea en p
      const txtArea = el.firstChild;
      const val = txtArea.value || txtArea.innerHTML;
      const pEl = document.createElement("p");
      pEl.innerHTML = val;
      el.appendChild(pEl);
      txtArea.remove();
    });

    // Cacher l'en-tête du tableau
    if (rE.querySelectorAll(".MuiToolbar-root")[0]) {
      rE.querySelectorAll(".MuiToolbar-root")[0].style.display = "none";
    }

    // Agrandir la police d'écriture
    _.each(rE.querySelectorAll(".MuiTableCell-head"), (el) => {
      el.style.fontSize = "18px";
    });
    _.each(rE.querySelectorAll(".MuiTableCell-body"), (el) => {
      el.style.fontSize = "18px";
    });
  },
  reset: (rE) => {},
};
