import { Injectable } from '@angular/core';
import { CommonService } from '../../common/services/common.service';

@Injectable()
export class AppElasticService {

  constructor(private _commonService: CommonService) { }

  search(url , param) {
    return new Promise((resolve, reject) => {
        const http = new XMLHttpRequest();
        http.onreadystatechange = function() {
            if (this.readyState === 4 && this.status === 200) {
                resolve(JSON.parse(this.responseText));
            } else if (this.readyState === 4 && this.status !== 200) {
                reject('error');
            }
        };
        http.open('POST', url, true);
        http.setRequestHeader('Content-Type', 'application/json');
        if ( this._commonService.isElasticAuthentiaction ) {
          http.setRequestHeader('Authorization', this._commonService.elasticAuthScheme + ' '
          + btoa(this._commonService.elasticUserName + this._commonService.elasticDelimiter + this._commonService.elasticPassword));
        }
        http.send(JSON.stringify(param));
    });
  }

}
