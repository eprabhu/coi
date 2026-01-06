import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class DashboardData {
    dashboardPieChartData: any = {};
    dashboardAreaChartData: any[];
    public dashboardPieChartData1 = new BehaviorSubject<any>( {} );
    dashboardPieChartData1Variable = this.dashboardPieChartData1.asObservable();
    public dashboardAreaChartData1 = new BehaviorSubject<any>( [[]] );
    dashboardAreaChartData1Variable = this.dashboardAreaChartData1.asObservable();

    constructor() { }

    getDashboardPieChartData(): any {
        return this.dashboardPieChartData;
    }

    setDashboardPieChartData( dashboardPieChartData: any ) {
        this.dashboardPieChartData = dashboardPieChartData;
    }

    getdashboardAreaChartData(): any[] {
        return this.dashboardAreaChartData;
    }

    setdashboardAreaChartData( dashboardAreaChartData: any[] ) {
        this.dashboardAreaChartData = dashboardAreaChartData;
    }

    getDashboardPieChartData1() {
        return this.dashboardPieChartData1;
    }

    setDashboardPieChartData1( dashboardPieChartData1: any ) {
        this.dashboardPieChartData1.next( dashboardPieChartData1 );
    }

    getDashboardAreaChartData1() {
        return this.dashboardPieChartData1;
    }

    setDashboardAreaChartData1( dashboardAreaChartData1: any ) {
        this.dashboardAreaChartData1.next( dashboardAreaChartData1 );
    }

}
