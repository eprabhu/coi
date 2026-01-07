/**
 * Written by Jobin Sebastian
 * This directive is to be used in places where you need the custom loader.
 * Usage :
      <div *ngIf="condition_for_showing_loader" appCustomPreloader></div>
 * If you want to disable the default loader while this is running then set this._commonService.isPreventDefaultLoader
 * as true and set that back to false in when not needed.
 * happy coding :)
 */
      import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';
      import { CommonService } from '../../common/services/common.service';

      @Directive({
        selector: '[appCustomPreloader]'
      })
      export class CustomPreloaderDirective implements OnInit {

          @Input() spinnerWidth = 5;
          @Input() spinnerHeight = 5;
          @Input() isLoadingNeeded = true;
          appLoading = true;
          private element: any;

        constructor(private _targetEl: ElementRef, private _renderer: Renderer2, private _commonService: CommonService) {
          this.element = this._targetEl.nativeElement;
        }

        ngOnInit() {
          const OVERLAY = this._renderer.createElement("div");
          this._renderer.addClass(OVERLAY, "OVERLAY-preloader");

          const LOADER_POSITION = this._renderer.createElement("div");
          this._renderer.addClass(LOADER_POSITION, "preloader-position");

          this._renderer.appendChild(OVERLAY, LOADER_POSITION);

          const LOADER_GRID = this._renderer.createElement("div");
          this._renderer.addClass(LOADER_GRID, "preloader-grid");

          this._renderer.appendChild(LOADER_POSITION, LOADER_GRID);

          const LOAD_LOADER_CLASS = this._renderer.createElement("div");
          this._renderer.addClass(LOAD_LOADER_CLASS, "spinner-border");
          this._renderer.setStyle(LOAD_LOADER_CLASS, "width", this.spinnerWidth+'rem');
          this._renderer.setStyle(LOAD_LOADER_CLASS, "height", this.spinnerHeight+'rem');
          this._renderer.setStyle(LOAD_LOADER_CLASS, "color", "#007DEC");
          this._renderer.appendChild(LOADER_GRID, LOAD_LOADER_CLASS);
          if(this.isLoadingNeeded) {
              const LOADER_CONTENT = this._renderer.createElement("div");
              this._renderer.addClass(LOADER_CONTENT, "preloader-text");

              const LOADER_CONTENT_SPAN = this._renderer.createElement("span");
              const LOADER_TEXT = this._renderer.createText(this._commonService.appLoaderContent);

              this._renderer.appendChild(LOADER_CONTENT_SPAN, LOADER_TEXT);
              this._renderer.appendChild(LOADER_CONTENT, LOADER_CONTENT_SPAN);

              this._renderer.appendChild(LOADER_GRID, LOADER_CONTENT);
          } else {
              this._renderer.setStyle(LOAD_LOADER_CLASS, "margin-bottom", '3rem');
          }
          this._renderer.appendChild(this.element, OVERLAY);
        }
      }
