import {
  ControlModeEnum,
  EditorModeEnum,
  EditorSignTypeEnum,
  FmbrControlCategoryEnum,
  FmbrFillableControlTypeEnum,
  FmbrLayoutControlTypeEnum,
  FmbrShapesControlTypeEnum,
  MemberProfileTypeEnum,
} from "./form-builder.enum";

/****************** Form builder Control Types *****************/
export type FmbrLayoutControlType = FmbrLayoutControlTypeEnum;

export type FmbrFillableControlType = FmbrFillableControlTypeEnum;

export type FmbrShapesControlType = FmbrShapesControlTypeEnum;

export type FmbrControlType =
  | FmbrLayoutControlTypeEnum
  | FmbrFillableControlTypeEnum
  | FmbrShapesControlTypeEnum;

export type PageActionPayload = {
  type: "update" | "create" | "delete";
  pageData: FmbrPage;
  // payload: {
  //   guId: string;
  //   jsonData: string;
  //   name: string;
  // };
};

export type ProjectPages = {
  pageData: FmbrPage;
  pageControls: FmbrControl[];
}[];

export type LayoutControl = {
  name: string;
  icon: string;
  controlCategory: FmbrControlCategory;
  controlType: FmbrLayoutControlType;
};

export type ControlLogic = {
  guid: string;
  conditions: {
    operator: string;
    triggerValue?: string;
  }[];
  conditionConnector?: string;
  actionTarget: string;
  action: string;
};

export type SaveSignatureActionPayload = {
  signature: string;
  mimeType: string;
};

export type CreateSignatureActionPayload = {
  signature: string;
  isDefaultSignature: boolean;
};

export type UpdateSignatureActionPayload = {
  guid: string;
  isDefault: boolean;
  // signatureItem: {
  //   email: string;
  //   isDefaultSignature: boolean;
  //   signatureGuId: string;
  //   initials: string;
  //   fullName: string;
  //   isFlowmonoUser: boolean;
  //   subscriberId: number;
  // };
};

export type FillableControl = {
  name: string;
  icon: string;
  controlCategory: FmbrControlCategory;
  controlType: FmbrFillableControlType;
};

export type ShapeControl = {
  name: string;
  icon: string;
  controlCategory: FmbrControlCategory;
  controlType: FmbrShapesControlType;
};

export type PageControlActionPayload = {
  type: "update" | "create" | "delete";
  control: FmbrControl;
};

export type ControlGridInfo = {
  leftToLeft: number;
  rightToLeft: number;
  leftToRight: number;
  rightToRight: number;
  topToTop: number;
  bottomToTop: number;
  bottomToBottom: number;
  topToBottom: number;
  centerVertically: number;
  centerHorizontally: number;
  element: HTMLElement;
};

export type DocumentUploadActionPayload = {
  file: File;
  callback: (
    pagesInfo: {
      pageImage: string;
      pageWidth: number;
      pageHeight: number;
      file: string;
    }[]
  ) => any;
};

export type FileUploadActionPayload = {
  file: File;
  callback: (uploadedBlobUrl: string) => any;
};

export type FmbrControlCategory = FmbrControlCategoryEnum;

export type FmbrControl = {
  id: string;
  controlCategory: FmbrControlCategory;
  controlType: FmbrControlType;
  name: string;
  coordinate: {
    position: "absolute" | "relative";
    width: string | null;
    height: string | null;
    transform: string;
  };
  value: any; // Shouldn't this be in properties?
  disabled: boolean;
  pageNumber: string;
  formId: string;
  parentControl: string | null;
  columnIndex: number;
  element?: HTMLElement; // Still contemplating
  properties: FmbrProperty[];
  logic: ControlLogic[] | null;
  assignee?: ControlAssignee | null;
  updateProperties: boolean;
  updateGeometry: boolean;
  controlIndex: number;
  pdfGenerationInfo: {
    controlGeometry: Geometry;
    labelInfo:
      | (Geometry & {
          lineHeight: number;
          fontFamily: string;
          fontSize: number;
        })
      | null;
    valueGeometry: Geometry | null;
    otherInfo: any;
  };
};

export type Geometry = {
  width: number;
  height: number;
  x: number;
  y: number;
};

// export type FmbrControlProperty = {
//   groupLabel?: string;
//   isCollapsible?: boolean;
//   propertyName?: string;
//   propertyType: FmbrControlPropertyType;
//   propertyValue?: any;
//   properties?: FmbrControlProperty[];
// };

// export type FmbrControlPropertyType =
//   | 'group'
//   | 'information'
//   | 'input'
//   | 'select'
//   | 'color'
//   | 'toggle';

