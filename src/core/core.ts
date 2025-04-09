import { Injectable, Renderer2 } from "@angular/core";
import { BehaviorSubject, Subject } from "rxjs";
import {
  AddNewFolderActionPayload,
  CreateSignatureActionPayload,
  DeleteThemeAction,
  FetchDriveFolderAndFilesActionPayload,
  FileUploadActionPayload,
  FmbrControl,
  FmbrControlCategory,
  FmbrProperty,
  Geometry,
  GetApiCollectionsAction,
  GetCollectionEndpointsByIdAction,
  GetEndpointDetailsAction,
  ProjectPages,
  SaveImageActionPayload,
  SaveSignatureActionPayload,
  SearchDriveLocationActionPayload,
  SignatureSettings,
  ThemeAction,
  ThemeData,
  UndoRedoState,
  UpdateSignatureActionPayload,
  UploadThemeAction,
  VerifyControlContentAction,
} from "../types/form-builder.type";
import {
  FmbrControlCategoryEnum,
  FmbrFillableControlTypeEnum,
  FmbrLayoutControlTypeEnum,
  FmbrPageOrientationEnum,
  FmbrPageSizeEnum,
  FmbrPropertyTypeOptionEnum,
  FmbrShapesControlTypeEnum,
} from "../enums";
import {
  FmbrPropertiesData,
  FmbrPropertyData,
  FmbrPropertyInterface,
} from "../interfaces/form-builder.interface";
import {
  FmbrOptionSources,
  FmbrPageSizeDimensionDefaultDetails,
  FontFamilies,
  PageSizesAt72DPI,
} from "../constants/form-builder.constant";
import { FormControl, Validators } from "@angular/forms";
import { formatDate } from "@angular/common";
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
import { GhostscriptService } from "./ghostscript.service";

interface AnyObject {
  [key: string]: any;
}

@Injectable({
  providedIn: "root",
})
export class FormBuilderService {
  onTouchStartInToolbar = new Subject<any>();
  addPageThumbnail = new Subject<MutationRecord>();
  removePageThumbnail = new Subject<MutationRecord>();
  updatePageThumbnail = new Subject<MutationRecord>();
  controlResize = new Subject();
  activeProperties = new BehaviorSubject<FmbrPropertiesData | null>(null);
  updateControlProperties = new Subject<FmbrPropertiesData>();
  updateControlProperty = new Subject<FmbrPropertyData>();
  updatePageProperties = new Subject<FmbrPropertiesData>();
  updatePageProperty = new Subject<FmbrPropertyData>();
  userProfile = new BehaviorSubject<any>(null);
  pageTypeUpdate = new Subject<boolean>();

  flashControl = "";

  activeCanvasId!: string;

  mouseDown = new Subject<boolean>();

  addPage = new Subject<number>();

  saveSignatureAction = new BehaviorSubject<SaveSignatureActionPayload | null>(
    null
  );
  createSignatureAction = new Subject<CreateSignatureActionPayload>();
  updateSignatureAction = new Subject<UpdateSignatureActionPayload>();
  signatureSettings = new BehaviorSubject<SignatureSettings | null>(null);
  deleteSavedSignatureAction = new Subject<string | null>();
  userSignatureInitialAction = new Subject<{ name: string; value: any }>();

  fetchDriveFolderAndFilesAction =
    new Subject<FetchDriveFolderAndFilesActionPayload>();
  saveImageAction = new Subject<SaveImageActionPayload>();
  searchDriveLocationAction = new Subject<SearchDriveLocationActionPayload>();
  addNewFolderAction = new Subject<AddNewFolderActionPayload>();

  fileUploadAction = new Subject<FileUploadActionPayload>();

  scrollTo = new Subject<{ canvasId: string; top: number }>();

  PAGECONTROL_HEIGHT: { [key: string]: number } = { "": 40 };

  defaultPageOrientation = FmbrPageOrientationEnum.Portrait;
  defaultPageSize = FmbrPageSizeEnum.A4;
  customPageWidth = "";
  customPageHeight = "";

  gridColumnIndex = 0;
  currentPageInd = 0;

  analyticsData: any;

  activeTheme = new BehaviorSubject<ThemeAction | null>(null);
  themes = new BehaviorSubject<{
    recentlyUsed: { data: ThemeData[]; count: number };
    suggested: { data: ThemeData[]; count: number };
    customized: { data: ThemeData[]; count: number };
  } | null>(null);
  uploadTheme = new Subject<UploadThemeAction>();
  deleteThemeAction = new Subject<DeleteThemeAction>();

  getApiCollectionsAction = new Subject<GetApiCollectionsAction>();
  getEndpointsByCollectionId = new Subject<GetCollectionEndpointsByIdAction>();
  getEndpointDetails = new Subject<GetEndpointDetailsAction>();
  verifyControlContent = new Subject<VerifyControlContentAction>();

  undoRedoAction = new Subject<"undo" | "redo">();
  undos: { [key: string]: UndoRedoState[] } = { "": [] };
  redos: { [key: string]: UndoRedoState[] } = { "": [] };
  canAddUndo = true;
  destroyControls = new Subject<string>();
  addUndoTimeout: any;
  addingUndo = false;

  activeControl = new Subject<string>();

  scale = new BehaviorSubject<{ [key: string]: number }>({
    "": 1,
  });

  stamps: { name: string; url: string }[] = [];

  currentProjectPages = new BehaviorSubject<{
    [key: string]: ProjectPages;
  }>({ "": [] });

  constructor(private ghostscriptService: GhostscriptService) {} // private helperService: HelperService // private notificationService: NotificationService, // private store: Store<fromApp.AppState>,

  locateControl({
    control,
    canvasId,
    callback,
  }: {
    control: FmbrControl;
    canvasId: string;
    callback?: () => void;
  }) {
    const propertyValue = (properties: any[], property: string) => {
      return this.traverseArray(
        properties,
        (value, key) => key === "propertyName" && value === property
      )[0].propertyValue;
    };
    const pageIndex = +control.pageNumber - 1;
    const PAGECONTROL_HEIGHT = this.PAGECONTROL_HEIGHT[canvasId];
    const PAGE_GAP = 30;
    const projectPages = this.currentProjectPages.value[canvasId];
    const pageDimensions = projectPages.slice(0, pageIndex).map((p) => {
      const properties = p.pageData.properties;
      const pageSize = propertyValue(properties, "Page size");
      const orientation = propertyValue(properties, "Orientation");
      let width = 0;
      let height = 0;
      if (pageSize === "Custom") {
        width = +propertyValue(properties, "Page width");
        height = +propertyValue(properties, "Page height");
      } else {
        width = +(FmbrPageSizeDimensionDefaultDetails as any)[pageSize][
          orientation
        ].width.replace(/px/, "");
        height = +(FmbrPageSizeDimensionDefaultDetails as any)[pageSize][
          orientation
        ].height.replace(/px/, "");
      }
      return { width, height };
    });
    const evalStr = pageDimensions
      .map((p) => p.height + PAGECONTROL_HEIGHT)
      .join(`+ ${PAGE_GAP} +`);
    const scale = this.scale.value[canvasId];
    const zoomOffsetTop = (
      document.querySelector(
        `#fmbr-canvas[data-canvas-id="${canvasId}"] .zoom-canvas-par`
      ) as HTMLElement
    ).offsetTop;
    const pageTop = (eval(evalStr || "0") + (evalStr ? PAGE_GAP : 0)) * scale;
    const top =
      pageTop +
      zoomOffsetTop +
      (control.pdfGenerationInfo.controlGeometry.y + PAGECONTROL_HEIGHT) *
        scale;
    this.scrollTo.next({ canvasId, top: top - 30 });
    callback?.();
    this.flashControl = control.name;
    setTimeout(() => {
      this.flashControl = "";
    }, 1000);
  }

  fileIcon(type: string) {
    let file = "";
    if (type.includes("image")) {
      file = "image";
    } else if (type.match(/spreadsheet|csv|excel/)) {
      file = "excel";
    } else if (type.includes("pdf")) {
      file = "pdf";
    } else if (type.match(/document|word/i)) {
      file = "word";
    } else {
      file = "unknown";
    }
    return `assets/icons/form-builder/analytics/files/${file}_icon.png`;
  }

