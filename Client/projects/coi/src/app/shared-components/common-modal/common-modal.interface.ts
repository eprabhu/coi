export type ModalBreakPoints = 'sm' | 'lg' | 'xl' | '';
export type ModalActionType = 'CLOSE_BTN' | 'SECONDARY_BTN' | 'PRIMARY_BTN';
export type FlexJustifyClass = 'justify-content-end' | 'justify-content-start' | 'justify-content-center' | 'justify-content-between' | 'justify-content-around';
export type ModalFullscreenBreakpoints = 'fullscreen' | 'fullscreen-sm-down' | 'fullscreen-md-down' | 'fullscreen-lg-down' | 'fullscreen-xl-down' | 'fullscreen-xxl-down' | '';

export interface ModalActionEvent {
    action: ModalActionType;
    event?: any;
}

export class ModalDataBsOptions {
    /** @param backdrop - Controls whether the modal has a backdrop. Can be a boolean or 'static' to prevent closing when clicking outside the modal. */
    backdrop: boolean | 'static' = 'static';

    /** @param keyboard - Controls whether the modal can be closed with the keyboard (Escape key). Defaults to true. */
    keyboard = true;

    /** @param focus - Controls whether the modal should automatically focus on the first focusable element when opened. Defaults to true. */
    focus = true;

    /** @param config - Optional additional configuration for Bootstrap modal data attributes. */
    config?: any;

    /** @param animation - Optional configuration for modal animations. */
    animation?: any;

    /** @param delay - Optional configuration for show and hide delays. Defaults to { show: 0, hide: 150 }. */
    delay?: any = { show: 0, hide: 150 };

    /**
     * Constructor to initialize the properties of the ModalDataBsOptions class.
     * @param backdrop - Controls whether the modal has a backdrop. Can be a boolean or 'static' to prevent closing when clicking outside the modal.
     * @param keyboard - Controls whether the modal can be closed with the keyboard (Escape key). Defaults to true.
     * @param focus - Controls whether the modal should automatically focus on the first focusable element when opened. Defaults to true.
     */
    constructor(
        backdrop: boolean | 'static' = 'static',
        keyboard: boolean = false,
        focus: boolean = true
    ) {
        this.backdrop = backdrop;
        this.keyboard = keyboard;
        this.focus = focus;
    }
}

export class ModalADAOptions {
    /** @param modalAriaLabel - ARIA label for the modal for accessibility purposes. */
    modalAriaLabel: string;

    /** @param idToFocusAfterClose - ID of the element to focus on after the modal is closed. */
    idToFocusAfterClose: string;

    /** @param primaryBtnAriaLabel - ARIA label for the primary button for accessibility purposes. */
    primaryBtnAriaLabel: string;

    /** @param primaryBtnTitle - Title text for the primary button, used for tooltips or accessibility. */
    primaryBtnTitle: string;

    /** @param secondaryBtnAriaLabel - ARIA label for the secondary button for accessibility purposes. */
    secondaryBtnAriaLabel: string;

    /** @param secondaryBtnTitle - Title text for the secondary button, used for tooltips or accessibility. */
    secondaryBtnTitle: string;

    /** @param isDisableSecondaryBtn - disable secondary button. */
    isDisableSecondaryBtn: boolean;

    /** @param isDisablePrimaryBtn - disable primary button. */
    isDisablePrimaryBtn: boolean;

    /**
     * Constructor to initialize the properties of ModalADAOptions.
     * @param modalAriaLabel - ARIA label for the modal.
     * @param idToFocusAfterClose - ID of the element to focus on after the modal is closed.
     * @param primaryBtnTitle - Title text for the primary button.
     * @param secondaryBtnTitle - Title text for the secondary button.
     * @param primaryBtnAriaLabel - ARIA label for the primary button.
     * @param secondaryBtnAriaLabel - ARIA label for the secondary button.
     */
    constructor(modalAriaLabel = '', idToFocusAfterClose = '', primaryBtnTitle = '', secondaryBtnTitle = '', primaryBtnAriaLabel = '', secondaryBtnAriaLabel = '') {
        this.modalAriaLabel = modalAriaLabel;
        this.primaryBtnAriaLabel = primaryBtnAriaLabel;
        this.primaryBtnTitle = primaryBtnTitle;
        this.secondaryBtnAriaLabel = secondaryBtnAriaLabel;
        this.secondaryBtnTitle = secondaryBtnTitle;
        this.idToFocusAfterClose = idToFocusAfterClose;
    }
}

