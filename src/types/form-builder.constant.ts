import {
  FmbrControlCategoryEnum,
  FmbrFillableControlTypeEnum,
  FmbrLayoutControlTypeEnum,
  FmbrPageOrientationEnum,
  FmbrPageSizeEnum,
  FmbrShapesControlTypeEnum,
} from "./form-builder.enum";
import { DynamicForm } from "./form-builder.interface";

export const PageSizesAt72DPI = {
  [FmbrPageSizeEnum.A0]: {
    [FmbrPageOrientationEnum.Portrait]: {
      width: "2384px",
      height: "3370px",
    },
    [FmbrPageOrientationEnum.Landscape]: {
      width: "3370px",
      height: "2384px",
    },
  },

  [FmbrPageSizeEnum.A1]: {
    [FmbrPageOrientationEnum.Portrait]: {
      width: "1684px",
      height: "2384px",
    },
    [FmbrPageOrientationEnum.Landscape]: {
      width: "2384px",
      height: "1684px",
    },
  },

  [FmbrPageSizeEnum.A2]: {
    [FmbrPageOrientationEnum.Portrait]: {
      width: "1191px",
      height: "1684px",
    },
    [FmbrPageOrientationEnum.Landscape]: {
      width: "1684px",
      height: "1191px",
    },
  },

  [FmbrPageSizeEnum.A3]: {
    [FmbrPageOrientationEnum.Portrait]: {
      width: "842px",
      height: "1191px",
    },
    [FmbrPageOrientationEnum.Landscape]: {
      width: "1191px",
      height: "842px",
    },
  },

  [FmbrPageSizeEnum.A4]: {
    [FmbrPageOrientationEnum.Portrait]: {
      width: "595px",
      height: "842px",
    },
    [FmbrPageOrientationEnum.Landscape]: {
      width: "842px",
      height: "595px",
    },
  },

  [FmbrPageSizeEnum.A5]: {
    [FmbrPageOrientationEnum.Portrait]: {
      width: "420px",
      height: "595px",
    },
    [FmbrPageOrientationEnum.Landscape]: {
      width: "595px",
      height: "420px",
    },
  },

  [FmbrPageSizeEnum.A6]: {
    [FmbrPageOrientationEnum.Portrait]: {
      width: "298px",
      height: "420px",
    },
    [FmbrPageOrientationEnum.Landscape]: {
      width: "420px",
      height: "298px",
    },
  },

  [FmbrPageSizeEnum.Letter]: {
    [FmbrPageOrientationEnum.Portrait]: {
      width: "612px",
      height: "792px",
    },
    [FmbrPageOrientationEnum.Landscape]: {
      width: "792px",
      height: "612px",
    },
  },

  [FmbrPageSizeEnum.Legal]: {
    [FmbrPageOrientationEnum.Portrait]: {
      width: "612px",
      height: "1008px",
    },
    [FmbrPageOrientationEnum.Landscape]: {
      width: "1008px",
      height: "612px",
    },
  },
};

export const FmbrPageSizeDimensionDefaultDetails = {
  [FmbrPageSizeEnum.A0]: {
    [FmbrPageOrientationEnum.Portrait]: {
      width: "3179px",
      height: "4517px",
    },
    [FmbrPageOrientationEnum.Landscape]: {
      width: "4517px",
      height: "3179px",
    },
  },

  [FmbrPageSizeEnum.A1]: {
    [FmbrPageOrientationEnum.Portrait]: {
      width: "2245px",
      height: "3179px",
    },
    [FmbrPageOrientationEnum.Landscape]: {
      width: "3179px",
      height: "2245px",
    },
  },

  [FmbrPageSizeEnum.A2]: {
    [FmbrPageOrientationEnum.Portrait]: {
      width: "1654px",
      height: "2245px",
    },
    [FmbrPageOrientationEnum.Landscape]: {
      width: "2245px",
      height: "1654px",
    },
  },

  [FmbrPageSizeEnum.A3]: {
    [FmbrPageOrientationEnum.Portrait]: {
      width: "1123px",
      height: "1654px",
    },
    [FmbrPageOrientationEnum.Landscape]: {
      width: "1654px",
      height: "1123px",
    },
  },

  [FmbrPageSizeEnum.A4]: {
    [FmbrPageOrientationEnum.Portrait]: {
      width: "794px",
      height: "1123px",
    },
    [FmbrPageOrientationEnum.Landscape]: {
      width: "1123px",
      height: "794px",
    },
  },

  [FmbrPageSizeEnum.A5]: {
    [FmbrPageOrientationEnum.Portrait]: {
      width: "559px",
      height: "794px",
    },
    [FmbrPageOrientationEnum.Landscape]: {
      width: "794px",
      height: "559px",
    },
  },

  [FmbrPageSizeEnum.A6]: {
    [FmbrPageOrientationEnum.Portrait]: {
      width: "397px",
      height: "559px",
    },
    [FmbrPageOrientationEnum.Landscape]: {
      width: "559px",
      height: "397px",
    },
  },

  [FmbrPageSizeEnum.Letter]: {
    [FmbrPageOrientationEnum.Portrait]: {
      width: "816px",
      height: "1056px",
    },
    [FmbrPageOrientationEnum.Landscape]: {
      width: "1056px",
      height: "816px",
    },
  },

  [FmbrPageSizeEnum.Legal]: {
    [FmbrPageOrientationEnum.Portrait]: {
      width: "816px",
      height: "1344px",
    },
    [FmbrPageOrientationEnum.Landscape]: {
      width: "1344px",
      height: "816px",
    },
  },
};

