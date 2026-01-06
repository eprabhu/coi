/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { SponsorHierarchyTreeviewComponent } from './Sponsor-hierarchy-treeview.component';

describe('SponsorHierarchyTreeviewComponent', () => {
  let component: SponsorHierarchyTreeviewComponent;
  let fixture: ComponentFixture<SponsorHierarchyTreeviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SponsorHierarchyTreeviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SponsorHierarchyTreeviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