  loadFont(name: string) {
    name = name.split(",")[0].trim().replace(/'|"/g, "");
    const fonts = {
      "Greycliff CF": "assets/fonts/greycliff-cf/greycliff-cf-medium.woff2",
      "Comforter Brush":
        "assets/fonts/comforter-brush/ComforterBrush-Regular.woff2",
      Italianno: "assets/fonts/italianno/italianno.woff2",
      "Edwardian Script ITC":
        "assets/fonts/edwardian-script-itc/edwardian-script-itc.woff2",
      "Brush Script MT":
        "assets/fonts/brush-script-mt/brush-script-regular.woff2",
      "Freestyle Script":
        "assets/fonts/freestyle-script/freestyle-script-regular.woff2",
      "Lucida Handwriting":
        "assets/fonts/lucida-handwriting/lucida-handwriting-std-regular.woff2",
    };
    const fontUrl = (fonts as any)[name];
    return new Promise((resolve) => {
      fetch(fontUrl)
        .then((res) => res.blob())
        .then((blob) => {
          const fr = new FileReader();
          fr.onload = (e) => {
            resolve(e.target!.result as string);
          };
          fr.readAsDataURL(blob);
        });
    });
  }

  async addWaterMark(
    imgUrl: string,
    callback: (url: string) => void,
    {
      includeDate,
      includeTime,
      includeFirstName,
      includeLastName,
    }: {
      includeDate: boolean;
      includeTime: boolean;
      includeFirstName: boolean;
      includeLastName: boolean;
    },
    fullName: string
  ) {
    const canvas = document.createElement("canvas") as HTMLCanvasElement;
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    const parser = new DOMParser();

    const ctx = canvas.getContext("2d")!;
    ctx.font = "14px Greycliff CF";

    const dateTimeText = `${includeDate ? new Date().toDateString() : ""} ${
      includeTime ? new Date().toTimeString().slice(0, 5) : ""
    }`.trim();
    const nameTxt = `${includeFirstName ? fullName.split(" ")[0] : ""} ${
      includeLastName ? fullName.split(" ").at(-1) : ""
    }`.trim();

    const metrics = ctx.measureText(`${dateTimeText} ${nameTxt}`);
    const totalHeight =
      metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
    const logoW = 24;
    const timeStampWidth = logoW + 8 + metrics.width;
    const timeStampHeight = Math.max(totalHeight, logoW);
    const timeStampSvg = document.createElementNS(ns, "svg");
    //   <defs>
    //   <style>

    //   </style>
    // </defs>
    const defs = document.createElementNS(ns, "defs");
    const style = document.createElement("style");
    style.innerHTML = `
        @font-face {
          font-family: "Greycliff CF";
          src: url("${await this.loadFont("Greycliff CF")}") format("woff2");
        }
    `;
    defs.appendChild(style);
    timeStampSvg.appendChild(defs);
    timeStampSvg.setAttribute("width", timeStampWidth.toString());
    timeStampSvg.setAttribute("height", timeStampHeight.toString());
    timeStampSvg.setAttribute(
      "viewBox",
      `0 0 ${timeStampWidth} ${timeStampHeight}`
    );
    const timeStampTxt = document.createElementNS(ns, "text");
    timeStampTxt.setAttribute("x", `${logoW + 8}`);
    timeStampTxt.setAttribute(
      "y",
      `${
        timeStampHeight / 2 - totalHeight / 2 + metrics.actualBoundingBoxAscent
      }`
    );
    timeStampTxt.setAttribute("fill", "#4E33FF");
    timeStampTxt.setAttribute("font-size", "14");
    timeStampTxt.setAttribute("font-family", "Greycliff CF");
    timeStampTxt.textContent = `${dateTimeText} ${nameTxt}`;
    let timeStampLogo = document.createElementNS(ns, "svg") as Element;
    const logoSvgStr = await (
      await fetch("assets/logo/flowmono-logo-mini.svg")
    ).text();
    timeStampLogo = parser.parseFromString(
      logoSvgStr,
      "image/svg+xml"
    ).documentElement;

    timeStampLogo.setAttribute("width", `${logoW}`);
    timeStampLogo.setAttribute("height", `${logoW}`);
    timeStampLogo.setAttribute("x", `0`);
    timeStampLogo.setAttribute("y", `0`);
    timeStampLogo.classList.add("logo");
    // timeStampLogo.setAttribute('href', `assets/logo/flowmono-logo-mini.svg`);
    timeStampSvg.appendChild(timeStampLogo);
    timeStampSvg.appendChild(timeStampTxt);
    timeStampSvg.classList.add("watermark");

    const { signatureEl, signatureW, signatureH } = await (async () => {
      const type = (await fetch(imgUrl)).headers.get("Content-Type")!;
      let el = document.createElement("div") as Element;
      let oldW, oldH;
      if (type === "image/svg+xml") {
        el = parser.parseFromString(
          imgUrl.includes("data:image/svg+xml")
            ? atob(imgUrl.split(",")[1])
            : await (await fetch(imgUrl)).text(),
          "image/svg+xml"
        ).documentElement;
        oldW = +el.getAttribute("width")!;
        oldH = +el.getAttribute("height")!;
      } else {
        const img: HTMLImageElement = await new Promise((resolve) => {
          const _img = new Image();
          _img.onload = () => {
            resolve(_img);
          };
          _img.src = imgUrl;
        });
        oldW = img.naturalWidth;
        oldH = img.naturalHeight;
        const image = document.createElementNS(ns, "image");
        el = image;
        const base64: string = await new Promise((resolve) => {
          const fr = new FileReader();
          fr.onload = (e) => {
            resolve(e.target!.result as string);
          };
          fetch(imgUrl)
            .then((r) => r.blob())
            .then((blob) => {
              fr.readAsDataURL(blob);
            });
        });
        el.setAttribute("href", base64);
      }
      const nh = timeStampHeight * 2.5;
      const nw = (nh * oldW) / oldH;
      el.setAttribute("width", `${nw}`);
      el.setAttribute("height", `${nh}`);
      return { signatureEl: el, signatureW: nw, signatureH: nh };
    })();

    const combinedW = Math.max(signatureW, timeStampWidth);
    signatureEl.setAttribute("x", `${combinedW / 2 - signatureW / 2}`);
    signatureEl.setAttribute("y", `0`);
    timeStampSvg.setAttribute("x", `${combinedW / 2 - timeStampWidth / 2}`);
    timeStampSvg.setAttribute("y", `${signatureH + 8}`);

    const combinedH = signatureH + 8 + timeStampHeight;

    svg.appendChild(signatureEl);
    svg.appendChild(timeStampSvg);

    svg.setAttribute("viewBox", `0 0 ${combinedW} ${combinedH}`);

    const scaledW = 450;
    const scaledH = (scaledW * combinedH) / combinedW;

    svg.setAttribute("width", `${scaledW}`);
    svg.setAttribute("height", `${scaledH}`);

    const svgStr = new XMLSerializer().serializeToString(svg);

    callback(`data:image/svg+xml;base64,${btoa(svgStr)}`);
  }

  genGraphUnitAndData(
    arr: number[],
    data: number,
    unitcallback: (unit: string) => void
  ) {
    const max = Math.max(...Object.values(arr));
    const conv = (n: number, u: string) => {
      if (u == "h") {
        return n / (1000 * 60 * 60);
      } else if (u == "m") {
        return n / (1000 * 60);
      }
      return n / 1000;
    };
    if (Math.floor(conv(max, "h"))) {
      unitcallback("hr");
      return conv(data, "h");
    }
    if (Math.floor(conv(max, "m"))) {
      unitcallback("min");
      return conv(data, "m");
    }
    unitcallback("sec");
    return conv(data, "s");
  }

  getFmbrControlMetaData({
    left,
    top,
    width,
    height,
    controlData,
    pageNumber,
    formId,
    pageType,
    defaultSpacing,
  }: {
    left: number;
    top: number;
    width: string | null;
    height: string | null;
    controlData: any;
    pageNumber: string;
    formId: string;
    pageType: "form" | "document";
    defaultSpacing: number;
  }) {
    const fitToWidth =
      pageType === "form" &&
      controlData.controlCategory !== FmbrControlCategoryEnum.Shapes;
    const control: FmbrControl = {
      id: controlData?.id || this.generateGUID(),
      controlCategory: controlData?.controlCategory,
      controlType: controlData?.controlType,
      name: !controlData?.name?.includes("_")
        ? `${controlData?.name?.replace(" ", "")}_${Date.now()}`
        : controlData?.name,
      coordinate: {
        position:
          // controlData?.coordinate?.position ||
          fitToWidth ? "relative" : "absolute",
        width: width,
        height: height,
        transform: `translate3d(${left}px, ${top}px, 0px)`,
      },
      value: controlData?.value ?? null,
      disabled: controlData?.disabled ?? false,
      pageNumber: pageNumber,
      formId: formId,
      parentControl: controlData?.parentControl ?? null,
      columnIndex: controlData?.columnIndex ?? 0,
      logic: controlData?.logic ?? null,
      assignee: controlData?.assignee ?? null,
      updateProperties: controlData?.updateProperties ?? true,
      updateGeometry: controlData?.updateGeometry ?? false,
      controlIndex: controlData?.controlIndex ?? 0,
      properties: this.getControlProperties({
        controlName: controlData?.name,
        pageType,
        defaultSpacing,
        updateGeometry: controlData?.updateGeometry ?? false,
        //recipient can update geometry
        oldProperties: controlData?.properties,
      }),
      pdfGenerationInfo: controlData.pdfGenerationInfo,
    };

    return control;
  }

  getControlTextDescription(category: FmbrControlCategory, type: number) {
    let catEnum;
    switch (category) {
      case FmbrControlCategoryEnum.Fillable:
        catEnum = FmbrFillableControlTypeEnum;
        break;
      case FmbrControlCategoryEnum.Layout:
        catEnum = FmbrLayoutControlTypeEnum;
        break;
      default:
        catEnum = FmbrShapesControlTypeEnum;
        break;
    }
    return catEnum[type];
  }

  setAsRequired(isRequired: boolean, formControl: FormControl) {
    if (isRequired) {
      formControl.addValidators(Validators.required);
    } else {
      formControl.removeValidators(Validators.required);
    }
    formControl.updateValueAndValidity();
  }

  getControlProperties({
    controlName,
    pageType = "form",
    defaultSpacing,
    oldProperties,
    updateGeometry,
  }: {
    controlName: string;
    pageType: "document" | "form";
    defaultSpacing: number;
    updateGeometry: boolean;
    oldProperties?: FmbrProperty[];
  }): FmbrProperty[] {
    const propValue = (property: string, valueKey = "propertyValue") => {
      return this.traverseArray(
        oldProperties || [],
        (value, key) => key === "propertyName" && value === property
      )?.[0]?.[valueKey];
    };
    let properties: FmbrProperty[] = [];

    if (controlName.match(/image/i)) {
      properties = [
        {
          groupLabel: "Image upload details",
          propertyType: "group",
          isCollapsible: true,
          properties: [
            {
              propertyName: "Label",
              propertyType: "input",
              propertyValue: propValue("Label") || "Image",
              inputPropertyType: "text",
              propertyCanToggle: true,
              propertyToggleValue:
                propValue("Label", "propertyToggleValue") ??
                pageType === "form",
            },
            // {
            //   propertyName: 'Background Color',
            //   propertyType: 'color',
            //   propertyValue:
            //     propValue('Background Color') ||
            //     propValue('Foreground Color') ||
            //     '#f6f5ff',
            // },
          ],
        },
        {
          groupLabel: "Image type",
          propertyType: "group",
          isCollapsible: true,
          properties: [
            {
              propertyName: "Allowable type",
              propertyType: "select",
              propertyValue: propValue("Allowable type") || ["jpeg", "png"],
              selectMultipleOptions: [
                { name: "JPEG", value: "jpeg" },
                { name: "PNG", value: "png" },
              ],
            },
            {
              propertyName: "Image size for upload(MB)",
              propertyType: "input",
              propertyValue: propValue("Image size for upload(MB)") || 5,
              inputPropertyType: "number",
            },
            {
              propertyName: "Object Fit",
              propertyType: "select",
              propertyValue: propValue("Object Fit") || "cover",
              selectOptions: [
                { name: "Fill", value: "fill" },
                { name: "Contain", value: "contain" },
                { name: "Cover", value: "cover" },
              ],
            },
          ],
        },
        {
          groupLabel: "Layout",
          propertyType: "group",
          isCollapsible: true,
          properties: [
            // {
            //   propertyName: 'Positioning',
            //   propertyType: 'select',
            //   propertyValue:
            //     propValue('Positioning') ||
            //     (pageType === 'document' ? 'absolute' : 'relative'),
            //   selectOptions: [
            //     { name: 'Automatic', value: 'relative' },
            //     { name: 'Freehand', value: 'absolute' },
            //   ],
            // },
            {
              propertyName: "Margin top",
              propertyType: "input",
              propertyValue: propValue("Margin top") || defaultSpacing,
              inputPropertyType: "number",
            },
            {
              propertyName: "Allow Geometry Update",
              propertyType: "slideToggle",
              propertyValue: updateGeometry,
            },
          ],
        },
        {
          propertyName: "Visibility",
          propertyType: "slideToggle",
          propertyValue: propValue("Visibility") || true,
        },
        {
          propertyName: "Set as required",
          propertyType: "slideToggle",
          propertyValue: propValue("Set as required") || false,
        },
      ];
    } else if (controlName.match(/grid/i)) {
      properties = [
        {
          groupLabel: "Column",
          propertyType: "group",
          isCollapsible: true,
          properties: [
            {
              propertyName: "Column",
              propertyType: "column",
              propertyValue: propValue("Column") || 1,
            },
          ],
        },
        {
          groupLabel: "Gap Settings",
          propertyType: "group",
          isCollapsible: true,
          properties: [
            {
              propertyName: "Column Gap",
              propertyType: "input",
              propertyValue: propValue("Column Gap") || "10",
              inputPropertyType: "number",
            },
          ],
        },
        {
          groupLabel: "Layout",
          propertyType: "group",
          isCollapsible: true,
          properties: [
            // {
            //   propertyName: 'Positioning',
            //   propertyType: 'select',
            //   propertyValue:
            //     propValue('Positioning') ||
            //     (pageType === 'document' ? 'absolute' : 'relative'),
            //   selectOptions: [
            //     { name: 'Automatic', value: 'relative' },
            //     { name: 'Freehand', value: 'absolute' },
            //   ],
            // },
            {
              propertyName: "Margin top",
              propertyType: "input",
              propertyValue: propValue("Margin top") || defaultSpacing,
              inputPropertyType: "number",
            },
            {
              propertyName: "Allow Geometry Update",
              propertyType: "slideToggle",
              propertyValue: updateGeometry,
            },
          ],
        },
      ];
    } else if (controlName.match(/section/i)) {
      properties = [
        {
          groupLabel: "Section details",
          propertyType: "group",
          isCollapsible: true,
          properties: [
            {
              propertyName: "Section title",
              propertyType: "input",
              propertyValue: propValue("Section title") || "Section",
              inputPropertyType: "text",
            },
            {
              propertyName: "Stroke",
              propertyType: "color",
              propertyValue: propValue("Stroke") || "#4E33FF",
            },
            {
              propertyName: "Background Color",
              propertyType: "color",
              propertyValue: propValue("Background Color") || "#FFFFFF",
            },
            {
              propertyName: "Highlight Color",
              propertyType: "color",
              propertyValue: propValue("Highlight Color") || "#64748B",
            },
          ],
        },
        {
          groupLabel: "Layout",
          propertyType: "group",
          isCollapsible: true,
          properties: [
            // {
            //   propertyName: 'Positioning',
            //   propertyType: 'select',
            //   propertyValue:
            //     propValue('Positioning') ||
            //     (pageType === 'document' ? 'absolute' : 'relative'),
            //   selectOptions: [
            //     { name: 'Automatic', value: 'relative' },
            //     { name: 'Freehand', value: 'absolute' },
            //   ],
            // },
            {
              propertyName: "Margin top",
              propertyType: "input",
              propertyValue: propValue("Margin top") || defaultSpacing,
              inputPropertyType: "number",
            },
            {
              propertyName: "Allow Geometry Update",
              propertyType: "slideToggle",
              propertyValue: updateGeometry,
            },
          ],
        },
        {
          propertyName: "Section visibility",
          propertyType: "slideToggle",
          propertyValue: propValue("Section visibility") || true,
        },
        {
          propertyName: "Toggle help",
          propertyType: "slideToggle",
          propertyValue: propValue("Toggle help") || true,
        },
        {
          propertyName: "Help text",
          propertyType: "input",
          propertyValue: propValue("Help text") || "",
          inputPropertyType: "text",
          propertyCanToggle: true,
          propertyToggleValue:
            propValue("Help text", "propertyToggleValue") || true,
        },
      ];
    }
    if (controlName.match(/text/i) && !controlName.match(/verifiable/i)) {
      properties = [
        {
          groupLabel: "Details",
          propertyType: "group",
          isCollapsible: true,
          properties: [
            {
              propertyName: "Label",
              propertyType: "input",
              propertyValue: propValue("Label") || "Text field",
              inputPropertyType: "text",
              propertyCanToggle: true,
              propertyToggleValue:
                propValue("Label", "propertyToggleValue") ??
                pageType === "form",
            },
            {
              propertyName: "Placeholder",
              propertyType: "input",
              propertyValue: propValue("Placeholder") || "Text",
              inputPropertyType: "text",
            },
            {
              propertyName: "Character Limit",
              propertyType: "input",
              propertyValue: propValue("Character Limit") || "",
              inputPropertyType: "number",
            },
            {
              propertyName: "Color",
              propertyType: "color",
              propertyValue: propValue("Color") || "#000000",
            },
          ],
        },
        {
          groupLabel: "Typography",
          propertyType: "group",
          isCollapsible: true,
          properties: [
            {
              propertyName: "Typeface",
              propertyType: "select",
              propertyValue:
                propValue("Typeface") || '"Greycliff CF", sans-serif',
              selectOptions: [...FontFamilies],
            },
            {
              propertyType: "row",
              properties: [
                {
                  propertyName: "Size",
                  propertyType: "input",
                  propertyValue: propValue("Size") || "12",
                  inputPropertyType: "number",
                },
                {
                  propertyName: "Height",
                  propertyType: "input",
                  propertyValue: propValue("Height") || "Auto",
                  inputPropertyType: "text",
                },
                {
                  propertyName: "Weight",
                  propertyType: "select",
                  propertyValue: propValue("Weight") || "400",
                  selectOptions: [
                    { name: "Thin", value: "100" },
                    { name: "Extra Light", value: "200" },
                    { name: "Light", value: "300" },
                    { name: "Normal", value: "400" },
                    { name: "Semi Bold", value: "600" },
                    { name: "Bold", value: "700" },
                    { name: "Extra Bold", value: "900" },
                  ],
                },
                {
                  propertyName: "Spacing",
                  propertyType: "input",
                  propertyValue: propValue("Spacing") || "0",
                  inputPropertyType: "number",
                },
              ],
            },
            {
              propertyType: "row",
              properties: [
                {
                  propertyName: "Text Style",
                  propertyType: "select",
                  propertyValue: propValue("Text Style") || "normal",
                  selectOptions: [
                    { name: "Normal", value: "normal" },
                    { name: "Italic", value: "italic" },
                  ],
                },
                {
                  propertyName: "Text Decoration",
                  propertyType: "select",
                  propertyValue: propValue("Text Decoration") || "none",
                  selectOptions: [
                    { name: "None", value: "none" },
                    { name: "Underline", value: "underline" },
                  ],
                },
              ],
            },
            {
              propertyName: "Alignment",
              propertyType: "textAlignment",
              propertyValue: propValue("Alignment") || "left",
            },
          ],
        },
        {
          groupLabel: "Layout",
          propertyType: "group",
          isCollapsible: true,
          properties: [
            // {
            //   propertyName: 'Positioning',
            //   propertyType: 'select',
            //   propertyValue:
            //     propValue('Positioning') ||
            //     (pageType === 'document' ? 'absolute' : 'relative'),
            //   selectOptions: [
            //     { name: 'Automatic', value: 'relative' },
            //     { name: 'Freehand', value: 'absolute' },
            //   ],
            // },
            {
              propertyName: "Margin top",
              propertyType: "input",
              propertyValue: propValue("Margin top") || defaultSpacing,
              inputPropertyType: "number",
            },
            {
              propertyName: "Allow Geometry Update",
              propertyType: "slideToggle",
              propertyValue: updateGeometry,
            },
          ],
        },
        {
          groupLabel: "Settings",
          propertyType: "group",
          isCollapsible: true,
          properties: [
            {
              propertyName: "Multiline text", // Tobi, you can make this a button toggle, showing multi line and single line
              propertyType: "slideToggle",
              propertyValue: propValue("Multiline text") || true,
            },
            {
              propertyName: "Set as required",
              propertyType: "slideToggle",
              propertyValue: propValue("Set as required") || false,
            },
            {
              propertyName: "Show Control MenuBar",
              propertyType: "slideToggle",
              propertyValue: propValue("Show Control MenuBar") || false,
            },
            {
              propertyName: "Set as readonly",
              propertyType: "slideToggle",
              propertyValue: propValue("Set as readonly") || false,
            },
          ],
        },
      ];
    } else if (controlName.match(/label/i)) {
      properties = [
        {
          groupLabel: "Details",
          propertyType: "group",
          isCollapsible: true,
          properties: [
            // {
            //   propertyName: 'Label',
            //   propertyType: 'input',
            //   propertyValue: propValue('Label') || 'Text field',
            //   inputPropertyType: 'text',
            //   propertyCanToggle: true,
            //   propertyToggleValue:
            //     propValue('Label', 'propertyToggleValue') ?? true,
            // },
            // {
            //   propertyName: 'Placeholder',
            //   propertyType: 'input',
            //   propertyValue: propValue('Placeholder') || 'Text',
            //   inputPropertyType: 'text',
            // },
            // {
            //   propertyName: 'Character Limit',
            //   propertyType: 'input',
            //   propertyValue: propValue('Character Limit') || '',
            //   inputPropertyType: 'number',
            // },
            {
              propertyName: "Color",
              propertyType: "color",
              propertyValue: propValue("Color") || "#000000",
            },
            {
              propertyName: "Background Color",
              propertyType: "color",
              propertyValue: propValue("Background Color") || "#ffffff",
            },
          ],
        },
        {
          groupLabel: "Typography",
          propertyType: "group",
          isCollapsible: true,
          properties: [
            {
              propertyName: "Typeface",
              propertyType: "select",
              propertyValue:
                propValue("Typeface") || '"Greycliff CF", sans-serif',
              selectOptions: [...FontFamilies],
            },
            {
              propertyType: "row",
              properties: [
                {
                  propertyName: "Size",
                  propertyType: "input",
                  propertyValue: propValue("Size") || "20",
                  inputPropertyType: "number",
                },
                {
                  propertyName: "Height",
                  propertyType: "input",
                  propertyValue: propValue("Height") || "Auto",
                  inputPropertyType: "text",
                },
                {
                  propertyName: "Weight",
                  propertyType: "select",
                  propertyValue: propValue("Weight") || "700",
                  selectOptions: [
                    { name: "Thin", value: "100" },
                    { name: "Extra Light", value: "200" },
                    { name: "Light", value: "300" },
                    { name: "Normal", value: "400" },
                    { name: "Semi Bold", value: "600" },
                    { name: "Bold", value: "700" },
                    { name: "Extra Bold", value: "900" },
                  ],
                },
                {
                  propertyName: "Spacing",
                  propertyType: "input",
                  propertyValue: propValue("Spacing") || "0",
                  inputPropertyType: "number",
                },
              ],
            },
            {
              propertyType: "row",
              properties: [
                {
                  propertyName: "Text Style",
                  propertyType: "select",
                  propertyValue: propValue("Text Style") || "normal",
                  selectOptions: [
                    { name: "Normal", value: "normal" },
                    { name: "Italic", value: "italic" },
                  ],
                },
                {
                  propertyName: "Text Decoration",
                  propertyType: "select",
                  propertyValue: propValue("Text Decoration") || "none",
                  selectOptions: [
                    { name: "None", value: "none" },
                    { name: "Underline", value: "underline" },
                  ],
                },
              ],
            },
            {
              propertyName: "Alignment",
              propertyType: "textAlignment",
              propertyValue: propValue("Alignment") || "left",
            },
          ],
        },
        {
          groupLabel: "Padding Option",
          propertyType: "group",
          isCollapsible: true,
          properties: [
            {
              propertyType: "row",
              properties: [
                {
                  propertyName: "Top",
                  propertyType: "input",
                  propertyValue: propValue("Top") || "0",
                  inputPropertyType: "number",
                },
                {
                  propertyName: "Bottom",
                  propertyType: "input",
                  propertyValue: propValue("Bottom") || "0",
                  inputPropertyType: "number",
                },
                {
                  propertyName: "Left",
                  propertyType: "input",
                  propertyValue: propValue("Left") || "0",
                  inputPropertyType: "number",
                },
                {
                  propertyName: "Right",
                  propertyType: "input",
                  propertyValue: propValue("Right") || "0",
                  inputPropertyType: "number",
                },
              ],
            },
          ],
        },
        {
          groupLabel: "Layout",
          propertyType: "group",
          isCollapsible: true,
          properties: [
            // {
            //   propertyName: 'Positioning',
            //   propertyType: 'select',
            //   propertyValue:
            //     propValue('Positioning') ||
            //     (pageType === 'document' ? 'absolute' : 'relative'),
            //   selectOptions: [
            //     { name: 'Automatic', value: 'relative' },
            //     { name: 'Freehand', value: 'absolute' },
            //   ],
            // },
            {
              propertyName: "Margin top",
              propertyType: "input",
              propertyValue: propValue("Margin top") || defaultSpacing,
              inputPropertyType: "number",
            },
            {
              propertyName: "Allow Geometry Update",
              propertyType: "slideToggle",
              propertyValue: updateGeometry,
            },
          ],
        },
      ];
    } else if (controlName.match(/email/i)) {
      properties = [
        {
          groupLabel: "Details",
          propertyType: "group",
          isCollapsible: true,
          properties: [
            {
              propertyName: "Label",
              propertyType: "input",
              propertyValue: propValue("Label") || "Email address",
              inputPropertyType: "text",
              propertyCanToggle: true,
              propertyToggleValue:
                propValue("Label", "propertyToggleValue") ??
                pageType === "form",
            },
            {
              propertyName: "Placeholder",
              propertyType: "input",
              propertyValue: propValue("Placeholder") || "fola@flowmono.com",
              inputPropertyType: "text",
            },
            {
              propertyName: "Color",
              propertyType: "color",
              propertyValue: propValue("Color") || "#000000",
            },
          ],
        },
        {
          groupLabel: "Typography",
          propertyType: "group",
          isCollapsible: true,
          properties: [
            {
              propertyName: "Typeface",
              propertyType: "select",
              propertyValue:
                propValue("Typeface") || '"Greycliff CF", sans-serif',
              selectOptions: [...FontFamilies],
            },
            {
              propertyType: "row",
              properties: [
                {
                  propertyName: "Size",
                  propertyType: "input",
                  propertyValue: propValue("Size") || "12",
                  inputPropertyType: "number",
                },
                {
                  propertyName: "Height",
                  propertyType: "input",
                  propertyValue: propValue("Height") || "Auto",
                  inputPropertyType: "text",
                },
                {
                  propertyName: "Weight",
                  propertyType: "select",
                  propertyValue: propValue("Weight") || "400",
                  selectOptions: [
                    { name: "Thin", value: "100" },
                    { name: "Extra Light", value: "200" },
                    { name: "Light", value: "300" },
                    { name: "Normal", value: "400" },
                    { name: "Semi Bold", value: "600" },
                    { name: "Bold", value: "700" },
                    { name: "Extra Bold", value: "900" },
                  ],
                },
                {
                  propertyName: "Spacing",
                  propertyType: "input",
                  propertyValue: propValue("Spacing") || "0",
                  inputPropertyType: "number",
                },
              ],
            },
            {
              propertyType: "row",
              properties: [
                {
                  propertyName: "Text Style",
                  propertyType: "select",
                  propertyValue: propValue("Text Style") || "normal",
                  selectOptions: [
                    { name: "Normal", value: "normal" },
                    { name: "Italic", value: "italic" },
                  ],
                },
                {
                  propertyName: "Text Decoration",
                  propertyType: "select",
                  propertyValue: propValue("Text Decoration") || "none",
                  selectOptions: [
                    { name: "None", value: "none" },
                    { name: "Underline", value: "underline" },
                  ],
                },
              ],
            },
            {
              propertyName: "Alignment",
              propertyType: "textAlignment",
              propertyValue: propValue("Alignment") || "left",
            },
          ],
        },
        {
          groupLabel: "Layout",
          propertyType: "group",
          isCollapsible: true,
          properties: [
            // {
            //   propertyName: 'Positioning',
            //   propertyType: 'select',
            //   propertyValue:
            //     propValue('Positioning') ||
            //     (pageType === 'document' ? 'absolute' : 'relative'),
            //   selectOptions: [
            //     { name: 'Automatic', value: 'relative' },
            //     { name: 'Freehand', value: 'absolute' },
            //   ],
            // },
            {
              propertyName: "Margin top",
              propertyType: "input",
              propertyValue: propValue("Margin top") || defaultSpacing,
              inputPropertyType: "number",
            },
            {
              propertyName: "Allow Geometry Update",
              propertyType: "slideToggle",
              propertyValue: updateGeometry,
            },
          ],
        },
        {
          propertyName: "Set as required",
          propertyType: "slideToggle",
          propertyValue: propValue("Set as required") || false,
        },
      ];
    } else if (controlName.match(/name/i)) {
      properties = [
        {
          groupLabel: "Details",
          propertyType: "group",
          isCollapsible: true,
          properties: [
            {
              propertyName: "Label",
              propertyType: "input",
              propertyValue: propValue("Label") || "Name",
              inputPropertyType: "text",
              propertyCanToggle: true,
              propertyToggleValue:
                propValue("Label", "propertyToggleValue") ??
                pageType === "form",
            },
            {
              propertyName: "Placeholder",
              propertyType: "input",
              propertyValue: propValue("Placeholder") || "Name",
              inputPropertyType: "text",
            },
            {
              propertyName: "Color",
              propertyType: "color",
              propertyValue: propValue("Color") || "#000000",
            },
          ],
        },
        {
          groupLabel: "Typography",
          propertyType: "group",
          isCollapsible: true,
          properties: [
            {
              propertyName: "Typeface",
              propertyType: "select",
              propertyValue:
                propValue("Typeface") || '"Greycliff CF", sans-serif',
              selectOptions: [...FontFamilies],
            },
            {
              propertyType: "row",
              properties: [
                {
                  propertyName: "Size",
                  propertyType: "input",
                  propertyValue: propValue("Size") || "12",
                  inputPropertyType: "number",
                },
                {
                  propertyName: "Height",
                  propertyType: "input",
                  propertyValue: propValue("Height") || "Auto",
                  inputPropertyType: "text",
                },
                {
                  propertyName: "Weight",
                  propertyType: "select",
                  propertyValue: propValue("Weight") || "400",
                  selectOptions: [
                    { name: "Thin", value: "100" },
                    { name: "Extra Light", value: "200" },
                    { name: "Light", value: "300" },
                    { name: "Normal", value: "400" },
                    { name: "Semi Bold", value: "600" },
                    { name: "Bold", value: "700" },
                    { name: "Extra Bold", value: "900" },
                  ],
                },
                {
                  propertyName: "Spacing",
                  propertyType: "input",
                  propertyValue: propValue("Spacing") || "0",
                  inputPropertyType: "number",
                },
              ],
            },
            {
              propertyType: "row",
              properties: [
                {
                  propertyName: "Text Style",
                  propertyType: "select",
                  propertyValue: propValue("Text Style") || "normal",
                  selectOptions: [
                    { name: "Normal", value: "normal" },
                    { name: "Italic", value: "italic" },
                  ],
                },
                {
                  propertyName: "Text Decoration",
                  propertyType: "select",
                  propertyValue: propValue("Text Decoration") || "none",
                  selectOptions: [
                    { name: "None", value: "none" },
                    { name: "Underline", value: "underline" },
                  ],
                },
              ],
            },
            {
              propertyName: "Alignment",
              propertyType: "textAlignment",
              propertyValue: propValue("Alignment") || "left",
            },
          ],
        },
        {
          groupLabel: "Layout",
          propertyType: "group",
          isCollapsible: true,
          properties: [
            // {
            //   propertyName: 'Positioning',
            //   propertyType: 'select',
            //   propertyValue:
            //     propValue('Positioning') ||
            //     (pageType === 'document' ? 'absolute' : 'relative'),
            //   selectOptions: [
            //     { name: 'Automatic', value: 'relative' },
            //     { name: 'Freehand', value: 'absolute' },
            //   ],
            // },
            {
              propertyName: "Margin top",
              propertyType: "input",
              propertyValue: propValue("Margin top") || defaultSpacing,
              inputPropertyType: "number",
            },
            {
              propertyName: "Allow Geometry Update",
              propertyType: "slideToggle",
              propertyValue: updateGeometry,
            },
          ],
        },
        {
          propertyName: "Set as required",
          propertyType: "slideToggle",
          propertyValue: propValue("Set as required") || false,
        },
      ];
    } else if (controlName.match(/job\s?title/i)) {
      properties = [
        {
          groupLabel: "Details",
          propertyType: "group",
          isCollapsible: true,
          properties: [
            {
              propertyName: "Label",
              propertyType: "input",
              propertyValue: propValue("Label") || "Job Title",
              inputPropertyType: "text",
              propertyCanToggle: true,
              propertyToggleValue:
                propValue("Label", "propertyToggleValue") ??
                pageType === "form",
            },
            {
              propertyName: "Placeholder",
              propertyType: "input",
              propertyValue: propValue("Placeholder") || "Job title",
              inputPropertyType: "text",
            },
            {
              propertyName: "Color",
              propertyType: "color",
              propertyValue: propValue("Color") || "#000000",
            },
          ],
        },
        {
          groupLabel: "Typography",
          propertyType: "group",
          isCollapsible: true,
          properties: [
            {
              propertyName: "Typeface",
              propertyType: "select",
              propertyValue:
                propValue("Typeface") || '"Greycliff CF", sans-serif',
              selectOptions: [...FontFamilies],
            },
            {
              propertyType: "row",
              properties: [
                {
                  propertyName: "Size",
                  propertyType: "input",
                  propertyValue: propValue("Size") || "12",
                  inputPropertyType: "number",
                },
                {
                  propertyName: "Height",
                  propertyType: "input",
                  propertyValue: propValue("Height") || "Auto",
                  inputPropertyType: "text",
                },
                {
                  propertyName: "Weight",
                  propertyType: "select",
                  propertyValue: propValue("Weight") || "400",
                  selectOptions: [
                    { name: "Thin", value: "100" },
                    { name: "Extra Light", value: "200" },
                    { name: "Light", value: "300" },
                    { name: "Normal", value: "400" },
                    { name: "Semi Bold", value: "600" },
                    { name: "Bold", value: "700" },
                    { name: "Extra Bold", value: "900" },
                  ],
                },
                {
                  propertyName: "Spacing",
                  propertyType: "input",
                  propertyValue: propValue("Spacing") || "0",
                  inputPropertyType: "number",
                },
              ],
            },
            {
              propertyType: "row",
              properties: [
                {
                  propertyName: "Text Style",
                  propertyType: "select",
                  propertyValue: propValue("Text Style") || "normal",
                  selectOptions: [
                    { name: "Normal", value: "normal" },
                    { name: "Italic", value: "italic" },
                  ],
                },
                {
                  propertyName: "Text Decoration",
                  propertyType: "select",
                  propertyValue: propValue("Text Decoration") || "none",
                  selectOptions: [
                    { name: "None", value: "none" },
                    { name: "Underline", value: "underline" },
                  ],
                },
              ],
            },
            {
              propertyName: "Alignment",
              propertyType: "textAlignment",
              propertyValue: propValue("Alignment") || "left",
            },
          ],
        },
        {
          groupLabel: "Layout",
          propertyType: "group",
          isCollapsible: true,
          properties: [
            // {
            //   propertyName: 'Positioning',
            //   propertyType: 'select',
            //   propertyValue:
            //     propValue('Positioning') ||
            //     (pageType === 'document' ? 'absolute' : 'relative'),
            //   selectOptions: [
            //     { name: 'Automatic', value: 'relative' },
            //     { name: 'Freehand', value: 'absolute' },
            //   ],
            // },
            {
              propertyName: "Margin top",
              propertyType: "input",
              propertyValue: propValue("Margin top") || defaultSpacing,
              inputPropertyType: "number",
            },
            {
              propertyName: "Allow Geometry Update",
              propertyType: "slideToggle",
              propertyValue: updateGeometry,
            },
          ],
        },
        {
          propertyName: "Set as required",
          propertyType: "slideToggle",
          propertyValue: propValue("Set as required") || false,
        },
      ];
    } else if (controlName.match(/date/i)) {
      properties = [
        {
          groupLabel: "Details",
          propertyType: "group",
          isCollapsible: true,
          properties: [
            {
              propertyName: "Label",
              propertyType: "input",
              propertyValue: propValue("Label") || "Date",
              inputPropertyType: "text",
              propertyCanToggle: true,
              propertyToggleValue:
                propValue("Label", "propertyToggleValue") ??
                pageType === "form",
            },
            {
              propertyName: "Placeholder",
              propertyType: "input",
              propertyValue: propValue("Placeholder") || "DD/MM/YYYY",
              inputPropertyType: "text",
            },
            {
              propertyName: "Date format",
              propertyType: "select",
              propertyValue: propValue("Date format") || "dd/MM/YYYY",
              selectOptions: [
                { name: "DD/MM/YYYY", value: "dd/MM/YYYY" },
                { name: "MM/DD/YYYY", value: "MM/dd/YYYY" },
                { name: "YYYY/MM/DD", value: "YYYY/MM/dd" },
              ],
            },
            {
              propertyName: "Color",
              propertyType: "color",
              propertyValue: propValue("Color") || "#000000",
            },
          ],
        },
        {
          groupLabel: "Typography",
          propertyType: "group",
          isCollapsible: true,
          properties: [
            {
              propertyName: "Typeface",
              propertyType: "select",
              propertyValue:
                propValue("Typeface") || '"Greycliff CF", sans-serif',
              selectOptions: [...FontFamilies],
            },
            {
              propertyType: "row",
              properties: [
                {
                  propertyName: "Size",
                  propertyType: "input",
                  propertyValue: propValue("Size") || "12",
                  inputPropertyType: "number",
                },
                {
                  propertyName: "Height",
                  propertyType: "input",
                  propertyValue: propValue("Height") || "Auto",
                  inputPropertyType: "text",
                },
                {
                  propertyName: "Weight",
                  propertyType: "select",
                  propertyValue: propValue("Weight") || "400",
                  selectOptions: [
                    { name: "Thin", value: "100" },
                    { name: "Extra Light", value: "200" },
                    { name: "Light", value: "300" },
                    { name: "Normal", value: "400" },
                    { name: "Semi Bold", value: "600" },
                    { name: "Bold", value: "700" },
                    { name: "Extra Bold", value: "900" },
                  ],
                },
                {
                  propertyName: "Spacing",
                  propertyType: "input",
                  propertyValue: propValue("Spacing") || "0",
                  inputPropertyType: "number",
                },
              ],
            },
            {
              propertyType: "row",
              properties: [
                {
                  propertyName: "Text Style",
                  propertyType: "select",
                  propertyValue: propValue("Text Style") || "normal",
                  selectOptions: [
                    { name: "Normal", value: "normal" },
                    { name: "Italic", value: "italic" },
                  ],
                },
                {
                  propertyName: "Text Decoration",
                  propertyType: "select",
                  propertyValue: propValue("Text Decoration") || "none",
                  selectOptions: [
                    { name: "None", value: "none" },
                    { name: "Underline", value: "underline" },
                  ],
                },
              ],
            },
            {
              propertyName: "Alignment",
              propertyType: "textAlignment",
              propertyValue: propValue("Alignment") || "left",
            },
          ],
        },
        {
          groupLabel: "Layout",
          propertyType: "group",
          isCollapsible: true,
          properties: [
            // {
            //   propertyName: 'Positioning',
            //   propertyType: 'select',
            //   propertyValue:
            //     propValue('Positioning') ||
            //     (pageType === 'document' ? 'absolute' : 'relative'),
            //   selectOptions: [
            //     { name: 'Automatic', value: 'relative' },
            //     { name: 'Freehand', value: 'absolute' },
            //   ],
            // },
            {
              propertyName: "Margin top",
              propertyType: "input",
              propertyValue: propValue("Margin top") || defaultSpacing,
              inputPropertyType: "number",
            },
            {
              propertyName: "Allow Geometry Update",
              propertyType: "slideToggle",
              propertyValue: updateGeometry,
            },
          ],
        },
        {
          propertyName: "Set as required",
          propertyType: "slideToggle",
          propertyValue: propValue("Set as required") || false,
        },
      ];
    } else if (controlName.match(/rating/i)) {
      properties = [
        {
          groupLabel: "Rating Details",
          propertyType: "group",
          isCollapsible: true,
          properties: [
            {
              propertyName: "Label",
              propertyType: "input",
              propertyValue: propValue("Label") || "Rating",
              inputPropertyType: "text",
              propertyToggleValue: true,
              propertyCanToggle:
                propValue("Label", "propertyToggleValue") ??
                pageType === "form",
            },
            {
              propertyName: "Highlight Color",
              propertyType: "color",
              propertyValue: propValue("Highlight Color") || "#10B981",
            },
            {
              propertyName: "Number of stars",
              propertyType: "input",
              propertyValue: propValue("Number of stars") || "5",
              inputPropertyType: "number",
            },
            {
              propertyName: "Star size",
              propertyType: "input",
              propertyValue: propValue("Star size") || "17",
              inputPropertyType: "number",
            },
            {
              propertyName: "Rating direction",
              propertyType: "select",
              propertyValue: propValue("Rating direction") || "row",
              selectOptions: [
                { name: "Horizontal", value: "row" },
                { name: "Vertical", value: "column" },
              ],
            },
          ],
        },
        {
          groupLabel: "Layout",
          propertyType: "group",
          isCollapsible: true,
          properties: [
            // {
            //   propertyName: 'Positioning',
            //   propertyType: 'select',
            //   propertyValue:
            //     propValue('Positioning') ||
            //     (pageType === 'document' ? 'absolute' : 'relative'),
            //   selectOptions: [
            //     { name: 'Automatic', value: 'relative' },
            //     { name: 'Freehand', value: 'absolute' },
            //   ],
            // },
            {
              propertyName: "Margin top",
              propertyType: "input",
              propertyValue: propValue("Margin top") || defaultSpacing,
              inputPropertyType: "number",
            },
            {
              propertyName: "Allow Geometry Update",
              propertyType: "slideToggle",
              propertyValue: updateGeometry,
            },
          ],
        },
        {
          propertyName: "Visibility",
          propertyType: "slideToggle",
          propertyValue: propValue("Visibility") || true,
        },
        {
          propertyName: "Set as required",
          propertyType: "slideToggle",
          propertyValue: propValue("Set as required") || false,
        },
      ];
    } else if (controlName.match(/dropdown/i)) {
      properties = [
        {
          groupLabel: "Dropdown details",
          propertyType: "group",
          isCollapsible: true,
          properties: [
            {
              propertyName: "Label",
              propertyType: "input",
              propertyValue: propValue("Label") || "Dropdown title",
              inputPropertyType: "text",
              propertyCanToggle: true,
              propertyToggleValue:
                propValue("Label", "propertyToggleValue") ??
                pageType === "form",
            },
            {
              propertyName: "Placeholder",
              propertyType: "input",
              propertyValue: propValue("Placeholder") || "Select from list",
              inputPropertyType: "text",
            },
            {
              propertyName: "Color",
              propertyType: "color",
              propertyValue: propValue("Color") || "#000000",
            },
          ],
        },
        {
          groupLabel: "Options list",
          propertyType: "group",
          isCollapsible: true,
          properties: [
            {
              propertyName: "Option Source",
              propertyType: "option",
              propertyValue: propValue("Option Source") || "",
              optionsList: propValue("Option Source", "optionsList") || [
                "Option 1",
              ],
              optionSource: FmbrOptionSources,
              optionSourceValue:
                propValue("Option Source", "optionSourceValue") ||
                FmbrPropertyTypeOptionEnum.ManualInput,
            },
          ],
        },
        {
          groupLabel: "Layout",
          propertyType: "group",
          isCollapsible: true,
          properties: [
            // {
            //   propertyName: 'Positioning',
            //   propertyType: 'select',
            //   propertyValue:
            //     propValue('Positioning') ||
            //     (pageType === 'document' ? 'absolute' : 'relative'),
            //   selectOptions: [
            //     { name: 'Automatic', value: 'relative' },
            //     { name: 'Freehand', value: 'absolute' },
            //   ],
            // },
            {
              propertyName: "Margin top",
              propertyType: "input",
              propertyValue: propValue("Margin top") || defaultSpacing,
              inputPropertyType: "number",
            },
            {
              propertyName: "Allow Geometry Update",
              propertyType: "slideToggle",
              propertyValue: updateGeometry,
            },
          ],
        },
        {
          propertyName: "Visibility",
          propertyType: "slideToggle",
          propertyValue: propValue("Visibility") || true,
        },
        {
          propertyName: "Set as required",
          propertyType: "slideToggle",
          propertyValue: propValue("Set as required") || false,
        },
      ];
    } else if (controlName.match(/signature/i)) {
      properties = [
        {
          groupLabel: "Details",
          propertyType: "group",
          isCollapsible: true,
          properties: [
            {
              propertyName: "Label",
              propertyType: "input",
              propertyValue: propValue("Label") || "Signature",
              inputPropertyType: "text",
              propertyCanToggle: true,
              propertyToggleValue:
                propValue("Label", "propertyToggleValue") ??
                pageType === "form",
            },
            {
              propertyName: "Placeholder",
              propertyType: "input",
              inputPropertyType: "text",
              propertyValue:
                propValue("Placeholder") || "Double click here to sign",
            },
            {
              propertyName: "Color",
              propertyType: "color",
              propertyValue: propValue("Color") || "#222222",
            },
          ],
        },
        // {
        //   groupLabel: 'Typography',
        //   propertyType: 'group',
        //   isCollapsible: true,
        //   properties: [
        //     {
        //       propertyName: 'Typeface',
        //       propertyType: 'select',
        //       propertyValue:
        //         propValue('Typeface') || '"Greycliff CF", sans-serif',
        //       selectOptions: [...FontFamilies],
        //     },
        //     {
        //       propertyType: 'row',
        //       properties: [
        //         {
        //           propertyName: 'Size',
        //           propertyType: 'input',
        //           propertyValue: propValue('Size') || '16',
        //           inputPropertyType: 'number',
        //         },
        //         {
        //           propertyName: 'Height',
        //           propertyType: 'input',
        //           propertyValue: propValue('Height') || '22',
        //           inputPropertyType: 'number',
        //         },
        //         {
        //           propertyName: 'Weight',
        //           propertyType: 'select',
        //           propertyValue: propValue('Weight') || '400',
        //           selectOptions: [
        //             { name: 'Thin', value: '100' },
        //             { name: 'Extra Light', value: '200' },
        //             { name: 'Light', value: '300' },
        //             { name: 'Normal', value: '400' },
        //             { name: 'Semi Bold', value: '600' },
        //             { name: 'Bold', value: '700' },
        //             { name: 'Extra Bold', value: '900' },
        //           ],
        //         },
        //       ],
        //     },
        //   ],
        // },
        {
          groupLabel: "Layout",
          propertyType: "group",
          isCollapsible: true,
          properties: [
            // {
            //   propertyName: 'Positioning',
            //   propertyType: 'select',
            //   propertyValue:
            //     propValue('Positioning') ||
            //     (pageType === 'document' ? 'absolute' : 'relative'),
            //   selectOptions: [
            //     { name: 'Automatic', value: 'relative' },
            //     { name: 'Freehand', value: 'absolute' },
            //   ],
            // },
            {
              propertyName: "Margin top",
              propertyType: "input",
              propertyValue: propValue("Margin top") || defaultSpacing,
              inputPropertyType: "number",
            },
            {
              propertyName: "Allow Geometry Update",
              propertyType: "slideToggle",
              propertyValue: updateGeometry,
            },
          ],
        },
        {
          groupLabel: "Settings",
          propertyType: "group",
          isCollapsible: true,
          properties: [
            // {
            //   propertyName: 'Show time stamp',
            //   propertyType: 'slideToggle',
            //   propertyValue: propValue('Show time stamp') || true,
            // },
            {
              propertyName: "Visibility",
              propertyType: "slideToggle",
              propertyValue: propValue("Visibility") || true,
            },
            {
              propertyName: "Set as required",
              propertyType: "slideToggle",
              propertyValue: propValue("Set as required") || false,
            },
          ],
        },
      ];
    } else if (controlName.match(/stamp/i)) {
      properties = [
        {
          groupLabel: "Details",
          propertyType: "group",
          isCollapsible: true,
          properties: [
            {
              propertyName: "Label",
              propertyType: "input",
              propertyValue: propValue("Label") || "Stamp",
              inputPropertyType: "text",
              propertyCanToggle: true,
              propertyToggleValue:
                propValue("Label", "propertyToggleValue") ??
                pageType === "form",
            },
            {
              propertyName: "Placeholder",
              propertyType: "input",
              inputPropertyType: "text",
              propertyValue: propValue("Placeholder") || "Click to stamp",
            },
          ],
        },
        {
          groupLabel: "Layout",
          propertyType: "group",
          isCollapsible: true,
          properties: [
            // {
            //   propertyName: 'Positioning',
            //   propertyType: 'select',
            //   propertyValue:
            //     propValue('Positioning') ||
            //     (pageType === 'document' ? 'absolute' : 'relative'),
            //   selectOptions: [
            //     { name: 'Automatic', value: 'relative' },
            //     { name: 'Freehand', value: 'absolute' },
            //   ],
            // },
            {
              propertyName: "Margin top",
              propertyType: "input",
              propertyValue: propValue("Margin top") || defaultSpacing,
              inputPropertyType: "number",
            },
            {
              propertyName: "Allow Geometry Update",
              propertyType: "slideToggle",
              propertyValue: updateGeometry,
            },
          ],
        },
        {
          groupLabel: "Settings",
          propertyType: "group",
          isCollapsible: true,
          properties: [
            {
              propertyName: "Visibility",
              propertyType: "slideToggle",
              propertyValue: propValue("Visibility") || true,
            },
            {
              propertyName: "Set as required",
              propertyType: "slideToggle",
              propertyValue: propValue("Set as required") || false,
            },
          ],
        },
      ];
    } else if (controlName.match(/initials/i)) {
      properties = [
        {
          groupLabel: "Details",
          propertyType: "group",
          isCollapsible: true,
          properties: [
            {
              propertyName: "Label",
              propertyType: "input",
              propertyValue: propValue("Label") || "Initials",
              inputPropertyType: "text",
              propertyCanToggle: true,
              propertyToggleValue:
                propValue("Label", "propertyToggleValue") ??
                pageType === "form",
            },
            {
              propertyName: "Placeholder",
              propertyType: "input",
              inputPropertyType: "text",
              propertyValue:
                propValue("Placeholder") || "Double click here add initials",
            },
            {
              propertyName: "Color",
              propertyType: "color",
              propertyValue: propValue("Color") || "#222222",
            },
          ],
        },
        // {
        //   groupLabel: 'Typography',
        //   propertyType: 'group',
        //   isCollapsible: true,
        //   properties: [
        //     {
        //       propertyName: 'Typeface',
        //       propertyType: 'select',
        //       propertyValue:
        //         propValue('Typeface') || '"Greycliff CF", sans-serif',
        //       selectOptions: [...FontFamilies],
        //     },
        //     {
        //       propertyType: 'row',
        //       properties: [
        //         {
        //           propertyName: 'Size',
        //           propertyType: 'input',
        //           propertyValue: propValue('Size') || '16',
        //           inputPropertyType: 'number',
        //         },
        //         {
        //           propertyName: 'Height',
        //           propertyType: 'input',
        //           propertyValue: propValue('Height') || '22',
        //           inputPropertyType: 'number',
        //         },
        //         {
        //           propertyName: 'Weight',
        //           propertyType: 'select',
        //           propertyValue: propValue('Weight') || '400',
        //           selectOptions: [
        //             { name: 'Thin', value: '100' },
        //             { name: 'Extra Light', value: '200' },
        //             { name: 'Light', value: '300' },
        //             { name: 'Normal', value: '400' },
        //             { name: 'Semi Bold', value: '600' },
        //             { name: 'Bold', value: '700' },
        //             { name: 'Extra Bold', value: '900' },
        //           ],
        //         },
        //       ],
        //     },
        //   ],
        // },
        {
          groupLabel: "Layout",
          propertyType: "group",
          isCollapsible: true,
          properties: [
            // {
            //   propertyName: 'Positioning',
            //   propertyType: 'select',
            //   propertyValue:
            //     propValue('Positioning') ||
            //     (pageType === 'document' ? 'absolute' : 'relative'),
            //   selectOptions: [
            //     { name: 'Automatic', value: 'relative' },
            //     { name: 'Freehand', value: 'absolute' },
            //   ],
            // },
            {
              propertyName: "Margin top",
              propertyType: "input",
              propertyValue: propValue("Margin top") || defaultSpacing,
              inputPropertyType: "number",
            },
            {
              propertyName: "Allow Geometry Update",
              propertyType: "slideToggle",
              propertyValue: updateGeometry,
            },
          ],
        },
        {
          groupLabel: "Settings",
          propertyType: "group",
          isCollapsible: true,
          properties: [
            {
              propertyName: "Visibility",
              propertyType: "slideToggle",
              propertyValue: propValue("Visibility") || true,
            },
            {
              propertyName: "Set as required",
              propertyType: "slideToggle",
              propertyValue: propValue("Set as required") || false,
            },
          ],
        },
      ];
    } else if (controlName.match(/radio/i)) {
      properties = [
        {
          groupLabel: "Radio button details",
          propertyType: "group",
          isCollapsible: true,
          properties: [
            {
              propertyName: "Label",
              propertyType: "input",
              propertyValue: propValue("Label") || "Radio button",
              inputPropertyType: "text",
              propertyCanToggle: true,
              propertyToggleValue:
                propValue("Label", "propertyToggleValue") ??
                pageType === "form",
            },
            {
              propertyName: "Options arrangement",
              propertyType: "select",
              propertyValue: propValue("Options arrangement") || "horizontal",
              selectOptions: [
                { name: "Horizontal", value: "horizontal" },
                { name: "Vertical", value: "vertical" },
              ],
            },
            {
              propertyName: "Highlight Color",
              propertyType: "color",
              propertyValue: propValue("Highlight Color") || "#000000",
            },

            {
              propertyName: "Theme",
              propertyType: "select",
              propertyValue: propValue("Theme") || "primary",
              selectOptions: [
                { name: "Primary", value: "primary" },
                { name: "Accent", value: "accent" },
                { name: "Warn", value: "warn" },
              ],
            },
          ],
        },
        {
          groupLabel: "Options list",
          propertyType: "group",
          isCollapsible: true,
          properties: [
            {
              propertyName: "Option Source",
              propertyType: "option",
              propertyValue: "",
              optionsList: propValue("Option Source", "optionsList") || [
                "Option 1",
              ],
              optionSource: FmbrOptionSources,
              optionSourceValue:
                propValue("Option Source", "optionSourceValue") ||
                FmbrPropertyTypeOptionEnum.ManualInput,
            },
          ],
        },
        {
          groupLabel: "Layout",
          propertyType: "group",
          isCollapsible: true,
          properties: [
            // {
            //   propertyName: 'Positioning',
            //   propertyType: 'select',
            //   propertyValue:
            //     propValue('Positioning') ||
            //     (pageType === 'document' ? 'absolute' : 'relative'),
            //   selectOptions: [
            //     { name: 'Automatic', value: 'relative' },
            //     { name: 'Freehand', value: 'absolute' },
            //   ],
            // },
            {
              propertyName: "Margin top",
              propertyType: "input",
              propertyValue: propValue("Margin top") || defaultSpacing,
              inputPropertyType: "number",
            },
            {
              propertyName: "Allow Geometry Update",
              propertyType: "slideToggle",
              propertyValue: updateGeometry,
            },
          ],
        },
        {
          propertyName: "Visibility",
          propertyType: "slideToggle",
          propertyValue: propValue("Visibility") || true,
        },
        {
          propertyName: "Set as required",
          propertyType: "slideToggle",
          propertyValue: propValue("Set as required") || false,
        },
      ];
    } else if (controlName.match(/phone/i)) {
      properties = [
        {
          groupLabel: "Phone number details",
          propertyType: "group",
          isCollapsible: true,
          properties: [
            {
              propertyName: "Label",
              propertyType: "input",
              propertyValue: propValue("Label") || "Phone number",
              inputPropertyType: "text",
              propertyCanToggle: true,
              propertyToggleValue:
                propValue("Label", "propertyToggleValue") ??
                pageType === "form",
            },
            {
              propertyName: "Placeholder",
              propertyType: "input",
              propertyValue: propValue("Placeholder") || "Enter phone number",
              inputPropertyType: "text",
            },
            {
              propertyName: "Highlight Color",
              propertyType: "color",
              propertyValue: propValue("Highlight Color") || "#4e33ff",
            },
            {
              propertyName: "Region",
              propertyType: "information",
              propertyValue: propValue("Region") || "All",
            },
          ],
        },
        {
          groupLabel: "Typography",
          propertyType: "group",
          isCollapsible: true,
          properties: [
            {
              propertyName: "Character type",
              propertyType: "select",
              propertyValue: propValue("Character type") || "numeric",
              selectOptions: [
                { name: "Numeric", value: "numeric" },
                { name: "Alpha Numeric", value: "tel" },
              ],
            },
            {
              propertyName: "Typeface",
              propertyType: "select",
              propertyValue:
                propValue("Typeface") || '"Greycliff CF", sans-serif',
              selectOptions: [...FontFamilies],
            },
            {
              propertyName: "Color",
              propertyType: "color",
              propertyValue: propValue("Color") || "#000000",
            },
            {
              propertyName: "Alignment",
              propertyType: "textAlignment",
              propertyValue: propValue("Alignment") || "left",
            },
            {
              propertyType: "row",
              properties: [
                {
                  propertyName: "Size",
                  propertyType: "input",
                  propertyValue: propValue("Size") || "12",
                  inputPropertyType: "number",
                },
                {
                  propertyName: "Height",
                  propertyType: "input",
                  propertyValue: propValue("Height") || "Auto",
                  inputPropertyType: "text",
                },
                {
                  propertyName: "Weight",
                  propertyType: "select",
                  propertyValue: propValue("Weight") || "400",
                  selectOptions: [
                    { name: "Thin", value: "100" },
                    { name: "Extra Light", value: "200" },
                    { name: "Light", value: "300" },
                    { name: "Normal", value: "400" },
                    { name: "Semi Bold", value: "600" },
                    { name: "Bold", value: "700" },
                    { name: "Extra Bold", value: "900" },
                  ],
                },
                {
                  propertyName: "Spacing",
                  propertyType: "input",
                  propertyValue: propValue("Spacing") || "0",
                  inputPropertyType: "number",
                },
              ],
            },
            {
              propertyType: "row",
              properties: [
                {
                  propertyName: "Text Style",
                  propertyType: "select",
                  propertyValue: propValue("Text Style") || "normal",
                  selectOptions: [
                    { name: "Normal", value: "normal" },
                    { name: "Italic", value: "italic" },
                  ],
                },
                {
                  propertyName: "Text Decoration",
                  propertyType: "select",
                  propertyValue: propValue("Text Decoration") || "none",
                  selectOptions: [
                    { name: "None", value: "none" },
                    { name: "Underline", value: "underline" },
                  ],
                },
              ],
            },
          ],
        },
        {
          groupLabel: "Padding Option",
          propertyType: "group",
          isCollapsible: true,
          properties: [
            {
              propertyType: "row",
              properties: [
                {
                  propertyName: "Top",
                  propertyType: "input",
                  propertyValue: propValue("Top") || "7",
                  inputPropertyType: "number",
                },
                {
                  propertyName: "Bottom",
                  propertyType: "input",
                  propertyValue: propValue("Bottom") || "7",
                  inputPropertyType: "number",
                },
                {
                  propertyName: "Left",
                  propertyType: "input",
                  propertyValue: propValue("Left") || "7",
                  inputPropertyType: "number",
                },
                {
                  propertyName: "Right",
                  propertyType: "input",
                  propertyValue: propValue("Right") || "7",
                  inputPropertyType: "number",
                },
              ],
            },
          ],
        },
        {
          groupLabel: "Layout",
          propertyType: "group",
          isCollapsible: true,
          properties: [
            // {
            //   propertyName: 'Positioning',
            //   propertyType: 'select',
            //   propertyValue:
            //     propValue('Positioning') ||
            //     (pageType === 'document' ? 'absolute' : 'relative'),
            //   selectOptions: [
            //     { name: 'Automatic', value: 'relative' },
            //     { name: 'Freehand', value: 'absolute' },
            //   ],
            // },
            {
              propertyName: "Margin top",
              propertyType: "input",
              propertyValue: propValue("Margin top") || defaultSpacing,
              inputPropertyType: "number",
            },
            {
              propertyName: "Allow Geometry Update",
              propertyType: "slideToggle",
              propertyValue: updateGeometry,
            },
          ],
        },
        {
          propertyName: "Visibility",
          propertyType: "slideToggle",
          propertyValue: propValue("Visibility") || true,
        },
        {
          propertyName: "Set as required",
          propertyType: "slideToggle",
          propertyValue: propValue("Set as required") || false,
        },
      ];
    } else if (controlName.match(/checkbox/i)) {
      properties = [
        {
          groupLabel: "Checkbox details",
          propertyType: "group",
          isCollapsible: true,
          properties: [
            {
              propertyName: "Label",
              propertyType: "input",
              propertyValue: propValue("Label") || "Checkbox label",
              inputPropertyType: "text",
              propertyCanToggle: true,
              propertyToggleValue:
                propValue("Label", "propertyToggleValue") ??
                pageType === "form",
            },
            {
              propertyName: "Color",
              propertyType: "color",
              propertyValue: propValue("Color") || "#4e33ff",
            },
            {
              propertyName: "Options arrangement",
              propertyType: "select",
              propertyValue: propValue("Options arrangement") || "horizontal",
              selectOptions: [
                { name: "Horizontal", value: "horizontal" },
                { name: "Vertical", value: "vertical" },
              ],
            },
          ],
        },
        {
          groupLabel: "Options list",
          propertyType: "group",
          isCollapsible: true,
          properties: [
            {
              propertyName: "Option Source",
              propertyType: "option",
              propertyValue: propValue("Option Source") || "",
              optionsList: propValue("Option Source", "optionsList") || [
                "Option 1",
              ],
              optionSource: FmbrOptionSources,
              optionSourceValue:
                propValue("Option Source", "optionSourceValue") ||
                FmbrPropertyTypeOptionEnum.ManualInput,
            },
          ],
        },
        {
          groupLabel: "Layout",
          propertyType: "group",
          isCollapsible: true,
          properties: [
            // {
            //   propertyName: 'Positioning',
            //   propertyType: 'select',
            //   propertyValue:
            //     propValue('Positioning') ||
            //     (pageType === 'document' ? 'absolute' : 'relative'),
            //   selectOptions: [
            //     { name: 'Automatic', value: 'relative' },
            //     { name: 'Freehand', value: 'absolute' },
            //   ],
            // },
            {
              propertyName: "Margin top",
              propertyType: "input",
              propertyValue: propValue("Margin top") || defaultSpacing,
              inputPropertyType: "number",
            },
            {
              propertyName: "Allow Geometry Update",
              propertyType: "slideToggle",
              propertyValue: updateGeometry,
            },
          ],
        },
        {
          propertyName: "Visibility",
          propertyType: "slideToggle",
          propertyValue: propValue("Visibility") || true,
        },
        {
          propertyName: "Set as required",
          propertyType: "slideToggle",
          propertyValue: propValue("Set as required") || false,
        },
      ];
    } else if (controlName.match(/time/i)) {
      properties = [
        {
          groupLabel: "Time details",
          propertyType: "group",
          isCollapsible: true,
          properties: [
            {
              propertyName: "Label",
              propertyType: "input",
              propertyValue: propValue("Label") || "Time",
              inputPropertyType: "text",
              propertyCanToggle: true,
              propertyToggleValue:
                propValue("Label", "propertyToggleValue") ??
                pageType === "form",
            },
          ],
        },
        {
          groupLabel: "Typography",
          propertyType: "group",
          isCollapsible: true,
          properties: [
            {
              propertyName: "Typeface",
              propertyType: "select",
              propertyValue:
                propValue("Typeface") || '"Greycliff CF", sans-serif',
              selectOptions: [...FontFamilies],
            },
            {
              propertyName: "Color",
              propertyType: "color",
              propertyValue: propValue("Color") || "#000000",
            },
            {
              propertyName: "Alignment",
              propertyType: "textAlignment",
              propertyValue: propValue("Alignment") || "left",
            },
            {
              propertyType: "row",
              properties: [
                {
                  propertyName: "Size",
                  propertyType: "input",
                  propertyValue: propValue("Size") || "12",
                  inputPropertyType: "number",
                },
                {
                  propertyName: "Height",
                  propertyType: "input",
                  propertyValue: propValue("Height") || "Auto",
                  inputPropertyType: "text",
                },
                {
                  propertyName: "Weight",
                  propertyType: "select",
                  propertyValue: propValue("Weight") || "400",
                  selectOptions: [
                    { name: "Thin", value: "100" },
                    { name: "Extra Light", value: "200" },
                    { name: "Light", value: "300" },
                    { name: "Normal", value: "400" },
                    { name: "Semi Bold", value: "600" },
                    { name: "Bold", value: "700" },
                    { name: "Extra Bold", value: "900" },
                  ],
                },
                {
                  propertyName: "Spacing",
                  propertyType: "input",
                  propertyValue: propValue("Spacing") || "0",
                  inputPropertyType: "number",
                },
              ],
            },
            {
              propertyType: "row",
              properties: [
                {
                  propertyName: "Text Style",
                  propertyType: "select",
                  propertyValue: propValue("Text Style") || "normal",
                  selectOptions: [
                    { name: "Normal", value: "normal" },
                    { name: "Italic", value: "italic" },
                  ],
                },
                {
                  propertyName: "Text Decoration",
                  propertyType: "select",
                  propertyValue: propValue("Text Decoration") || "none",
                  selectOptions: [
                    { name: "None", value: "none" },
                    { name: "Underline", value: "underline" },
                  ],
                },
              ],
            },
          ],
        },
        {
          groupLabel: "Padding Option",
          propertyType: "group",
          isCollapsible: true,
          properties: [
            {
              propertyType: "row",
              properties: [
                {
                  propertyName: "Top",
                  propertyType: "input",
                  propertyValue: propValue("Top") || "7",
                  inputPropertyType: "number",
                },
                {
                  propertyName: "Bottom",
                  propertyType: "input",
                  propertyValue: propValue("Bottom") || "7",
                  inputPropertyType: "number",
                },
                {
                  propertyName: "Left",
                  propertyType: "input",
                  propertyValue: propValue("Left") || "7",
                  inputPropertyType: "number",
                },
                {
                  propertyName: "Right",
                  propertyType: "input",
                  propertyValue: propValue("Right") || "7",
                  inputPropertyType: "number",
                },
              ],
            },
          ],
        },
        {
          groupLabel: "Layout",
          propertyType: "group",
          isCollapsible: true,
          properties: [
            // {
            //   propertyName: 'Positioning',
            //   propertyType: 'select',
            //   propertyValue:
            //     propValue('Positioning') ||
            //     (pageType === 'document' ? 'absolute' : 'relative'),
            //   selectOptions: [
            //     { name: 'Automatic', value: 'relative' },
            //     { name: 'Freehand', value: 'absolute' },
            //   ],
            // },
            {
              propertyName: "Margin top",
              propertyType: "input",
              propertyValue: propValue("Margin top") || defaultSpacing,
              inputPropertyType: "number",
            },
            {
              propertyName: "Allow Geometry Update",
              propertyType: "slideToggle",
              propertyValue: updateGeometry,
            },
          ],
        },
        {
          propertyName: "Visibility",
          propertyType: "slideToggle",
          propertyValue: propValue("Visibility") || true,
        },
        {
          propertyName: "Set as required",
          propertyType: "slideToggle",
          propertyValue: propValue("Set as required") || false,
        },
      ];
    } else if (controlName.match(/address/i)) {
      properties = [
        {
          groupLabel: "Address details",
          propertyType: "group",
          isCollapsible: true,
          properties: [
            {
              propertyName: "Label",
              propertyType: "input",
              propertyValue: propValue("Label") || "Address",
              inputPropertyType: "text",
              propertyCanToggle: true,
              propertyToggleValue:
                propValue("Label", "propertyToggleValue") ??
                pageType === "form",
            },
            {
              propertyName: "Placeholder",
              propertyType: "input",
              propertyValue: propValue("Placeholder") || "Enter Address",
              inputPropertyType: "text",
            },
            {
              propertyName: "Highlight Color",
              propertyType: "color",
              propertyValue: propValue("Highlight Color") || "#4e33ff",
            },
            {
              propertyName: "Region",
              propertyType: "information",
              propertyValue: propValue("Region") || "All",
            },
          ],
        },
        {
          groupLabel: "Typography",
          propertyType: "group",
          isCollapsible: true,
          properties: [
            {
              propertyName: "Typeface",
              propertyType: "select",
              propertyValue:
                propValue("Typeface") || '"Greycliff CF", sans-serif',
              selectOptions: [...FontFamilies],
            },
            {
              propertyName: "Color",
              propertyType: "color",
              propertyValue: propValue("Color") || "#000000",
            },
            {
              propertyName: "Alignment",
              propertyType: "textAlignment",
              propertyValue: propValue("Alignment") || "left",
            },
            {
              propertyType: "row",
              properties: [
                {
                  propertyName: "Size",
                  propertyType: "input",
                  propertyValue: propValue("Size") || "12",
                  inputPropertyType: "number",
                },
                {
                  propertyName: "Height",
                  propertyType: "input",
                  propertyValue: propValue("Height") || "Auto",
                  inputPropertyType: "text",
                },
                {
                  propertyName: "Weight",
                  propertyType: "select",
                  propertyValue: propValue("Weight") || "400",
                  selectOptions: [
                    { name: "Thin", value: "100" },
                    { name: "Extra Light", value: "200" },
                    { name: "Light", value: "300" },
                    { name: "Normal", value: "400" },
                    { name: "Semi Bold", value: "600" },
                    { name: "Bold", value: "700" },
                    { name: "Extra Bold", value: "900" },
                  ],
                },
                {
                  propertyName: "Spacing",
                  propertyType: "input",
                  propertyValue: propValue("Spacing") || "0",
                  inputPropertyType: "number",
                },
              ],
            },
            {
              propertyType: "row",
              properties: [
                {
                  propertyName: "Text Style",
                  propertyType: "select",
                  propertyValue: propValue("Text Style") || "normal",
                  selectOptions: [
                    { name: "Normal", value: "normal" },
                    { name: "Italic", value: "italic" },
                  ],
                },
                {
                  propertyName: "Text Decoration",
                  propertyType: "select",
                  propertyValue: propValue("Text Decoration") || "none",
                  selectOptions: [
                    { name: "None", value: "none" },
                    { name: "Underline", value: "underline" },
                  ],
                },
              ],
            },
          ],
        },
        {
          groupLabel: "Layout",
          propertyType: "group",
          isCollapsible: true,
          properties: [
            // {
            //   propertyName: 'Positioning',
            //   propertyType: 'select',
            //   propertyValue:
            //     propValue('Positioning') ||
            //     (pageType === 'document' ? 'absolute' : 'relative'),
            //   selectOptions: [
            //     { name: 'Automatic', value: 'relative' },
            //     { name: 'Freehand', value: 'absolute' },
            //   ],
            // },
            {
              propertyName: "Margin top",
              propertyType: "input",
              propertyValue: propValue("Margin top") || defaultSpacing,
              inputPropertyType: "number",
            },
            {
              propertyName: "Allow Geometry Update",
              propertyType: "slideToggle",
              propertyValue: updateGeometry,
            },
          ],
        },
        {
          groupLabel: "Settings",
          propertyType: "group",
          isCollapsible: true,
          properties: [
            {
              propertyName: "Multiline text",
              propertyType: "slideToggle",
              propertyValue: propValue("Multiline text") || true,
            },
            {
              propertyName: "Set as required",
              propertyType: "slideToggle",
              propertyValue: propValue("Set as required") || false,
            },
            {
              propertyName: "Show Control MenuBar",
              propertyType: "slideToggle",
              propertyValue: propValue("Show Control MenuBar") || false,
            },
            {
              propertyName: "Visibility",
              propertyType: "slideToggle",
              propertyValue: propValue("Visibility") || true,
            },
          ],
        },
      ];
    } else if (controlName.match(/file/i)) {
      properties = [
        {
          groupLabel: "File upload details",
          propertyType: "group",
          isCollapsible: true,
          properties: [
            {
              propertyName: "Label",
              propertyType: "input",
              propertyValue: propValue("Label") || "File",
              inputPropertyType: "text",
              propertyCanToggle: true,
              propertyToggleValue:
                propValue("Label", "propertyToggleValue") ??
                pageType === "form",
            },
            {
              propertyName: "File title",
              propertyType: "input",
              propertyValue: propValue("File title") || "",
              inputPropertyType: "text",
            },
            // {
            //   propertyName: 'Background Color',
            //   propertyType: 'color',
            //   propertyValue:
            //     propValue('Background Color') ||
            //     propValue('Foreground Color') ||
            //     '#f6f5ff',
            // },
            {
              propertyName: "Foreground Color",
              propertyType: "color",
              propertyValue:
                propValue("Highlight Color") ||
                propValue("Foreground Color") ||
                "#4e33ff",
            },
          ],
        },
        {
          groupLabel: "File type",
          propertyType: "group",
          isCollapsible: true,
          properties: [
            {
              propertyName: "Allowable type",
              propertyType: "select",
              propertyValue: propValue("Allowable type") || [
                "image/jpeg",
                "application/pdf",
                "image/png",
              ],
              selectMultipleOptions: [
                { name: "JPEG", value: "image/jpeg" },
                { name: "PDF", value: "application/pdf" },
                { name: "PNG", value: "image/png" },
                { name: "SVG", value: "image/svg+xml" },
                { name: "XLS", value: "application/vnd.ms-excel" },
                {
                  name: "XLSX",
                  value:
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                },
                { name: "DOC", value: "application/msword" },
                {
                  name: "DOCX",
                  value:
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                },
                { name: "CSV", value: "text/csv" },
                { name: "TXT", value: "text/plain" },
                { name: "HTML", value: "text/html" },
                { name: "XML", value: "application/xml" },
              ],
            },
            {
              propertyName: "File size for upload(MB)",
              propertyType: "input",
              propertyValue: propValue("File size for upload(MB)") || 5,
              inputPropertyType: "number",
            },
          ],
        },
        {
          groupLabel: "Layout",
          propertyType: "group",
          isCollapsible: true,
          properties: [
            // {
            //   propertyName: 'Positioning',
            //   propertyType: 'select',
            //   propertyValue:
            //     propValue('Positioning') ||
            //     (pageType === 'document' ? 'absolute' : 'relative'),
            //   selectOptions: [
            //     { name: 'Automatic', value: 'relative' },
            //     { name: 'Freehand', value: 'absolute' },
            //   ],
            // },
            {
              propertyName: "Margin top",
              propertyType: "input",
              propertyValue: propValue("Margin top") || defaultSpacing,
              inputPropertyType: "number",
            },
            {
              propertyName: "Allow Geometry Update",
              propertyType: "slideToggle",
              propertyValue: updateGeometry,
            },
          ],
        },
        {
          propertyName: "File visibility",
          propertyType: "slideToggle",
          propertyValue: propValue("File visibility") || true,
        },
        {
          propertyName: "Open file as new document",
          propertyType: "slideToggle",
          propertyValue: propValue("Open file as new document") || true,
        },
        {
          propertyName: "Toggle help",
          propertyType: "slideToggle",
          propertyValue: propValue("Toggle help") || true,
        },
        {
          propertyName: "Help text",
          propertyType: "input",
          propertyValue: propValue("Help text") || "",
          inputPropertyType: "text",
          propertyCanToggle: true,
          propertyToggleValue:
            propValue("Help text", "propertyToggleValue") || true,
        },
      ];
    } else if (controlName.match(/table/i)) {
      properties = [
        {
          groupLabel: "Table details",
          propertyType: "group",
          isCollapsible: true,
          properties: [
            {
              propertyName: "Table Header",
              propertyType: "slideToggle",
              propertyValue: propValue("Table Header") ?? true,
            },
            {
              propertyName: "Header BG Color",
              propertyType: "color",
              propertyValue: propValue("Header BG Color") || "#F6F5FF",
            },
            {
              propertyName: "Background Color",
              propertyType: "color",
              propertyValue: propValue("Background Color") || "#ffffff",
            },
            {
              propertyName: "Number of Rows",
              propertyType: "input",
              propertyValue: propValue("Number of Rows") || 2,
              inputPropertyType: "number",
            },
            {
              propertyName: "Number of Columns",
              propertyType: "input",
              propertyValue: propValue("Number of Columns") || 4,
              inputPropertyType: "number",
            },
          ],
        },
        {
          groupLabel: "Typography",
          propertyType: "group",
          isCollapsible: true,
          properties: [
            {
              propertyName: "Typeface",
              propertyType: "select",
              propertyValue:
                propValue("Typeface") || '"Greycliff CF", sans-serif',
              selectOptions: [...FontFamilies],
            },
            {
              propertyName: "Color",
              propertyType: "color",
              propertyValue: propValue("Color") || "#323A46",
            },
            {
              propertyName: "Alignment",
              propertyType: "textAlignment",
              propertyValue: propValue("Alignment") || "left",
            },
            {
              propertyType: "row",
              properties: [
                {
                  propertyName: "Size",
                  propertyType: "input",
                  propertyValue: propValue("Size") || "12",
                  inputPropertyType: "number",
                },
                {
                  propertyName: "Height",
                  propertyType: "input",
                  propertyValue: propValue("Height") || "Auto",
                  inputPropertyType: "text",
                },
                {
                  propertyName: "Weight",
                  propertyType: "select",
                  propertyValue: propValue("Weight") || "400",
                  selectOptions: [
                    { name: "Thin", value: "100" },
                    { name: "Extra Light", value: "200" },
                    { name: "Light", value: "300" },
                    { name: "Normal", value: "400" },
                    { name: "Semi Bold", value: "600" },
                    { name: "Bold", value: "700" },
                    { name: "Extra Bold", value: "900" },
                  ],
                },
                {
                  propertyName: "Spacing",
                  propertyType: "input",
                  propertyValue: propValue("Spacing") || "0",
                  inputPropertyType: "number",
                },
              ],
            },
            {
              propertyType: "row",
              properties: [
                {
                  propertyName: "Text Style",
                  propertyType: "select",
                  propertyValue: propValue("Text Style") || "normal",
                  selectOptions: [
                    { name: "Normal", value: "normal" },
                    { name: "Italic", value: "italic" },
                  ],
                },
                {
                  propertyName: "Text Decoration",
                  propertyType: "select",
                  propertyValue: propValue("Text Decoration") || "none",
                  selectOptions: [
                    { name: "None", value: "none" },
                    { name: "Underline", value: "underline" },
                  ],
                },
              ],
            },
          ],
        },
        {
          groupLabel: "Padding Option",
          propertyType: "group",
          isCollapsible: true,
          properties: [
            {
              propertyType: "row",
              properties: [
                {
                  propertyName: "Top",
                  propertyType: "input",
                  propertyValue: propValue("Top") || 10,
                  inputPropertyType: "number",
                },
                {
                  propertyName: "Bottom",
                  propertyType: "input",
                  propertyValue: propValue("Bottom") || 10,
                  inputPropertyType: "number",
                },
                {
                  propertyName: "Left",
                  propertyType: "input",
                  propertyValue: propValue("Left") || 10,
                  inputPropertyType: "number",
                },
                {
                  propertyName: "Right",
                  propertyType: "input",
                  propertyValue: propValue("Right") || 10,
                  inputPropertyType: "number",
                },
              ],
            },
          ],
        },
        {
          groupLabel: "Borders",
          propertyType: "group",
          isCollapsible: true,
          properties: [
            {
              propertyName: "Horizontal",
              propertyType: "slideToggle",
              propertyValue: propValue("Horizontal") ?? true,
            },
            {
              propertyName: "Vertical",
              propertyType: "slideToggle",
              propertyValue: propValue("Vertical") ?? true,
            },
            {
              propertyName: "Border style",
              propertyType: "select",
              propertyValue: propValue("Border style") || "solid",
              selectOptions: [
                { name: "Solid", value: "solid" },
                { name: "Dashed", value: "dashed" },
                { name: "Dotted", value: "dotted" },
              ],
            },
            {
              propertyName: "Stroke",
              propertyType: "color",
              propertyValue: propValue("Stroke") || "#64748B",
            },
          ],
        },
        {
          groupLabel: "Layout",
          propertyType: "group",
          isCollapsible: true,
          properties: [
            // {
            //   propertyName: 'Positioning',
            //   propertyType: 'select',
            //   propertyValue:
            //     propValue('Positioning') ||
            //     (pageType === 'document' ? 'absolute' : 'relative'),
            //   selectOptions: [
            //     { name: 'Automatic', value: 'relative' },
            //     { name: 'Freehand', value: 'absolute' },
            //   ],
            // },
            {
              propertyName: "Margin top",
              propertyType: "input",
              propertyValue: propValue("Margin top") || defaultSpacing,
              inputPropertyType: "number",
            },
            {
              propertyName: "Allow Geometry Update",
              propertyType: "slideToggle",
              propertyValue: updateGeometry,
            },
          ],
        },
        {
          propertyName: "Visibility",
          propertyType: "slideToggle",
          propertyValue: propValue("Visibility") || true,
        },
        {
          propertyName: "Set as required",
          propertyType: "slideToggle",
          propertyValue: propValue("Set as required") || true,
        },
      ];
    } else if (controlName.match(/verifiable/i)) {
      properties = [
        {
          groupLabel: "Details",
          propertyType: "group",
          isCollapsible: true,
          properties: [
            {
              propertyName: "Label",
              propertyType: "input",
              propertyValue: propValue("Label") || "Verifiable Field",
              inputPropertyType: "text",
              propertyCanToggle: true,
              propertyToggleValue:
                propValue("Label", "propertyToggleValue") ??
                pageType === "form",
            },
            {
              propertyName: "Placeholder",
              propertyType: "input",
              propertyValue:
                propValue("Placeholder") || "Enter a value for verification",
              inputPropertyType: "text",
            },
            {
              propertyName: "Color",
              propertyType: "color",
              propertyValue: propValue("Color") || "#000000",
            },
            // {
            //   propertyName: 'Text type',
            //   propertyType: 'select',
            //   propertyValue: 'text',
            //   selectOptions: [
            //     { name: 'Text', value: 'text' },
            //     { name: 'Number', value: 'number' },
            //   ],
            // },
          ],
        },
        {
          groupLabel: "Typography",
          propertyType: "group",
          isCollapsible: true,
          properties: [
            {
              propertyName: "Typeface",
              propertyType: "select",
              propertyValue:
                propValue("Typeface") || '"Greycliff CF", sans-serif',
              selectOptions: [...FontFamilies],
            },
            {
              propertyType: "row",
              properties: [
                {
                  propertyName: "Size",
                  propertyType: "input",
                  propertyValue: propValue("Size") || "12",
                  inputPropertyType: "number",
                },
                {
                  propertyName: "Height",
                  propertyType: "input",
                  propertyValue: propValue("Height") || "Auto",
                  inputPropertyType: "text",
                },
                {
                  propertyName: "Weight",
                  propertyType: "select",
                  propertyValue: propValue("Weight") || "400",
                  selectOptions: [
                    { name: "Thin", value: "100" },
                    { name: "Extra Light", value: "200" },
                    { name: "Light", value: "300" },
                    { name: "Normal", value: "400" },
                    { name: "Semi Bold", value: "600" },
                    { name: "Bold", value: "700" },
                    { name: "Extra Bold", value: "900" },
                  ],
                },
                {
                  propertyName: "Spacing",
                  propertyType: "input",
                  propertyValue: propValue("Spacing") || "0",
                  inputPropertyType: "number",
                },
              ],
            },
            {
              propertyType: "row",
              properties: [
                {
                  propertyName: "Text Style",
                  propertyType: "select",
                  propertyValue: propValue("Text Style") || "normal",
                  selectOptions: [
                    { name: "Normal", value: "normal" },
                    { name: "Italic", value: "italic" },
                  ],
                },
                {
                  propertyName: "Text Decoration",
                  propertyType: "select",
                  propertyValue: propValue("Text Decoration") || "none",
                  selectOptions: [
                    { name: "None", value: "none" },
                    { name: "Underline", value: "underline" },
                  ],
                },
              ],
            },
            {
              propertyName: "Alignment",
              propertyType: "textAlignment",
              propertyValue: propValue("Alignment") || "left",
            },
          ],
        },
        {
          groupLabel: "API Configuration",
          propertyType: "group",
          isCollapsible: true,
          properties: [
            {
              propertyName: "API Info",
              propertyType: "input",
              propertyValue: propValue("API Info") || "",
              inputPropertyType: "text",
            },
            {
              propertyName: "Send value as",
              propertyType: "select",
              propertyValue: propValue("Send value as") || "",
              selectOptions: [],
            },
            {
              propertyName: "Verifiable character length",
              propertyType: "input",
              propertyValue: propValue("Verifiable character length") || "10",
              inputPropertyType: "number",
            },
            {
              propertyName: "Printable response accessor",
              propertyType: "input",
              propertyValue: propValue("Printable response accessor") || "",
              inputPropertyType: "text",
            },
            {
              propertyName: "Printable response",
              propertyType: "input",
              propertyValue: propValue("Printable response") || "",
              inputPropertyType: "text",
            },
          ],
        },
        {
          groupLabel: "Layout",
          propertyType: "group",
          isCollapsible: true,
          properties: [
            // {
            //   propertyName: 'Positioning',
            //   propertyType: 'select',
            //   propertyValue:
            //     propValue('Positioning') ||
            //     (pageType === 'document' ? 'absolute' : 'relative'),
            //   selectOptions: [
            //     { name: 'Automatic', value: 'relative' },
            //     { name: 'Freehand', value: 'absolute' },
            //   ],
            // },
            {
              propertyName: "Margin top",
              propertyType: "input",
              propertyValue: propValue("Margin top") || defaultSpacing,
              inputPropertyType: "number",
            },
            {
              propertyName: "Allow Geometry Update",
              propertyType: "slideToggle",
              propertyValue: updateGeometry,
            },
          ],
        },
        {
          groupLabel: "Settings",
          propertyType: "group",
          isCollapsible: true,
          properties: [
            {
              propertyName: "Set as required",
              propertyType: "slideToggle",
              propertyValue: propValue("Set as required") || false,
            },
            // {
            //   propertyType: 'row',
            //   properties: [
            //     {
            //       propertyName: 'Min characters',
            //       propertyType: 'input',
            //       propertyValue: '',
            //       inputPropertyType: 'number',
            //     },
            //     {
            //       propertyName: 'Max characters',
            //       propertyType: 'input',
            //       propertyValue: '',
            //       inputPropertyType: 'number',
            //     },
            //   ],
            // },
          ],
        },
      ];
    }
    // } else if (controlCategory === FmbrControlCategoryEnum.Shapes) {
    if (controlName.match(/rectangle/i)) {
      properties = [
        {
          groupLabel: "Rectangle Details",
          propertyType: "group",
          isCollapsible: true,
          properties: [
            {
              propertyName: "Highlight Color",
              propertyType: "color",
              propertyValue: propValue("Highlight Color") || "",
            },
          ],
        },
        {
          groupLabel: "Layout",
          propertyType: "group",
          isCollapsible: true,
          properties: [
            // {
            //   propertyName: 'Positioning',
            //   propertyType: 'select',
            //   propertyValue: propValue('Positioning') || 'absolute',
            //   selectOptions: [
            //     { name: 'Automatic', value: 'relative' },
            //     { name: 'Freehand', value: 'absolute' },
            //   ],
            // },
            {
              propertyName: "Margin top",
              propertyType: "input",
              propertyValue: propValue("Margin top") || defaultSpacing,
              inputPropertyType: "number",
            },
            {
              propertyName: "Allow Geometry Update",
              propertyType: "slideToggle",
              propertyValue: updateGeometry,
            },
          ],
        },
        {
          propertyName: "Visibility",
          propertyType: "slideToggle",
          propertyValue: propValue("Visibility") || true,
        },
      ];
    } else if (controlName.match(/square/i)) {
      properties = [
        {
          groupLabel: "Square Details",
          propertyType: "group",
          isCollapsible: true,
          properties: [
            {
              propertyName: "Highlight Color",
              propertyType: "color",
              propertyValue: propValue("Highlight Color") || "",
            },
          ],
        },
        {
          groupLabel: "Layout",
          propertyType: "group",
          isCollapsible: true,
          properties: [
            // {
            //   propertyName: 'Positioning',
            //   propertyType: 'select',
            //   propertyValue: propValue('Positioning') || 'absolute',
            //   selectOptions: [
            //     { name: 'Automatic', value: 'relative' },
            //     { name: 'Freehand', value: 'absolute' },
            //   ],
            // },
            {
              propertyName: "Margin top",
              propertyType: "input",
              propertyValue: propValue("Margin top") || defaultSpacing,
              inputPropertyType: "number",
            },
            {
              propertyName: "Allow Geometry Update",
              propertyType: "slideToggle",
              propertyValue: updateGeometry,
            },
          ],
        },
        {
          propertyName: "Visibility",
          propertyType: "slideToggle",
          propertyValue: propValue("Visibility") || true,
        },
      ];
    } else if (controlName.match(/star/i)) {
      properties = [
        {
          groupLabel: "Star Details",
          propertyType: "group",
          isCollapsible: true,
          properties: [
            {
              propertyName: "Highlight Color",
              propertyType: "color",
              propertyValue: propValue("Highlight Color") || "",
            },
          ],
        },
        {
          groupLabel: "Layout",
          propertyType: "group",
          isCollapsible: true,
          properties: [
            // {
            //   propertyName: 'Positioning',
            //   propertyType: 'select',
            //   propertyValue: propValue('Positioning') || 'absolute',
            //   selectOptions: [
            //     { name: 'Automatic', value: 'relative' },
            //     { name: 'Freehand', value: 'absolute' },
            //   ],
            // },
            {
              propertyName: "Margin top",
              propertyType: "input",
              propertyValue: propValue("Margin top") || defaultSpacing,
              inputPropertyType: "number",
            },
            {
              propertyName: "Allow Geometry Update",
              propertyType: "slideToggle",
              propertyValue: updateGeometry,
            },
          ],
        },
        {
          propertyName: "Visibility",
          propertyType: "slideToggle",
          propertyValue: propValue("Visibility") || true,
        },
      ];
    } else if (controlName.match(/circle/i)) {
      properties = [
        {
          groupLabel: "Circle Details",
          propertyType: "group",
          isCollapsible: true,
          properties: [
            {
              propertyName: "Color",
              propertyType: "color",
              propertyValue: propValue("Color") || "",
            },
          ],
        },
        {
          groupLabel: "Dimension",
          propertyType: "group",
          isCollapsible: true,
          properties: [
            {
              propertyType: "row",
              properties: [
                {
                  propertyName: "Height",
                  propertyType: "input",
                  propertyValue: propValue("Height") || "100",
                  inputPropertyType: "number",
                },
                {
                  propertyName: "Width",
                  propertyType: "input",
                  propertyValue: propValue("Width") || "100",
                  inputPropertyType: "number",
                },
              ],
            },
          ],
        },
        {
          groupLabel: "Layout",
          propertyType: "group",
          isCollapsible: true,
          properties: [
            // {
            //   propertyName: 'Positioning',
            //   propertyType: 'select',
            //   propertyValue: propValue('Positioning') || 'absolute',
            //   selectOptions: [
            //     { name: 'Automatic', value: 'relative' },
            //     { name: 'Freehand', value: 'absolute' },
            //   ],
            // },
            {
              propertyName: "Margin top",
              propertyType: "input",
              propertyValue: propValue("Margin top") || defaultSpacing,
              inputPropertyType: "number",
            },
            {
              propertyName: "Allow Geometry Update",
              propertyType: "slideToggle",
              propertyValue: updateGeometry,
            },
          ],
        },
        {
          propertyName: "Visibility",
          propertyType: "slideToggle",
          propertyValue: propValue("Visibility") || true,
        },
      ];
    } else if (controlName.match(/triangle/i)) {
      properties = [
        {
          groupLabel: "Triangle Details",
          propertyType: "group",
          isCollapsible: true,
          properties: [
            {
              propertyName: "Color",
              propertyType: "color",
              propertyValue: propValue("Color") || "",
            },
          ],
        },
        {
          groupLabel: "Layout",
          propertyType: "group",
          isCollapsible: true,
          properties: [
            // {
            //   propertyName: 'Positioning',
            //   propertyType: 'select',
            //   propertyValue: propValue('Positioning') || 'absolute',
            //   selectOptions: [
            //     { name: 'Automatic', value: 'relative' },
            //     { name: 'Freehand', value: 'absolute' },
            //   ],
            // },
            {
              propertyName: "Margin top",
              propertyType: "input",
              propertyValue: propValue("Margin top") || defaultSpacing,
              inputPropertyType: "number",
            },
            {
              propertyName: "Allow Geometry Update",
              propertyType: "slideToggle",
              propertyValue: updateGeometry,
            },
          ],
        },
        {
          propertyName: "Visibility",
          propertyType: "slideToggle",
          propertyValue: propValue("Visibility") || true,
        },
      ];
    } else if (controlName.match(/arrow/i)) {
      properties = [
        {
          groupLabel: "Triangle Details",
          propertyType: "group",
          isCollapsible: true,
          properties: [
            {
              propertyName: "Color",
              propertyType: "color",
              propertyValue: propValue("Color") || "",
            },
          ],
        },
        {
          groupLabel: "Dimension",
          propertyType: "group",
          isCollapsible: true,
          properties: [
            {
              propertyType: "row",
              properties: [
                {
                  propertyName: "Size",
                  propertyType: "input",
                  propertyValue: propValue("Size") || "100",
                  inputPropertyType: "number",
                },
              ],
            },
          ],
        },
        {
          groupLabel: "Layout",
          propertyType: "group",
          isCollapsible: true,
          properties: [
            // {
            //   propertyName: 'Positioning',
            //   propertyType: 'select',
            //   propertyValue: propValue('Positioning') || 'absolute',
            //   selectOptions: [
            //     { name: 'Automatic', value: 'relative' },
            //     { name: 'Freehand', value: 'absolute' },
            //   ],
            // },
            {
              propertyName: "Margin top",
              propertyType: "input",
              propertyValue: propValue("Margin top") || defaultSpacing,
              inputPropertyType: "number",
            },
            {
              propertyName: "Allow Geometry Update",
              propertyType: "slideToggle",
              propertyValue: updateGeometry,
            },
          ],
        },
        {
          propertyName: "Visibility",
          propertyType: "slideToggle",
          propertyValue: propValue("Visibility") || true,
        },
      ];
    }
    // }

    return properties;
  }

  getControlsActualCoordinates(
    controlData: any,
    relativePage: any,
    documentIndex: number,
    allDocuments: any[]
  ): {
    width: string;
    height: string;
    xPosition: string;
    yPosition: string;
    // transform: string;
  } {
    const originalPage = allDocuments[documentIndex].pages.find((page: any) => {
      return page.pageNumber === Number(controlData?.pageNumber);
    });

    const width =
      (this.pixelToNumber(originalPage!.width) *
        this.pixelToNumber(controlData?.coordinate.width)) /
      this.pixelToNumber(relativePage.width);

    const height =
      (this.pixelToNumber(originalPage!.height) *
        this.pixelToNumber(controlData?.coordinate.height)) /
      this.pixelToNumber(relativePage.height);

    const translate3dCoordinates = this.getTransformCoordinates(
      controlData?.coordinate.transform
    );

    const x =
      (this.pixelToNumber(originalPage!.width) * translate3dCoordinates.x) /
      this.pixelToNumber(relativePage.width);

    const y =
      (this.pixelToNumber(originalPage!.height) * translate3dCoordinates.y) /
      this.pixelToNumber(relativePage.height);

    // const transform = `translate3d(${x}px, ${y}px, 0px)`;

    return {
      width: `${width}px`,
      height: `${height}px`,
      xPosition: `${x}px`,
      yPosition: `${y}px`,
      // transform: `${transform}`,
    };
  }

  addUndo(canvasId: string, scrollablePar: HTMLElement, currentPage: number) {
    this.addingUndo = true;
    clearTimeout(this.addUndoTimeout);
    this.addUndoTimeout = setTimeout(() => {
      if (!this.canAddUndo) return;
      const undos = this.undos[canvasId];
      const lastItem = undos.at(-1)?.projectPages;
      let activeControl;

      const projectPages = JSON.parse(
        JSON.stringify(this.currentProjectPages.value[canvasId])
      ) as ProjectPages;

      const sortedPages = projectPages.map((p) => this.sortObjectKeys(p));
      const lastItemPages = (lastItem || []).map((p) => this.sortObjectKeys(p));
      if (JSON.stringify(sortedPages) === JSON.stringify(lastItemPages)) return;
      // console.log('add undo');
      this.redos = { ...this.redos, [canvasId]: [] };
      // console.log({ top: scrollablePar.scrollTop });
      this.undos[canvasId].push({
        projectPages: sortedPages,
        scrollTop: scrollablePar.scrollTop,
        activeControl,
        currentPage,
      });
      // console.log(this.undos[canvasId]);
      this.addingUndo = false;
    }, 800);
  }

  sortObjectKeys(obj: any): any {
    if (typeof obj !== "object" || obj === null) {
      return obj; // Return the value if it's not an object
    }

    if (Array.isArray(obj)) {
      return obj.map((o) => this.sortObjectKeys(o));
    }

    const sortedKeys = Object.keys(obj).sort(); // Get keys and sort them
    const sortedObj: any = {};

    for (const key of sortedKeys) {
      sortedObj[key] = this.sortObjectKeys(obj[key]); // Recursively sort nested objects
    }

    return sortedObj;
  }

  equalArray(arr1: any[], arr2: any[]) {
    if (arr1.length !== arr2.length) return false;

    return arr1.every((item, index) => this.deepEqual(item, arr2[index]));
  }

  deepEqual(obj1: any, obj2: any) {
    if (obj1 === obj2) return true; // Same reference

    if (
      typeof obj1 !== "object" ||
      obj1 === null ||
      typeof obj2 !== "object" ||
      obj2 === null
    ) {
      return false; // Primitive types or one is null
    }

    if (Array.isArray(obj1) !== Array.isArray(obj2)) return false; // One is array, the other is not

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) return false;

    for (const key of keys1) {
      if (!keys2.includes(key) || !this.deepEqual(obj1[key], obj2[key])) {
        return false; // Key mismatch or nested mismatch
      }
    }

    return true;
  }

