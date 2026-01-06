import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-person-rolodex-details',
  templateUrl: './person-rolodex-details.component.html',
  styleUrls: ['./person-rolodex-details.component.css']
})
export class PersonRolodexDetailsComponent implements OnInit {
  @Input() selectedPersonDetails;
  constructor() { }

  ngOnInit() {
  }

}
