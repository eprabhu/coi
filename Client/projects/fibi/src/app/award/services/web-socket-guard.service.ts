import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { WebSocketService } from '../../common/services/web-socket.service';

@Injectable()
export class WebSocketGuardService {

  constructor(public webSocket: WebSocketService) { }
  resolve(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Promise<boolean> {
    return new Promise<boolean>(async (resolve) => {
      if (route.queryParamMap.get('awardId')) {
        this.webSocket.isModuleLocked('Award', route.queryParamMap.get('awardId')).then(() => resolve(true));
      } else {
        resolve(true);
      }
    });
  }
}
