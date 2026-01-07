import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { Observable, Subject, interval } from 'rxjs';
import { DataService } from './data.service';
import * as d3 from 'd3';
import { GraphEvent, GraphDetail, GraphDataRO, HEIGHT, WIDTH, DISTANCE_BTN_NODES, FORCE_BTN_NODES, EventHistoryItem, TooltipEvent } from './interface';
import { debounce } from 'rxjs/operators';
class RedirectionClass {
    node: string;
    id: number | string;
}

export type GraphActionTypes = 'MODAL_CLOSE';
export type GraphAction = { actionType: GraphActionTypes, content?: any };
@Component({
    selector: 'app-graph',
    templateUrl: './graph.component.html',
    styleUrls: ['./graph.component.scss'],
    providers: [DataService]
})
export class GraphComponent implements OnInit {

    @Input() graphEnableEvent: Observable<GraphDetail>;
    @Input() graphId: string | number;

    @Output() emitGraphModalActions = new EventEmitter<GraphAction>();

    graphDetail: GraphDetail = new GraphDetail();
    graphNodeEvents = new Subject<GraphEvent>;
    graphTooltipEvents = new Subject<TooltipEvent>;
    popOverEvents = new Subject<boolean>;
    openTooltipEvent = new Subject<boolean>;
    popOverPositions = {
        clientX: 0,
        clientY: 0,
        popoverHeight: 400,
        popoverWidth: 500,
        containerWidth: 0,
        containerHeight: 0
    };
    selectedRelations: any = {};
    cardData: any = {};
    relations = [];
    height = HEIGHT;
    width = WIDTH;
    graph = { nodes: [], links: [] };
    svg;
    simulation;
    link;
    node;
    zoom;
    isShowFilter = false;
    eventHistory: Array<EventHistoryItem> = [];
    eventData: any = {};
    selectedEventIndex = 0;
    showtimeLine = false;
    tooltipPositionDetails = {
        clientX: 0,
        clientY: 0,
        popoverHeight: 400,
        popoverWidth: 500,
        containerWidth: 0,
        containerHeight: 0,
        index: null,
        type: ''
    };
    $debounceEventForTooltip = new Subject();
    @HostListener('document:keydown.escape', ['$event'])
    handleEscapeEvent(event: any): void {
        if ((event.key === 'Escape' || event.key === 'Esc')) {
            this.emitGraphModalActions.next({ actionType: 'MODAL_CLOSE', content: {closeTrigger : 'ESCAPE'} });
        }
    }

    constructor(public graphDataService: DataService) { }

    async ngOnInit(): Promise<any> {
        if (this.graphId) {
            await this.graphDataService.getGraphConfiguration(this.graphId).catch(err => {
                // do something here to handle error and indicate the error.
            });
        }
        await this.graphDataService.getMetaDataForGraph().catch(err => {
            // do something here to handle error and indicate the error.
        });
        this.manageGraphDisplay();
        this.getSearchList();
        this.listenToGraphEvents();
        this.subscribeTooltipEvent();
        this.openDetailsView();
    }

    private manageGraphDisplay(): void {
        this.graphEnableEvent.subscribe(async (data: GraphDetail) => {
            this.graphDetail = data;
            if (data.visible) {
                this.setSVGForGraph();
                this.toggleGraphModal(true);
                const RO: GraphDataRO = this.fetchROForRoot(5);
                const GRAPH_DATA = await this.graphDataService.getDataForGraph(RO);
                const eventName: string = this.setEventName(this.graphDetail.name, this.graphDataService.graphTypeConfiguration.root_name);
                const eventItem: EventHistoryItem = this.setEventItem('root', eventName, RO.relationship, RO.value, null, null);
                this.setEventHistory(eventItem);
                this.selectedEventIndex = this.eventHistory.length - 1;
                this.setEventData(GRAPH_DATA, 'root');
                this.addNodesAndLinks(GRAPH_DATA.nodes, GRAPH_DATA.links);
            } else {
                this.toggleGraphModal(false);
            }
        });
    }

