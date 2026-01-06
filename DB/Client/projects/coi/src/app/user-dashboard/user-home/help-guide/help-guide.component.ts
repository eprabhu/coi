import { Component, OnInit } from '@angular/core';
import { UserHomeService } from '../services/user-home.service';
import { CoiHelpGuide } from '../user-home.interface';

@Component({
    selector: 'app-help-guide',
    templateUrl: './help-guide.component.html',
    styleUrls: ['./help-guide.component.scss']
})
export class HelpGuideComponent implements OnInit {

    helpGuideConfig: CoiHelpGuide[] = [];
    
    constructor(public userHomeService: UserHomeService) { }

    ngOnInit(): void {
        this.helpGuideConfig = this.userHomeService?.landingConfig?.helpGuideConfig.filter((helpConfig: CoiHelpGuide) => helpConfig?.isActive);
    }

}
