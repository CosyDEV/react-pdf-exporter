export default {
  transform: (rE) => {
    rE
      .querySelectorAll(".label")
      .forEach((label) => (label.style.position = "relative"));
  },
  reset: (rE) => {
    rE
      .querySelectorAll(".label")
      .forEach((label) => (label.style.position = "initial"));
  },
};
