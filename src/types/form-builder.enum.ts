export enum FmbrPropertyTypeEnum {
  None = 'none',
  Group = 'group',
  Row = 'row',
  Information = 'information',
  Input = 'input',
  TextArea = 'textarea',
  Select = 'select',
  Color = 'color',
  SlideToggle = 'slideToggle',
  ButtonToggle = 'buttonToggle',
  DateTime = 'dateTime',
  TextAlignment = 'textAlignment',
  Option = 'option',
  Image = 'image',
  Margin = 'margin',
  Column = 'column',
  TextStyle = 'TextStyle',
}

export enum FmbrPropertyTypeOptionEnum {
  ManualInput = 'manual input',
  FromFile = 'import from file',
  FromApi = 'import from api',
  FromUrl = 'import from url',
}

export enum FmbrControlCategoryEnum {
  Layout = 1,
  Fillable = 2,
  Shapes = 3,
}

export enum FmbrLayoutControlTypeEnum {
  Section = 23,
  Grid = 24,
  Table = 15,
}

export enum FmbrFillableControlTypeEnum {
  Text = 1,
  Signature = 2,
  Checkbox = 3,
  Date = 4,
  Name = 5,
  Email = 6,
  JobTitle = 7,
  Select = 8,
  Address = 9,
  PhoneNumber = 10,
  Radio = 11,
  Rating = 12,
  Image = 13,
  File = 14,
  Table = 15,
  Time = 31,
  Initials = 32,
  VerifiableText = 33,
  Label = 34,
  Stamp = 35,
}

export enum FmbrShapesControlTypeEnum {
  Rectangle = 25,
  Circle = 26,
  Square = 27,
  Triangle = 28,
  Star = 29,
  Arrow = 30,
}

export enum FmbrPageOrientationEnum {
  Portrait = 'Portrait',
  Landscape = 'Landscape',
}

export enum FmbrPageSizeEnum {
  A0 = 'A0',
  A1 = 'A1',
  A2 = 'A2',
  A3 = 'A3',
  A4 = 'A4',
  A5 = 'A5',
  A6 = 'A6',
  Letter = 'Letter',
  Legal = 'Legal',
  Custom = 'Custom',
}

export enum ProjectStatus {
  Draft = 1,
  PendingApproval = 2,
  Approved = 3,
  Rejected = 4,
  Published = 5,
  Expired = 6,
}

export enum ProjectPublishType {
  saveonly = 1,
  publishandsendmail = 2,
}

export enum TemplateFilter {
  All = 1,
  CreatedByMe = 2,
  CreatedByOthers = 3,
}

export enum StateTypeEnum {
  Start = 1,
  Pass = 2,
  Wait = 3,
  Choice = 4,
  Parallel = 5,
  StateMachine = 6,
  Terminal = 7,
  Exception = 9999,
}

export enum ControlModeEnum {
  Internal = 'internal',
  External = 'external',
}

export enum EditorModeEnum {
  Internal = 'internal',
  External = 'external',
  Developer = 'developer',
  PatchProcessConfigurationForm = 'patchProcessConfigurationForm', // This needs to be reviewed and standardized
}

export enum EditorSignTypeEnum {
  Self = 'self',
  Multiple = 'multiple',
}

export enum MemberProfileTypeEnum {
  User = 1,
  Role = 2,
  Employee = 3,
  JobFunction = 4,
  Division = 5,
  Department = 6,
  Unit = 7,
  UserGroup = 8,
  Contact = 9,
  ContactCategory = 10,
}
