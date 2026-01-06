import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { DECLARATION_LOCALIZE } from '../../../../app-locales';
import { CommonService } from '../../../../common/services/common.service';
import { AutoSaveService } from '../../../../common/services/auto-save.service';
import { UserDeclarationService } from '../../services/user-declaration.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-user-declaration-nav',
    templateUrl: './user-declaration-nav.component.html',
    styleUrls: ['./user-declaration-nav.component.scss'],
    standalone: true,
    imports:[RouterModule, MatIconModule, CommonModule, FormsModule]
})
export class UserCertificationNavComponent {

    @Input() isEditMode = false;

    declarationLocalize = DECLARATION_LOCALIZE;

    constructor(public router: Router,
        public commonService: CommonService,
        public autoSaveService: AutoSaveService,
        private _declarationService: UserDeclarationService) {}

    onTabSwitch(tabName: 'DECLARATION' | 'HISTORY'): void {
        this._declarationService.setTopForDeclaration();
    }

}
