/*!
 * Développé par Baptiste Miquel
 * pour CEA Tech Occitanie
 */

import React from "react";
import jsPDF from "jspdf";
import _ from "lodash";
import moment from "moment";
import html2canvas from "./html2canvas.min.js";
import uuid from "uuid";
import svgToCanvas from "./transforms/svgToCanvas";
import ajustMuiTables from "./transforms/ajustMuiTables";
import relativeLabels from "./transforms/relativeLabels";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFilePdf,
  faHandPointer,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import "./style.css";

// Formats en pixels d'une page
const page_formats = {
  a4: {
    width: 595,
    height: 842,
  },
};

// Exporter la version PDF de tous les éléments chargés avec la classe "pdf_print"
export const getPDFOfAallElements = (
  uid,
  title,
  target,
  pdf_config,
  select,
  setElementCount
) => {
  addLoader();
  let export_state = {
    completed: 0,
    percent: 0,
  };

  return new Promise((resolveExport, rejectExport) => {
    _.each(
      document.querySelectorAll(".pdf_hidden"),
      (el) => (el.style.opacity = 0)
    );
    var doc = initPDF(title, pdf_config);
    let pos = { x: 0, y: 80 };

    // Permet de s'assurer que l'ensemble des éléments sont écrits dans le PDF avant exportation
    let promises = [];

    let container =
      document.querySelectorAll(`.pdf_container-${uid}`)[0] || document.body;

    let elements = target
      ? container.querySelectorAll(target)
      : container.children;

    // Si les éléments sont sélectionnés
    if (select) {
      elements = _.filter(elements, (el) => el.pdf_selected === "1");
    }

    console.log(elements);

    // Ne pas ajouter les boutons d'export PDF
    // elements = _.filter(
    //   elements,
    //   (el) => !isChildOfElementWithClass(el, "pdf_no_select")
    // );

    // Ne pas ajouter les balises SCRIPT / STYLE
    elements = _.filter(
      elements,
      (el) =>
        el.nodeName.toUpperCase() !== "STYLE" &&
        el.nodeName.toUpperCase() !== "SCRIPT"
    );

    elements = _.sortBy(elements, [
      function (o) {
        return o.getAttribute("pdf_position");
      },
    ]);

    // Ajout des éléments dans le PDF
    _.each(elements, (el) => {
      let data = {
        title: el.getAttribute("pdf_title") || "Sans titre",
        zoom: el.getAttribute("pdf_zoom") || 1,
        page: 1,
      };
      makePrintable(el, pdf_config.transforms, target, uid);
      promises.push(
        new Promise((resolve, reject) => {
          setTimeout(() => {
            html2canvas(el).then((canvas) => {
              let canvasInfo = addElementToPDF(
                doc,
                el,
                canvas,
                pos,
                data,
                pdf_config
              );
              // Si l'élément a bien été ajouté
              if (canvasInfo) {
                pos.y += 80 + canvasInfo.size.height; // Prévoir la place pour le prochain élément
                data.page = canvasInfo.page; // Changer de page si nécessaire
              }
              unmakePrintable(el, pdf_config.transforms);
              resolve(); // Confirmer que l'élément est bien ajouté au PDF

              export_state.completed += 1;
              export_state.percent =
                (export_state.completed / elements.length) * 100;

              document.getElementById(
                "pdf_loader_progress_bar_value"
              ).style.width = `${export_state.percent}%`;
            });
          }, 500);
        })
      );
    });

    // Attendre que tous les éléments soient ajoutés au PDF
    Promise.all(promises).then((values) => {
      console.log("Print success");
      _.each(
        document.querySelectorAll(".pdf_hidden"),
        (el) => (el.style.opacity = 1)
      );
      // Exporter le PDF
      if (!pdf_config.no_download) {
        doc.save("export.pdf");
        resolveExport();
        setTimeout(removeLoader, 500);
      }
    });
  });

  return true;
};

