import _ from "lodash";

export default {
  transform: (rE) => {
    const ratio = window.devicePixelRatio || 1;
    rE.querySelectorAll("img,svg").forEach((svgElement) => {
      if ((svgElement.src && svgElement.src.includes(".svg")) || svgElement.nodeName.toUpperCase() === "SVG") {
        svgElement.style._animation = svgElement.style.animation;
        svgElement.style.animation = "null";

        const canvas = document.createElement("canvas");

        canvas.classList.add("canvas_icon");
        canvas.width = svgElement.getBoundingClientRect().width * ratio;
        canvas.height = svgElement.getBoundingClientRect().height * ratio;

        canvas.style.width = svgElement.getBoundingClientRect().width + "px";
        canvas.style.height = svgElement.getBoundingClientRect().height + "px";

        svgElement.style.display = "none";
        svgElement.parentNode.insertBefore(canvas, svgElement);

        var ctx = canvas.getContext("2d");

        // Créer et ajouter l'élément au DOM
        var DOMURL = window.self.URL || window.self.webkitURL || window.self;
        var svgString = new XMLSerializer().serializeToString(svgElement);
        var img = new Image();
        var svg = new Blob([svgString], {
          type: "image/svg+xml;charset=utf-8",
        });
        img.src = svgElement.nodeName.toUpperCase() === "SVG" ? DOMURL.createObjectURL(svg) : svgElement.src;
        img.onload = function () {
          ctx.drawImage(img, 0, 0);
        };
      }
    });
  },
  reset: (rE) => {
    _.each(rE.querySelectorAll(".canvas_icon"), (el) => el.remove());
    _.each(rE.querySelectorAll("img,svg"), (el) => {
      if ((el.src && el.src.includes(".svg")) || el.nodeName.toUpperCase() === "SVG") {
        el.style.animation = el.style._animation;
        el.style.display = "initial";
      }
    });
  },
};