/***************************************************************/

/***************** Form builder Property Types *****************/

// type FmbrPropertyBase = {
//   groupLabel: string | null;
//   isCollapsible: boolean;
//   propertyName: string;
//   propertyType: FmbrPropertyType;
//   propertyValue: any;
//   inputPropertyType: FmbrInputPropertyType;
//   selectOptions: { name: string; value: any }[];
//   propertyCanToggle: boolean;
//   propertyToggleValue: boolean;
//   buttonToggleOptions: { name: string; value: any }[];
//   optionPropertyType: FmbrOptionPropertyType;
//   optionsList: string[];
//   properties: FmbrProperty[];
// };

type FmbrPropertyBase = {
  propertyType: FmbrPropertyType;
};

type FmbrPropertyTypeMapping = {
  // none: {};
  group: {
    groupLabel: string;
    isCollapsible: boolean;
    propertyType: "group";
    properties: FmbrProperty[];
  };
  row: {
    // propertyName: string | null;
    propertyType: "row";
    properties: FmbrProperty[];
  };
  information: {
    propertyName: string;
    propertyType: "information";
    propertyValue: string;
  };
  input: {
    propertyName: string;
    propertyType: "input";
    propertyValue: any;
    inputPropertyType: FmbrInputPropertyType;
    propertyCanToggle?: boolean;
    propertyToggleValue?: boolean;
  };
  textarea: {
    propertyName: string;
    propertyType: "textarea";
    propertyValue: any;
    inputPropertyType: FmbrInputPropertyType;
    propertyCanToggle?: boolean;
    propertyToggleValue?: boolean;
  };
  select: {
    propertyName: string;
    propertyType: "select";
    propertyValue: any;
    selectOptions?: { name: string; value: any }[];
    selectMultipleOptions?: { name: string; value: any }[];
    propertyCanToggle?: boolean;
    propertyToggleValue?: boolean;
  };
  color: {
    propertyName: string;
    propertyType: "color";
    propertyValue: any;
  };
  slideToggle: {
    propertyName: string;
    propertyType: "slideToggle";
    propertyValue: boolean;
  };
  buttonToggle: {
    propertyName: string;
    propertyType: "buttonToggle";
    propertyValue: any;
    buttonToggleOptions: { name: string; value: any }[];
  };
  dateTime: {
    propertyName: string;
    propertyType: "dateTime";
    propertyValue: Date;
  };
  textAlignment: {
    propertyName: string;
    propertyType: "textAlignment";
    propertyValue: string;
  };
  option: {
    propertyName: string;
    propertyType: "option";
    propertyValue: string;
    optionsList: string[];
    optionSource: { name: string; value: FmbrOptionSource }[];
    optionSourceValue: FmbrOptionSource;
  };
  image: {
    propertyName: string;
    propertyType: "image";
    propertyValue: string;
  };
  margin: {
    propertyName: string;
    propertyType: "margin";
    propertyValue: {
      top: number;
      left: number;
      bottom: number;
      right: number;
    };
  };
  column: {
    propertyName: string;
    propertyType: "column";
    propertyValue: number;
  };
};

export type FmbrProperty = FmbrPropertyBase["propertyType"] extends infer P
  ? P extends keyof FmbrPropertyTypeMapping
    ? FmbrPropertyTypeMapping[P] // & AdditionalProperties<P>
    : never
  : never;

// // Additional conditions based on propertyType
// type AdditionalProperties<T extends FmbrPropertyType> = T extends 'input'
//   ? T extends true
//     ? { propertyCanToggle: true; propertyToggleValue: boolean }
//     : T extends false
//     ? { propertyCanToggle: undefined; propertyToggleValue: undefined }
//     : {}
//   : {};

// ? Extract<
//     FmbrPropertyTypeMapping['input'],
//     { propertyCanToggle: true }
//   > extends { propertyCanToggle: true }
//   ? { propertyCanToggle?: true; propertyToggleValue: boolean }
//   : {}
// : {};

export type FmbrPropertyType =
  | "none"
  | "group"
  | "row"
  | "information"
  | "input"
  | "textarea"
  | "select"
  | "color"
  | "slideToggle"
  | "buttonToggle"
  | "dateTime"
  | "textAlignment"
  | "option"
  | "image"
  | "margin"
  | "opacity"
  | "column";

export type FmbrInputPropertyType = "text" | "number" | "percentage";

export type FmbrOptionSource =
  | "manual input"
  | "import from file"
  | "import from api"
  | "import from url"
  | "none";

/***************************************************************/

/******************* Form builder Page Types *******************/

