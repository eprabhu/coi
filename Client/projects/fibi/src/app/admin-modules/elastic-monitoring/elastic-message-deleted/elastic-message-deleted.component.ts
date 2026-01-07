import { Component, Input, OnInit } from '@angular/core';
import { fadeDown } from '../../../common/utilities/animations';
import { GoogleChartService } from '../../../research-summary-widgets/google-chart.service';
import { ElasticMonitoringService } from '../elastic-monitoring.service';

@Component({
  selector: 'app-elastic-message-deleted',
  templateUrl: './elastic-message-deleted.component.html',
  styleUrls: ['./elastic-message-deleted.component.css'],
  animations: [fadeDown]
})
export class ElasticMessageDeletedComponent extends GoogleChartService implements OnInit {

  private chart;
  private axisValues;
  private data;
  @Input() isShowLoader = false;
  messageDeleted = [];

  constructor(private _elasticMonitoringService: ElasticMonitoringService) {
    super();
  }

  ngOnInit() {
    this.getListOfMessageDeleted();
  }

  getListOfMessageDeleted() {
    this._elasticMonitoringService.$elasticMonitoringDetails.subscribe((data: any) => {
      if (data) {
        this.messageDeleted = data.ElasticQueue.NumberOfMessagesDeleted || [];
        if (this.messageDeleted.length > 0) {
          this.googleChartFunction();
        }
      }
    });
  }

  drawGraph() {
    this.data = this.createcolumnChartTable();
    this.data.addColumn('datetime', 'Date');
    this.data.addColumn('number', 'Count');
    this.messageDeleted.sort((a, b) => a.timestamp - b.timestamp);
    this.messageDeleted.forEach((ele: any) => {
      this.data.addRows([[new Date(ele.timestamp), ele.sum]]);
    });
    this.axisValues = {
      legend: { position: 'top', alignment: 'start' },
      colors: ['#e2431e'],
      hAxis: {
        title: 'Date'
      },
      vAxis: {
        title: 'Count'
      }
    };
    this.chart = this.createLineChart(document.getElementById('elastic_monitoring_line_chart_message_deleted'));
    this.chart.draw(this.data, this.axisValues);

  }

  onResize(event) {
    if (this.chart) {
      this.chart.draw(this.data, this.axisValues);
    }
  }

}
