import { Injectable } from '@angular/core';
import { Subject ,  BehaviorSubject } from 'rxjs';
import { ProposalSection } from './comparison-constants';
import { CompareDetails, Section } from './interfaces';

@Injectable()
export class ToolkitEventInteractionService {

    constructor() { }
    $compareEvent = new Subject<CompareDetails>();
    $viewEvent = new Subject<CompareDetails>();
    $currentHeader = new BehaviorSubject<any>({});
    $isCompareActive = new BehaviorSubject<boolean>(false);
    $compareFromHeader = new Subject();
    $versionCommentList = new BehaviorSubject<any>([]);
    $sectionCommentsCount = new Subject<any>();
    $filter = new BehaviorSubject([]);
    $isToolkitVisible = new BehaviorSubject(true);
    isReviewCommentsActive = false;
    proposalSequenceStatus = new BehaviorSubject('');
}