export const FmbrLayoutControlTypeDefaultDimensions = {
  [FmbrLayoutControlTypeEnum.Section]: {
    width: "100%",
    height: "200px",
  },

  [FmbrLayoutControlTypeEnum.Grid]: {
    width: "100%",
    height: "100px",
  },

  [FmbrLayoutControlTypeEnum.Table]: {
    width: "100%",
    height: "",
  },
};

export const FmbrFillableControlTypeDefaultDimensions = {
  [FmbrFillableControlTypeEnum.Text]: {
    width: "285.58px",
    height: "32px",
  },

  [FmbrFillableControlTypeEnum.Label]: {
    width: "285.58px",
    height: "32px",
  },

  [FmbrFillableControlTypeEnum.Signature]: {
    width: "200px",
    height: "48px",
  },

  [FmbrFillableControlTypeEnum.Stamp]: {
    width: "150px",
    height: "150px",
  },

  [FmbrFillableControlTypeEnum.Initials]: {
    width: "200px",
    height: "48px",
  },

  [FmbrFillableControlTypeEnum.Email]: {
    width: "230px",
    height: "32px",
  },

  [FmbrFillableControlTypeEnum.Name]: {
    width: "230px",
    height: "32px",
  },

  [FmbrFillableControlTypeEnum.JobTitle]: {
    width: "230px",
    height: "32px",
  },

  [FmbrFillableControlTypeEnum.Date]: {
    width: "230px",
    height: "32px",
  },

  [FmbrFillableControlTypeEnum.Select]: {
    width: "230px",
    height: "32px",
  },

  [FmbrFillableControlTypeEnum.PhoneNumber]: {
    width: "260px",
    height: "32px",
  },

  [FmbrFillableControlTypeEnum.File]: {
    width: "300px",
    height: "48px",
  },

  [FmbrFillableControlTypeEnum.Address]: {
    width: "400px", //formerly 37.5rem
    height: "32px", //formerly 1.75rem
  },

  [FmbrFillableControlTypeEnum.VerifiableText]: {
    width: "230px",
    height: "32px",
  },

  [FmbrFillableControlTypeEnum.Image]: {
    width: "230px",
    height: "250px",
  },
};

export const ThemesAndColors: { themes: string[]; themeColors: DynamicForm } = {
  themes: [
    "theme1",
    "theme2",
    "theme3",
    "theme4",
    "theme5",
    "theme6",
    "theme7",
    "theme8",
  ],
  themeColors: {
    theme1: "#4e33ff",
    theme2: "#fb8500",
    theme3: "#be0424",
    theme4: "#906e18",
    theme5: "#208b3a",
    theme6: "#094cf4",
    theme7: "#6c27a7",
    theme8: "#222222",
  },
};

export const FmbrOptionSources: { name: string; value: any }[] = [
  { name: "Manual Input", value: "manual input" },
  {
    name: "Import from File",
    value: "import from file",
  },
  { name: "Import from API", value: "import from api" },
  { name: "Import from URL", value: "import from url" },
];

