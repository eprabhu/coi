export function setFilteredData(ruleService, selectedObject) {
    ruleService.filterData.UNIT_NAME = selectedObject.unitName;
    ruleService.filterData.MODULE_NAME = ruleService.filterData.RULE_APPLIED_TO = selectedObject.moduleName;
    ruleService.filterData.RULE_NAME = selectedObject.ruleName;
    ruleService.filterData.UNIT_NUMBER = selectedObject.unitNumber;
    ruleService.filterData.MODULE_CODE = selectedObject.moduleCode;
    ruleService.filterData.SUB_MODULE_CODE = selectedObject.subModuleCode;
    ruleService.filterData.RULE_TYPE = selectedObject.ruleCode;
}

export function setSelectedCriteriaAndDefaultValue(ruleService, selectedCriteria) {
    ruleService.completerUnitListOptions.defaultValue =
    ruleService.filterData.UNIT_NUMBER ? ruleService.filterData.UNIT_NUMBER + '-' + ruleService.filterData.UNIT_NAME  : null;
    ruleService.completerModuleListOptions.defaultValue =
                      selectedCriteria.moduleName = ruleService.filterData.RULE_APPLIED_TO;
    ruleService.completerRuleListOptions.defaultValue =
                      selectedCriteria.ruleName = ruleService.filterData.RULE_NAME;
    selectedCriteria.moduleCode = ruleService.filterData.MODULE_CODE;
    selectedCriteria.unitName =  ruleService.filterData.UNIT_NAME;
    selectedCriteria.unitNumber = ruleService.filterData.UNIT_NUMBER;
    selectedCriteria.subModuleCode = ruleService.filterData.SUB_MODULE_CODE;
    selectedCriteria.ruleCode = ruleService.filterData.RULE_TYPE;
    return selectedCriteria;
}

export function getSelectedSubModule(filterData) {
    const submodule: any = {};
    if (filterData.moduleList[filterData.moduleIndex].subModules.length && filterData.SUB_MODULE_CODE) {
        submodule.moduleName = filterData.moduleList[filterData.moduleIndex].DESCRIPTION;
        submodule.index = filterData.moduleList[filterData.moduleIndex].subModules.
            findIndex(item => item.SUB_MODULE_CODE === filterData.SUB_MODULE_CODE);
    }
    return submodule;
}

export function getSelectedModule(filterData) {
    return filterData.moduleList.findIndex(item => item.MODULE_CODE === filterData.MODULE_CODE);
}

export function onUnitSelect(selectedItem, selectedObject, ruleService) {
    if (selectedItem) {
      selectedObject.unitNumber = selectedItem.UNIT_NUMBER;
      selectedObject.unitName = selectedItem.UNIT_NAME;
    } else {
      selectedObject.unitNumber = null;
      selectedObject.unitName = null;
      ruleService.completerUnitListOptions.defaultValue = null;
    }
    return selectedObject;
  }

  export function onModuleSelect(selectedItem, selectedObject, ruleService) {
    if (selectedItem) {
      selectedObject.moduleCode = selectedItem.MODULE_CODE;
      selectedObject.moduleName = selectedItem.DESCRIPTION;
      selectedObject.subModuleCode = selectedItem.SUB_MODULE_CODE;
    } else {
      selectedObject.moduleCode = null;
      selectedObject.subModuleCode = null;
      selectedObject.moduleName = null;
      ruleService.completerModuleListOptions.defaultValue = null;
    }
    return selectedObject;
  }

  export function onRuleSelect(selectedItem, selectedObject, ruleService) {
    if (selectedItem) {
      selectedObject.ruleCode = selectedItem.id;
      selectedObject.ruleName = selectedItem.name;
    } else {
      selectedObject.ruleCode = null;
      selectedObject.ruleName = null;
      ruleService.completerRuleListOptions.defaultValue = null;
    }
    return selectedObject;
  }

  export function setCompleterOptions(dataList: Array<any>, contextField: string, filterFields: string, formatString: string) {
    const completerOptions: any = {};
    completerOptions.arrayList = dataList || [];
    completerOptions.contextField = contextField;
    completerOptions.filterFields = filterFields;
    completerOptions.formatString = formatString;
    return JSON.parse(JSON.stringify(completerOptions));
  }

  export function mapModules(list: Array<any>) {
    const MODULES = list.filter(el => !el.SUB_MODULE_CODE);
    MODULES.forEach(m => m.subModules = findSubModules(list, m.MODULE_CODE));
    return MODULES;
  }

  function findSubModules(list, code) {
    const SUB_MODULES = list.filter(l => l.MODULE_CODE === code && l.SUB_MODULE_CODE);
    return SUB_MODULES;
  }
