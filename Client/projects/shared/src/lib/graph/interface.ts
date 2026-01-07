export class GraphData {
    nodes: Array<any> = [];
    links: Array<any> = [];
}

export interface GraphEvent {
    index: number;
    clientX: number;
    clientY: number;
}

export class GraphDetail {
    id: string;
    visible: boolean;
    name: string;
}

export class GraphConfiguration {
    nodes: any = {};
    relations: any = {};
}

export class GraphDataRO {
    node: string;
    value: string;
    relationship: Array<string>;
}

export interface TooltipEvent {
    index: number;
    clientX: number;
    clientY: number;
    type: string;
    source: string;
    target: string;
}

export class EventHistoryItem {
    eventId: string;
    eventName: string;
    nodeName: string;
    relationId: string;
    relations: Array<string> = [];
    elementId: string;
}
export const WIDTH = 1000;
export const HEIGHT = 800;
export const DISTANCE_BTN_NODES = 75;
export const FORCE_BTN_NODES = -500;

export const JSON_MAPPING = {
    101: './assets/graph/entity-graph.json'
};