export class ModalStyleOptions {
    /** @param primaryBtnClass - CSS class for the primary button. */
    primaryBtnClass: string;

    /** @param secondaryBtnClass - CSS class for the secondary button. */
    secondaryBtnClass: string;

    /** @param closeBtnClass - CSS class for the close button. */
    closeBtnClass: string;

    /** @param footerPosition - CSS class for positioning the modal footer, typically used for alignment. */
    footerPosition: FlexJustifyClass;

    /** @param animationClass - CSS class for positioning the modal footer, typically used for alignment. */
    animationClass: string;

    /** @param modalBodyClass =  - CSS class for the modal body */
    modalBodyClass: string;

    /**
     * Constructor to initialize the properties of ModalStyleOptions.
     * @param primaryBtnClass - CSS class for the primary button.
     * @param secondaryBtnClass - CSS class for the secondary button.
     * @param closeBtnClass - CSS class for the close button.
     * @param footerPosition - CSS class for positioning the modal footer.
     */
    constructor(primaryBtnClass = 'btn-primary', secondaryBtnClass = 'btn-outline-secondary', closeBtnClass = '', footerPosition: FlexJustifyClass = 'justify-content-end', animationClass = 'fade') {
        this.primaryBtnClass = primaryBtnClass;
        this.secondaryBtnClass = secondaryBtnClass;
        this.closeBtnClass = closeBtnClass;
        this.footerPosition = footerPosition;
        this.animationClass = animationClass;
    }
}

export class ModalDisplayOptions {
    /** @param modalSize - The size of the modal, based on predefined breakpoints. */
    modalSize: ModalBreakPoints;

    /** @param fullScreen - The fullscreen breakpoints configuration for the modal. */
    fullScreen: ModalFullscreenBreakpoints;

    /**
     * Constructor to initialize the properties of ModalDisplayOptions.
     * @param modalSize - The size of the modal, based on predefined breakpoints ( 'sm' | 'lg' | 'xl' | '' ).
     * @param fullScreen - The fullscreen breakpoints configuration for the modal.
     */
    constructor(modalSize: ModalBreakPoints = '', fullScreen: ModalFullscreenBreakpoints = '') {
        this.modalSize = modalSize;
        this.fullScreen = fullScreen;
    }
}

export class ModalNamings {
    /** @param modalName - The name of the modal. */
    modalName: string;

    /** @param primaryBtnName - The name of the primary button associated with the modal. */
    primaryBtnName: string;

    /** @param secondaryBtnName - The name of the secondary button associated with the modal. */
    secondaryBtnName: string;

    /**
     * Constructor to initialize the properties of ModalNamings.
     * @param modalName - The name of the modal.
     * @param primaryBtnName - The name of the primary button.
     * @param secondaryBtnName - The name of the secondary button.
     */
    constructor(modalName = '', primaryBtnName = '', secondaryBtnName = '') {
        this.modalName = modalName;
        this.primaryBtnName = primaryBtnName;
        this.secondaryBtnName = secondaryBtnName;
    }
}

export class CommonModalConfig {
    /** @param namings - Configuration for modal names including modal, primary button, and secondary button names. */
    namings: ModalNamings;

    /** @param dataBsOptions - Configuration for Bootstrap data attributes related to the modal. */
    dataBsOptions = new ModalDataBsOptions();

    /** @param ADAOptions - Configuration for ADA (Accessibility) options related to the modal. */
    ADAOptions = new ModalADAOptions();

    /** @param styleOptions -  Configuration for style options related to the modal. */
    styleOptions = new ModalStyleOptions();

    /** @param displayOptions - Configuration for modal display options such as size. */
    displayOptions = new ModalDisplayOptions();

    /**
     * Constructor to initialize the properties of CommonModalConfig.
     * @param modalName - Name of the modal.
     * @param primaryBtnName - Name of the primary button.
     * @param secondaryBtnName - Name of the secondary button.
     * @param modalSize - Size of the modal based on predefined breakpoints ( 'sm' | 'lg' | 'xl' | '' ).
     */
    constructor(modalName: string, primaryBtnName: string, secondaryBtnName: string = '', modalSize: ModalBreakPoints = '') {
        this.namings = new ModalNamings(modalName, primaryBtnName, secondaryBtnName);
        this.displayOptions = new ModalDisplayOptions(modalSize);
    }
}
