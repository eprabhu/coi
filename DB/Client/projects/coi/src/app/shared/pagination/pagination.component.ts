import { Component, OnInit, Input, Output, EventEmitter, OnChanges, ChangeDetectionStrategy } from '@angular/core';

/**
 * Written By Mahesh Sreenath V M
 * this creates a pagination component for your application
 * TODO @self push to git create a readme and link the file here
 */
@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaginationComponent implements OnInit, OnChanges {

  @Input() totalCount = 0;
  @Input() pageCount = 20;
  @Input() defaultCurrentPage = 0;
  @Output() pageChangeEvent: EventEmitter<number> = new EventEmitter<number>();
  currentPage = 1;
  paginationCount = 1;
  paginationList: Array<number> = [];
  lowerLimit = 0;
  upperLimit = 0;

  constructor() { }

  ngOnInit() {
    this.findPaginationCount();
    this.updateCurrentPage(this.defaultCurrentPage ? this.defaultCurrentPage : this.currentPage);
  }

  ngOnChanges() {
    this.findPaginationCount();
  }

  /**  finds the total number of page numbers in rounded figure. */
  findPaginationCount() {
    if (this.totalCount > this.pageCount) {
      this.paginationCount = Math.floor(this.totalCount / this.pageCount + (this.totalCount % this.pageCount ? 1 : 0));
    } else {
      this.paginationCount = 1;
    }
    this.updateCurrentPage(this.defaultCurrentPage ? this.defaultCurrentPage : 1);
  }

  /**
   * @param  {} currentPage
   * sets the currently selected or currently active page number as current page and
   * shows the required left and right hand side pages from the selected page
   */
  updateCurrentPage(currentPage) {
    if (currentPage) {
      if (currentPage !== this.currentPage) {
        this.currentPage = currentPage;
        this.pageChangeEvent.emit(currentPage);
      }
      this.getPaginationListArray(currentPage);
      if (this.totalCount) { this.updateLowerAndUpperLimit(); }
    }
  }

  /**
   * @param  {} currentPage
   * gets elements into paginationList array based on conditions.
   * if  total number of pages <=5, then the array will shows elements upto the count otherwise,
   * it will finds the pages towards left and right from the selected page.
   */
  getPaginationListArray(currentPage) {
    this.paginationList = [];
     (this.paginationCount <= 5) ? this.getPaginationListArrayBelowFive() : this.getPaginationListArrayMoreThanFive(currentPage);
  }

  getPaginationListArrayBelowFive() {
    if (this.paginationCount <= 5) {
      for (let i = 1; i <= this.paginationCount; i++) {
        this.paginationList.push(i);
      }
    }
  }

  getPaginationListArrayMoreThanFive(currentPage) {
    this.paginationList = this.updatePaginationList(this.findValuesToLeft(currentPage - 1),
    this.findValuesToRight(currentPage + 1), currentPage);
  }

  updatePaginationList(leftArray: Array<number>, rightArray: Array<number>, currentPage: number) {
    if (currentPage !== 1 && currentPage !== this.paginationCount) {
      leftArray.push(currentPage);
    }
    return [...leftArray, ...rightArray];
  }

  /**
   * @param  {number} value
   * returns the pages which should show towards the left hand side from the selected page.
   */
  findValuesToLeft(value: number) {
    return (value <= 1) ? [1] : value === 2 ? [1, 2] : [1, null, value];
  }

  /**
   * @param  {} value
   * returns the pages which should show towards the right hand side from the selected page.
   */
  findValuesToRight(value) {
    return (value >= this.paginationCount) ?
      [this.paginationCount] : value === this.paginationCount - 1 ?
        [this.paginationCount - 1, this.paginationCount] : [value, null, this.paginationCount];
  }

  /**
   * @param  {} value
   * updates the page and its data based on user input('previous' and 'next' button)
   */
  setCurrentPage(value) {
    this.updateCurrentPage(this.currentPage + value);
  }

  resetCurrentPage(value) {
    this.updateCurrentPage(value);
  }

  /**
   * Calulcates the lower and upper value of range which is to be displayed near pagination.
   * Example, '41 - 60 of 2456 Records' on page 3 as 41 is lowerLimit and 60 is upper limit.
   */
  updateLowerAndUpperLimit() {
    const tempUpperLimit = this.currentPage * this.pageCount;
    this.lowerLimit = (tempUpperLimit - this.pageCount) + 1;
    this.upperLimit = tempUpperLimit > this.totalCount ? this.totalCount : tempUpperLimit;
  }
}
