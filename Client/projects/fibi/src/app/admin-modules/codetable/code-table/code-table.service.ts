import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '../../../common/services/common.service';
import { Observable } from 'rxjs';

@Injectable()

export class CodeTableService {

    constructor(private _http: HttpClient, private _commonService: CommonService) { }

    getCodeTableEntryList(codeTable): Observable<any> {
        return this._http.post(this._commonService.baseUrl + '/getCodeTable', codeTable);
    }

    getUpdatedTableValues(updatedCodeTable, attachmentColumnName) {
        const formData = new FormData();
        if (attachmentColumnName) {
            const attachment = updatedCodeTable.tableData[0][attachmentColumnName];
            updatedCodeTable.tableData[0][attachmentColumnName] = 'changed';
            formData.append('files', attachment, attachment.name);
        }
        formData.append('formDataJson', JSON.stringify(updatedCodeTable));
        return this._http.post(this._commonService.baseUrl + '/updateCodeTableRecord', formData);
    }

    removeSelectedData(removeData) {
        return this._http.post(this._commonService.baseUrl + '/deleteCodeTableRecord', removeData);
    }

    addNewCodeTableData(newCodeTableData, attachmentColumnName) {
        const formData = new FormData();
        if (attachmentColumnName) {
            const attachment = newCodeTableData.tableData[0][attachmentColumnName];
            newCodeTableData.tableData[0][attachmentColumnName] = 'changed';
            formData.append('files', attachment, attachment.name);
        }
        formData.append('formDataJson', JSON.stringify(newCodeTableData));
        return this._http.post(this._commonService.baseUrl + '/addCodeTableRecord', formData);
    }
    downloadAttachment(downloadData) {
        return this._http.post(this._commonService.baseUrl + '/downloadAttachment', downloadData, { responseType: 'blob' });
    }

    fetchRoles() {
		return this._http.post(this._commonService.baseUrl + '/fetchAllRoles', {});
	}
}
