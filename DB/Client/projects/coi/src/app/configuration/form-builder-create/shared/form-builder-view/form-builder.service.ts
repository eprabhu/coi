import { Injectable } from '@angular/core';
import { Observable, Subject, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '../../../../common/services/common.service';
import { FBActionEvent, FBConfiguration, FormBuilderSaveRO } from './form-builder-interface';
import {CustomAnswerAttachment} from '../../form-builder-create-interface';

@Injectable()

export class FormBuilderService {

    baseURL = '';
    $formBuilderActionEvents = new Subject<FBActionEvent>();

    constructor(private _http: HttpClient, private _commonService: CommonService) {
        this.baseURL = this._commonService.formUrl;
     }

    getFormBuilderData(configuration: FBConfiguration) {
        return this._http.post(this.baseURL + '/formbuilder/getForm', configuration);
    }

    getRevisedFormData(configuration) {
        return this._http.post(this.baseURL + '/formbuilder/copyForm', configuration);
    }

    getOpaPersonType(): any {
        return this._http.get(this.baseURL + '/opa' + '/getOpaPersonType');
    }
    getFormBuilderDataForBlankForm(configuration: FBConfiguration) {
        return this._http.post(this.baseURL + '/formbuilder/getBlankForm', configuration);
    }

    saveFormComponent(data: FormBuilderSaveRO[]) {
        const FORM_DATA = new FormData();

        const [first] = data;
        const bulkRequest = {
            formBuilderId: first?.formBuilderId?.toString()?.trim() || null,
            documentOwnerPersonId: first?.documentOwnerPersonId,
            moduleItemCode: first?.moduleItemCode,
            moduleSubItemCode: first?.moduleSubItemCode,
            moduleItemKey: first?.moduleItemKey,
            moduleSubItemKey: first?.moduleSubItemKey,
            formBuilderAnswerHeaderId: first?.formBuilderAnswerHeaderId
                ? JSON.stringify(first?.formBuilderAnswerHeaderId)
                : null
        };

        const components = data.map((RO: FormBuilderSaveRO) => {
            const { componentId, componentType, componentRefId, componentData, programmedElement, questionnaire, customElement, files }
                = RO;
            if (files?.length) {
                files.forEach(file => {
                    FORM_DATA.append(file?.questionId?.toString(), file?.attachment, file?.attachment?.name);
                });
            }
            customElement?.customElements?.forEach(element => {
                (element.attachments || []).forEach((att: CustomAnswerAttachment)  => {
                    const ATTACHMENT = att.attachment;
                    if (ATTACHMENT && ATTACHMENT instanceof File) {
                        FORM_DATA.append(att.fileKey, ATTACHMENT);
                    }
                    delete att.attachment;
                });
            });

            return programmedElement
                ? { componentId, componentType, componentRefId, componentData, programmedElement }
                : questionnaire
                    ? { componentId, componentType, questionnaire }
                    : { componentId, componentType, customElement };
        });

        bulkRequest['components'] = components;
        FORM_DATA.append('bulkRequest', JSON.stringify(bulkRequest));

        return this._http.post(`${this.baseURL}/formbuilder/saveFormComponent/v1`, FORM_DATA);
    }

    downloadFormAttachment(attachmentId): any {
        return this._http.get(this.baseURL + '/formbuilder/downloadFormAttachment/' + attachmentId.toString(), { responseType: 'blob'});
    }

}

export function setCommentInput(formBuilderId, formBuilderSectionId, formBuilderComponentId, headerName): any{
    const COMMENT_META_DATA: any = {
        "componentTypeCode": '10',
        "formBuilderId": formBuilderId,
        "formBuilderSectionId": formBuilderSectionId,
        "formBuilderComponentId": formBuilderComponentId,
        "headerName": headerName
    }
    return COMMENT_META_DATA;
}