export const PageSizes = [
  { name: "A0", value: "A0", sizeInInch: "33.1 x 46.8 inch" },
  { name: "A1", value: "A1", sizeInInch: "23.4 x 33.1 inch" },
  { name: "A2", value: "A2", sizeInInch: "16.5 x 23.4 inch" },
  { name: "A3", value: "A3", sizeInInch: "11.7 x 16.5 inch" },
  { name: "A4", value: "A4", sizeInInch: "8.3 x 11.7 inch" },
  { name: "A5", value: "A5", sizeInInch: "5.8 x 8.3 inch" },
  { name: "A6", value: "A6", sizeInInch: "4.1 x 5.8 inch" },
  { name: "Letter", value: "Letter", sizeInInch: "8.5 x 11 inch" },
  { name: "Legal", value: "Legal", sizeInInch: "8.5 x 14 inch" },
  { name: "Custom", value: "Custom", sizeInInch: "Customize" },
];

export const LayoutControls = [
  {
    name: "Section",
    controlCategory: FmbrControlCategoryEnum.Layout,
    controlType: FmbrLayoutControlTypeEnum.Section,
    icon: "/assets/icons/form-builder/fmbr-left-pane/fmbr-controls-panel/controls/layout/section.svg",
  },
  {
    name: "Grid",
    controlCategory: FmbrControlCategoryEnum.Layout,
    controlType: FmbrLayoutControlTypeEnum.Grid,
    icon: "/assets/icons/form-builder/fmbr-left-pane/fmbr-controls-panel/controls/layout/grid.svg",
  },
  {
    name: "Table",
    controlCategory: FmbrControlCategoryEnum.Layout,
    controlType: FmbrLayoutControlTypeEnum.Table,
    icon: "/assets/icons/form-builder/fmbr-left-pane/fmbr-controls-panel/controls/fillable/text.svg",
  },
];

export const FillableControls = [
  {
    name: "Text",
    controlCategory: FmbrControlCategoryEnum.Fillable,
    controlType: FmbrFillableControlTypeEnum.Text,
    icon: "/assets/icons/form-builder/fmbr-left-pane/fmbr-controls-panel/controls/fillable/text.svg",
  },
  {
    name: "Label",
    controlCategory: FmbrControlCategoryEnum.Fillable,
    controlType: FmbrFillableControlTypeEnum.Label,
    icon: "/assets/icons/form-builder/fmbr-left-pane/fmbr-controls-panel/controls/fillable/note.svg",
  },
  {
    name: "Signature",
    controlCategory: FmbrControlCategoryEnum.Fillable,
    controlType: FmbrFillableControlTypeEnum.Signature,
    icon: "/assets/icons/form-builder/fmbr-left-pane/fmbr-controls-panel/controls/fillable/signature.svg",
  },
  {
    name: "Email",
    controlCategory: FmbrControlCategoryEnum.Fillable,
    controlType: FmbrFillableControlTypeEnum.Email,
    icon: "/assets/icons/form-builder/fmbr-left-pane/fmbr-controls-panel/controls/fillable/email.svg",
  },
  {
    name: "Name",
    controlCategory: FmbrControlCategoryEnum.Fillable,
    controlType: FmbrFillableControlTypeEnum.Name,
    icon: "/assets/icons/form-builder/fmbr-left-pane/fmbr-controls-panel/controls/fillable/name.svg",
  },
  {
    name: "Checkbox",
    controlCategory: FmbrControlCategoryEnum.Fillable,
    controlType: FmbrFillableControlTypeEnum.Checkbox,
    icon: "/assets/icons/form-builder/fmbr-left-pane/fmbr-controls-panel/controls/fillable/checkbox.svg",
  },
  {
    name: "Date",
    controlCategory: FmbrControlCategoryEnum.Fillable,
    controlType: FmbrFillableControlTypeEnum.Date,
    icon: "/assets/icons/form-builder/fmbr-left-pane/fmbr-controls-panel/controls/fillable/date.svg",
  },
  {
    name: "Time",
    controlCategory: FmbrControlCategoryEnum.Fillable,
    controlType: FmbrFillableControlTypeEnum.Time,
    icon: "/assets/icons/form-builder/fmbr-left-pane/fmbr-controls-panel/controls/fillable/time.svg",
  },
  {
    name: "Dropdown",
    controlCategory: FmbrControlCategoryEnum.Fillable,
    controlType: FmbrFillableControlTypeEnum.Select,
    icon: "/assets/icons/form-builder/fmbr-left-pane/fmbr-controls-panel/controls/fillable/select.svg",
  },
  {
    name: "Address",
    controlCategory: FmbrControlCategoryEnum.Fillable,
    controlType: FmbrFillableControlTypeEnum.Address,
    icon: "/assets/icons/form-builder/fmbr-left-pane/fmbr-controls-panel/controls/fillable/address.svg",
  },
  {
    name: "Phone No",
    controlCategory: FmbrControlCategoryEnum.Fillable,
    controlType: FmbrFillableControlTypeEnum.PhoneNumber,
    icon: "/assets/icons/form-builder/fmbr-left-pane/fmbr-controls-panel/controls/fillable/mobile.svg",
  },
  {
    name: "Radio",
    controlCategory: FmbrControlCategoryEnum.Fillable,
    controlType: FmbrFillableControlTypeEnum.Radio,
    icon: "/assets/icons/form-builder/fmbr-left-pane/fmbr-controls-panel/controls/fillable/radio.svg",
  },
  {
    name: "Rating",
    controlCategory: FmbrControlCategoryEnum.Fillable,
    controlType: FmbrFillableControlTypeEnum.Rating,
    icon: "/assets/icons/form-builder/fmbr-left-pane/fmbr-controls-panel/controls/fillable/rating.svg",
  },
  {
    name: "File",
    controlCategory: FmbrControlCategoryEnum.Fillable,
    controlType: FmbrFillableControlTypeEnum.File,
    icon: "/assets/icons/form-builder/fmbr-left-pane/fmbr-controls-panel/controls/fillable/file.svg",
  },
  {
    name: "Image",
    controlCategory: FmbrControlCategoryEnum.Fillable,
    controlType: FmbrFillableControlTypeEnum.Image,
    icon: "/assets/icons/form-builder/fmbr-left-pane/fmbr-controls-panel/controls/layout/image.svg",
  },
  {
    name: "Job Title",
    controlCategory: FmbrControlCategoryEnum.Fillable,
    controlType: FmbrFillableControlTypeEnum.JobTitle,
    icon: "/assets/icons/editor/control-icons/job-title.svg",
  },
  {
    name: "Verifiable Text",
    controlCategory: FmbrControlCategoryEnum.Fillable,
    controlType: FmbrFillableControlTypeEnum.VerifiableText,
    icon: "/assets/icons/form-builder/fmbr-left-pane/fmbr-controls-panel/controls/fillable/verifiable_field.svg",
  },
  {
    name: "Initials",
    controlCategory: FmbrControlCategoryEnum.Fillable,
    controlType: FmbrFillableControlTypeEnum.Initials,
    icon: "assets/icons/editor/control-icons/initials.svg",
  },
  {
    name: "Stamp",
    controlCategory: FmbrControlCategoryEnum.Fillable,
    controlType: FmbrFillableControlTypeEnum.Stamp,
    icon: "assets/icons/form-builder/fmbr-left-pane/fmbr-controls-panel/controls/fillable/stamp.svg",
  },
];

