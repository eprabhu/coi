import { Component, Input, OnChanges, ChangeDetectionStrategy, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import * as _ from 'lodash';
import { CreateQuestionnaireService } from '../../services/create.service';
import { easeIn } from '../../services/animations';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';

@Component({
  selector: 'app-questionnaire-tree',
  templateUrl: './questionnaire-tree.component.html',
  styleUrls: ['./questionnaire-tree.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [easeIn],
})
export class QuestionnaireTreeComponent implements OnInit, OnChanges, OnDestroy {
  selectedNode: any;
  groupLabels: any;
  isMaximized: boolean;
  expandedTreeData = [];

  constructor(private _createQuestionnaireService: CreateQuestionnaireService,
    private _changeRef: ChangeDetectorRef) { }
  @Input() data: any;
  @Input() nodes: any;
  highlightNode = null;
  treeData = [];
  $subscriptions: Subscription[] = [];

  ngOnInit() {
    this.updateSelectedQuestion();
    this.updateTree();
  }

  ngOnChanges() {
    this.createTreeNodes();
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  updateHighlightNode(questionId) {
    this.highlightNode = questionId;
    this._createQuestionnaireService.updateSelectedQuestionId.next(questionId);
  }
  /**
   * updates the width of the tree to maximum according to the size of the current screen
  */
  maximizeTree() {
    this.isMaximized = true;
    (document.getElementsByClassName('qst-tree-content')[0] as HTMLElement).style.width = window.innerWidth - 85 + 'px';
    (document.getElementsByClassName('qst-tree-heading')[0] as HTMLElement).style.width = window.innerWidth - 85 + 'px';
    this.createExpandedTreeData();
  }
  /** updates the width of the tree to 192px which fits into the left size of the screen
  */
  minimizeTree() {
    this.isMaximized = false;
    (document.getElementsByClassName('qst-tree-content')[0] as HTMLElement).style.width = '14vw';
    (document.getElementsByClassName('qst-tree-heading')[0] as HTMLElement).style.width = '14vw';
  }
  /**
   * creates the questionnaire hierarchy tree for a given questionnaire.
   * creates the node to be appended to the tree
   * creates an object with respective groupName and group labels
   */
  createTreeNodes() {
    this.nodes.nodes = [];
    _.forEach(this.data.questionnaire.questions, (question, key) => {
      const newNode = {
        questionId: question.QUESTION_ID,
        name: 'Q ' + question.QUESTION_ID,
        children: [],
      };
      if (question.GROUP_NAME === 'G0') {
        this.nodes.nodes.push(newNode);
      } else {
        this.addChildToTree(this.nodes.nodes, question.PARENT_QUESTION_ID, newNode);
      }
    });
    this.treeData = this.nodes.nodes;
  }
  /**
   * @param  {} nodes
   * @param  {} parentId
   * @param  {} childId
   * @param  {} groupName
   * Traverse the existing tree to find the exact position of parent node.
   * pushes the created node to the children of parent tree and breaks the tree traversal
   */
  addChildToTree(nodes, parentId, newNode) {
    _.forEach(nodes, (node) => {
      if (node.questionId === parentId) {
        node.children.push(newNode);
        return false;
      } else if (node.children.length > 0) {
        this.addChildToTree(node.children, parentId, newNode);
      }
    });
  }

  updateTree() {
    this.$subscriptions.push(this._createQuestionnaireService.updateTree.subscribe(
      (data: any) => {
        this.createTreeNodes();
        this._changeRef.markForCheck();
      }));
  }

  updateSelectedQuestion() {
    this.$subscriptions.push(this._createQuestionnaireService.updateSelectedQuestionId.subscribe(
      (data: number) => {
        this.highlightNode = data;
        this._changeRef.markForCheck();
      }));
  }
  /**
   * @param  {} questionId
   * @param  {} groupName
   * adds a base node to tree(G0) simply pushes the created node to the nodes array
   */
  addParentToTree(questionId, groupName) {
    this.nodes.nodes.push({ questionId: questionId, name: 'Q ' + questionId, groupName: groupName, children: [] });
  }
  /**u
   * used to create expanded tree with full question and its conditions.
   *@returns create a tree hierarchy with all data
   */
  createExpandedTreeData() {
    this.expandedTreeData = [];
    _.forEach(this.data.questionnaire.questions, (question) => {
      const newNode = {
        questionId: question.QUESTION_ID,
        name: 'Q ' + question.QUESTION_ID,
        content: question.QUESTION,
        children: [],
        ruleId: question.RULE_ID,
        groupName: question.GROUP_NAME
      };
      const conditions = _.filter(this.data.questionnaire.conditions, { 'QUESTION_ID': question.QUESTION_ID });
      conditions.forEach((condition: any) => {
        newNode.children.push({
          'condition': condition.CONDITION_VALUE, children: [],
          'conditionGroup': condition.GROUP_NAME, 'type': condition.CONDITION_TYPE,
          'questionId': condition.QUESTION_ID,
          'conditionType' : this.getConditionTYpe(condition.CONDITION_TYPE)
        });
      });
      if (question.GROUP_NAME === 'G0') {
        this.expandedTreeData.push(newNode);
      } else {
        this.addChildToExpandedTree(this.expandedTreeData, newNode, question.PARENT_QUESTION_ID);
      }
    });
  }

  getConditionTYpe( type: string): string {
    switch (type) {
      case 'EQUALS' :  return 'Equals';
      case 'NOTEQUALS' :  return 'Not Equals';
      case 'CONTAINS' :  return 'Contains';
      case 'GREATERTHAN' :  return 'Greater Than';
      case 'LESSTHAN' :  return 'Less Than';
    }
  }

  /**
   * @param  {} nodes
   * @param  {} newNode
   * @param  {} parentId
   * add child to expandedTreeData according to the group name in the data groupName of the
   * node is used to match with treeData
   */
  addChildToExpandedTree(nodes, newNode, parentId) {
    _.forEach(nodes, (node) => {
      if (node.questionId === parentId) {
        node.children.forEach(child => {
          if (child.conditionGroup === newNode.groupName) {
            child.children.push(newNode);
          }
        });
        return false;
      } else if (node.children.length > 0) {
        this.addChildToExpandedTree(node.children, parentId, newNode);
      }
    });
  }
}
