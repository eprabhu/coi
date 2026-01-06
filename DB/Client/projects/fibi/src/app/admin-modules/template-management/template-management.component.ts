import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-template-management',
  templateUrl: './template-management.component.html',
  styleUrls: ['./template-management.component.css']
})
export class TemplateManagementComponent implements OnInit, OnDestroy {

  constructor() { }

  ngOnInit() {
  }
  ngOnDestroy() {
    localStorage.removeItem('agreementType');
  }

}
