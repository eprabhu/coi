import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EntityCorporateFamilyComponent } from './entity-corporate-family.component';


describe('EntityCorporateFamilyComponent', () => {
  let component: EntityCorporateFamilyComponent;
  let fixture: ComponentFixture<EntityCorporateFamilyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EntityCorporateFamilyComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EntityCorporateFamilyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
