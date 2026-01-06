import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { DragNdropDirective } from './file-drop/drag-ndrop.directive';
import { AppElasticComponent } from './app-elastic/app-elastic.component';
import { FileDropComponent } from './file-drop/file-drop.component';
import { KeyboardListenerDirective } from './directives/keyboardListener.directive';
import { CustomElementComponent } from './custom-element/custom-element.component';
import { CustomElementService } from './custom-element/custom-element.service';
import { AppEndpointSearchComponent } from './app-endpoint-search/app-endpoint-search.component';
import { AppEndpointSearchService } from './app-endpoint-search/app-endpoint-search.service';
import { AppAutocompleterComponent } from './app-autocompleter/app-autocompleter.component';
import { ClickNdragDirective } from './directives/clickNdrag.directive';
import { ViewQuestionnaireComponent } from './view-questionnaire/view-questionnaire.component';
import { LookUpComponent } from './look-up/look-up.component';
import { LookupFilterPipe } from './look-up/lookup-filter.pipe';
import { AddressBookComponent } from './address-book/address-book.component';
import { DateFormatPipe, DateFormatPipeWithTimeZone } from './pipes/custom-date.pipe';
import { SearchFilterPipe } from './pipes/search-filter.pipe';
import { RouterModule } from '@angular/router';
import { ViewQuestionnaireListComponent } from './view-questionnaire-list/view-questionnaire-list.component';
import { LengthValidatorDirective } from './directives/length-validator.directive';
import { CurrencyFormatDirective } from './directives/currency-format.directive';
import { CustomCurrencyPipe } from './pipes/custom-currency.pipe';
import { AddressBookService } from './address-book/address-book.service';
import { AutoGrowDirective } from './directives/autoGrow.directive';
import { QuestionnaireListCompareComponent } from './questionnaire-list-compare/questionnaire-list-compare.component';
import { QuestionnaireCompareComponent } from './questionnaire-compare/questionnaire-compare.component';
import { CustomElementCompareComponent } from './custom-element-compare/custom-element-compare.component';
import { GrantDetailsViewComponent } from './grant-details-view/grant-details-view.component';
import { AppTimePickerComponent } from './app-time-picker/app-time-picker.component';
import { SafeHtmlPipe } from './pipes/safe-html.pipe';
import { CustomNumberPipe } from './pipes/custom-number.pipe';
import { CustomPreloaderDirective } from './directives/custom-preloader.directive';
import { OrderByPipe } from './directives/orderBy.pipe';
import { DragNDragDirective } from './directives/drag-n-drag.directive';
import { OrderByIndexPipe } from './directives/orderByIndex.pipe';
import { CustomTagRemoverPipe } from './pipes/customTagRemover.pipe';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { CdkMenuModule } from '@angular/cdk/menu';
import { PaginationComponent } from './pagination/pagination.component';
import { NoDataLabelComponent } from './no-data-label/no-data-label.component';
import { SfiService } from '../disclosure/sfi/sfi.service';
import { RichTextComponent } from './rich-text/rich-text.component';
import { HostContainerDirective } from './directives/host-container.directive';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { TailingSpaceRemoverDirective } from './directives/tailing-space-remover.directive';
import { ReadMoreComponent } from './read-more/read-more.component';
import { CommonHelpTextComponent } from './common-help-text/common-help-text.component';
import { CommonInformationComponent } from './common-information/common-information.component';
import { VisibleInViewportDirective } from './directives/visibleInViewport.directive';
import { DATE_PICKER_FORMAT_MATERIAL } from '../app-constants';
import { EntityCreationComponent } from './entity-creation/entity-creation.component';
import { ModalDragDirective } from './directives/modal-drag.directive';
import { ToggleCheckboxComponent } from './toggle-checkbox/toggle-checkbox.component';
import { CommonSharedInfoTextComponent } from './common-shared-info-text/common-shared-info-text.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        CKEditorModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatIconModule,
        CdkMenuModule,
        MatMenuModule,
        MatSelectModule,
        MatInputModule,
        MatAutocompleteModule,
    ],
    declarations: [AppElasticComponent, FileDropComponent, DragNdropDirective, AppAutocompleterComponent, KeyboardListenerDirective,
        AppEndpointSearchComponent, CustomElementComponent, ViewQuestionnaireComponent, LookUpComponent, LookupFilterPipe,
        ClickNdragDirective, AddressBookComponent, DateFormatPipe, SearchFilterPipe, ViewQuestionnaireListComponent,
        LengthValidatorDirective, CurrencyFormatDirective, CustomCurrencyPipe, QuestionnaireListCompareComponent, AutoGrowDirective,
        QuestionnaireCompareComponent, CustomElementCompareComponent, GrantDetailsViewComponent, AppTimePickerComponent,
        DateFormatPipeWithTimeZone, SafeHtmlPipe, CustomNumberPipe, CustomPreloaderDirective, OrderByPipe, OrderByIndexPipe,
        DragNDragDirective, CustomTagRemoverPipe, PaginationComponent, NoDataLabelComponent, RichTextComponent,
        HostContainerDirective, ReadMoreComponent, TailingSpaceRemoverDirective, CommonHelpTextComponent, CommonInformationComponent,
        VisibleInViewportDirective, EntityCreationComponent, ModalDragDirective, ToggleCheckboxComponent, CommonSharedInfoTextComponent],
    exports: [
        AppElasticComponent,
        FileDropComponent,
        DragNdropDirective,
        CustomElementComponent,
        KeyboardListenerDirective,
        AppEndpointSearchComponent,
        AppAutocompleterComponent,
        ClickNdragDirective,
        ViewQuestionnaireComponent,
        LookUpComponent,
        AddressBookComponent,
        DateFormatPipe,
        PaginationComponent,
        SearchFilterPipe,
        CustomCurrencyPipe,
        ViewQuestionnaireListComponent,
        LengthValidatorDirective,
        CurrencyFormatDirective,
        AutoGrowDirective,
        QuestionnaireListCompareComponent,
        QuestionnaireCompareComponent,
        CustomElementCompareComponent,
        GrantDetailsViewComponent,
        CKEditorModule,
        AppTimePickerComponent,
        DateFormatPipeWithTimeZone,
        SafeHtmlPipe,
        CustomNumberPipe,
        CustomPreloaderDirective,
        OrderByPipe,
        OrderByIndexPipe,
        DragNDragDirective,
        CustomTagRemoverPipe,
        MatDatepickerModule,
        MatNativeDateModule,
        MatIconModule,
        CdkMenuModule,
        MatMenuModule,
        NoDataLabelComponent,
        RichTextComponent,
        HostContainerDirective,
        MatAutocompleteModule,
        TailingSpaceRemoverDirective,
        ReadMoreComponent,
        CommonHelpTextComponent,
        CommonInformationComponent,
        VisibleInViewportDirective,
        EntityCreationComponent,
        ModalDragDirective,
        ToggleCheckboxComponent,
        CommonSharedInfoTextComponent
    ],

    providers: [
        {
            provide: DateAdapter, useClass: MomentDateAdapter,
            deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
        },
        {provide: MAT_DATE_FORMATS, useValue: DATE_PICKER_FORMAT_MATERIAL},

        CustomElementService,
        AppEndpointSearchService,
        CurrencyPipe,
        DateFormatPipe,
        CustomCurrencyPipe,
        AddressBookService,
        DateFormatPipeWithTimeZone,
        SafeHtmlPipe,
        DecimalPipe,
        CustomNumberPipe,
        CustomTagRemoverPipe, SfiService
    ],

})
export class SharedModule {
}
