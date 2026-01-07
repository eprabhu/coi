import {  Component, Input } from '@angular/core';

@Component({
    selector: 'app-icon-map',
    template: `<span id="icon-container-{{id}}" class="d-flex align-items-center justify-content-center icon-container " [class]="iconContainerStyleMap.get(iconCode)"><i id='icon-{{id}}' class="{{iconMap.get(iconCode)}}" aria-hidden="true"></i></span>`,
    styleUrls: ['./app-icon-map.component.css']
})
export class IconMapComponent {

    @Input() id;
    @Input() iconCode;
    @Input() size;
    iconMap = new Map();
    iconContainerStyleMap = new Map();

    ngOnInit() {
        this.iconMap.set('A','fa fa-check');
        this.iconMap.set('O','fa fa-check');
        this.iconMap.set('R','fa fa fa-times');
        this.iconMap.set('J','fa fa fa-times');
        this.iconMap.set('B','fa fa-random ms-1');
        this.iconMap.set('K','fa fa-random ms-1');
        this.iconMap.set('T','fa fa-folder-open ms-1');
        this.iconMap.set('W','fa fa-clock-o'); 
        this.iconMap.set('C','fa fa-sort-amount-asc');
        this.iconMap.set('P','');
        this.iconMap.set('I','fa fa-stop-circle-o');
        this.iconMap.set('X','');

        this.iconContainerStyleMap.set('A','icon-approved');
        this.iconContainerStyleMap.set('O','icon-approved');
        this.iconContainerStyleMap.set('R','icon-rejected');
        this.iconContainerStyleMap.set('J','icon-rejected');
        this.iconContainerStyleMap.set('B','icon-bypass');
        this.iconContainerStyleMap.set('K','icon-bypass');
        this.iconContainerStyleMap.set('T','icon-to-be-submitted');
        this.iconContainerStyleMap.set('W','icon-waiting');
        this.iconContainerStyleMap.set('C','icon-withdraw');   
        this.iconContainerStyleMap.set('P','map-status-pending-icon');
        this.iconContainerStyleMap.set('I','map-status-ignored-icon');
        this.iconContainerStyleMap.set('X','map-status-deactivate-icon');
      }

      //Makes icon 60% size of the container
      ngAfterViewInit() {
        const span: any = document.getElementById(`icon-container-${this.id}`);
        span.style.height = this.size + 'px'
        span.style.width = this.size + 'px'
        const icon: any = document.getElementById(`icon-${this.id}`);
        icon.style.fontSize = this.size*0.60 + 'px'
      }
}

