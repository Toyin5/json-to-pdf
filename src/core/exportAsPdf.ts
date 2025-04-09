import {
  PDFDocument,
  PDFFont,
  PDFImage,
  rgb,
  PDFEmbeddedPage,
  layoutMultilineText,
  TextAlignment,
  PDFName,
  PDFString,
  PDFRef,
  PDFPage,
} from "pdf-lib";

async exportAsPdf(documentName: string, download = true, canvasId = "") {
    const projectPages =
      this.currentProjectPages.value[canvasId || this.activeCanvasId];

    const fechedPdfs: { pdf: PDFDocument; url: string }[] = [];
    const fetchedFonts: { font: PDFFont; style: string; fontName: string }[] =
      [];
    const fetchedImgs: {
      image: PDFImage;
      url: string;
      objectFit?: "cover";
      width?: number;
      height?: number;
    }[] = [];

    const pdfDoc = await PDFDocument.create();
    const fontkit = ((await import("@pdf-lib/fontkit")) as any).default;
    pdfDoc.registerFontkit(fontkit);
    const propertyValue = (
      properties: any[],
      property: string,
      valueKey = "propertyValue"
    ) => {
      return this.traverseArray(
        properties,
        (value, key) => key === "propertyName" && value === property
      )[0][valueKey];
    };

    const fonts = {
      "Greycliff CF": {
        Regular: `${location.origin}/assets/fonts/greycliff-cf/greycliff-cf-medium.ttf`,
        "Regular-Italic": `${location.origin}/assets/fonts/greycliff-cf/greycliff-cf-mediumitalic.ttf`,
        "Bold-Italic": `${location.origin}/assets/fonts/greycliff-cf/greycliff-cf-bolditalic.ttf`,
        Bold: `${location.origin}/assets/fonts/greycliff-cf/greycliff-cf-bold.ttf`,
      },
      Arial: {
        Regular: `${location.origin}/assets/fonts/arial/arial.ttf`,
        "Regular-Italic": `${location.origin}/assets/fonts/arial/arial-italic.ttf`,
        "Bold-Italic": `${location.origin}/assets/fonts/arial/arial-bold-italic.ttf`,
        Bold: `${location.origin}/assets/fonts/arial/arial-bold.ttf`,
      },
      Poppins: {
        Regular: `${location.origin}/assets/fonts/poppins/poppins-regular.ttf`,
        "Regular-Italic": `${location.origin}/assets/fonts/poppins/poppins-italic.ttf`,
        "Bold-Italic": `${location.origin}/assets/fonts/poppins/poppins-bold-italic.ttf`,
        Bold: `${location.origin}/assets/fonts/poppins/poppins-bold.ttf`,
      },
      Monospace: {
        Regular: `${location.origin}/assets/fonts/monospace/monospace.ttf`,
        "Regular-Italic": `${location.origin}/assets/fonts/monospace/monospace-oblique.ttf`,
        "Bold-Italic": `${location.origin}/assets/fonts/monospace/monospace-bold.ttf`,
        Bold: `${location.origin}/assets/fonts/monospace/monospace-bold.ttf`,
      },
      "Roboto Mono": {
        Regular: `${location.origin}/assets/fonts/roboto-mono/roboto-mono-regular.ttf`,
        "Regular-Italic": `${location.origin}/assets/fonts/roboto-mono/roboto-mono-italic.ttf`,
        "Bold-Italic": `${location.origin}/assets/fonts/roboto-mono/roboto-mono-bold-italic.ttf`,
        Bold: `${location.origin}/assets/fonts/roboto-mono/roboto-mono-bold.ttf`,
      },
      "Brush Script MT": {
        Regular: `${location.origin}/assets/fonts/brush-script-mt/brush-script-mt-regular.ttf`,
        "Regular-Italic": `${location.origin}/assets/fonts/brush-script-mt/brush-script-mt-italic.ttf`,
        "Bold-Italic": `${location.origin}/assets/fonts/brush-script-mt/brush-script-mt-medium.ttf`,
        Bold: `${location.origin}/assets/fonts/brush-script-mt/brush-script-mt-medium.ttf`,
      },
      Italianno: {
        Regular: `${location.origin}/assets/fonts/italianno/italianno.ttf`,
        "Regular-Italic": `${location.origin}/assets/fonts/italianno/italianno.ttf`,
        "Bold-Italic": `${location.origin}/assets/fonts/italianno/italianno.ttf`,
        Bold: `${location.origin}/assets/fonts/italianno/italianno.ttf`,
      },
      "Edwardian Script ITC": {
        Regular: `${location.origin}/assets/fonts/edwardian-script-itc/edwardian-script-itc.ttf`,
        "Regular-Italic": `${location.origin}/assets/fonts/edwardian-script-itc/edwardian-script-itc.ttf`,
        "Bold-Italic": `${location.origin}/assets/fonts/edwardian-script-itc/edwardian-script-itc-std-bold.ttf`,
        Bold: `${location.origin}/assets/fonts/edwardian-script-itc/edwardian-script-itc-std-bold.ttf`,
      },
      "Freestyle Script": {
        Regular: `${location.origin}/assets/fonts/freestyle-script/freestyle-script-regular.ttf`,
        "Regular-Italic": `${location.origin}/assets/fonts/freestyle-script/freestyle-script-regular.ttf`,
        "Bold-Italic": `${location.origin}/assets/fonts/freestyle-script/freestyle-script-regular.ttf`,
        Bold: `${location.origin}/assets/fonts/freestyle-script/freestyle-script-regular.ttf`,
      },
      "Lucida Handwriting": {
        Regular: `${location.origin}/assets/fonts/lucida-handwriting/lucida-handwriting-std-regular.ttf`,
        "Regular-Italic": `${location.origin}/assets/fonts/lucida-handwriting/lucida-handwriting-italic.ttf`,
        "Bold-Italic": `${location.origin}/assets/fonts/lucida-handwriting/lucida-handwriting-std-bold.ttf`,
        Bold: `${location.origin}/assets/fonts/lucida-handwriting/lucida-handwriting-std-bold.ttf`,
      },
      "Comforter Brush": {
        Regular: `${location.origin}/assets/fonts/comforter-brush/ComforterBrush-Regular.ttf`,
        "Regular-Italic": `${location.origin}/assets/fonts/comforter-brush/ComforterBrush-Regular.ttf`,
        "Bold-Italic": `${location.origin}/assets/fonts/comforter-brush/ComforterBrush-Regular.ttf`,
        Bold: `${location.origin}/assets/fonts/comforter-brush/ComforterBrush-Regular.ttf`,
      },
    };

    const getColor = (hex: string) => {
      const [r, g, b, a] = hex
        .slice(1)
        .match(/.{2}/g)!
        .map((c) => parseInt(`0x${c}`) / 255);
      const opacity = a ?? 1;
      return { color: rgb(r, g, b), opacity };
    };

    const drawPath = ({
      x,
      y,
      path,
      scale,
      stroke,
      color,
      borderWidth = 1,
      page,
    }: Geometry & {
      path: string;
      scale: number;
      stroke?: string;
      color?: string;
      borderWidth?: number;
      page: PDFPage;
    }) => {
      const pdfPageSize = page.getSize();
      y = pdfPageSize.height - y;
      page.drawSvgPath(path, {
        x,
        y,
        scale,
        color: color ? getColor(color).color : undefined,
        borderColor: stroke ? getColor(stroke).color : undefined,
        opacity: color ? getColor(color).opacity : undefined,
        borderOpacity: stroke ? getColor(stroke).opacity : undefined,
        borderWidth,
      });
    };

    /**
     * Draws a circle on the page.
     * @param option.size - The radius of the circle.
     * @param option.x - x axis of the circle.
     * @param option.y - html y axis coordinate of the circle.
     */
    const drawCircle = ({
      size,
      x,
      y,
      color,
      borderColor,
      borderWidth,
      page,
    }: {
      size: number;
      x: number;
      y: number;
      color: string;
      borderWidth: number;
      borderColor: string;
      page: PDFPage;
    }) => {
      const pdfPageSize = page.getSize();
      y = pdfPageSize.height - y - size;
      x = x + size;
      page.drawCircle({
        y,
        x,
        size,
        borderColor: getColor(borderColor).color,
        borderOpacity: getColor(borderColor).opacity,
        borderWidth,
        color: getColor(color).color,
        opacity: getColor(color).opacity,
      });
    };

    const drawLine = ({
      start,
      end,
      color,
      strokeWidth = 1,
      dashArray,
      page,
    }: {
      start: { x: number; y: number };
      end: { x: number; y: number };
      color: string;
      dashArray?: number[];
      strokeWidth?: number;
      page: PDFPage;
    }) => {
      const pdfPageSize = page.getSize();
      const startY = pdfPageSize.height - start.y;
      const endY = pdfPageSize.height - end.y;
      page.drawLine({
        start: { x: start.x, y: startY },
        end: { x: end.x, y: endY },
        color: getColor(color).color,
        thickness: strokeWidth,
        dashArray,
        opacity: getColor(color).opacity,
      });
    };

    const drawBox = ({
      x,
      y,
      width,
      height,
      color,
      strokeWidth = 1,
      strokeColor,
      borderRadius = 0,
      outlined = true,
      dashArray,
      page,
    }: Geometry & {
      color: string;
      strokeWidth?: number;
      strokeColor: string;
      borderRadius: number;
      outlined?: boolean;
      page: PDFPage;
      dashArray?: number[];
    }) => {
      const pdfPageSize = page.getSize();
      width = outlined ? width + strokeWidth * 2 : width;
      height = outlined ? height + strokeWidth * 2 : height;
      y = outlined ? y - strokeWidth : y;
      x = outlined ? x - strokeWidth : x;
      const calcY = pdfPageSize.height - y;
      const path = `M ${x + borderRadius} ${0}
                H ${x + width - borderRadius}
                Q ${x + width} ${0}, ${x + width} ${0 + borderRadius}
                V ${0 + height - borderRadius}
                Q ${x + width} ${0 + height}, ${x + width - borderRadius} ${
        0 + height
      }
                H ${x + borderRadius}
                Q ${x} ${0 + height}, ${x} ${0 + height - borderRadius}
                V ${0 + borderRadius}
                Q ${x} ${0}, ${x + borderRadius} ${0}
                Z`;

      page.drawSvgPath(path, {
        x: 0,
        y: calcY,
        borderWidth: strokeWidth,
        borderColor: getColor(strokeColor).color,
        color: getColor(color).color,
        borderDashArray: dashArray,
        borderOpacity: getColor(strokeColor).opacity,
        opacity: getColor(color).opacity,
      });
    };

    const links: PDFRef[] = [];

    const drawTxt = async ({
      text,
      width,
      height,
      x,
      y,
      fontName,
      fontSize,
      fontWeight = "400",
      fontStyle = "normal",
      textDecoration = "none",
      txtAlignment = "left",
      color,
      lineHeight,
      page,
    }: Geometry & {
      text: string;
      fontName: string;
      fontSize: number;
      fontWeight?: string;
      fontStyle?: string;
      textDecoration?: string;
      txtAlignment?: string;
      color: string;
      lineHeight: number;
      page: PDFPage;
    }) => {
      const pdfPageSize = page.getSize();
      fontName = fontName.split(",")[0].replace(/"|'/g, "").trim();
      const existingFont = fetchedFonts.find(
        (f) =>
          f.fontName === fontName && f.style === `${fontWeight}-${fontStyle}`
      );
      let font: PDFFont | undefined;
      if (existingFont) {
        font = existingFont.font;
      } else {
        const weightTxt = fontWeight === "400" ? "Regular" : "Bold";
        const byte = await (
          await fetch(
            (fonts as any)[fontName][
              `${weightTxt}${fontStyle === "italic" ? "-Italic" : ""}`
            ]
          )
        ).arrayBuffer();
        font = await pdfDoc.embedFont(byte);
        fetchedFonts.push({
          font,
          fontName,
          style: `${fontWeight}-${fontStyle}`,
        });
      }

      const txtY = pdfPageSize.height - y - height;

      const lines = layoutMultilineText(text, {
        alignment:
          txtAlignment === "left"
            ? TextAlignment.Left
            : txtAlignment === "right"
            ? TextAlignment.Right
            : TextAlignment.Center,
        font,
        fontSize: +fontSize,
        bounds: {
          width: width,
          height: height,
          x: x,
          y: txtY,
        },
      });
      let lineY = txtY + +lineHeight * 0.27;
      for (let i = lines.lines.length - 1; i >= 0; i--) {
        const line = lines.lines[i];
        page.drawText(line.text, {
          font,
          x: line.x,
          y: lineY,
          size: +fontSize,
          lineHeight: +lineHeight,
          color: getColor(color).color,
          opacity: getColor(color).opacity,
        });
        if (textDecoration === "underline") {
          page.drawLine({
            start: { x: line.x, y: lineY - 2 },
            end: { x: line.x + line.width, y: lineY - 2 },
            thickness: 1,
            color: getColor(color).color,
            opacity: getColor(color).opacity,
          });
        }
        lineY += +lineHeight;
      }
    };

    const loadImg = (src: string): Promise<HTMLImageElement> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.src = src;
      });
    };

    const drawImg = async ({
      x,
      y,
      width,
      height,
      objectFit = "fill",
      opacity = 1,
      url,
      position = "center center",
      page,
      type,
    }: Geometry & {
      objectFit?: "fill" | "contain" | "cover";
      page: PDFPage;
      url: string;
      type?: string;
      opacity?: number;
      position?:
        | "left top"
        | "left center"
        | "left bottom"
        | "center top"
        | "center center"
        | "center bottom"
        | "right top"
        | "right center"
        | "right bottom";
    }) => {
      const pdfPageSize = page.getSize();
      type = type || (await fetch(url)).headers.get("Content-Type")!;
      let ny = pdfPageSize.height - y - height;
      const fetchedImg = fetchedImgs.find((img) =>
        objectFit !== "cover"
          ? img.url === url
          : img.url === url && width === img.width && height === img.height
      );
      let pdfImg: PDFImage | undefined;
      if (fetchedImg) {
        pdfImg = fetchedImg.image;
      } else {
        if (objectFit !== "cover") {
          if (type.match(/png/i)) {
            pdfImg = await pdfDoc.embedPng(
              await (await fetch(url)).arrayBuffer()
            );
            fetchedImgs.push({ image: pdfImg, url });
          } else if (type.match(/jpg|jpeg/i)) {
            pdfImg = await pdfDoc.embedJpg(
              await (await fetch(url)).arrayBuffer()
            );
            fetchedImgs.push({ image: pdfImg, url });
          } else {
            const img = await loadImg(url);
            const canvas = document.createElement("canvas");
            canvas.width =
              img.naturalWidth * (type === "image/svg+xml" ? 2 : 1);
            canvas.height =
              img.naturalHeight * (type === "image/svg+xml" ? 2 : 1);
            const ctx = canvas.getContext("2d")!;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const canvasUrl = canvas.toDataURL("image/png");
            pdfImg = await pdfDoc.embedPng(
              await (await fetch(canvasUrl)).arrayBuffer()
            );
            fetchedImgs.push({ image: pdfImg, url });
          }
        } else {
          const img = await loadImg(url);
          const widthScale = width / img.naturalWidth;
          const heightScale = height / img.naturalHeight;
          let nw = width;
          let nh = img.naturalHeight * widthScale;
          if (nh < height) {
            nh = height;
            nw = img.naturalWidth * heightScale;
          }
          const scale =
            nw === width ? img.naturalWidth / nw : img.naturalHeight / nh;
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d")!;
          canvas.width = width * scale;
          canvas.height = height * scale;
          ctx.drawImage(
            img,
            img.naturalWidth / 2 - (width * scale) / 2,
            img.naturalHeight / 2 - (height * scale) / 2,
            width * scale,
            height * scale,
            0,
            0,
            width * scale,
            height * scale
          );
          const croppedImgUrl = canvas.toDataURL();
          pdfImg = await pdfDoc.embedPng(
            await (await fetch(croppedImgUrl)).arrayBuffer()
          );
          fetchedImgs.push({
            image: pdfImg,
            url,
            width,
            height,
            objectFit,
          });
        }
      }
      if (objectFit === "contain") {
        const img = await loadImg(url);
        let nw = img.naturalWidth;
        let nh = img.naturalHeight;
        if (nw > width) {
          nw = width;
          nh = (nw * img.naturalHeight) / img.naturalWidth;
        }
        if (nh > height) {
          nh = height;
          nw = (nh * img.naturalWidth) / img.naturalHeight;
        }
        const [xPos, yPos] = position.split(" ");
        if (xPos === "center") {
          x = x + width / 2 - nw / 2;
        } else {
          x = x + width - nw;
        }
        if (yPos === "top") {
          ny = pdfPageSize.height - y - nh;
        } else if (yPos === "center") {
          ny = ny + height / 2 - nh / 2;
        }
        width = nw;
        height = nh;
      }
      page.drawImage(pdfImg, { x, y: ny, width, height, opacity });
    };

    const drawLink = ({
      x,
      y,
      width,
      height,
      url,
      page,
    }: Geometry & { url: string; page: PDFPage }) => {
      const pdfPageSize = page.getSize();
      y = pdfPageSize.height - y - height;
      const link = page.doc.context.register(
        page.doc.context.obj({
          Type: "Annot",
          Subtype: "Link",
          /* Bounds of the link on the page */
          Rect: [x, y, x + width, y + height],
          /* Give the link a 2-unit-wide border, with sharp corners */
          // Border: [5, 5, 5],
          /* Make the border color blue: rgb(255, 255, 1) */
          C: [2, 2, 1],
          /* Page to be visited when the link is clicked */
          A: { Type: "Action", S: "URI", URI: PDFString.of(url) },
        })
      );

      links.push(link);

      page.node.set(PDFName.of("Annots"), page.doc.context.obj(links));
    };

    for (const pageInfo of projectPages) {
      const { pageData, pageControls } = pageInfo;
      let existingPage: PDFEmbeddedPage | null = null;
      let scale = 1;
      if (pageData.pageType === "document" && pageData.documentFile) {
        const existingPdf = fechedPdfs.find(
          (p) => p.url === pageData.documentFile
        );
        if (!existingPdf) {
          const byte = await (await fetch(pageData.documentFile)).arrayBuffer();
          const pdf = await PDFDocument.load(byte);
          existingPage = await pdfDoc.embedPage(
            pdf.getPage(pageData.documentPageIndex)
          );
          fechedPdfs.push({ pdf, url: pageData.documentFile });
        } else {
          existingPage = await pdfDoc.embedPage(
            existingPdf.pdf.getPage(pageData.documentPageIndex)
          );
        }
      }

      const orientation = propertyValue(pageData.properties, "Orientation");
      const pageSize = propertyValue(pageData.properties, "Page size");
      const pageWidth =
        pageSize === "Custom"
          ? propertyValue(pageData.properties, "Page width")
          : (FmbrPageSizeDimensionDefaultDetails as any)[pageSize][
              orientation
            ].width.replace(/px/, "");
      const pageHeight =
        pageSize === "Custom"
          ? propertyValue(pageData.properties, "Page height")
          : (FmbrPageSizeDimensionDefaultDetails as any)[pageSize][
              orientation
            ].height.replace(/px/, "");
      let existingPdfSize;
      if (existingPage) {
        const pdfPageSize = existingPage.size();
        for (const k in FmbrPageSizeDimensionDefaultDetails) {
          const { width, height } = (
            FmbrPageSizeDimensionDefaultDetails as any
          )[k][orientation];
          const eachWidth = +width.replace(/px/, "");
          const eachHeight = +height.replace(/px/, "");
          if (
            eachWidth / eachHeight ===
            pdfPageSize.width / pdfPageSize.height
          ) {
            scale = pdfPageSize.width / eachWidth;
            const _scale = eachWidth / pdfPageSize.width;
            existingPdfSize = existingPage.scale(_scale);
            break;
          }
        }
      } else if (pageSize !== "Custom") {
        const dpi72Width = (PageSizesAt72DPI as any)[pageSize][
          orientation
        ].width.replace("px", "");
        scale = dpi72Width / pageWidth;
      }
      const page = pdfDoc.addPage([+pageWidth, +pageHeight]);

      if (existingPage) {
        page.drawPage(existingPage, {
          x: 0,
          y: 0,
          width: existingPdfSize?.width,
          height: existingPdfSize?.height,
        });
      }

      const pageBgColor = propertyValue(pageData.properties, "Color");
      const pageBgColorOpacity = propertyValue(
        pageData.properties,
        "Color opacity"
      );

      drawBox({
        ...page.getSize(),
        x: 0,
        y: 0,
        color: `${pageBgColor}${Math.round(
          ((pageBgColorOpacity > 100
            ? 100
            : pageBgColorOpacity < 0
            ? 0
            : pageBgColorOpacity) /
            100) *
            255
        )
          .toString(16)
          .padStart(2, "0")}`,
        borderRadius: 0,
        strokeColor: "#ffffff00",
        page,
      });

      if (!existingPage) {
        const url = propertyValue(pageData.properties, "Image");
        const objectFit = propertyValue(pageData.properties, "Size") as
          | "auto"
          | "contain"
          | "cover";
        const position = propertyValue(pageData.properties, "Position");
        const repeat = propertyValue(pageData.properties, "Repeat") as
          | "no-repeat"
          | "repeat";
        let opacity = propertyValue(pageData.properties, "Opacity");
        opacity = (+opacity < 0 ? 0 : +opacity > 100 ? 100 : +opacity) / 100;
        if (url) {
          if (objectFit === "cover") {
            await drawImg({
              ...page.getSize(),
              x: 0,
              y: 0,
              objectFit,
              url,
              opacity,
              page,
            });
          } else if (objectFit === "contain") {
            await drawImg({
              ...page.getSize(),
              x: 0,
              y: 0,
              objectFit,
              url,
              position,
              opacity,
              page,
            });
            if (repeat === "repeat") {
              // repeat algorithm
            }
          } else {
            const img = await loadImg(url);
            const width = img.naturalWidth;
            const height = img.naturalHeight;
            const [xPos, yPos] = position.split(" ");
            let x = 0,
              y = 0;

            if (xPos === "center") {
              x = +pageWidth / 2 - width / 2;
            } else if (xPos === "right") {
              x = +pageWidth - width;
            }

            if (yPos === "center") {
              y = +pageHeight / 2 - height / 2;
            } else if (xPos === "bottom") {
              y = +pageHeight - height;
            }

            await drawImg({ x, y, width, height, opacity, url, page });
          }
        }
      }

      for (const control of pageControls) {
        const ctrlPropValue = (prop: string, valKey = "propertyValue") => {
          return propertyValue(control.properties, prop, valKey);
        };
        if (control.pdfGenerationInfo.labelInfo) {
          const label = ctrlPropValue("Label").trim();
          const { x, y, height, lineHeight, fontFamily, fontSize, width } =
            control.pdfGenerationInfo.labelInfo;
          await drawTxt({
            text: label,
            x,
            y,
            width: width + 2,
            height,
            lineHeight,
            fontSize,
            fontName: fontFamily,
            color: "#222222",
            page,
          });
        }

        if (!control.name.match(/table|rating|checkbox|radio|label|grid/i)) {
          // bordercolor: #d0d5dd
          const { x, y, width, height } =
            control.pdfGenerationInfo.controlGeometry;
          let bgColor = "#ffffff00";
          let stroke = "#ffffff00";
          if (pageData.pageType === "form" && !control.name.match(/section/i)) {
            stroke = "#d0d5dd";
          } else if (control.name.match(/section/i)) {
            stroke = ctrlPropValue("Stroke");
            bgColor = ctrlPropValue("Background Color");
          }
          drawBox({
            x,
            y,
            width,
            height,
            color: bgColor,
            strokeColor: stroke,
            strokeWidth: 1,
            borderRadius: 4,
            outlined: !control.name.match(/section/i),
            dashArray: control.name.match(/section/i) ? [2, 2] : undefined,
            page,
          });
          if (control.name.match(/file/i) && control.value) {
            const { iconGeometry, lineHeight, iconSrc } =
              control.pdfGenerationInfo.otherInfo;
            const fileInfo: {
              name: string;
              url: string;
              size: number;
              type: string;
            } = JSON.parse(control.value);
            await drawImg({ ...iconGeometry, url: iconSrc, page });
            await drawTxt({
              ...(control.pdfGenerationInfo.valueGeometry as Geometry),
              text: fileInfo.name,
              color: ctrlPropValue("Foreground Color"),
              fontSize: 12,
              fontName: "Greycliff CF",
              lineHeight,
              page,
            });
            drawLink({
              ...control.pdfGenerationInfo.controlGeometry,
              url: fileInfo.url,
              page,
            });
          } else if (control.name.match(/image/i) && control.value) {
            const value = JSON.parse(control.value);
            await drawImg({
              ...control.pdfGenerationInfo.controlGeometry,
              url: value.url,
              page,
              objectFit: ctrlPropValue("Object Fit"),
              type: value.type,
            });
          } else if (control.name.match(/section/i)) {
            const { titleGeometry, titleTxtGeometry, lineHeight } =
              control.pdfGenerationInfo.otherInfo;
            drawBox({
              ...titleGeometry,
              color: "#f7f8f9",
              borderRadius: 4,
              strokeColor: "#ffffff00",
              strokeWidth: 0,
              page,
            });
            await drawTxt({
              ...titleTxtGeometry,
              text: ctrlPropValue("Section title").trim(),
              color: ctrlPropValue("Highlight Color"),
              fontName: "Greycliff CF",
              fontSize: 12,
              lineHeight,
              page,
            });
          }
        } else if (control.name.match(/rating/i)) {
          const { stars, starPath } = control.pdfGenerationInfo.otherInfo;
          const scale = stars[0].width / 17;
          const value = control.value;
          const color = ctrlPropValue("Highlight Color");
          stars.forEach((star: Geometry, i: number) => {
            drawPath({
              ...star,
              page,
              path: starPath,
              scale,
              stroke: i + 1 <= value ? color : "#B8C0CC",
              color: i + 1 <= value ? color : "#B8C0CC",
            });
          });
        } else if (control.name.match(/checkbox|radio/i)) {
          const options: {
            boxGeometry: Geometry;
            checkIndicatorGeometry: Geometry;
            txtGeometry: Geometry & {
              lineHeight: number;
            };
          }[] = control.pdfGenerationInfo.otherInfo.optionsInfo;
          const optionList = ctrlPropValue("Option Source", "optionsList");
          for (const o of options) {
            const i = options.indexOf(o);
            drawBox({
              ...o.boxGeometry,
              borderRadius: 5,
              outlined: false,
              strokeColor: "#e7eaee",
              color: "#f7f8f9",
              page,
            });
            const { x, y, width } = o.checkIndicatorGeometry;
            if (control.name.match(/radio/i)) {
              const theme = ctrlPropValue("Theme");
              const themeCssVar = (() => {
                return theme === "primary"
                  ? "--flwmn-primary-color"
                  : theme === "accent"
                  ? "--flwmn-accent-color"
                  : "--flwmn-warning";
              })();
              const themeColorVal = getComputedStyle(
                document.body
              ).getPropertyValue(themeCssVar);
              const checked = optionList[i].trim() === control.value?.trim();
              const checkColor = checked ? themeColorVal : "#d0d5dd";
              const borderWidth = 1.4;
              drawCircle({
                ...o.checkIndicatorGeometry,
                size: width / 2,
                color: "#ffffff00",
                borderColor: checkColor,
                borderWidth,
                page,
              });
              if (checked) {
                const size = (width * 0.5) / 2;
                const _x = x + width / 2 - size;
                const _y = y + width / 2 - size;
                drawCircle({
                  x: _x,
                  y: _y,
                  size,
                  color: checkColor,
                  borderColor: checkColor,
                  borderWidth: 0,
                  page,
                });
              }
            } else {
              const value = control.value ? JSON.parse(control.value) : [];
              const checked = value.find(
                (v: string) => v.trim() === optionList[i].trim()
              );
              const color = checked ? ctrlPropValue("Color") : "#ffffff00";
              drawBox({
                ...o.checkIndicatorGeometry,
                color,
                strokeColor: checked ? color : "#d0d5dd",
                borderRadius: 2,
                strokeWidth: 1.4,
                outlined: false,
                page,
              });
              if (checked) {
                //draw check path;
                const { svgCheckPath } = control.pdfGenerationInfo.otherInfo;
                const scale = 12 / 24;
                drawPath({
                  ...o.checkIndicatorGeometry,
                  scale,
                  stroke: "#fafafa",
                  borderWidth: 2.1333333333,
                  path: svgCheckPath,
                  page,
                });
              }
            }
            await drawTxt({
              ...o.txtGeometry,
              color: "#222222",
              fontName: "Greycliff CF",
              fontSize: 12,
              text: optionList[i].trim(),
              page,
            });
          }
        } else if (control.name.match(/table/i) && control.value) {
          const strokeColor = ctrlPropValue("Stroke");
          const strokeStyle = ctrlPropValue("Border style") as
            | "solid"
            | "dashed"
            | "dotted";
          const bgColor = ctrlPropValue("Background Color");
          const headerBgColor = ctrlPropValue("Header BG Color");
          const showTableHeader = ctrlPropValue("Table Header");
          const _fontSize = ctrlPropValue("Size");
          const _fontWeight = ctrlPropValue("Weight");
          const _txtStyle = ctrlPropValue("Text Style");
          const _textDecoration = ctrlPropValue("Text Decoration");
          const _txtAlignment = ctrlPropValue("Alignment");
          const _color = ctrlPropValue("Color");
          const _fontName = ctrlPropValue("Typeface");
          const showVerticalBorder = ctrlPropValue("Vertical");
          const showHorizontalBorder = ctrlPropValue("Horizontal");
          const rowArray = JSON.parse(control.value);
          const dashArray = strokeStyle.match(/dashed|dotted/i)
            ? strokeStyle === "dashed"
              ? [2, 2]
              : [1, 1]
            : undefined;
          const rowsWithGeometry = control.pdfGenerationInfo.otherInfo.rows;
          drawBox({
            ...control.pdfGenerationInfo.controlGeometry,
            borderRadius: 0,
            strokeWidth: 0,
            strokeColor,
            color: bgColor,
            outlined: false,
            page,
          });
          for (const row of rowArray) {
            const i = rowArray.indexOf(row);
            for (const cell of row) {
              const j = row.indexOf(cell);
              const drawCell = i !== 0 || showTableHeader;
              if (!drawCell) continue;
              const cellGeometryInfo = rowsWithGeometry[i][j];
              drawBox({
                ...cellGeometryInfo.geometry,
                outlined: false,
                color: i === 0 ? headerBgColor : "#ffffff00",
                borderRadius: 0,
                strokeWidth: 0,
                strokeColor: "#ffffff00",
                page,
              });
            }
            for (const cell of row) {
              const j = row.indexOf(cell);
              const drawCell = i !== 0 || showTableHeader;
              if (!drawCell) continue;
              const cellGeometryInfo = rowsWithGeometry[i][j];
              const fontSize =
                propertyValue(cell.properties, "Size") || _fontSize;
              const fontWeight =
                propertyValue(cell.properties, "Weight") || _fontWeight;
              const fontStyle =
                propertyValue(cell.properties, "Text Style") || _txtStyle;
              const txtAlignment =
                propertyValue(cell.properties, "Alignment") || _txtAlignment;
              const textDecoration =
                propertyValue(cell.properties, "Text Decoration") ||
                _textDecoration;
              const color = propertyValue(cell.properties, "Color") || _color;
              const fontName =
                propertyValue(cell.properties, "Typeface") || _fontName;
              if (showHorizontalBorder && i !== rowArray.length - 1) {
                const start = {
                  x: cellGeometryInfo.geometry.x,
                  y:
                    cellGeometryInfo.geometry.y +
                    cellGeometryInfo.geometry.height,
                };
                const end = {
                  x:
                    cellGeometryInfo.geometry.x +
                    cellGeometryInfo.geometry.width,
                  y:
                    cellGeometryInfo.geometry.y +
                    cellGeometryInfo.geometry.height,
                };
                drawLine({ start, end, color: strokeColor, dashArray, page });
              }
              if (showVerticalBorder && j !== row.length - 1) {
                const start = {
                  x:
                    cellGeometryInfo.geometry.x +
                    cellGeometryInfo.geometry.width,
                  y: cellGeometryInfo.geometry.y,
                };
                const end = {
                  x:
                    cellGeometryInfo.geometry.x +
                    cellGeometryInfo.geometry.width,
                  y:
                    cellGeometryInfo.geometry.y +
                    cellGeometryInfo.geometry.height,
                };
                drawLine({ start, end, color: strokeColor, dashArray, page });
              }
              await drawTxt({
                ...cellGeometryInfo.txtInfo,
                color,
                fontName,
                fontSize,
                fontStyle,
                fontWeight,
                textDecoration,
                txtAlignment,
                page,
              });
            }
          }
          drawBox({
            ...control.pdfGenerationInfo.controlGeometry,
            color: "#ffffff00",
            strokeColor,
            strokeWidth: 1,
            borderRadius: 0,
            outlined: false,
            dashArray,
            page,
          });
        }
        if (control.value) {
          if (control.name.match(/signature|initials/i)) {
            const url = control.value;
            await drawImg({
              ...control.pdfGenerationInfo.valueGeometry!,
              url,
              page,
            });
          } else if (
            control.name.match(
              /text|email|name|label|date|jobtitle|time|address|dropdown|phone/i
            )
          ) {
            const { width, height, x, y } =
              control.pdfGenerationInfo.valueGeometry!;
            const { lineHeight } = control.pdfGenerationInfo.otherInfo;
            const text = control.name.match(/date/i)
              ? formatDate(control.value, ctrlPropValue("Date format"), "en-US")
              : control.name.match(/time/i)
              ? formatDate(
                  `${new Date().toISOString().split("T")[0]}T${control.value}`,
                  "hh:mm a",
                  "en-US"
                )
              : control.value;
            const fontName = control.name.match(/dropdown/i)
              ? "Greycliff CF"
              : ctrlPropValue("Typeface");
            const fontSize = control.name.match(/dropdown/i)
              ? 12
              : ctrlPropValue("Size");
            const fontWeight = control.name.match(/dropdown/i)
              ? "400"
              : ctrlPropValue("Weight");
            const fontStyle = control.name.match(/dropdown/i)
              ? "normal"
              : ctrlPropValue("Text Style");
            const textDecoration = control.name.match(/dropdown/i)
              ? "none"
              : ctrlPropValue("Text Decoration");
            textDecoration;
            const txtAlignment = control.name.match(/dropdown/i)
              ? "left"
              : ctrlPropValue("Alignment");
            const color = ctrlPropValue("Color");
            if (control.name.match(/label/i)) {
              const { width, height, x, y } =
                control.pdfGenerationInfo.controlGeometry;
              drawBox({
                width,
                height,
                x,
                y,
                color: ctrlPropValue("Background Color"),
                strokeColor: "#ffffff00",
                borderRadius: 0,
                page,
              });
            }
            await drawTxt({
              text: text.trim(),
              width,
              height,
              x,
              y,
              fontSize,
              fontWeight,
              fontStyle,
              textDecoration,
              txtAlignment,
              color,
              fontName,
              lineHeight,
              page,
            });
          }
        }
      }
      page.scale(scale, scale);
    }
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });

    const pdfLibFile = new File([blob], `${documentName}.pdf`, {
      type: "application/pdf",
    });

    const outputPdfFile: File = pdfLibFile;

    // try {
    //   const compressedBlob = await this.ghostscriptService.compressPDF(
    //     pdfLibFile
    //   );

    //   outputPdfFile = new File([compressedBlob], `${documentName}.pdf`, {
    //     type: 'application/pdf',
    //   });
    // } catch (error) {
    //   console.error('Compression failed:', error);
    //   // alert('Compression failed: ' + error);
    // }
    this.ghostscriptService;

    if (download) {
      const fr = new FileReader();
      fr.onload = (e) => {
        const a = document.createElement("a");
        a.href = e.target!.result as string;
        a.download = `${documentName}.pdf`;
        a.click();
      };
      fr.readAsDataURL(outputPdfFile);
    }

    return outputPdfFile;
  }