import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { DragNdropDirective } from './file-drop/drag-ndrop.directive';

import { AppElasticComponent } from './app-elastic/app-elastic.component';
import { FileDropComponent } from './file-drop/file-drop.component';
import { MedusaComponent } from './medusa/medusa.component';
import { AddReviewComponent } from './pre-routing/add-review/add-review.component';
import { ReviewComponent } from './pre-routing/review/review.component';
import { RequestSupportComponent } from './clarification/request-support/request-support.component';
import { SupportComponent } from './clarification/support/support.component';
import { KeyboardListenerDirective } from './directives/keyboardListener.directive';

import { MedusaService } from './medusa/medusa.service';
import { SupportService } from './clarification/support/support.service';
import { ReviewService } from './pre-routing/review/review.service';
import { CustomElementComponent } from './custom-element/custom-element.component';
import { CustomElementService } from './custom-element/custom-element.service';
import { AppEndpointSearchComponent } from './app-endpoint-search/app-endpoint-search.component';
import { AppEndpointSearchService } from './app-endpoint-search/app-endpoint-search.service';
import { AppAutocompleterComponent } from './app-autocompleter/app-autocompleter.component';
import { StickyNoteComponent } from './sticky-note/sticky-note.component';
import { ClickNdragDirective } from './directives/clickNdrag.directive';
import { WorkflowEngineComponent } from './workflow-engine/workflow-engine.component';
import { WorkflowEngineService } from './workflow-engine/workflow-engine.service';
import { ViewQuestionnaireComponent } from './view-questionnaire/view-questionnaire.component';
import { LookUpComponent } from './look-up/look-up.component';
import { LookupFilterPipe } from './look-up/lookup-filter.pipe';
import { AddressBookComponent } from './address-book/address-book.component';
import { DateFormatPipe, DateFormatPipeWithTimeZone } from './pipes/custom-date.pipe';
import { SearchFilterPipe } from './pipes/search-filter.pipe';
import { RouterModule } from '@angular/router';
import { DATE_PICKER_FORMAT_MATERIAL } from '../app-constants';
import { NotifyComponent } from './notify/notify.component';
import { NotifyService } from './notify/notify.service';
import { ViewQuestionnaireListComponent } from './view-questionnaire-list/view-questionnaire-list.component';
import { LengthValidatorDirective } from './directives/length-validator.directive';
import { PaginationComponent } from './pagination/pagination.component';
import { CurrencyFormatDirective } from './directives/currency-format.directive';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
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
import { DateAdapter, MatNativeDateModule, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import {MatAutocompleteModule} from '@angular/material/autocomplete';

@ NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    CKEditorModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatAutocompleteModule
  ],
  declarations: [AppElasticComponent, FileDropComponent, DragNdropDirective, AppAutocompleterComponent,
    MedusaComponent, KeyboardListenerDirective, AddReviewComponent, AppEndpointSearchComponent,
    ReviewComponent, RequestSupportComponent, SupportComponent, CustomElementComponent,
    StickyNoteComponent, WorkflowEngineComponent, ViewQuestionnaireComponent, LookUpComponent, LookupFilterPipe,
    ClickNdragDirective, AddressBookComponent, DateFormatPipe, SearchFilterPipe, NotifyComponent, ViewQuestionnaireListComponent,
    LengthValidatorDirective, PaginationComponent, CurrencyFormatDirective, CustomCurrencyPipe, QuestionnaireListCompareComponent,
    AutoGrowDirective, QuestionnaireCompareComponent, CustomElementCompareComponent, GrantDetailsViewComponent, AppTimePickerComponent,
    DateFormatPipeWithTimeZone, SafeHtmlPipe, CustomNumberPipe, CustomPreloaderDirective, OrderByPipe, OrderByIndexPipe,
    DragNDragDirective, CustomTagRemoverPipe],
  exports: [
    AppElasticComponent,
    FileDropComponent,
    DragNdropDirective,
    MedusaComponent,
    AddReviewComponent,
    ReviewComponent,
    RequestSupportComponent,
    SupportComponent,
    CustomElementComponent,
    KeyboardListenerDirective,
    AppEndpointSearchComponent,
    AppAutocompleterComponent,
    StickyNoteComponent,
    ClickNdragDirective,
    WorkflowEngineComponent,
    ViewQuestionnaireComponent,
    LookUpComponent,
    AddressBookComponent,
    DateFormatPipe,
    SearchFilterPipe,
    CustomCurrencyPipe,
    NotifyComponent,
    ViewQuestionnaireListComponent,
    LengthValidatorDirective,
    PaginationComponent,
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
    MatAutocompleteModule
    ],

  providers: [
    {
      provide: DateAdapter, useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    { provide: MAT_DATE_FORMATS, useValue: DATE_PICKER_FORMAT_MATERIAL },
    MedusaService,
    SupportService,
    ReviewService,
    CustomElementService,
    AppEndpointSearchService,
    WorkflowEngineService,
    NotifyService,
    CurrencyPipe,
    DateFormatPipe,
    CustomCurrencyPipe,
    AddressBookService,
    DateFormatPipeWithTimeZone,
    SafeHtmlPipe,
    DecimalPipe,
    CustomNumberPipe,
    CustomTagRemoverPipe
  ],

})
export class SharedModule { }
