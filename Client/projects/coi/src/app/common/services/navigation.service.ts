/**
 * custom navigation controller for fibi
 * Author Mahesh Sreenath V M
 * this will acts a wrapper around application navigation and scroll into view.
 * this custom navigation uses 'Route-config.ts' as its base.
 */

import { Injectable } from '@angular/core';
import { Router, NavigationEnd, RouteConfigLoadStart, RouteConfigLoadEnd, GuardsCheckEnd } from '@angular/router';
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
                    // this.currentSubPath ? scrollIntoView(this.currentSubPath) : this.scrollToTop(this._router.url);
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

    /**
     * Sets the current sub-tab in sessionStorage based on the user's permission and available tab values.
     * It first clears the previously stored tab using `removeCurrentTab`, then checks the user's permissions
     * against each tab type, and restores the corresponding tab value if it exists in sessionStorage.
     */
    setCurrentSubTabForModules(event) {
        const COI_ADMIN_TAB = sessionStorage.getItem('currentCOIAdminTab');
        const COI_REVIEW_TAB = sessionStorage.getItem('currentCOIReviewTab');
        const OPA_DASHBOARD_TAB = sessionStorage.getItem('currentOPATab');
        const PROJECT_DASHBOARD_TAB = sessionStorage.getItem('currentProjectDashboardTab');
        const ENTITY_DASHBOARD_TAB = sessionStorage.getItem('currentEntityDashboardTab')
        const REPORTER_DASHBOARD_TAB = sessionStorage.getItem('currentMyDisclosureTab');
        const DECLARATION_DASHBOARD_TAB = sessionStorage.getItem('currentDeclarationAdminTab');
        this.removeCurrentTab();
        if (this.coiPermissionList(event) && COI_ADMIN_TAB) {
            sessionStorage.setItem('currentCOIAdminTab', COI_ADMIN_TAB);
        } else if (this.coiReviewerPermissionList(event) && COI_REVIEW_TAB) {
            sessionStorage.setItem('currentCOIReviewTab', COI_REVIEW_TAB);
        } else if (this.opaDashboardCheck(event) && OPA_DASHBOARD_TAB) {
            sessionStorage.setItem('currentOPATab', OPA_DASHBOARD_TAB);
        } else if (this.projectPermissionList(event) && PROJECT_DASHBOARD_TAB) {
            sessionStorage.setItem('currentProjectDashboardTab', PROJECT_DASHBOARD_TAB);
        } else if (this.entityPermissionList(event) && ENTITY_DASHBOARD_TAB) {
            sessionStorage.setItem('currentEntityDashboardTab' , ENTITY_DASHBOARD_TAB);
        } else if (this.myDisclosureTab(event) && REPORTER_DASHBOARD_TAB) {
            sessionStorage.setItem('currentMyDisclosureTab' , REPORTER_DASHBOARD_TAB);
        } else if (this.declarationPermissionList(event) && DECLARATION_DASHBOARD_TAB) {
            sessionStorage.setItem('currentDeclarationAdminTab' , DECLARATION_DASHBOARD_TAB);
        }
    }

    /**
     * Remove all Dashboard tabs
     */
    removeCurrentTab() {
        sessionStorage.removeItem('currentCOIAdminTab');
        sessionStorage.removeItem('currentCOIReviewTab');
        sessionStorage.removeItem('currentOPATab');
        sessionStorage.removeItem('currentProjectDashboardTab');
        sessionStorage.removeItem('currentEntityDashboardTab');
        sessionStorage.removeItem('currentMyDisclosureTab');
        sessionStorage.removeItem('currentDeclarationAdminTab');
    }
     
    /**
     * @param  {} event
     * check whether the current url has 'coi' or 'coiList'
     */
     coiPermissionList(event) {
        return event.url.split(/[/?]/).includes('disclosure') || event.url.split(/[/?]/).includes('travel-disclosure') || event.url.split(/[/?]/).includes('consulting') || event.url.split('/').includes('management-plan') || event.url.split('/').includes('create-management-plan') || event.url.split('/').includes('admin-dashboard') ? true : false;
    }

    /**
     * @param  {} event
     * check whether the current url has 'disclosure' or 'reviewer-dashboard' and return true so that the value can be reset.
     */
    coiReviewerPermissionList(event) {
    return event.url.split(/[/?]/).includes('disclosure') || event.url.split('/').includes('reviewer-dashboard') ? true : false;
    }

    opaDashboardCheck(event) {
        return event.url.split(/[/?]/).includes('opa') || event.url.split('/').includes('opa-dashboard') ? true : false;
    }

    /**
     * @param  {} event
     * check whether the current url has 'project-dashboard' or 'disclosure'
     */
    projectPermissionList(event) {
        return event.url.split(/[/?]/).includes('project-dashboard') || event.url.split(/[/?]/).includes('disclosure') ? true : false;
    }

    /**
    * @param  {} event
    * check whether the current url has 'entity-dashboard' or 'manage-entity'
    */
    entityPermissionList(event) {
        return event.url.split(/[/?]/).includes('entity-dashboard') || event.url.split(/[/?]/).includes('manage-entity') ? true : false;
    }

    /**
    * @param  {} event
    * check whether the current url has 'declaration-dashboard' or 'declaration'
    */
    declarationPermissionList(event: any) {
        return event.url.split(/[/?]/).includes('declaration-dashboard') || event.url.split(/[/?]/).includes('declaration');
    }

    /**
     * @param {any} event
     * Check whether the current URL contains certain paths relevant to the dashboard
     */
    myDisclosureTab(event) {
        const URL_ENDPOINTS = [
            'disclosure',
            'travel-disclosure',
            'opa',
            'consulting',
            'management-plan',
            'user-dashboard/disclosures',
            'declaration',
            'management-plan'
        ];

        return URL_ENDPOINTS.some(url => event.url.includes(url));
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
