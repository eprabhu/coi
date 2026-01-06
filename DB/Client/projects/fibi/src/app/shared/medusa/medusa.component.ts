import { MedusaService } from './medusa.service';
import { Component, OnInit, Input, OnChanges, OnDestroy } from '@angular/core';
import { forkJoin, Subscription } from 'rxjs';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';

@Component({
  selector: 'app-medusa',
  templateUrl: './medusa.component.html',
  styleUrls: ['./medusa.component.css']
})
export class MedusaComponent implements OnInit, OnChanges, OnDestroy {
  treeData: any = [];
  selectedNode: any;
  isNegotiation = false;
  isAward = false;
  isdev = false;
  isip = false;
  isGrant = false;
  medusaId: any;
  medusaDetails: any = {};
  @Input() medusa: any = {};
  detail: any;
  medusaResult: any;
  $subscriptions: Subscription[] = [];
  getServiceRequestList: any = [];
  collapseServiceRequest: any = {};
  noDataLabel = 'No data available';

  constructor(private _medusaService: MedusaService) { }

  ngOnInit() {
    this.getMedusaHierarchy().then(data => {
      this.medusaDetails.projectNumber = this.treeData[0].projectNumber;
      this.medusaDetails.moduleName = this.treeData[0].moduleName;
      this.viewUnitDetails(this.treeData[0]);
    }).catch(e => console.log(e));
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }
  getMedusaHierarchy() {
    return new Promise((resolve, reject) => {
      this.$subscriptions.push(this._medusaService.getContentJSON(this.medusa).subscribe(data => {
        this.treeData = data;
        this.openAllNodes(this.treeData);
        resolve(true);
      }, (err) => {
        this.treeData = [];
        reject(false);
      }));
    });
  }

  ngOnChanges() { }

  /**
 * @param  {} event
 * @param  {} node
 * Accordion functionality on clicking a specific node
 */
  listClick(event, node) {
    this.selectedNode = node;
    node.visible = !node.visible;
    event.stopPropagation();
  }
  /**
   * @param  {} nodes
   * Expand every nodes in the treeview
   */
  openAllNodes(nodes) {
    nodes.forEach(node => {
      node.visible = true;
      if (node.childUnits) {
        this.openAllNodes(node.childUnits);
      }
    });
  }
  /**
   * @param  {} node\
   * view the details of the selected node
   */
  viewUnitDetails(node) {
    if (node.projectNumber === null) {
      return;
    }
    this.highlightNode(node);
    this.medusaDetails.projectNumber = node.projectNumber;
    this.medusaDetails.moduleName = node.moduleName;
    this.medusa.moduleCode = node.moduleCode;
    this.medusa.projectId = node.projectNumber;
    this.getMedusaDetailsWithSR(node);
  }

  private getMedusaDetailsWithSR(node: any) {
    this.$subscriptions.push(forkJoin(this._medusaService.getMedusaDetails(this.medusaDetails),
      this._medusaService.getServiceRequestDetailsForMedusaByModule(this.medusa)).subscribe((data: any) => {
        this.medusaResult = data[0];
        this.getServiceRequestList = data[1];
        if (this.getServiceRequestList.length === 1) {
          this.collapseServiceRequest[this.getServiceRequestList[0].serviceRequestId] = true;
        }
        this.isNegotiation = (node.moduleName === 'NEGO') ? true : false;
        this.isAward = (node.moduleName === 'AWD') ? true : false;
        this.isip = (node.moduleName === 'IP') ? true : false;
        this.isdev = (node.moduleName === 'PD') ? true : false;
        this.isGrant = (node.moduleName === 'GRANT') ? true : false;
        this.getServiceRequestList.projectId = this.medusaDetails.projectNumber;
        this.getServiceRequestList.moduleCode = this.medusaDetails.moduleCode;
      }));
  }

  /**
  * @param  {} medusaId
  * highlight it on selecting specific node
  */
  highlightNode(node) {
    if (document.getElementsByClassName('highlight-node')[0]) {
      document.getElementsByClassName('highlight-node')[0].classList.remove('highlight-node');
    }
    setTimeout(() => {
      this.medusaId = document.getElementById(node.moduleName + node.projectNumber);
      if (this.medusaId !== null) { this.medusaId.classList.add('highlight-node'); }
    }, 0);
  }

  setProposalTab() {
    localStorage.setItem('currentTab', 'PROPOSAL_REVIEW');
  }

  collapseCriteria(id, flag) {
    this.collapseServiceRequest = {};
    this.collapseServiceRequest[id] = !flag;
  }

}