export type FmbrPage = {
  id: string;
  pageNumber: number;
  formId: number;
  pageType: "form" | "document";
  documentPageIndex: number;
  documentFile: string | null;
  element?: HTMLElement; // Still contemplating
  properties: FmbrProperty[];
};

export type FmbrPageOrientation = "Portrait" | "Landscape";

export type FmbrPageSize =
  | "Letter"
  | "Legal"
  | "Custom"
  | "A0"
  | "A1"
  | "A2"
  | "A3"
  | "A4";

export type FmbrPageThumbnailData = {
  element: HTMLElement;
  width: number;
  height: number;
  orientation: FmbrPageOrientation;
};

export type ControlAssignee = {
  profileGuid: string;
  profileName?: string | null;
  memberProfileType: MemberProfileTypeEnum;
  memberProfileTypeDesc?: string;
  email?: string | null;
  profilePicture?: string;
  firstName?: string | null;
  lastName?: string | null;

  // may not be guid.
  profileId?: number | string;
};

/***************************************************************/

export type EditorMode = EditorModeEnum;

export type ControlMode = ControlModeEnum;

export type EditorSignType = EditorSignTypeEnum;

export type ThemeAction = {
  show: boolean;
  theme?: ThemeData | null;
};

export type UploadThemeAction = {
  payload: {
    ThemeName: string;
    ThemeAccessLevel: number;
    ThemeType: number;
    file: File;
  };
  callback: (data: any) => void;
};

export type DeleteThemeAction = {
  theme: ThemeData;
  callback: () => void;
};

export type ThemeSettings = {
  active?: string | null;
  recentlyUsed: { data: ThemeData[]; count: number };
  suggested: { data: ThemeData[]; count: number };
  customized: { data: ThemeData[]; count: number };
};

export type ThemeData = {
  guid: string;
  themeUrl: string;
  themeAccessLevel: number;
  themeType: number;
  themeName: string;
};

export type GetApiCollectionsAction = {
  payload: { skip: number; take: number; search: string };
  callback: (data: { count: number; entity: any[] }) => void;
};

export type GetCollectionEndpointsByIdAction = {
  payload: { id: string; skip: number; take: number; search: string };
  callback: (data: { count: number; entity: any[] }) => void;
};

export type GetEndpointDetailsAction = {
  id: string;
  callback: (data: any) => void;
};

export type VerifyControlContentAction = {
  payload: {
    verificationUrl: string;
    headers: { [key: string]: string };
    apiType: number;
    body: any;
  };
  callback: (data: any) => void;
};

export type UndoRedoState = {
  projectPages: ProjectPages;
  scrollTop: number;
  activeControl?: string | null;
  currentPage: number;
};

export type ControlDimensionLimit = {
  minWidth: number;
  minHeight: number;
  maxHeight?: number;
};

export type DuplicateControlPayload = {
  element: HTMLElement;
  dropTarget: HTMLElement;
  controlAttribute: FmbrControl;
  type: "duplicate" | "repeat";
};

export type SignatureSettings = {
  savedSignatures: {
    guId: string;
    isDefaultSignature: boolean;
    signature: string;
  }[];
  savedInitials: {
    guId: string;
    isDefaultSignature: boolean;
    signature: string;
  }[];
  settings: {
    showWatermark: boolean;
    showWatermarkOption: boolean;
    signatureDate: "USERCHOICE" | "YES" | "NO";
    signatureTime: "USERCHOICE" | "YES" | "NO";
    signatureFirstName: "USERCHOICE" | "YES" | "NO";
    signatureLastName: "USERCHOICE" | "YES" | "NO";
  };
};

export type FetchDriveFolderAndFilesActionPayload = {
  folder: "root" | string;
  callback: (data: DriveItem[]) => void;
};

export type DriveItem = {
  type: "file" | "folder";
  guid: string;
  label: string;
  folderInfo: {
    totalItems: number;
  } | null;
  fileInfo: FileInfo | null;
};

export type FileInfo = {
  name: string;
  type: string;
  size: number;
  url: string;
};

export type DriveItemDisplay = {
  guid: string;
  type: "folder" | "file";
  items: DriveItemDisplay[] | null;
  name: string;
  fileInfo: FileInfo | null;
  new: boolean;
};

export type SaveImageActionPayload = {
  file: File;
  folder: string;
  callback: (url: string) => void;
};

export type SearchDriveLocationActionPayload = {
  keyword: string;
  callback: (data: DriveItem[]) => void;
};

export type AddNewFolderActionPayload = {
  name: string;
  parentFolder: string;
  callback: (data: DriveItem) => void;
};
