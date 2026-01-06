import { CommonService } from './../../../../common/services/common.service';
import { Component, Input } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { ProposalHomeService } from '../../proposal-home.service';
import { environment } from '../../../../../environments/environment';
import { getOrganizationAddress } from '../../../../common/utilities/custom-utilities';

@Component({
    selector: 'app-organization-view',
    templateUrl: './organization-view.component.html',
    styleUrls: ['./organization-view.component.scss'],
})
export class OrganizationViewComponent {
    @Input() result: any = {};

    viewOrganizationDetails: any = {};
    viewContactDetails: any = {};
    deployMap = environment.deployUrl;
    $subscriptions: Subscription[] = [];
    isCollapse = true;

    isRolodexViewModal = false;
    type = 'ROLODEX';
    isTraining = false;
    id: string;
    personDescription: string;
    trainingStatus: string;
    getOrganizationAddress = getOrganizationAddress;
    constructor(public _proposalService: ProposalHomeService, public _commonService: CommonService) {}

    getOrganizationDetails(index: number) {
        this.viewOrganizationDetails = this.result.proposalOrganizations[index];
    }

    getContactDetails(rolodexId) {
        this.isRolodexViewModal = true;
        this.personDescription = null;
          this.id = rolodexId;
          this.type = 'ROLODEX';
    }
    setPersonRolodexModalView(personRolodexObject) {
        this.isRolodexViewModal = personRolodexObject.isPersonRolodexViewModal;
      }

    getFullAddress(data: any) {
        let fullAddress;
            if (data.rolodex.addressLine1) {
                fullAddress = data.rolodex.addressLine1;
            } else if (data.rolodex.addressLine1 && data.rolodex.addressLine2) {
                fullAddress =  (data.rolodex.addressLine1 + ',' + ' ' + data.rolodex.addressLine2 );
            } else if (data.rolodex.addressLine1 && data.rolodex.addressLine2 && data.rolodex.addressLine3) {
                fullAddress =  (data.rolodex.addressLine1 + ',' + ' ' + data.rolodex.addressLine2 + ',' + ' ' + data.rolodex.addressLine3);
            } else {
                fullAddress = null;
            }
            return fullAddress;
        }

        /** default organization types which will be added on proposal creation are
         * 'Proposal Organization' (type code-1) & 'Performing Organization' (type code-2)*/
        isDefaultOrganizationType(orgTypeCode: string) {
            return ['1', '2'].includes(orgTypeCode);
        }
    }