// Initialiser le PDF
export const initPDF = (title, pdf_config) => {
  let doc = new jsPDF("p", "pt");
  doc = addHeaderPDF(doc, title, pdf_config);
  return doc;
};

// En-tête
const addHeaderPDF = (doc, title, pdf_config) => {
  let nowTime = moment().format("DD/MM/YYYY à HH:mm");

  // Rectangle gris
  doc.setFillColor(pdf_config.color || "black");
  doc.rect(0, 0, page_formats.a4.width, 40, "F");

  // Logo
  if (pdf_config.logo) {
    doc.addImage(pdf_config.logo, 0, 0, 53, 40);
  }

  // Titre
  doc.setTextColor(pdf_config.textColor || "#FFFFFF");
  doc.setFontSize(12);
  doc.setFont("helvetica");
  doc.setFontType("normal");
  doc.text(65, 25, pdf_config.title || "");

  // Date
  doc.setFontSize(8);
  doc.setFont("helvetica");
  doc.setFontType("normal");
  doc.text(520, 35, `${nowTime}`);

  return doc;
};

const addLoader = () => {
  const progress_bar = document.createElement("div");
  progress_bar.style.width = "500px";
  progress_bar.style.height = "20px";
  progress_bar.style.backgroundColor = "white";
  progress_bar.style.position = "absolute";
  progress_bar.style.left = "50%";
  progress_bar.style.top = "50%";
  progress_bar.style.transform = "translateX(-50%)";
  progress_bar.style.borderRadius = "20px";

  const progress_bar_value = document.createElement("div");
  progress_bar_value.id = "pdf_loader_progress_bar_value";
  progress_bar_value.style.width = "0px";
  progress_bar_value.style.height = progress_bar.style.height;
  progress_bar_value.style.backgroundColor = "#F50057";
  progress_bar_value.style.position = "absolute";
  progress_bar_value.style.left = "0";
  progress_bar_value.style.top = "0";
  progress_bar_value.style.borderRadius = progress_bar.style.borderRadius;
  progress_bar_value.style.transition = "100ms";

  const loader_text = document.createElement("p");
  loader_text.style.color = "white";
  loader_text.style.fontSize = "22px";
  loader_text.style.position = "fixed";
  loader_text.style.left = "50%";
  loader_text.style.top = "calc(50% - 60px)";
  loader_text.style.transform = "translateX(-50%)";
  loader_text.innerHTML = "Génération du PDF en cours...";

  const loader = document.createElement("div");
  loader.id = "pdf_loader";
  loader.style.width = "100%";
  loader.style.height = "100%";
  loader.style.backgroundColor = "#00000088";
  loader.style.position = "fixed";
  loader.style.left = "0";
  loader.style.top = "0";
  loader.style.zIndex = "1000005";
  loader.style.transition = "500ms";

  progress_bar.appendChild(progress_bar_value);
  loader.appendChild(progress_bar);
  loader.appendChild(loader_text);
  document.body.appendChild(loader);
};

const removeLoader = () => {
  document.getElementById("pdf_loader").style.opacity = 0;
  setTimeout(() => {
    document.getElementById("pdf_loader").remove();
  }, 500);
};

