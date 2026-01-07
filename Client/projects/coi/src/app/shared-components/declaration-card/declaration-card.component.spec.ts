import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeclarationCardComponent } from './declaration-card.component';

describe('DeclarationCardComponent', () => {
    let component: DeclarationCardComponent;
    let fixture: ComponentFixture<DeclarationCardComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [DeclarationCardComponent]
        })
            .compileComponents();

        fixture = TestBed.createComponent(DeclarationCardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
