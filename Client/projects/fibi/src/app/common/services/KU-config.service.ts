import { Injectable } from '@angular/core';

@Injectable()
export class KUConfigService {

constructor() {
    this.KUProjectTaskUrl = '';
    this.KUProjectUrl = '';
    this.KuToken = '';
    this.KuTokenType = '';
}

    KUProjectUrl: string ;
    KUProjectTaskUrl: string;
    KuToken: string;
    KuTokenType: string;
}