// Ajouter un élément au PDF
const addElementToPDF = (doc, el, canvas, pdfPos, data, pdf_config) => {
  let canv = document.createElement("canvas");
  let canvContext = canv.getContext("2d");

  const screenRatio = window.devicePixelRatio || 1;

  // Taille exacte de l'élément sur l'écran
  let iW = el.getBoundingClientRect().width * screenRatio + 0; // Ajouter 2 pixels à la largeur sans lesquels la taille semble incorrecte
  let iH = el.getBoundingClientRect().height * screenRatio;
  if (iW <= 0 || iH <= 0) return false;
  canv.width = iW;
  canv.height = iH;

  if (!canvas || canvas.width <= 0 || canvas.height <= 0) return false;

  canvContext.drawImage(canvas, 0, 0, iW, iH, 0, 0, iW, iH);

  const imgUrl = canv.toDataURL();
  // console.log(imgUrl);

  // const w = window.open("");
  // w.document.write(`<img src="${imgUrl}">`);

  // Obtenir le ratio de l'image
  const ratio = iW / iH;

  const totalWidth =
    el.getAttribute("pdf_split") !== null
      ? page_formats.a4.width / el.getAttribute("pdf_split")
      : page_formats.a4.width;
  const offsetX = 0;

  // Mapper la largeur de l'image pour qu'elle rentre dans le PDF (si elle est trop grande)
  // Le PDF est au format A4, soit 595px de largeur
  const mappedWidth =
    iW > totalWidth - 50
      ? mapVal(iW, 0, iW, 0, totalWidth) * data.zoom - 10
      : iW * data.zoom;

  // Changer de page si dépassement
  let currentPage = data.page;
  if (pdfPos.y + mappedWidth / ratio > page_formats.a4.height) {
    currentPage++;
    console.log("Changement de page!");
    doc.addPage();
    doc.movePage(currentPage);
    doc = addHeaderPDF(doc, "", pdf_config);
    pdfPos.y = 80;
  }

  // Appliquer l'image avec la bonne taille dans le PDF (le ratio hauteur / largeur est conservé)
  // https://rawgit.com/MrRio/jsPDF/master/docs/module-addImage.html
  doc.addImage(
    imgUrl,
    "jpg",
    totalWidth / 2 - mappedWidth / 2 + offsetX,
    pdfPos.y,
    mappedWidth,
    mappedWidth / ratio
  );

  doc.setTextColor("#000000");
  doc.setFontSize(12);
  doc.setFont("helvetica");
  doc.setFontType("normal");
  doc.text(5, pdfPos.y - 10, data.title);

  doc.setFillColor("#000000");
  doc.line(5, pdfPos.y - 8, totalWidth - 10, pdfPos.y - 8);

  // Ajout des commentaires
  if (
    el.getAttribute("pdf_comment") !== null &&
    el.getAttribute("pdf_split") !== null
  ) {
    doc.setTextColor("#000000");
    doc.setFontSize(10);
    doc.setFont("helvetica");
    doc.setFontType("normal");
    doc.text(
      page_formats.a4.width / el.getAttribute("pdf_split") + 10,
      pdfPos.y + 10,
      el.getAttribute("pdf_comment")
    );
  }

  return {
    pos: {
      x: pdfPos.x,
      y: pdfPos.y,
    },
    size: {
      width: mappedWidth,
      height: mappedWidth / ratio,
    },
    page: currentPage || 1,
  };
};

// Mapper une valeur avec:
// n la valeur de départ
// start1 et stop1 les limites de la valeur de départ
// start2 et stop2 les limites de la valeur retournée
const mapVal = (n, start1, stop1, start2, stop2) =>
  ((n - start1) / (stop1 - start1)) * (stop2 - start2) + start2;

// Rend les éléments compatibles avec html2canvas
const makePrintable = (refElement, transforms, target) => {
  removeAllBorders(target);
  transforms.ajustMuiTables !== false && ajustMuiTables.transform(refElement);
  transforms.relativeLabels !== false && relativeLabels.transform(refElement);
  transforms.svgToCanvas !== false && svgToCanvas.transform(refElement);
};

// Remet les éléments à leur état initial
const unmakePrintable = (refElement, transforms) => {
  transforms.relativeLabels !== false && relativeLabels.reset(refElement);
  transforms.svgToCanvas !== false && svgToCanvas.reset(refElement);
};

