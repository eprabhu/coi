import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdditionalAddressesComponent } from './additional-addresses.component';

describe('AdditionalAddressesComponent', () => {
  let component: AdditionalAddressesComponent;
  let fixture: ComponentFixture<AdditionalAddressesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdditionalAddressesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdditionalAddressesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
