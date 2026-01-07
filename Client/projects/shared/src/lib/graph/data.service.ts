import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';
import { GraphDataRO, JSON_MAPPING } from './interface';
import * as d3 from 'd3';

@Injectable()
export class DataService {

    graphMetaData: any = {};
    graphTypeConfiguration: any = {};
    configSubscription: Subscription;
    links: any;
    nodes: any;
    openDetailsEvent = new Subject();
    constructor(private _http: HttpClient) { }

    getDataForGraph(RO: GraphDataRO): Promise<any> {
        return new Promise((resolve, reject) => {
            this.configSubscription = this.graphDataAPI(RO)
            .subscribe((response: any) => {
                resolve(response);
            }, err => {
                reject(true);
            });
        });
    }

    getMetaDataForGraph(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.configSubscription = this.graphMetaDataAPI()
                .subscribe((data: any) => {
                    this.graphMetaData = data;
                    resolve(true);
                }, err => {
                    reject(true);
                });
        });
    }

    getGraphConfiguration(graphId): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.configSubscription = this.configurationAPI(graphId)
            .subscribe(data => {
                this.graphTypeConfiguration = data;
                resolve(true);
            }, err => {
                reject(true);
            });

        });
    }

    private configurationAPI(graphId) {
        const url = JSON_MAPPING[graphId];
        return this._http.get(url);
    }

    private graphDataAPI(RO: GraphDataRO): Observable<any> {
        return this._http.post( this.graphTypeConfiguration.end_point, RO);
    }

    private graphMetaDataAPI() {
        return this._http.get('assets/graph/graph-config.json');
    }

    assignArrowheadToGraphLinks(svg: d3.Selection<d3.BaseType, any, any, any>): d3.Selection<d3.BaseType, any, any, any> {
        // see if we can attach different markers for each link from graph config jus like images below.
        // if we do so we need to make necessary chnages to the link function also.
        svg.append('defs').append('marker')
            .attr('id', `arrow`)
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', 60)
            .attr('refY', 0)
            .attr('markerWidth', 4)
            .attr('markerHeight', 4)
            .attr('orient', 'auto')
            .attr('class', 'arrow')
            .append('svg:path')
            .attr('d', 'M0,-5L10,0L0,5');
        return svg;
    }

    setImageMarkersForGraph(svg: d3.Selection<d3.BaseType, any, any, any>): d3.Selection<d3.BaseType, any, any, any> {
        for (const node in this.graphMetaData.nodes) {
            if (node) {
                svg.append('defs').append('svg:pattern')
                    .attr('id', node)
                    .attr('width', 5)
                    .attr('height', 5)
                    .append('svg:image')
                    .attr('width', 30)
                    .attr('height', 30)
                    .attr('x', 5)
                    .attr('y', 5)
                    .attr('xlink:href', d => this.getLinkForImage(node));
            }
        }
        if (this.graphMetaData.additionalImages) {
            this.graphMetaData.additionalImages.forEach( N => {
                svg.append('defs').append('svg:pattern')
                        .attr('id', N.id)
                        .attr('width', 5)
                        .attr('height', 5)
                        .append('svg:image')
                        .attr('width', 30)
                        .attr('height', 30)
                        .attr('x', 5)
                        .attr('y', 5)
                        .attr('xlink:href', d => this.getLinkForAdditionalImage(N.image));
            });
        }
        return svg;
    }

    getLinkForImage(node): string {
        return window.location.origin + window.location.pathname + this.graphMetaData.nodes[node].image;
    }

    private getLinkForAdditionalImage(imageURL): string {
        return window.location.origin + window.location.pathname + imageURL;
    }

    openRedirectionPath(node, id) {
        const LINK_TYPE = this.graphMetaData.nodes[node].linkType;
        const ORIGIN_URL = this.graphMetaData.externalLinks[LINK_TYPE];
        window.open(ORIGIN_URL + this.graphMetaData.nodes[node].openLink + id);
    }

}
