import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonService } from '../../../common/services/common.service';

@Component({
    selector: 'app-themes',
    templateUrl: './themes.component.html',
    styleUrls: ['./themes.component.css']
})
export class ThemesComponent {

    fibiTheme: any;
    showThemeConfiguringOption = false;
    themesWidgetOpen = true;
    currentTheme = 'green';
    currentContrast = 'default';
    themes = new Map([
        ['green', 'theme-green'],
        ['greendark', 'theme-green-dark'],
        ['greenlight', 'theme-green-light'],
        ['blue', 'theme-blue'],
        ['bluedark', 'theme-blue-dark'],
        ['bluelight', 'theme-blue-light'],
      ]);

    @ViewChild('notificationBar', { static: false }) notificationBar: ElementRef;
    @ViewChild('configurationBar', { static: false }) configurationBar: ElementRef;
    @ViewChild('themeConfigurationBar', { static: false }) themeConfigurationBar: ElementRef;
    @ViewChild('sideBarMenu', { static: false }) sideBarMenu: ElementRef;

    constructor(public _commonService: CommonService) {}


    changeTheme(theme) {
        this.fibiTheme = document.getElementById('fibi-body');
        this.fibiTheme.className = '';
        this.fibiTheme.classList.add(theme);
    }
    changeContrast(type) {
        let currentTheme =  this.currentTheme + type;
        currentTheme = this.themes.get(currentTheme);
        this.changeTheme(currentTheme);
    }
    offClickHandlerTheme(event: any) {
      if (!this.themeConfigurationBar.nativeElement.contains(event.target)) {
          this.showThemeConfiguringOption = false;
        }
    }
    changeFontSize(size) {
        (document.querySelector(':root') as HTMLElement).style.fontSize = size;
    }
}
