import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CorporateFamilyTreeComponent } from './corporate-family-tree.component';

describe('CorporateFamilyTreeComponent', () => {
  let component: CorporateFamilyTreeComponent;
  let fixture: ComponentFixture<CorporateFamilyTreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CorporateFamilyTreeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CorporateFamilyTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
