import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntitySponsorComponent } from './entity-sponsor.component';

describe('EntitySponsorComponent', () => {
    let component: EntitySponsorComponent;
    let fixture: ComponentFixture<EntitySponsorComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [EntitySponsorComponent]
        })
            .compileComponents();

        fixture = TestBed.createComponent(EntitySponsorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