    drawGraph() {
        this.link = this.svg.selectAll('.link').data(this.graph.links);
        this.link.enter()
            .insert('line', '.node')
            .attr('class', 'link')
            .style('stroke', '#d9d9d9')
            .attr('marker-end', 'url(#arrow)')
            .on('mouseover', (event, d) => {
                this.$debounceEventForTooltip.next({'d': d, 'event': event});
            });

        this.node = this.svg.selectAll('.node').data(this.graph.nodes);
        const g = this.node.enter().append('g').attr('class', 'node');

        g.append('circle')
            .style('cursor', 'pointer')
            .attr('r', 20)
            .attr('fill', d => this.getImageURL(d));

        g.append('text')
            .style('font-size', '10px')
            .style('cursor', 'pointer')
            .attr('x', 20)
            .attr('y', '0.50em')
            .text(d => this.getTextForNode(d))
            .clone(true).lower()
            .attr('fill', 'none')
            .attr('stroke', 'white')
            .attr('stroke-width', 2);

        this.node.call(d3.drag()
            .on('start', this.dragStarted.bind(this))
            .on('drag', this.dragged.bind(this))
            .on('end', this.dragEnded.bind(this)))
            .on('click', (event, d) => {
                this.selectedRelations[d.elementId] = this.selectedRelations[d.elementId] || {};
                this.graphNodeEvents.next({ index: d.index, clientX: event.clientX, clientY: event.clientY });
                this.cardData = d;
                this.relations = this.setConnectionsDataForPopUp(d) || [];
            });

        this.link.exit().remove();
        this.node.exit().remove();

        this.simulation.nodes(this.graph.nodes)
            .force('link', d3.forceLink(this.graph.links).distance(100))
            .force('charge', d3.forceManyBody().strength(-500))
            .alpha(0.03)
            .restart();
    }

    getImageURL(node: any): string {
        return `url(#${this.getNodeLabel(node)})`;
    }

    getImageForEntity(node: any): string {
        const LABEL = this.getNodeLabel(node);
        return this.graphDataService.getLinkForImage(LABEL);
    }

    private getNodeLabel(node: any): string {
        if (node.label === 'Entity') {
            if (node.is_sponsor === 'Y' && node.is_organization === 'N') {
                return 'Sponsor';
            } else if (node.is_sponsor === 'N' && node.is_organization === 'Y') {
                return 'Organization';
            } else if (node.is_sponsor === 'Y' && node.is_organization === 'Y') {
                return 'Sponsor_Organization';
            }
        }
        return node.label;
    }

    private setSVGForGraph(): void {
        this.attachZoom();
        this.svg = d3.select('#chart-container').append('svg')
            .attr('viewBox', [-WIDTH / 2.5, -HEIGHT / 3.8, WIDTH, HEIGHT])
            .on('click', (event, d) => {
                this.hideToolTipAndCard();
            })
            .call(this.zoom).append('svg:g');
        this.zoom.scaleTo(this.svg, 1 / 1);
        this.attachStimulation();
        this.graphDataService.setImageMarkersForGraph(this.svg);
        this.graphDataService.assignArrowheadToGraphLinks(this.svg);
    }

    private attachStimulation() {
        this.simulation = d3.forceSimulation()
            .force('link', d3.forceLink(this.graph.links).id((d: any) => d.elementId))
            .force('charge', d3.forceManyBody().strength(FORCE_BTN_NODES))
            .force('center', d3.forceCenter().strength(1))
            .force('x', d3.forceX())
            .force('y', d3.forceY())
            .force('collide', d3.forceCollide(d => DISTANCE_BTN_NODES).strength(0.01))
            .on('tick', () => {
                this.svg.selectAll('.link')
                    .attr('x1', (d) => d.source.x)
                    .attr('y1', (d) => d.source.y)
                    .attr('x2', (d) => d.target.x)
                    .attr('y2', (d) => d.target.y);
                this.svg.selectAll('.node')
                    .attr('cx', (d) => d.x)
                    .attr('cy', (d) => d.y)
                    // tslint:disable-next-line:quotemark
                    .attr('transform', (d) => "translate(" + d.x + "," + d.y + ")");
            });
    }

    hideToolTipAndCard() {
        this.hideTooltip();
        this.hideBasicDetailsPopup();
    }

    private attachZoom() {
        this.zoom = d3.zoom()
            .scaleExtent([1 / 2, 10])
            .on('zoom', d => {
                this.svg.attr('transform', d.transform);
                this.hideToolTipAndCard();
            });
    }

    private dragStarted(event) {
        if (!event.active) { this.simulation.alphaTarget(0.03).restart(); }
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
    }

