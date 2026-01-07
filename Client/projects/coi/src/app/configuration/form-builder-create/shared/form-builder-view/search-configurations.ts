export class Endpoint {
    contextField: string;
    formatString: string;
    path: string;
    defaultValue: string;
    params: any;
    filterFields: string;
  }

export function getEndPointForEntity(baseUrl: string): Endpoint {
    const END_POINT_OPTIONS = new Endpoint();
    END_POINT_OPTIONS.contextField = 'entityName';
    END_POINT_OPTIONS.formatString = 'entityName | countryName';
    END_POINT_OPTIONS.path = baseUrl + '/coi/getEntityWithRelationShipInfo';
    END_POINT_OPTIONS.defaultValue = '';
    return END_POINT_OPTIONS;
}

export function getEndPointOptionsForCountry(baseUrl: string = ''): Endpoint {
    const END_POINT_OPTIONS = new Endpoint();
    END_POINT_OPTIONS.contextField = 'countryName';
    END_POINT_OPTIONS.formatString = 'countryName';
    END_POINT_OPTIONS.path = baseUrl + '/' + 'findCountry';
    END_POINT_OPTIONS.defaultValue = '';
    END_POINT_OPTIONS.params = null;
    return JSON.parse(JSON.stringify(END_POINT_OPTIONS));
}

