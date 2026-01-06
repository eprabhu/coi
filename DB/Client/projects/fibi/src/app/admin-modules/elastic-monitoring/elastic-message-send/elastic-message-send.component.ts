import { Component, Input, OnInit } from '@angular/core';
import { fadeDown } from '../../../common/utilities/animations';
import { GoogleChartService } from '../../../research-summary-widgets/google-chart.service';
import { ElasticMonitoringService } from '../elastic-monitoring.service';

@Component({
  selector: 'app-elastic-message-send',
  templateUrl: './elastic-message-send.component.html',
  styleUrls: ['./elastic-message-send.component.css'],
  animations: [fadeDown]
})
export class ElasticMessageSendComponent extends GoogleChartService implements OnInit {

  private chart;
  private axisValues;
  private data;
  @Input() isShowLoader = false;
  messageSended = [];
  constructor(private _elasticMonitoringService: ElasticMonitoringService) {
    super();
  }

  ngOnInit() {
    this.getListOfMessageSended();
  }
  getListOfMessageSended() {
    this._elasticMonitoringService.$elasticMonitoringDetails.subscribe((data: any) => {
      if (data) {
        this.messageSended = data.ElasticQueue.NumberOfMessagesSent || [];
        if (this.messageSended.length > 0) {
          this.googleChartFunction();
        }
      }

    });
  }

  drawGraph() {
    this.data = this.createcolumnChartTable();
    this.data.addColumn('datetime', 'Date');
    this.data.addColumn('number', 'Count');
    this.messageSended.sort((a, b) => a.timestamp - b.timestamp);
    this.messageSended.forEach((ele: any) => {
      this.data.addRows([[new Date(ele.timestamp), ele.sum]]);
    });
    this.axisValues = {
      legend: { position: 'top', alignment: 'start' },
      hAxis: {
        title: 'Date'
      },
      vAxis: {
        title: 'Count'
      }
    };
    this.chart = this.createLineChart(document.getElementById('elastic_monitoring_line_chart_message_send'));
    this.chart.draw(this.data, this.axisValues);

  }

  onResize(event) {
    if (this.chart) {
      this.chart.draw(this.data, this.axisValues);
    }
  }

}
