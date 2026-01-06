import { Component, Input, OnInit } from '@angular/core';
import {EDITOR_CONFIURATION} from '../../../../../fibi/src/app/app-constants';
import * as DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';

@Component({
  selector: 'app-rich-text',
  templateUrl: './rich-text.component.html',
  styleUrls: ['./rich-text.component.scss']
})
export class RichTextComponent implements OnInit {

  public Editor = DecoupledEditor;
  editorConfig = EDITOR_CONFIURATION;
  isEdited = false;

  @Input()editorData = '';

  constructor() { }

  ngOnInit() {
  }

  public onEditorReady(editor) {
    editor.ui.getEditableElement().parentElement.insertBefore(
        editor.ui.view.toolbar.element,
        editor.ui.getEditableElement()
    );
}

}