export const ShapesControls = [
  {
    name: "Rectangle",
    controlCategory: FmbrControlCategoryEnum.Shapes,
    controlType: FmbrShapesControlTypeEnum.Rectangle,
    icon: "/assets/icons/form-builder/fmbr-left-pane/fmbr-controls-panel/controls/shapes/rectangle.svg",
  },
  {
    name: "Circle",
    controlCategory: FmbrControlCategoryEnum.Shapes,
    controlType: FmbrShapesControlTypeEnum.Circle,
    icon: "/assets/icons/form-builder/fmbr-left-pane/fmbr-controls-panel/controls/shapes/circle.svg",
  },
  {
    name: "Triangle",
    controlCategory: FmbrControlCategoryEnum.Shapes,
    controlType: FmbrShapesControlTypeEnum.Triangle,
    icon: "/assets/icons/form-builder/fmbr-left-pane/fmbr-controls-panel/controls/shapes/triangle.svg",
  },
  {
    name: "Arrow",
    controlCategory: FmbrControlCategoryEnum.Shapes,
    controlType: FmbrShapesControlTypeEnum.Arrow,
    icon: "/assets/icons/form-builder/fmbr-left-pane/fmbr-controls-panel/controls/shapes/arrow.svg",
  },
  {
    name: "Star",
    controlCategory: FmbrControlCategoryEnum.Shapes,
    controlType: FmbrShapesControlTypeEnum.Star,
    icon: "/assets/icons/form-builder/fmbr-left-pane/fmbr-controls-panel/controls/shapes/star.svg",
  },
  {
    name: "Square",
    controlCategory: FmbrControlCategoryEnum.Shapes,
    controlType: FmbrShapesControlTypeEnum.Square,
    icon: "/assets/icons/form-builder/fmbr-left-pane/fmbr-controls-panel/controls/shapes/square.svg",
  },
];

