import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { WebSocketService } from '../../common/services/web-socket.service';

@Injectable()
export class WebSocketGuardService implements Resolve<any> {

	constructor(
		public webSocket: WebSocketService) { }

	resolve(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Promise<boolean> {
		return new Promise<boolean>(async (resolve, reject) => {
			if (route.queryParamMap.get('proposalId')) {
				this.webSocket.isModuleLocked('Proposal', route.queryParamMap.get('proposalId')).then(() => resolve(true));
			} else {
				resolve(true);
			}
		});
	}

}
