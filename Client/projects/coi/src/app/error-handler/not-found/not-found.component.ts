import { Component, OnInit } from '@angular/core';
import { Router} from '@angular/router';
import { NavigationService } from '../../common/services/navigation.service';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss']
})
export class NotFoundComponent implements OnInit {

  constructor(public router: Router, private _navigationService: NavigationService) {}

  ngOnInit() {
  }

    navigateBack() {
      this.router.navigateByUrl(this._navigationService.previousURL);
    }

}
