import {
  FmbrControlType,
  FmbrInputPropertyType,
  FmbrOptionSource,
  FmbrPropertyType,
} from "./form-builder-type";

export interface FmbrPropertyInterface {
  groupLabel?: string | null;
  isCollapsible?: boolean;
  propertyName?: string;
  propertyType: FmbrPropertyType;
  propertyValue?: any;
  inputPropertyType?: FmbrInputPropertyType;
  selectOptions?: { name: string; value: any }[];
  selectMultipleOptions?: { name: string; value: any }[];
  propertyCanToggle?: boolean;
  propertyToggleValue?: boolean;
  buttonToggleOptions?: { name: string; value: any }[];
  optionPropertyType?: FmbrOptionSource;
  optionsList?: string[];
  optionSource?: {
    name: string;
    value: FmbrOptionSource;
  }[];
  optionSourceValue?: FmbrOptionSource;
  properties?: FmbrPropertyInterface[];
}

export interface FmbrPropertiesData {
  objectType: "control" | "page";
  objectId: string;
  objectName: string;
  controlName?: string;
  controlCategory?: any;
  controlType?: FmbrControlType;
  pageName?: string;
  properties: FmbrPropertyInterface[];
}

export interface FmbrPropertyData {
  objectType: "control" | "page";
  objectName: string;
  controlName?: string;
  controlCategory?: any;
  controlType?: FmbrControlType;
  pageName?: string;
  property: {
    [key: string]: any;
  };
  propertiesForm: any;
  propertyPath: string[];
}

// export interface PropertyMeta {
//   groupLabel: string | null;
//   isCollapsible: boolean;
//   propertyType: string;
//   properties: FmbrProperty[];
// }

// export interface FmbrProperty {
//   propertyName: string | null | any;
//   propertyType: string;
//   optionType?: string;
//   propertyValue?: any;
//   canToggle?: boolean;
//   properties?: FmbrProperty[];
//   options?: any[];
//   selectOptions?: { name: string; value: any }[];
//   buttonToggleOptions?: { name: string; value: any }[];
// }

// export interface FmbrProperty {
//   groupLabel?: string | null;
//   isCollapsible?: boolean;
//   propertyName?: string | null;
//   propertyType: FmbrPropertyType;
//   propertyValue?: any;
//   inputPropertyType?: FmbrInputPropertyType;
//   selectOptions?: { name: string; value: any }[];
//   propertyCanToggle?: boolean;
//   propertyToggleValue?: boolean;
//   buttonToggleOptions?: { name: string; value: any }[];
//   optionPropertyType?: FmbrOptionPropertyType;
//   optionsList?: string[];
//   properties?: FmbrProperty[];
// }

export interface DynamicForm {
  [key: string]: any;
}

export interface IProjectCollaborators {
  collaboratorEmail: string;
  collaboratorName: string;
  collaboratorSubscriberId: number;
  projectLink: string;
  permission: number;
}
