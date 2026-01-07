/**
 * custom navigation controller for fibi
 * Author Mahesh Sreenath V M
 * this will acts a wrapper around application navigation and scroll into view.
 * this custom navigation uses 'Route-config.ts' as its base.
 */

import { Injectable } from '@angular/core';
import { Router, NavigationEnd, RouteConfigLoadStart, RouteConfigLoadEnd, GuardsCheckEnd } from '@angular/router';
import { routeConfigurations } from '../utilities/route-config';
import { scrollIntoView } from '../utilities/custom-utilities';
import { CommonService } from './common.service';
/**
 * this will control all the route configurations inside fibi. we take path details from
 * route config and use that data to either navigate or scroll items into view.
 * to enable this feature we can inject this service into required components and call
 * "navigateToDocumentRoutePath()" method.
 * the logic I have used here is that the every component will have an unique id field  which
 * will represent its presents in screen if the id is available the function will scroll the
 * element into view. otherwise we will navigate to the configured route and then scroll
 * to that particular element. this service will also handle the functionality of showing loader
 * on module load.
 * main path - the value mentioned as key in route-config.ts.
 * sub path - the subsection inside a given path
 * logic . if main path is available then we simply scroll the sub path into view
 * else navigate to mun path ad scroll to sub path.
 */
@Injectable()
export class NavigationService {

    currentSubPath = '';
    currentURL = '';
    previousURL = '';
    navigationGuardUrl = '';


    constructor(private _router: Router, public _commonService: CommonService) {
        this.routerEventSubscription();
    }
    /**
     * this event listens to angular router events.
     * a timeout is used to trick the scroll into view function to be executed in to next
     * stack instance.
     */
    routerEventSubscription() {
        this._router.events.subscribe(event => {
            this._commonService.isManualLoaderOn = false;
            if (event instanceof RouteConfigLoadStart) {
                this._commonService.isShowLoader.next(true);
            }
            if (event instanceof RouteConfigLoadEnd) {
                this._commonService.isShowLoader.next(false);
            }
            if (event instanceof NavigationEnd) {
                this.setCurrentSubTabForModules(event);
                this._commonService.isPreventDefaultLoader = false;
                this.previousURL = this.currentURL;
                this.currentURL = event.url;
                setTimeout(() => {
                    this.currentSubPath ? scrollIntoView(this.currentSubPath) : this.scrollToTop(this._router.url);
                    this.currentSubPath = '';
                });
            }
            if (event instanceof GuardsCheckEnd) {
                this.navigationGuardUrl = event.url;
              }
        });
    }
    /**
     * @param url Automatic scroll on navigation URL is split by '/'
     * the length of array will be % or less than 5 if the component doesn't has its own internal route
     * For example award-budget If scroll to top is executed on award budget sub tab navigation then
     * then user will be forced to scroll down on every tab change.
     * so to avoid this scroll top will be only executed on main router-> module -> module tabs
     * will not work on module tabs -> sub tabs
     */
    scrollToTop(url) {
        if (url.split('/').length <= 5 && !url.includes('budget')) {
            window.scroll(0, 0);
        }
    }

    setCurrentSubTabForModules(event) {
        const proposalSubTabName = sessionStorage.getItem('currentProposalDashboardTab');
        const awardSubTabName = sessionStorage.getItem('currentAwardDashboardTab');
        const agreementSubTab = sessionStorage.getItem('currentAgreementDashboardTab');
        const serviceRequestSubTab = sessionStorage.getItem('currentServiceRequestTab');
        this.removeCurrentTab();
        if (this.awardModulePermission(event) && awardSubTabName) {
            sessionStorage.setItem('currentAwardDashboardTab', awardSubTabName);
        } else if (this.proposalModulePermission(event) && proposalSubTabName) {
            sessionStorage.setItem('currentProposalDashboardTab', proposalSubTabName);
        } else if (this.agreementModule(event) && agreementSubTab) {
            sessionStorage.setItem('currentAgreementDashboardTab', agreementSubTab);
        } else if (this.serviceRequestModulePermission(event) && serviceRequestSubTab) {
            sessionStorage.setItem('currentServiceRequestTab', serviceRequestSubTab);
        }
    }