    private dragged(event, d) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
    }

    private dragEnded(event, d) {
        if (!event.active) { this.simulation.alphaTarget(0); }
        event.subject.fx = null;
        event.subject.fy = null;
    }

    private toggleGraphModal(visible: boolean): void {
        visible ? document.getElementById('d3GraphModalbutton').click() : document.getElementById('graph-modal-dismiss-btn').click();
    }

    private fetchROForRoot(id): GraphDataRO {
        const RO: GraphDataRO = this.getROForGraph(this.graphDataService.graphTypeConfiguration.root_node[0],
            this.graphDetail.id, this.graphDataService.graphTypeConfiguration.root_relations);
        return RO;
    }

    private getROForGraph(node: string, value: string, relations: string[]): GraphDataRO {
        const RO = new GraphDataRO();
        RO.value = value;
        RO.relationship = relations;
        RO.node = node;
        return RO;
    }

    addNodes(node) {
        if (!this.graph.nodes.find(N => N.elementId === node.elementId)) {
            this.graph.nodes.push(node);
            this.drawGraph();
        }
    }

    addLinks(link) {
        if (!this.graph.links.find(L => L.source.elementId === link.source && L.target.elementId === link.target
            && L.type === link.type)) {
            const indexes = this.findSourceAndTargetIndex(link);
            link = { ...link, ...indexes };
            this.graph.links.push(link);
            this.drawGraph();
        }
    }

    addNodesAndLinks(nodes = [], links = []): void {
        nodes.forEach(N => this.addNodes(N));
        links.forEach(L => this.addLinks(L));
    }

    findSourceAndTargetIndex(link): any {
        const source = this.graph.nodes.findIndex(N => N.elementId === link.source);
        const target = this.graph.nodes.findIndex(N => N.elementId === link.target);
        return { source, target };
    }

    private getTextForNode(node): string {
        switch (node.label) {
            case 'Award': return node.award_number;
            case 'COIDisclosure': return node.disclosure_number;
            case 'Country': return node.country_name;
            case 'Entity': return node.name;
            case 'Person': return node.full_name;
            case 'Proposal': return node.title;
            case 'Sponsor': return node.sponsor_name;
            case 'TravelDisclosure': return node.travel_number;
            case 'Unit': return node.unit_name;
        }
    }

    setConnectionsDataForPopUp(node) {
        const data = this.graphDataService.graphTypeConfiguration.relations.find(R => R.node === node.label);
        return data?.relationships;
    }

    private listenToGraphEvents() {
        this.graphNodeEvents.subscribe((data: any) => { this.showBasicDetailsPopup(data); });
    }

    private showBasicDetailsPopup(position) {
        this.popOverPositions.clientX = position.clientX;
        this.popOverPositions.clientY = position.clientY;
        const modal: HTMLElement = document.querySelector('#d3GraphModal');
        this.popOverPositions.containerWidth = modal.offsetWidth;
        this.popOverPositions.containerHeight = modal.offsetHeight;
        this.popOverEvents.next(true);
    }

    async drillDownEvent(event, R): Promise<any> {
        this.hideToolTipAndCard();
        const value = this.getValueForNode(this.cardData);
        const eventId: string = value + R.id;
        let GRAPH_DATA: any;
        if (event.target.checked) {
            if (!this.eventData[eventId]) {
                const RO: GraphDataRO = this.getROForGraph(this.cardData.label, value, R.relation);
                GRAPH_DATA = await this.graphDataService.getDataForGraph(RO);
            } else {
                GRAPH_DATA = this.eventData[eventId];
            }
            const eventName: string = this.setEventName(this.getTextForNode(this.cardData), R.description);
            const eventItem: EventHistoryItem = this.setEventItem(eventId, eventName, R.relation, value, R.id, this.cardData.elementId);
            this.clearCheckBoxSelection();
            this.eventHistory.length = this.selectedEventIndex + 1;
            this.setEventHistory(eventItem);
            this.setEventData(GRAPH_DATA, eventId);
            this.addNodesAndLinks(GRAPH_DATA.nodes, GRAPH_DATA.links);
        } else {
            const index = this.eventHistory.findIndex(E => E.eventId === eventId);
            if (index !== -1) {
                this.setEventHistory(null, index);
            }
            this.graph = { nodes: [], links: [] };
            this.eventHistory.forEach(E => this.addNodesAndLinks(this.eventData[E.eventId].nodes, this.eventData[E.eventId].links));
        }
        this.selectedEventIndex = this.eventHistory.length - 1;
        this.hideBasicDetailsPopup();
    }

    private getValueForNode(node: any): string {
        const valueFiled = this.graphDataService.graphMetaData.nodes[node.label].valueField;
        switch (node.label) {
            case 'Award': return node[valueFiled];
            case 'COIDisclosure': return node[valueFiled];
            case 'Country': return node[valueFiled];
            case 'Entity': return node[valueFiled];
            case 'Person': return node[valueFiled];
            case 'Proposal': return node[valueFiled];
            case 'Sponsor': return node[valueFiled];
            case 'TravelDisclosure': return node[valueFiled];
            case 'Unit': return node[valueFiled];
        }
    }

    private hideBasicDetailsPopup(): void {
        this.popOverEvents.next(false);
    }

    hideTooltip(): void {
        this.openTooltipEvent.next(false);
    }

    clearGraph() {
        document.getElementById('chart-container').innerHTML = '';
        this.graph = { nodes: [], links: [] };
        this.selectedRelations = {};
        this.cardData = {};
        this.eventData = {};
        this.eventHistory = [];
        this.selectedEventIndex = null;
        this.showtimeLine = false;
        this.hideToolTipAndCard();
        this.emitGraphModalActions.next({ actionType: 'MODAL_CLOSE', content: {closeTrigger : 'BUTTON_CLICK'} });
    }

    setEventItem(eventId: string, eventName: string, relations: string[], nodeName: string,
            relationId: string, elementId: string): EventHistoryItem {
        const eventItem = new EventHistoryItem();
        eventItem.eventId = eventId;
        eventItem.eventName = eventName;
        eventItem.nodeName = nodeName;
        eventItem.relations = relations;
        eventItem.relationId = relationId;
        eventItem.elementId = elementId;
        return eventItem;
    }

    setEventName(first: string, second: string): string {
        return first + '  ➜  ' + second;
    }

    setEventData(data, eventId): void {
        this.eventData[eventId] = data;
    }

    setEventHistory(data: EventHistoryItem, index?: number): void {
        (index || index === 0) ? this.eventHistory.splice(index, 1) : this.eventHistory.push(data);
    }

    unlinkFromGraph(event: EventHistoryItem): void {
        this.hideToolTipAndCard();
        const eventIndex = this.eventHistory.findIndex(E => E.eventId === event.eventId);
        this.selectedEventIndex = eventIndex;
        this.graph = { nodes: [], links: [] };
        for (let index = 0; index <= eventIndex; index++) {
            const eventId = this.eventHistory[index].eventId;
            this.addNodesAndLinks(this.eventData[eventId].nodes, this.eventData[eventId].links);
        }
    }

    clearCheckBoxSelection() {
        for (let index = this.selectedEventIndex + 1; index < this.eventHistory.length; index++) {
            const E = this.eventHistory[index];
            this.selectedRelations[E.elementId][E.relationId] = false;
        }
    }

    openDetailsView() {
        this.graphDataService.openDetailsEvent.subscribe((data: RedirectionClass) => {
            if (data) {
                this.graphDataService.openRedirectionPath(data.node, data.id);
            }
        });
    }

    subscribeTooltipEvent() {
        this.graphTooltipEvents.subscribe((data: any) => {
            this.showToolTipDetails(data); });
    }

    getSearchList() {
        this.$debounceEventForTooltip.pipe(debounce(() => interval(80)))
        .subscribe((data: any) => {
            if (data) {
                this.showToolTipDetails({ index: data.d.index, clientX: data.event.clientX,
                     clientY: data.event.clientY, type: this.getType(data) });
            }
        });
    }

    getType(data: any) {
        return data.d.Relationship_Info || data.d.Relationship_type || this.graphDataService.graphMetaData.relations[data.d.type].name;
    }

    showToolTipDetails(data) {
        const modal: HTMLElement = document.querySelector('#d3GraphModal');
        this.tooltipPositionDetails.containerWidth = modal.offsetWidth;
        this.tooltipPositionDetails.containerHeight = modal.offsetHeight;
        this.tooltipPositionDetails.clientX = data.clientX;
        this.tooltipPositionDetails.clientY = data.clientY;
        this.tooltipPositionDetails.type = data.type;
        this.openTooltipEvent.next(true);
    }

    getLinkForAdditionalImage(imageURL): string {
        return window.location.origin + window.location.pathname + imageURL;
    }

}
