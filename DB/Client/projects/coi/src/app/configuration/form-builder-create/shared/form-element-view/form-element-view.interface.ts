export interface CustomDataElementAnswer {
  customDataId: number;
  customDataElementsId: number | null;
  moduleItemCode: string | null;
  moduleSubItemCode: string | null;
  moduleItemKey: string | null;
  moduleSubItemKey: string | null;
  value: string;
  description: string;
  updateUser: string | null;
  updateTimestamp: string | null;
}

export interface CustomDataElement {
  customDataElementId: number;
  columnName: string;
  defaultValue: string;
  dataType: string;
  isRequired: boolean | null;
  options: any[]; // Define a specific type if available
  answers: CustomDataElementAnswer[];
  moduleItemCode: string | null;
  moduleItemKey: string | null;
  dataLength: number | null;
  lookupWindow: string;
  lookupArgument: string;
  filterType: string;
  orderNumber: number | null;
  isActive: boolean | null;
  customElementName: string | null;
  isMultiSelectLookup: string;
}