  pixelToNumber(value: string): number {
    return parseFloat(value.replaceAll('"', "").replaceAll("px", ""));
  }

  calculateLineHeight(fontSize: string, lineHeight: string) {
    lineHeight = `${lineHeight}`;
    return lineHeight.match(/auto/i)
      ? "1.5"
      : lineHeight.split(".")[0].length < 2
      ? lineHeight
      : this.pixelToRem(`${lineHeight}px`);
  }

  pixelToRem(px: string): string {
    if (!px.endsWith("px")) {
      return px;
    }

    const pxValue = parseFloat(px);

    if (isNaN(pxValue)) {
      return px;
    }

    const remValue = pxValue / 16;

    return `${remValue}rem`;
  }

  pixelsToRems(pixels: string[]): string[] {
    return pixels.map((px) => this.pixelToRem(px));
  }

  generateGUID(): string {
    const s4 = (): string => {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    };
    return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
  }

  getTransformCoordinates(transform: string) {
    const transform3dCoordinates = transform
      .split("translate3d")[1]
      .replace("(", "")
      .replace(")", "")
      .split(",");

    const x = parseFloat(transform3dCoordinates[0].split("px")[0]);
    const y = parseFloat(transform3dCoordinates[1].split("px")[0]);
    const z = parseFloat(transform3dCoordinates[2].split("px")[0]);

    return { x, y, z };
  }

