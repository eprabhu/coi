// Last updated by Ramlekshmy on 11 August 2020
import { Component, OnInit, Input } from '@angular/core';

@ Component({
  selector: 'app-declaration-details-view',
  templateUrl: './declaration-details-view.component.html',
  styleUrls: ['./declaration-details-view.component.css']
})
export class DeclarationDetailsViewComponent implements OnInit {
  @ Input() result: any = {};
  @Input() helpText: any = {};

  constructor() { }

  ngOnInit() { }

}
