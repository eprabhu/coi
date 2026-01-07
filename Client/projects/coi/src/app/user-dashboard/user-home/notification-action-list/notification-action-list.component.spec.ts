/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { NotificationActionListComponent } from './notification-action-list.component';

describe('NotificationActionListComponent', () => {
	let component: NotificationActionListComponent;
	let fixture: ComponentFixture<NotificationActionListComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [NotificationActionListComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(NotificationActionListComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
