import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { COIReviewCommentCheckbox, COIReviewCommentEditor } from '../coi-review-comments.interface';
import { CoiReviewCommentsService } from '../coi-review-comments.service';

@Component({
    selector: 'app-coi-review-comments-editor',
    templateUrl: './coi-review-comments-editor.component.html',
    styleUrls: ['./coi-review-comments-editor.component.scss'],
})
export class CoiReviewCommentsEditorComponent implements OnInit, OnChanges {

    btnName = 'Save Comment';
    mandatoryList = new Map();
    isChecked: boolean[] = [];
    editorElement: HTMLElement = null;

    @Input() commentEditorConfig = new COIReviewCommentEditor();
    @ViewChild('editorElementRef') editorElementRef!: ElementRef;

    constructor(private _reviewCommentService: CoiReviewCommentsService) {}

    ngOnInit(): void {
        setTimeout(() => {
            this.editorElementRef?.nativeElement?.scrollIntoView({block: 'center', behavior: 'smooth'});
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.commentEditorConfig) {
            const IS_REPLY_COMMENT = this.commentEditorConfig?.isReplyComment;
            const IS_EDIT_ACTION = this.commentEditorConfig?.actionType === 'EDIT_COMMENT';
            this.btnName = IS_EDIT_ACTION ? 'Save Comment' : IS_REPLY_COMMENT ? 'Reply Comment' : 'Add Comment';
        }
    }

    private focusEditor(): void {
        setTimeout(() => {
            this.editorElement?.focus();
        }, 300);
    }

    onReady(editor: any): void {
        editor?.ui?.getEditableElement()?.parentElement?.insertBefore(
            editor?.ui?.view?.toolbar?.element,
            editor?.ui?.getEditableElement()
        );
        this.editorElement = editor?.ui?.getEditableElement();
        this.focusEditor();
    }

    addOrUpdateComment(): void {
        if (this.validateComment()) {
            if (this.commentEditorConfig?.checkboxConfig?.length) {
                this.commentEditorConfig.checkboxConfig.forEach((config: COIReviewCommentCheckbox, index: number) => {
                    // Ensure commentDetails is initialized
                    this.commentEditorConfig.commentDetails = this.commentEditorConfig.commentDetails;

                    if (this.isChecked[index]) {
                        // Merge the 'true' values if the checkbox is checked
                        this.commentEditorConfig.commentDetails = {
                            ...this.commentEditorConfig.commentDetails,
                            ...config.values?.true
                        };
                    } else if (config.values?.false) {
                        // Merge the 'false' values if available
                        this.commentEditorConfig.commentDetails = {
                            ...this.commentEditorConfig.commentDetails,
                            ...config.values.false
                        };
                    }
                });
            }
            // Notify the global event
            this._reviewCommentService.notifyGlobalEvent(this.commentEditorConfig?.actionType, { commentEditorConfig: this.commentEditorConfig });
        }
    }

    clearEditor(): void {
        this.mandatoryList.clear();
        this.commentEditorConfig.commentDetails.comment = '';
        this.focusEditor();
    }

    cancelEditor(): void {
        this._reviewCommentService.notifyGlobalEvent('CANCEL_EDITOR', { commentEditorConfig: this.commentEditorConfig });
    }

    commentChanged(): void {
        this.validateComment();
        this._reviewCommentService.notifyGlobalEvent('COMMENT_CHANGES', { commentEditorConfig: this.commentEditorConfig });
    }

    validateComment(): boolean {
        this.mandatoryList.clear();
        this.commentEditorConfig.commentDetails.comment = this.commentEditorConfig?.commentDetails?.comment?.trim() || '';
        if (!this.commentEditorConfig?.commentDetails?.comment?.trim()) {
            this.mandatoryList.set('comment', `Please enter the ${this.commentEditorConfig.isReplyComment ? 'reply comment' : 'comment'}.`);
        }
        return this.mandatoryList.size === 0;
    }

}
