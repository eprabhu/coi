import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-declaration-view',
  templateUrl: './declaration-view.component.html',
  styleUrls: ['./declaration-view.component.css']
})
export class DeclarationViewComponent implements OnInit {
  @Input() externalProjectDetails: any = {};
  constructor() { }

  ngOnInit() {
  }

}
