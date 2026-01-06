export interface CoiHelpGuide {
    name: string;
    title: string;
    ariaLabel: string;
    navigateToUrl: string;
    navigateToUrlType: string;
    isActive: boolean;
}

export interface CoiQuickLink {
    name: string;
    title: string;
    ariaLabel: string;
    icon: string;
    navigateToUrl: string;
    navigateToUrlType: string;
    isActive: boolean;
    actionType: string;
    additionalInfo?: any;
}

export interface CoiImageConfig {
    name: string;
    uniqueId: string;
    imagePath: string;
    imagePathType: 'INTERNAL' | 'EXTERNAL' | string;
    navigateToUrl: string;
    navigateToUrlType: string;
    notificationHeader: string;
    notificationBody: string;
    notificationButtonName: string;
    isActive: boolean;
}

export class FaqConfig {
    maxCount: number = null;
}

export class ActionListConfig {
    maxCount: number = null;
}

export class SupportAssistanceConfig {
    header = {
        title: '',
        subtitle: ''
    };
    contacts: ContactConfig[] = [];
}

export interface ContactConfig {
    sectionHeader: string;
    contactType: string;
    contactLink: string;
    displayText: string;
    linkTooltip: string;
    linkAriaLabel: string;
}

export class LandingConfig {
    faqConfig = new FaqConfig();
    notificationBannerText = '';
    helpGuideConfig: CoiHelpGuide[] = [];
    quickLinksConfig: CoiQuickLink[] = [];
    imageUrlConfig: CoiImageConfig[] = [];
    actionListConfig = new ActionListConfig();
    supportAssistanceConfig = new SupportAssistanceConfig();
    navigateToUrlTypes: Record<string, string> = {};
}

export class TravelRO {
    personEntityId: any;
    personEntityNumber: any;
    entityId: any;
    entityNumber: any;
    travelerFundingTypeCode = '2';
    travelDisclosureId = null;
}
