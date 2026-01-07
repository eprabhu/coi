/**
 * Written by Jobin Sebastian
 * This directive is to be used in places where you need the custom loader.
 * Usage :
      <div *ngIf="condition_for_showing_loader" appCustomPreloader></div>
 * If you want to disable the default loader while this is running then set this._commonService.isPreventDefaultLoader
 * as true and set that back to false in when not needed.
 * happy coding :)
 */
import { Directive, ElementRef, OnInit, Renderer2 } from '@angular/core';
import { CommonService } from '../../common/services/common.service';

@Directive({
  selector: '[appCustomPreloader]'
})
export class CustomPreloaderDirective implements OnInit {

  appLoading = true;
  private element: any;

  constructor(private targetEl: ElementRef, private renderer: Renderer2, private _commonService: CommonService) {
    this.element = this.targetEl.nativeElement;
  }

  ngOnInit() {
    const overlay = this.renderer.createElement("div");
    this.renderer.addClass(overlay, "overlay-preloader");

    const loaderPosition = this.renderer.createElement("div");
    this.renderer.addClass(loaderPosition, "preloader-position");

    this.renderer.appendChild(overlay, loaderPosition);

    const loaderGrid = this.renderer.createElement("div");
    this.renderer.addClass(loaderGrid, "preloader-grid");

    this.renderer.appendChild(loaderPosition, loaderGrid);

    const loadLoaderClass = this.renderer.createElement("div");
    this.renderer.addClass(loadLoaderClass, "spinner-border");
    this.renderer.setStyle(loadLoaderClass, "width", "5rem");
    this.renderer.setStyle(loadLoaderClass, "height", "5rem");
    this.renderer.setStyle(loadLoaderClass, "color", "#47a69a");
    this.renderer.appendChild(loaderGrid, loadLoaderClass);

    const loaderContent = this.renderer.createElement("div");
    this.renderer.addClass(loaderContent, "preloader-text");

    const loaderContentSpan = this.renderer.createElement("span");
    const loaderText = this.renderer.createText(this._commonService.appLoaderContent);

    this.renderer.appendChild(loaderContentSpan, loaderText);
    this.renderer.appendChild(loaderContent, loaderContentSpan);

    this.renderer.appendChild(loaderGrid, loaderContent);

    this.renderer.appendChild(this.element, overlay);
  }
}
