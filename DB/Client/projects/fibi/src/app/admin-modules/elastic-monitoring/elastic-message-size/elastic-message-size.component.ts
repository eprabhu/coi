import { Component, Input, OnInit } from '@angular/core';
import { fadeDown } from '../../../common/utilities/animations';
import { GoogleChartService } from '../../../research-summary-widgets/google-chart.service';
import { ElasticMonitoringService } from '../elastic-monitoring.service';

@Component({
  selector: 'app-elastic-message-size',
  templateUrl: './elastic-message-size.component.html',
  styleUrls: ['./elastic-message-size.component.css'],
  animations: [fadeDown]
})
export class ElasticMessageSizeComponent extends GoogleChartService implements OnInit {

  private chart;
  private axisValues;
  private data;
  @Input() isShowLoader = false;
  messageSize = [];

  constructor(private _elasticMonitoringService: ElasticMonitoringService) {
    super();
  }

  ngOnInit() {
    this.getListOfMessageSize();
  }

  getListOfMessageSize() {
    this._elasticMonitoringService.$elasticMonitoringDetails.subscribe((data: any) => {
      if (data) {
        this.messageSize = data.ElasticQueue.NumberOfMessagesSent || [];
        if (this.messageSize.length > 0) {
          this.googleChartFunction();
        }
      }
    });

  }

  drawGraph() {
    this.data = this.createcolumnChartTable();
    this.data.addColumn('datetime', 'Date');
    this.data.addColumn('number', 'Count');
    this.messageSize.sort((a, b) => a.timestamp - b.timestamp);
    this.messageSize.forEach((ele: any) => {
      this.data.addRows([[new Date(ele.timestamp), ele.sum]]);
    });
    this.axisValues = {
      legend: { position: 'top', alignment: 'start' },
      colors: ['#f1ca3a'],
      hAxis: {
        title: 'Date'
      },
      vAxis: {
        title: 'Count'
      }
    };
    this.chart = this.createLineChart(document.getElementById('elastic_monitoring_line_chart_message_size'));
    this.chart.draw(this.data, this.axisValues);

  }

  onResize(event) {
    if (this.chart) {
      this.chart.draw(this.data, this.axisValues);
    }
  }

}