  traverseObject(
    obj: AnyObject,
    predicate: (value: any, key?: string | number, obj?: AnyObject) => boolean
  ): AnyObject[] {
    const result: AnyObject[] = [];

    for (const key in obj) {
      if (Object.hasOwnProperty.call(obj, key)) {
        const value = obj[key];
        if (Array.isArray(value)) {
          // If the value is an array, recursively traverse it
          result.push(...this.traverseArray(value, predicate));
        } else if (typeof value === "object" && value !== null) {
          // If the value is an object, recursively traverse its values
          result.push(...this.traverseObject(value, predicate));
        } else {
          // If the key-value pair matches the predicate, add it to the result
          if (predicate(value, key, obj)) {
            result.push(obj);
          }
        }
      }
    }

    return result;
  }

  traverseArray(
    arr: any[],
    predicate: (value: any, key?: string | number, obj?: AnyObject) => boolean
  ): any[] {
    const result: any[] = [];

    for (const item of arr) {
      if (Array.isArray(item)) {
        // If the item is an array, recursively traverse it
        result.push(...this.traverseArray(item, predicate));
      } else if (typeof item === "object" && item !== null) {
        // If the item is an object, recursively traverse its values
        result.push(...this.traverseObject(item, predicate));
      } else {
        // If the item matches the predicate, add it to the result
        if (predicate(item, undefined, arr)) {
          result.push(item);
        }
      }
    }

    return result;
  }

