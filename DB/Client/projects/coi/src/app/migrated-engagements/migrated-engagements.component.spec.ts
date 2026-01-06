import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MigratedEngagementsComponent } from './migrated-engagements.component';

describe('MigratedEngagementsComponent', () => {
  let component: MigratedEngagementsComponent;
  let fixture: ComponentFixture<MigratedEngagementsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MigratedEngagementsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MigratedEngagementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
