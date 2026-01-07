import { Injectable, OnInit } from '@angular/core';

declare var google: any;

@Injectable()
export class GoogleChartService implements OnInit {

    private static googleLoaded: any;

    constructor() { }

    getGoogle() {
        return google;
    }

    ngOnInit() { }

    googleChartFunction() {
        if (!GoogleChartService.googleLoaded) {
            GoogleChartService.googleLoaded = true;
            google.charts.load('current', { packages: ['corechart', 'bar', 'line'] });
        }
        google.charts.setOnLoadCallback(() => this.drawGraph());
    }

    drawGraph() { }

    createAreaChart(element: any): any {
        if (element) {
            return new google.visualization.AreaChart(element);
        }
    }

    createDataTable(array: any[]): any {
        if (array) {
            return new google.visualization.arrayToDataTable(array);
        }
    }

    createPiChart(element: any): any {
        if (element) {
            return new google.visualization.PieChart(element);
        }
    }

    createBarChart(element: any): any {
        if (element) {
            return new google.visualization.ColumnChart(element);
        }
    }
    createcolumnChartTable() {
        return new google.visualization.DataTable();
    }

    createLineChart(element: any): any {
        if (element) {
            return new google.visualization.LineChart(element);
        }
    }
}