const selectElements = (uid, target, setElementCount) => {
  let container =
    document.querySelectorAll(`.pdf_container-${uid}`)[0] || document.body;
  let elements = target
    ? container.querySelectorAll(target)
    : container.children;

  _.each(elements, (el) => {
    if (!isChildOfElementWithClass(el, "pdf_no_select")) {
      el.style._zIndex = el.style.zIndex;
      el.style.zIndex = "1000001";
      el.style._border = el.style.border;
      el.style.border = "1px dotted red";

      el.style._cursor = el.style.cursor;
      el.style.cursor = "pointer";
      el.addEventListener("mouseover", selectMouseOverEvent);
      el.addEventListener("mouseleave", selectMouseLeaveEvent);
      el.addEventListener("click", selectClickEvent);
      el.addEventListener(
        "click",
        setElementCountClick(setElementCount, uid, target)
      );
    }
  });
  return true;
};

var setElementCountClick = (setElementCount, uid, target) => (e) => {
  let container =
    document.querySelectorAll(`.pdf_container-${uid}`)[0] || document.body;

  let elements = target
    ? container.querySelectorAll(target)
    : container.children;

  elements = _.filter(elements, (el) => el.pdf_selected === "1");

  setElementCount(elements.length);
};

var selectMouseOverEvent = (e) => {
  if (isChildOfElementWithClass(e.currentTarget, "pdf_no_select")) return false;
  // e.stopPropagation();
  e.preventDefault();
  const newBg = "rgba(0, 255, 0, 0.1)";
  if (newBg !== e.currentTarget.style.backgroundColor) {
    e.currentTarget.style._backgroundColor =
      e.currentTarget.style.backgroundColor;
  }
  e.currentTarget.style.backgroundColor = newBg;
};

var selectMouseLeaveEvent = (e) => {
  if (isChildOfElementWithClass(e.currentTarget, "pdf_no_select")) return false;
  // e.stopPropagation();
  e.preventDefault();
  e.currentTarget.style.backgroundColor =
    e.currentTarget.style._backgroundColor;
};

var selectClickEvent = (e) => {
  if (isChildOfElementWithClass(e.currentTarget, "pdf_no_select")) return false;
  // e.stopPropagation();
  e.preventDefault();
  if (e.currentTarget.pdf_selected === "1") {
    e.currentTarget.pdf_selected = "0";
    e.currentTarget.style.border = "1px dotted red";
  } else {
    e.currentTarget.pdf_selected = "1";
    e.currentTarget.style.border = "2px dashed green";
  }
};

const removeAllBorders = (target) => {
  let container = document.body;
  let elements =
    target !== null ? container.querySelectorAll(target) : container.children;

  _.each(elements, (el) => {
    if (!isChildOfElementWithClass(el, "pdf_no_select")) {
      el.style.border = el.style._border;
      el.style.zIndex = el.style._zIndex;
      el.style.cursor = el.style._cursor;
      el.removeEventListener("mouseover", selectMouseOverEvent);
      el.removeEventListener("mouseleave", selectMouseLeaveEvent);
      el.removeEventListener("click", selectClickEvent);
      el.style.backgroundColor = el.style._backgroundColor;

      el.pdf_selected = 0;
    }
  });

  // Enlever l'overlay
  // document.getElementById("pdf_overlay").remove();
};

// Vérifier si l'élément est enfant d'un autre élément qui a la classe indiquée
function isChildOfElementWithClass(child, elementClass) {
  if (child.parentNode == null) return false;
  if (!child.classList.contains(elementClass)) {
    if (isChildOfElementWithClass(child.parentNode, elementClass)) return true;
  } else {
    return true;
  }
}

// Ajoute un bouton qui permet l'impression
// Les éléments chargés à l'intérieur du container ne sont pas visibles sur l'interface mais peuvent être imprimés
// Chaque élément à imprimer doit quand même posséder la classe "pdf_print"
export class PDFButton extends React.Component {
  state = {
    selectState: 0,
    elementCount: 0,
    uid: -1,
  };

  // componentDidMount = () => {
  //   let container =
  //     document.querySelectorAll(`.pdf_container-${this.state.uid}`)[0] ||
  //     document.body;

  //   let elements = this.props.target
  //     ? container.querySelectorAll(this.props.target)
  //     : container.children;

