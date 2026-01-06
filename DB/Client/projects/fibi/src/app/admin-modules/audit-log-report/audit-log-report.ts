export class ExportObject {
    actionFrom = null;
    actionTo = null;
    personIds = [];
    moduleNames = [];
    moduleDescriptions= [];
    personNames = [];
}

export interface Person {
    addr_line_1: any;
    directory_title: any;
    email_addr: any;
    external: any;
    full_name: any;
    phone_nbr: any;
    primary_title: any;
    prncpl_id: any;
    prncpl_nm: any;
    unit_name: any;
    unit_number: any;
}

export interface Category {
    code: any;
    dataType: any;
    description: any;
    isChecked: any;
}
