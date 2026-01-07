import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { WebSocketService } from '../services/web-socket.service';
import { subscriptionHandler } from '../utilities/subscription-handler';
import { environment } from '../../../environments/environment';

class Message {
	message: string;
	type: 'send';
	user: string;
}

@Component({
	selector: 'app-chatbox',
	templateUrl: './chatbox.component.html',
	styleUrls: ['./chatbox.component.css']
})

export class ChatboxComponent implements OnDestroy {

	isShowChat = true;
	messageArray = [];
	deployMap = environment.deployUrl;
	message = new Message();
	$subscriptions: Subscription[] = [];
	sound = new Audio( this.deployMap + 'assets/alert.mp3');

	constructor(public webSocket: WebSocketService) {
		this.receiveMessage();
	}

	ngOnDestroy() {
		subscriptionHandler(this.$subscriptions);
	}

	sendMessage() {
		if (this.message.message) {
			this.message.type = 'send';
			this.webSocket.sendMessage(this.message.message);
			this.messageArray.push(this.message);
			this.message = new Message();
		}
	}

	receiveMessage() {
		this.$subscriptions.push(this.webSocket.selfMessage$.subscribe((message: Message | 'clear') => {
			if (message !== 'clear') {
				this.messageArray.push(message);
				this.isShowChat = true;
				this.sound.play();
			} else {
				this.messageArray = [];
			}
		}));
	}

	preventNewLine(event) {
		event.preventDefault();
	}

}