  //   this.setElementCount(elements.length);
  // };

  setSelectState = (newSelectState) => {
    this.setState({ selectState: newSelectState });
    return true;
  };

  setElementCount = (newElementCount) => {
    this.setState({ elementCount: newElementCount });
  };

  setUid = (newUid) => {
    this.setState({ uid: newUid });
  };

  render() {
    const { children, pdf_config, ...rest } = this.props;
    const { selectState, elementCount } = this.state;

    let uid = uuid.v4();
    const mode = !this.props.target ? "default" : pdf_config.mode ? pdf_config.mode : "default"; // default, select, both
    return (
      <div
        className={`pdf_hidden pdf_no_select pdf_button_parent ${
          selectState === 1 && "pdf_button_parent-select"
        }`}
      >
        <div className="pdf_button_container pdf_hidden">
          {(mode === "default" || children) && (
            <PDFButtonDefault
              pdf_config={pdf_config}
              mode={mode}
              uid={uid}
              count={elementCount}
              setElementCount={this.setElementCount}
              {...rest}
            />
          )}
          {mode === "select" && !children && (
            <PDFButtonSelect
              pdf_config={pdf_config}
              mode={mode}
              uid={uid}
              selectState={selectState}
              setSelectState={this.setSelectState}
              count={elementCount}
              setElementCount={this.setElementCount}
              {...rest}
            />
          )}
          {mode === "both" && !children && (
            <PDFButtonSelect
              pdf_config={pdf_config}
              mode={mode}
              uid={uid}
              selectState={selectState}
              setSelectState={this.setSelectState}
              count={elementCount}
              setElementCount={this.setElementCount}
              {...rest}
            />
          )}
        </div>
        {children && (
          <div className={`pdf_container pdf_container-${uid}`}>{children}</div>
        )}
      </div>
    );
  }
}

const PDFButtonDefault = ({
  uid,
  title,
  target,
  pdf_config,
  count,
  setElementCount,
  selectState,
}) => (
  <button
    variant="contained"
    color="secondary"
    className="pdf_button pdf_hidden"
    onClick={() => {
      getPDFOfAallElements(
        uid,
        title,
        target,
        pdf_config,
        false,
        setElementCount
      ).then(() => {
        console.log("Export terminé");
      });
    }}
  >
    {selectState === 1 && <BubbleIndicator count={count} />}
    <FontAwesomeIcon icon={faFilePdf} />
  </button>
);

const PDFButtonSelect = ({
  uid,
  title,
  target,
  pdf_config,
  mode,
  selectState,
  setSelectState,
  count,
  setElementCount,
  children,
}) => {
  const resetSelectState = () => {
    removeAllBorders(target);
    setSelectState(0);
  };
  return (
    <React.Fragment>
      {selectState === 1 ? (
        <button
          className="pdf_button pdf_hidden"
          onClick={() =>
            getPDFOfAallElements(
              uid,
              title,
              target,
              pdf_config,
              true,
              setElementCount
            ).then(resetSelectState)
          }
        >
          {selectState === 1 && <BubbleIndicator count={count} />}
          <FontAwesomeIcon icon={faFilePdf} />
        </button>
      ) : (
        <PDFButtonDefault
          selectState={selectState}
          pdf_config={pdf_config}
          mode={mode}
          uid={uid}
          title={title}
          target={target}
          count={count}
        />
      )}

      {selectState === 1 ? (
        <button
          className="pdf_button pdf_hidden"
          onClick={() => {
            resetSelectState();
          }}
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
      ) : (
        <button
          className="pdf_button pdf_hidden"
          onClick={() => {
            selectElements(uid, target, setElementCount) &&
              setSelectState(1) &&
              setElementCount(0);
          }}
        >
          <FontAwesomeIcon icon={faHandPointer} />
        </button>
      )}
    </React.Fragment>
  );
};

const BubbleIndicator = ({ count }) => (
  <div className="pdf_bubble_indicator">{count}</div>
);