export const DefaultLeftPaneItems = [
  {
    name: "Pages",
    icon: "assets/icons/form-builder/fmbr-left-pane/pages.svg",
    componentName: "PagesComponent",
  },
  {
    name: "Control Panel",
    icon: "assets/icons/form-builder/fmbr-left-pane/control-panel.svg",
    componentName: "ControlsPanelComponent",
  },
  {
    name: "Control Locator",
    icon: "assets/icons/form-builder/fmbr-left-pane/control-locator.svg",
    componentName: "ControlLocatorComponent",
  },
];

export const DefaultRightPaneItems = [
  {
    name: "Properties",
    componentName: "PropertiesComponent",
  },
  {
    name: "Logic",
    componentName: "LogicComponent",
  },
];

export const Themes = [
  {
    themeName: "Official",
    thumbnail: "assets/images/form/themes/theme_thumbnail1.png",
    themeUrl: "assets/images/form/themes/theme1.jpeg",
    guid: "theme1",
    themeAccessLevel: 1,
    themeType: 1,
  },
  {
    themeName: "Warm",
    thumbnail: "assets/images/form/themes/theme_thumbnail2.png",
    themeUrl: "assets/images/form/themes/theme2.jpeg",
    guid: "theme2",
    themeAccessLevel: 1,
    themeType: 1,
  },
  {
    themeName: "Autumn",
    thumbnail: "assets/images/form/themes/theme_thumbnail3.png",
    themeUrl: "assets/images/form/themes/theme3.jpeg",
    guid: "theme3",
    themeAccessLevel: 1,
    themeType: 1,
  },
  {
    themeName: "Landscape",
    thumbnail: "assets/images/form/themes/theme_thumbnail4.png",
    themeUrl: "assets/images/form/themes/theme4.jpeg",
    guid: "theme4",
    themeAccessLevel: 1,
    themeType: 1,
  },
  {
    themeName: "Snow",
    thumbnail: "assets/images/form/themes/theme_thumbnail5.png",
    themeUrl: "assets/images/form/themes/theme5.jpeg",
    guid: "theme5",
    themeAccessLevel: 1,
    themeType: 1,
  },
  {
    themeName: "Night",
    thumbnail: "assets/images/form/themes/theme_thumbnail6.png",
    themeUrl: "assets/images/form/themes/theme6.jpeg",
    guid: "theme6",
    themeAccessLevel: 1,
    themeType: 1,
  },
  {
    themeName: "Mountain",
    thumbnail: "assets/images/form/themes/theme_thumbnail7.png",
    themeUrl: "assets/images/form/themes/theme7.png",
    guid: "theme7",
    themeAccessLevel: 1,
    themeType: 1,
  },
  {
    themeName: "Jujutsu kaisen",
    thumbnail: "assets/images/form/themes/theme_thumbnail8.png",
    themeUrl: "assets/images/form/themes/theme8.png",
    guid: "theme8",
    themeAccessLevel: 1,
    themeType: 1,
  },
  {
    themeName: "Autumn2",
    thumbnail: "assets/images/form/themes/theme_thumbnail9.png",
    themeUrl: "assets/images/form/themes/theme9.png",
    guid: "theme9",
    themeAccessLevel: 1,
    themeType: 1,
  },
  {
    themeName: "Official2",
    thumbnail: "assets/images/form/themes/theme_thumbnail10.png",
    themeUrl: "assets/images/form/themes/theme10.png",
    guid: "theme10",
    themeAccessLevel: 1,
    themeType: 1,
  },
];

export const TextAlignments = [
  {
    type: "left",
    svg: "assets/icons/TextAlignLeft.svg",
  },
  {
    type: "center",
    svg: "assets/icons/TextAlignCenter.svg",
  },
  {
    type: "right",
    svg: "assets/icons/TextAlignRight.svg",
  },
  {
    type: "justify",
    svg: "assets/icons/TextAlignJustify.svg",
  },
];

export const FontFamilies = [
  { name: "Arial", value: "Arial, sans-serif" },
  { name: "Poppins", value: "Poppins, sans-serif" },
  { name: "Greycliff", value: '"Greycliff CF", sans-serif' },
  { name: "Roboto Mono", value: '"Roboto Mono", monospace' },
  // {
  //   name: 'Comforter Brush',
  //   value: '"Comforter Brush", cursive',
  // },
  { name: "Italianno", value: "Italianno, cursive" },
  {
    name: "Edwardian Script ITC",
    value: "Edwardian Script ITC",
  },
  { name: "Brush Script MT", value: "Brush Script MT" },
  { name: "Freestyle Script", value: "Freestyle Script" },
  { name: "Lucida Handwriting", value: "Lucida Handwriting" },
];
