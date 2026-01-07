/**
 * custom pipe for Fibi text editor view mode will be controlled here.
 * Developer can simply use the pipe name
 * eg: <span [innerHTML]="result?.proposal?.abstractDescription | safe"></span>.
 * Parameters are handled from here.
 */
import { Pipe, PipeTransform } from "@angular/core";
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
    name: 'safe'
  })

export class SafeHtmlPipe implements PipeTransform {
    constructor(protected sanitizer: DomSanitizer) {
    }
    public transform(value) {
        return this.sanitizer.bypassSecurityTrustHtml(value);
    }
}
