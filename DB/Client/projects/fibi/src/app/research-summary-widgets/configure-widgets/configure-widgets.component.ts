/**
 * widget images are listed in the object 'imagePaths'
 * the key is the widget id.
 */
import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Subscription } from 'rxjs';

import { environment } from '../../../environments/environment';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { ResearchSummaryWidgetsService } from '../research-summary-widgets.service';
import { CommonService } from '../../common/services/common.service';



@Component({
  selector: 'app-configure-widgets',
  templateUrl: './configure-widgets.component.html',
  styleUrls: ['./configure-widgets.component.css']
})
export class ConfigureWidgetsComponent implements OnChanges, OnDestroy {

  $subscriptions: Subscription[] = [];
  deployMap = environment.deployUrl;
  @Input() widgetLookUpList: any = [];
  @Input() savedWidgetList: any = [];
  @Output() widgetUpdationEvent: EventEmitter<any> = new EventEmitter<any>();
  widgetList: any = [];
  isConfigurationChange = false;
  debounceTimer: any;

  constructor(private _researchSummaryWidgetService: ResearchSummaryWidgetsService,
    public _commonService: CommonService) { }

  ngOnChanges() {
    this.prepareWidgetList();
  }

  prepareWidgetList() {
    this.widgetList = [];
    const LIST = this.getUnsavedWidgetList();
    this.widgetList = [...this.savedWidgetList, ...LIST];
    this.widgetList.forEach(widget => {
      widget.widgetName = widget.widgetName ? widget.widgetName : widget.widgetLookup.widgetName;
      widget.imagePath = widget.imagePath ? widget.imagePath :
       widget.widgetLookup ? widget.widgetLookup.imagePath : null;
      widget.isSelected = widget.selectedWidgetId ? true : false;
      widget.isDisabled = false;
    });
    this.widgetList = this.setSortOrder(this.widgetList);
    this.setPadding();
  }

  /**
   * returns a list of widgets which is the difference of widgetLookUpList & savedWidgetList.
   */
  getUnsavedWidgetList() {
    return JSON.parse(JSON.stringify(this.widgetLookUpList.filter(widget =>
      (this.getIndexOfWidget(this.savedWidgetList, widget.widgetId, 'widgetId') < 0))));
  }

  selectOrDeleteWidget(widget) {
    this.isConfigurationChange = true;
    widget.isSelected = !widget.isSelected;
    widget.isSelected ? this.saveUserSelectedWidget(widget) : this.deleteUserSelectedWidget(widget);
  }

  getSaveWidgetRequestObject(widget) {
    return {
      userSelectedWidget: {
        selectedWidgetId: widget.selectedWidgetId ? widget.selectedWidgetId : null,
        widgetId: widget.widgetId,
        widgetLookup: this.widgetLookUpList.find(widgets => widgets.widgetId === widget.widgetId),
        sortOrder: widget.sortOrder,
        personId: this._commonService.getCurrentUserDetail('personID')
      }
    };
  }

  saveUserSelectedWidget(widget) {
    if (!widget.selectedWidgetId) {
      widget.isDisabled = true;
      this.$subscriptions.push(this._researchSummaryWidgetService.saveUserSelectedWidget(this.getSaveWidgetRequestObject(widget))
        .subscribe((data: any) => {
          this.savedWidgetList.push(data.userSelectedWidget);
          data.userSelectedWidget.widgetName = widget.widgetName ? widget.widgetName : widget.widgetLookup.widgetName;
          data.userSelectedWidget.imagePath = widget.imagePath ? widget.imagePath :
          widget.widgetLookup ? widget.widgetLookup.imagePath : null;
          data.userSelectedWidget.isSelected = data.userSelectedWidget.selectedWidgetId ? true : false;
          data.userSelectedWidget.isDisabled = false;
          data.userSelectedWidget.isPadding =  widget.isPadding;
          this.widgetList[this.getIndexOfWidget(this.widgetList, widget.widgetId, 'widgetId')] = data.userSelectedWidget;
          this.setPadding();
        }));
    }
  }

  deleteUserSelectedWidget(widget) {
    if (widget.selectedWidgetId) {
      widget.isDisabled = true;
      this.$subscriptions.push(this._researchSummaryWidgetService.deleteUserSelectedWidget(widget.selectedWidgetId)
        .subscribe((data: any) => {
          this.savedWidgetList.splice(this.getIndexOfWidget(this.savedWidgetList, widget.selectedWidgetId, 'selectedWidgetId'), 1);
          this.widgetList[this.getIndexOfWidget(this.widgetList, widget.selectedWidgetId, 'selectedWidgetId')].selectedWidgetId = null;
          widget.isDisabled = false;
          this.setPadding();
        }));
    }
  }

  getIndexOfWidget(list, id, key) {
    return list.findIndex(widget => widget[key] && widget[key] === id);
  }

  drop(event: CdkDragDrop<string[]>) {
    this.isConfigurationChange = true;
    moveItemInArray(this.widgetList, event.previousIndex, event.currentIndex);
    this.setPadding();
    this.updateWidgetSortOrder();
  }

  setPadding() {
    let count = 0;
    this.widgetList.forEach((widget) => {
      const SIZE = widget.size ? widget.size : widget.widgetLookup ? widget.widgetLookup.size : null;
      count = SIZE !== 'L' && widget.selectedWidgetId  ? count + 1 : count % 2 !== 0 && widget.selectedWidgetId ? count + 3 : count + 2;
      widget.isPadding = (count % 2 !== 0 || SIZE === 'L' || !widget.selectedWidgetId) ? false : true;
    });
  }

  updateWidgetSortOrder() {
    let list = this.widgetList.filter(widget => widget.selectedWidgetId);
    list = list.map(({ isSelected, widgetName, imagePath, isDisabled, isPadding, ...widget }) => widget);
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.$subscriptions.push(this._researchSummaryWidgetService.updateWidgetSortOrder({ userSelectedWidgets: this.setSortOrder(list) })
        .subscribe((data: any) => {
          this.savedWidgetList = data.userSelectedWidgets;
        }));
    }, 1000);
  }

  /**
   * @param  {} list
   * sort order is 1,2, 3...
   * so it is updated as index+1;(since index starts from 0)
   */
  setSortOrder(list) {
    list.map((item, index) => item.sortOrder = index + 1);
    return list;
  }

  updateDashboard() {
    if (this.isConfigurationChange) {
      this.widgetUpdationEvent.emit(this.savedWidgetList);
      this.isConfigurationChange = false;
    }
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

}
