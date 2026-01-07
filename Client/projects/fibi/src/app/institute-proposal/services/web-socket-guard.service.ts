import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { WebSocketService } from '../../common/services/web-socket.service';
@Injectable()
export class WebSocketGuardService {

	constructor(
		public webSocket: WebSocketService) { }

	resolve(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Promise<boolean> {
		return new Promise<boolean>(async (resolve) => {
			if (route.queryParamMap.get('instituteProposalId')) {
             this.webSocket.isModuleLocked('IP', route.queryParamMap.get('instituteProposalId')).then(() => resolve(true));
			} else {
				resolve(true);
			}
		});
	}

}
