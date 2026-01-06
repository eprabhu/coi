import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-special-review-details-view',
  templateUrl: './special-review-details-view.component.html',
  styleUrls: ['./special-review-details-view.component.css']
})

export class SpecialReviewDetailsViewComponent implements OnInit {
  @Input() dataVisibilityObj: any = {};
  @Input() result: any = {};
  @Input() helpText: any = {};
  savedSpecialReviewObject: any = {};
  isViewProtocolDetails = false;
  proposalSpecialReviews: any = {};

  constructor() { }

  ngOnInit() {
  }

  showSpecialReviewComment(savedSpecialReviewObject) {
    this.savedSpecialReviewObject.comment = savedSpecialReviewObject.comments;
    this.savedSpecialReviewObject.title = savedSpecialReviewObject.specialReviewType.description;
  }

  viewProtocolDetails(specialReview): void {
    this.isViewProtocolDetails = true;
    this.proposalSpecialReviews = specialReview;
  }

  closeViewModal(event) {
    this.isViewProtocolDetails = event;
    this.proposalSpecialReviews = {};
  }

}
