# React PDF Exporter module

React PDF Exporter is a module compatible with react that allows export of the DOM in PDF format. This module can keep page styling and includes a configuration system to customize the generated document.
It can export any HTML element: text, images, tables, canvas, ...

## Installation

### Install module

```
npm install react-pdf-exporter
```

### Import module

```js
import { PDFButton } from 'react-pdf-module';
```

## Structure

* dist : Built code
* src : Source code

## Functionalities

### Export child components

```jsx
<PDFButton pdf_config={pdf_config}>
  <div>
    <p>
      Test <span>PDF</span>
    </p>
  </div>
</PDFButton>
```

Will export:

```jsx
<div>
	<p>
		Test <span>PDF</span>
	</p>
</div>
```

### Export child components with selector

```jsx
<PDFButton pdf_config={pdf_config} target="span">
  <div>
    <p>
      Test <span>PDF</span>
    </p>
  </div>
</PDFButton>
```

Will export:

```jsx
<span>PDF</span>
```

### Export any component with selector

```jsx
<PDFButton pdf_config={pdf_config} target=".card-body" />
```

Will export elements with class "card-body"

### Export whole page

```jsx
<PDFButton pdf_config={pdf_config} />
```

## Configuration

### pdf_config

The pdf_config is *mandatory* and defines the generation configuration:

* file_name : Name of the exported file
* title : Header title
* icon : Header icon
* color : Header color
* transforms : Transformations applied before and after generation (see bellow)
* mode : Selection mode ("default"|"select"|"both")
* no_download : Prevent download (for testing purposes)

Example of configuration:

```jsx
<PDFButton
  pdf_config={{
	file_name: "export",
	title: "Data exported",
	color: "#3F51B5",
	transforms: {
	  ajustMuiTables: false,
	  relativeLabels: true,
	  svgToCanvas: true,
	},
	no_download: false,
	mode: "default",
  }}
/>;
```

### Selection modes

* "default" add an export button that will export element following parameters on PDFButton
* "select" add a selection button that enable a selection mode in which you can select elements you want to export (selectable elements are specified with the target props on PDFButton and only work if the elements are visible on screen)
* "both" Add the default and select button

### Props for PDF Styling

Theses props are applied on any React element and define how they appear on the PDF.

* pdf_title : Give a title to the element
* pdf_position : Give a reference position for the order in which the element appear on PDF (position *1* will appear before position *2* in the document)
* pdf_zoom : Define a zoom on the element (0.5 will make the element twice as small and 2 will make the element twice as big)
* pdf_split : Define the with of the element. By default its equal to the with of the document (A4 format). pdf_split at 2 will make its width equal to the half of the document.
* pdf_comment : Add some text beside generated element

Styling example:

```jsx
<CardContent
  className="pdf_print"
  pdf_position={1}
  pdf_split="2"
  pdf_zoom=".8"
  pdf_title="Example"
  pdf_comment="It's an example"
>
	...
</CardContent>
```

## Advanced configuration

### Transforms

Transforms are functions applied before and after generation, they correct specific elements that cannot be exported by default or that doesn't appear correctly.

Existing transforms:

* svgToCanvas: Add support for SVG images (default: true)
* relativeLabels: Give relative position to class .label (default: true)
* ajustMuiTables: Enhance render of Material UI Tables (default: true)

## Build module

```
npm run build
```

## License

React-pdf-exporter is released under the MIT license.

## Author

Released by Baptiste Miquel for CEA Tech Occitanie