  getFormControlPartialPath(path: string[]) {
    return path ? path.join(".") : null;
  }

  getFormControlFullPath(path: string[], property: FmbrPropertyInterface) {
    return [...(path || []), property.propertyName].join(".");
  }

  setStyleWithImportant(
    element: HTMLElement,
    style: string,
    styleValue: string,
    renderer: Renderer2
  ) {
    let currentStyle = element.getAttribute("style") || "";

    // Remove any existing declarations for the same style property
    const regex = new RegExp(`${style}\\s*:\\s*[^;]+;\\s*`, "g");
    currentStyle = currentStyle.replace(regex, "");

    // Construct the new style declaration with !important
    const newStyle = `${style}: ${styleValue} !important;`;

    // Set the style attribute to the new style string
    // element.setAttribute('style', currentStyle + newStyle);

    renderer.setAttribute(element, "style", currentStyle + newStyle);
  }

  setStylesWithImportant(
    element: HTMLElement,
    styles: { [key: string]: string },
    renderer: Renderer2
  ) {
    for (const style in styles) {
      if (Object.hasOwnProperty.call(styles, style)) {
        this.setStyleWithImportant(element, style, styles[style], renderer);
      }
    }
  }

  hexToRgb(hex: string, opacity: number): string | null {
    // Remove hash if present
    hex = hex.replace(/^#/, "");

    // Parse hex into RGB
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    // Validate opacity
    if (opacity < 0 || opacity > 100) {
      throw new Error("Opacity must be a value between 0 and 100.");
    }

    // Construct the RGB string
    const rgbString = `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;

    return rgbString;
  }

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
}
