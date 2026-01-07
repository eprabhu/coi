import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { CommonService } from './common.service';
import { getPathWithoutParams, getSpecificUrlPart } from '../utilities/custom-utilities';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private _router: Router, public _commonService: CommonService) { }

    async canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
        localStorage.setItem('currentUrl', state.url);
        const authToken = this._commonService.getCurrentUserDetail('Authorization');
        if (authToken) {
            if (!this.isDashboardRouteEnabled(getPathWithoutParams(state.url))) { return false; }
            return await this.isPathRightAccessible(state);
        } else {
            this._router.navigate(['/login']);
            return false;
        }
    }

    private async isPathRightAccessible(state: RouterStateSnapshot): Promise<boolean> {
        if (await this.isPathAllowed(state)) {
            return true;
        } else {
            this._router.navigate(['/fibi/error/403']);
            return false;
        }
    }

    private async isPathAllowed(state: RouterStateSnapshot): Promise<boolean> {
        const path = getPathWithoutParams(getSpecificUrlPart(state.url, 2));
        if (this.isRightCheckingNeeded(path)) { return await this.hasPathRights(path, state); }
        return true;
    }

    private isRightCheckingNeeded(pathName: string): boolean {
        if (!pathName) { return false; }
        const adminDashboardPaths = ['admin-dashboard', 'questionnaire', 'codetable', 'unitHierarchy', 'mapMaintainance',
            'training-maintenance', 'businessRule', 'notification', 'rolodex', 'customdata', 'sponsor-maintenance',
            'user-activity', 'role-maintainance', 'feed-maintenance', 'person', 'sponsor-hierarchy', 'audit-log-report', 'sponsor-report'];
        return adminDashboardPaths.includes(pathName);
    }

    private async hasPathRights(path: string, state: RouterStateSnapshot): Promise<boolean> {
        switch (path) {
            case 'questionnaire': return await this.checkIfRightsPresent(['MAINTAIN_QUESTIONNAIRE']);
            case 'codetable': return await this.checkIfRightsPresent(['APPLICATION_ADMINISTRATOR']);
            case 'unitHierarchy': return await this.checkIfRightsPresent(['APPLICATION_ADMINISTRATOR']);
            case 'mapMaintainance': return await this.checkIfRightsPresent(['APPLICATION_ADMINISTRATOR']);
            case 'businessRule': return await this.checkIfRightsPresent(['APPLICATION_ADMINISTRATOR']);
            case 'notification': return await this.checkIfRightsPresent(['APPLICATION_ADMINISTRATOR']);
            case 'rolodex': return await this.checkIfRightsPresent(['MAINTAIN_ROLODEX']);
            case 'customdata': return await this.checkIfRightsPresent(['APPLICATION_ADMINISTRATOR']);
            case 'sponsor-maintenance': return await this.checkIfRightsPresent(['MAINTAIN_SPONSOR']);
            case 'sponsor-hierarchy': return await this.checkIfRightsPresent(['MAINTAIN_SPONSOR_HIERARCHY']);
            case 'user-activity': return await this.checkIfRightsPresent(['APPLICATION_ADMINISTRATOR']);
            case 'role-maintainance': return await this.checkIfRightsPresent(['MAINTAIN_USER_ROLES', 'MAINTAIN_ROLE']);
            case 'template-management': return await this.checkIfRightsPresent(['AGREEMENT_ADMINISTRATOR']);
            case 'clauses-management': return await this.checkIfRightsPresent(['AGREEMENT_ADMINISTRATOR']);
            case 'training-maintenance': return (await this.checkIfRightsPresent(['APPLICATION_ADMINISTRATOR', 'MAINTAIN_TRAINING'])
                || this.hasFromInParameter(state));
            case 'person': return (await this.checkIfRightsPresent(['APPLICATION_ADMINISTRATOR', 'MAINTAIN_PERSON',
                'MAINTAIN_ORCID_WORKS', 'MAINTAIN_DELEGATION', 'MAINTAIN_KEY_PERSON_TIMESHEET', 'VIEW_KEY_PERSON_TIMESHEET','MAINTAIN_TRAINING'])
                || this.isLoggedInPerson(state));
            case 'feed-maintenance': return await this.checkIfRightsPresent(['MAINTAIN_SAP_FEED', 'VIEW_SAP_FEED', 'MAINTAIN_MANPOWER_FEED',
                'MAINTAIN_INVOICE_FEED', 'VIEW_INVOICE_FEED', 'MAINTAIN_INVOICE_INTERFACE_PROCESSING']);
            case 'admin-dashboard': return await this.checkIfRightsPresent(['MAINTAIN_QUESTIONNAIRE', 'MAINTAIN_ROLODEX', 'MAINTAIN_SPONSOR',
                'APPLICATION_ADMINISTRATOR', 'MAINTAIN_PERSON', 'MAINTAIN_ORCID_WORKS', 'MAINTAIN_SAP_FEED', 'VIEW_SAP_FEED', 'MAINTAIN_MANPOWER_FEED',
                'MAINTAIN_INVOICE_FEED', 'VIEW_INVOICE_FEED', 'MAINTAIN_INVOICE_INTERFACE_PROCESSING', 'MAINTAIN_USER_ROLES', 'MAINTAIN_ROLE', 'MAINTAIN_DELEGATION',
                'AGREEMENT_ADMINISTRATOR', 'MAINTAIN_KEY_PERSON_TIMESHEET', 'VIEW_KEY_PERSON_TIMESHEET', 'MAINTAIN_TRAINING']);
                case 'maintain-external-reviewer' : return await this.checkIfRightsPresent(['MAINTAIN_EXTERNAL_REVIEW']);
                case 'audit-log-report' : return await this.checkIfRightsPresent(['VIEW_AUDIT_LOG']);
                case 'sponsor-report': return await this.checkIfRightsPresent(['APPLICATION_ADMINISTRATOR']);
            default: return true;
        }
    }

    async checkIfRightsPresent(rightsArray: string[]): Promise<boolean> {
        for (const right of rightsArray) {
            if (await this._commonService.checkPermissionAllowed(right)) { return true; }
        }
        return false;
    }

    isLoggedInPerson(state: any) {
        return this._commonService.getCurrentUserDetail('personID') == state._root.value.queryParams.personId;
    }

    hasFromInParameter(state: any) {
        return Boolean(state._root.value.queryParams.from);
    }

    isDashboardRouteEnabled(currentUrl: string) {
        switch (getSpecificUrlPart(currentUrl, 3)) {
            case 'researchSummary': return this.isModuleActive('RS52');
            case 'grantCall': return this.isModuleActive('GC15');
            case 'proposalList': return this.isModuleActive('DP03');
            case 'instituteProposalList': return this.isModuleActive('IP02');
            case 'negotiations': return this.isModuleActive('NE05');
            case 'agreements': return this.isModuleActive('AG13');
            case 'awardList': return this.isModuleActive('AW01');
            case 'requestList': return this.isModuleActive('VR50');
            case 'progressReportList': return this.isModuleActive('PR16');
            case 'claim-list': return this.isModuleActive('CL14');
            case 'report': return this.isModuleActive('RE51');
            default: return this.isModuleRouteEnabled(getSpecificUrlPart(currentUrl, 2));
        }
    }

    isModuleRouteEnabled(currentUrl: string) {
        switch (currentUrl) {
            case 'grant': return this.isModuleActive('GC15');
            case 'proposal': return this.isModuleActive('DP03');
            case 'instituteproposal': return this.isModuleActive('IP02');
            case 'negotiation': return this.isModuleActive('NE05');
            case 'agreement': return this.isModuleActive('AG13');
            case 'award': return this.isModuleActive('AW01');
            case 'service-request': return this.isModuleActive('VR50');
            case 'progress-report': return this.isModuleActive('PR16');
            case 'claims': return this.isModuleActive('CL14');
            default: return true;
        }
    }


    isModuleActive(moduleCode: string): boolean {
        const isActive = this._commonService.dashboardModules[moduleCode].isActive;
        return isActive ? isActive : this._router.navigate(['/fibi/error/404']);
    }
}

@Injectable()
export class LoginGuard implements CanActivate {
    constructor(private _router: Router, public _commonService: CommonService) { }
    canActivate(): boolean {
        if (!this._commonService.enableSSO) {
            return true;
        } else {
            this._router.navigate(['error/401']);
            return false;
        }
}

}