    /**
     * Remove all Dashboard tabs
     */
    removeCurrentTab() {
        sessionStorage.removeItem('currentProposalDashboardTab');
        sessionStorage.removeItem('currentAwardDashboardTab');
        sessionStorage.removeItem('currentAgreementDashboardTab');
        sessionStorage.removeItem('currentServiceRequestTab');
    }

    /**
     * @param  {} event
     * check whether the current url has 'award' or 'awardList'
     */
    awardModulePermission(event) {
        return event.url.split('/').includes('award') || event.url.split('/').includes('awardList') ? true : false;
    }

    /**
     * @param  {} event
     * check whether the current url has 'proposal' or 'proposalList'
     */
    proposalModulePermission(event) {
        return event.url.split(/[/?]/).includes('proposal') || event.url.split('/').includes('proposalList') ? true : false;
    }

    /**
     * check whether current url has agreement or agreementsList.
     * @param event
     */
    agreementModule(event) {
        return event.url.split('/').includes('agreement') || event.url.split('/').includes('agreementsList') ? true : false;
     }
    /**
     * @param  {} event
     * check whether the current url has 'service request' or 'serviceRequestList'
     */
     serviceRequestModulePermission(event) {
        return event.url.split(/[/?]/).includes('service-request') || event.url.split('/').includes('serviceRequestList') ? true : false;
    }
    /**
     * @param  {string} mainPath
     * @param  {string} subPath
     * @param  {Array<string>} queryParamsValues
     * main path - the value mentioned as key in route-config.ts.
     * sub path - the subsection inside a given path
     * logic . if main path is available then we simply scroll the sub path into view
     * else navigate to mun path ad scroll to sub path.
     */
    navigateToDocumentRoutePath(mainPath: string, subPath: string, queryParamsValues: Array<string>) {
        const pathDetails = routeConfigurations[mainPath];
        const { documentId, route, queryParams } = this.decryptPathDetails(pathDetails);
        const IS_CURRENT_PAGE = document.getElementById(documentId) ? true : false;
        if (IS_CURRENT_PAGE) {
            scrollIntoView(subPath);
        } else {
            this.currentSubPath = subPath;
            this._router.navigate([route], { queryParams: this.configureQueryParams(queryParams, queryParamsValues) });
        }
    }
    /**
     * @param  {} pathDetails
     * decrypts the path details and formats them to required values. # based splitting is used
     */
    decryptPathDetails(pathDetails) {
        const values = pathDetails.split('#');
        const queryParams = values[2].split(',');
        return { documentId: values[0], route: values[1], queryParams };
    }
    /**
     * @param  {Array<string>} queryParamKeys
     * @param  {Array<any>} queryParamValues
     * a query param value mapper used to append values to the query params. takes value as array and
     * keys as array they will be in order so we basically set a[0] = b[0]. if queryParamValues[x] is true
     */
    configureQueryParams(queryParamKeys: Array<string>, queryParamValues: Array<any>) {
        queryParamValues = this.convertQueryParamValueToArray(queryParamValues);
        const QUERY_PARAMS = {};
        queryParamValues.forEach((value, index) => {
            if (value) {
                QUERY_PARAMS[queryParamKeys[index]] = value;
            }
        });
        return QUERY_PARAMS;
    }
    /**
     * @param  {} queryParamValues
     * converts to array if the type is not array in single value query params developer will be giving a
     * string or number as input that is why this function is written
     */
    convertQueryParamValueToArray(queryParamValues) {
        return Array.isArray(queryParamValues) ? queryParamValues : [queryParamValues];
    }

}
