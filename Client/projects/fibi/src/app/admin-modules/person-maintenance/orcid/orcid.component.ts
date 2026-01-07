import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { PersonMaintenanceService } from '../person-maintenance.service';
import { ElasticConfigService } from '../../../common/services/elastic-config.service';
import { Subscription } from 'rxjs';
import { CommonService } from '../../../common/services/common.service';
import { OrcidService } from './orcid.service';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../app-constants';
import { ActivatedRoute } from '@angular/router';
import { slideInOut } from '../../../common/utilities/animations';

@Component({
  selector: 'app-orcid',
  templateUrl: './orcid.component.html',
  styleUrls: ['./orcid.component.css'],
  animations: [slideInOut]
})
export class OrcidComponent implements OnInit {

  $subscriptions: Subscription[] = [];
  homeUnitSearchOptions: any = {};
  awardElasticSearchOptions: any = {};
  isMoreInfoShowLevel1 = [];
  isMoreInfoShowLevel2 = [];
  isAward = false;
  elasticPersonSearchOptions: any = {};
  awardClearField: String;
  clearPersonField: String;
  // isMultiAwardLinkError = false;
  isAwardLinkError = false;
  isDesc = false;
  sort: any = {
    sortColumn: '',
    sortOrder: -1
  };
  orcidData: any = {};
  searchOrcidFilters: any = [];
  searchTitle: any;
  searchPerson: any;
  searchWorkCategory: any = null;
  searchworkType: any = null;
  selectedAwardNumber: any = {};
  workTypes: any = [];
  isLinkAwardsToOrcidWorks = false;
  orcidPersonId: any;
  orcidAwardId: any;
  unlinkAward: any;
  deleteIndex: any;
  tempOrcidData: any = [];
  isWorkSelected = {};
  @ViewChild('awardMultiTagOverlay', { static: true }) awardMultiTagOverlay: ElementRef;
  scrollHeight: number;
  selectedAwardNumberMulti: any;
  isDuplicate: any = {};
  isShowTaggedAwards = [];

  constructor(public _personService: PersonMaintenanceService, private _commonService: CommonService,
    private _elasticConfig: ElasticConfigService, public _orcidService: OrcidService, private _activeRoute: ActivatedRoute) { }

  ngOnInit() {
    this.checkOrcidLocation();
    this.awardElasticSearchOptions = this._elasticConfig.getElasticForAward();
    this.awardElasticSearchOptions.defaultValue = '';
    this.elasticPersonSearchOptions = this._elasticConfig.getElasticForPerson();
    this.elasticPersonSearchOptions.defaultValue = '';
    this.isAward ? this.getLinkedOrcidWorksOfAward() : this.getPersonOrcidWorks();
  }
  /**
   * for checking the current position
   */
  checkOrcidLocation() {
    this.isAward = window.location.hash.split(/[/?]/).includes('award');
  }

  getPersonOrcidWorks() {
    this.orcidPersonId = this._activeRoute.snapshot.queryParamMap.get('personId');
    this._personService.isPersonEditOrView = true;
    this.$subscriptions.push(this._orcidService.getPersonOrcidWorks({
      'personId': this.orcidPersonId
    }).subscribe((data: any) => {
      this.updateCitationData(data.personOrcidWorks);
      this.orcidData = data;
      this._personService.personDisplayCard = data.person;
      this.tempOrcidData = data.personOrcidWorks;
    }));
  }
  /**
   * @param  {} data
   * for mapping the citation values to the orcid data
   */
  updateCitationData(data) {
    data.forEach(work => {
      if (work.orcidWork.citationValue && work.orcidWork.citationType.orcidWorkCitationTypeCode === 'bibtex') {
        work.orcidWork.citationValueFormatted = this.switchCitationView(work.orcidWork.citationValue);
      }
      work.orcidWork.publicationDate = work.orcidWork.publicationYear ? this.setPublishDate(work.orcidWork.publicationDay,
          work.orcidWork.publicationMonth, work.orcidWork.publicationYear) : null;
    });
  }

  getLinkedOrcidWorksOfAward() {
    this.orcidAwardId = this._activeRoute.snapshot.queryParamMap.get('awardId');
    this._personService.isPersonEditOrView = true;
    this.$subscriptions.push(this._orcidService.getLinkedOrcidWorksOfAward({
      'awardId': this.orcidAwardId
    }).subscribe((data: any) => {
      this.updateCitationData(data.personOrcidWorks);
      this.orcidData = data;
      this.tempOrcidData = data.personOrcidWorks;
    }));
  }
  /**
   * @param  {} awardData
   * @param  {} personOrcidWorkId
   * for selecting the award in multiple works
   */
  awardSelect(awardData, personOrcidWorkId) {
    this.selectedAwardNumber[personOrcidWorkId] = awardData ? awardData.award_number : {};
  }
  /**
   * @param  {} awardData
   * for selecting the award in multiselect
   */
  multiAwardSelect(awardData) {
    this.selectedAwardNumberMulti = awardData ? awardData.award_number : null;
  }

  personSearch(person) {
    this.searchPerson = person ? person.prncpl_id : null;
  }

  redirectUrl(url) {
    window.open(url, '_blank');
  }

  sortOrcid(columnName) {
    this.isMoreInfoShowLevel1.fill(false);
    this.isShowTaggedAwards.fill(false);
    this.isMoreInfoShowLevel2.fill(false);
    this.isDesc = !this.isDesc;
    this.sort.sortColumn = columnName;
    this.sort.sortOrder = this.isDesc ? 1 : -1;
  }

  searchOrcid() {
    this.setSearchFilters();
    if (this.searchOrcidFilters.length) {
      this.orcidData.personOrcidWorks = this.multiFilter(this.tempOrcidData, this.searchOrcidFilters);
      this.searchOrcidFilters = [];
    }
  }
  /**
   * @param  {} arr
   * @param  {} filters
   * for filtering through the conditions
   */
  multiFilter = (arr, filters) => {
    let filterKeys = arr;
    filters.forEach(eachKey => {
      filterKeys = filterKeys.filter(work =>
        (eachKey.key === 'title') ? this.searchByTitle(work.orcidWork[eachKey.key], eachKey.value) :
          (eachKey.key === 'orcidWorkTypeCode') ? work.orcidWork.orcidWorkType[eachKey.key] == eachKey.value :
          (eachKey.key === 'personId') ? work[eachKey.key] == eachKey.value : work.orcidWork[eachKey.key] == eachKey.value
      );
    });
    return filterKeys;
  }

  searchByTitle(title: string, searchTitle: string) {
    if (title) {
      return title.toLowerCase().includes(searchTitle.toLowerCase());
    }
  }
  /**
   * setting the search filters
   */
  setSearchFilters() {
    if (this.searchTitle) {
      this.pushFilters('title', this.searchTitle);
    }
    if (this.searchPerson) {
      this.pushFilters('personId', this.searchPerson);
    }
    if (this.searchWorkCategory) {
      this.pushFilters('orcidWorkCategoryCode', this.searchWorkCategory);
    }
    if (this.searchworkType) {
      this.pushFilters('orcidWorkTypeCode', this.searchworkType);
    }
  }

  clearOrcidFilters() {
    this.searchTitle = this.searchPerson = this.searchWorkCategory = this.searchworkType = null;
    this.clearPersonField = new String('true');
    this.orcidData.personOrcidWorks = this.tempOrcidData;
    this.workTypes = [];
  }

  pushFilters(key, value) {
    this.searchOrcidFilters.push({ 'key': key, 'value': value });
  }

  updateOverlayState() {
    if (this.isLinkAwardsToOrcidWorks) {
      this.awardMultiTagOverlay.nativeElement.style.display = 'block';
      this.scrollHeight = document.documentElement.scrollTop;
      document.documentElement.classList.add('cdk-global-scrollblock');
      document.documentElement.style.top = - this.scrollHeight + 'px';
    } else {
      this.awardMultiTagOverlay.nativeElement.style.display = 'none';
      document.documentElement.classList.remove('cdk-global-scrollblock');
      document.documentElement.scrollTop = this.scrollHeight;
    }
  }

  unLinkPersonOrcidWorkFromAward() {
    const index = this.orcidData.personOrcidWorks[this.deleteIndex].linkedAwards.indexOf(this.unlinkAward);
    this.$subscriptions.push(this._orcidService.unLinkPersonOrcidWorkFromAward({
      'awardPersonOrcidWorkId': this.unlinkAward.awardPersonOrcidWorkId,
    }).subscribe((data: any) => {
      this.orcidData.personOrcidWorks[this.deleteIndex].linkedAwards.splice(index, 1);
      this.unlinkAward = {};
      this.deleteIndex = null;
    }, err => { this._commonService.showToast(HTTP_ERROR_STATUS, 'Unliking Award Action failed. Please try again.'); },
      () => { this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Award unlinked successfully.'); }
    ));
  }

  setTypeOtions(categoryCode) {
    this.workTypes = categoryCode ? this.orcidData.orcidWorkTypes.filter(type =>
      categoryCode === type.orcidWorkCategory.orcidWorkCategoryCode) : [];
  }

  linkPersonOrcidWorksToAward(personOrcidWorkId) {
    const personOrcidWorkIdList = personOrcidWorkId ? [] : this.prepareWorkIdList();
    if (this.isAwardDuplicate(personOrcidWorkId ? this.selectedAwardNumber[personOrcidWorkId] : this.selectedAwardNumberMulti,
      personOrcidWorkIdList, personOrcidWorkId)) {
      this.$subscriptions.push(this._orcidService.linkPersonOrcidWorksToAward({
        'awardNumber': this.selectedAwardNumberMulti ? this.selectedAwardNumberMulti : this.selectedAwardNumber[personOrcidWorkId],
        'personOrcidWorkIds': personOrcidWorkId ? [personOrcidWorkId] : personOrcidWorkIdList,
        'updateUser': this._commonService.getCurrentUserDetail('userName'),
        'personId': this.orcidPersonId
      }).subscribe((data: any) => {
        data.awardPersonOrcidWorks.forEach(element => {
          const orcidData = this.orcidData.personOrcidWorks.find(work => work.personOrcidWorkId ===
            element.personOrcidWorkId);
          if (orcidData) { this.pushAwardToWorks(orcidData, element); }
          this.clearElastic();
        });
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Award linked successfully.');
      }, err => {
        this._commonService.showToast(HTTP_ERROR_STATUS, 'Linking Award Action failed. Please try again.');
        this.clearElastic();
      }));
    }
  }

  prepareWorkIdList() {
    const workList = [];
    for (const key in this.isWorkSelected) {
      if (this.isWorkSelected[key]) {
        workList.push(parseInt(key, 10));
      }
    }
    return workList;
  }

  clearElastic() {
    this.selectedAwardNumberMulti = null;
    this.selectedAwardNumber = {};
    this.awardClearField = new String('true');
    this.awardElasticSearchOptions.defaultValue = '';
  }
  /**
   * @param  {} orcidData
   * @param  {} awardData
   * for pushing the award data
   */
  pushAwardToWorks(orcidData, awardData) {
    orcidData.linkedAwards.push(awardData);
  }

  showLinkMultipleAward() {
    return Object.values(this.isWorkSelected).some(this.isSelected);
  }

  isSelected = (currentValue) => currentValue === true;

  closeMultiAwardAdd() {
    this.clearElastic();
    this.isLinkAwardsToOrcidWorks = false;
    this.updateOverlayState();
  }
  /**
   * @param  {} awardNumber
   * @param  {} workIds
   * @param  {} personOrcidWorkId
   * for checking duplicatoin in award linking
   */
  isAwardDuplicate(awardNumber, workIds, personOrcidWorkId) {
    let linkedAwards = [], duplicatePresent;
    this.isDuplicate = {};
    this.isAwardLinkError = false;
    // this.isMultiAwardLinkError = false;
    if (personOrcidWorkId) {
      linkedAwards = this.orcidData.personOrcidWorks.find(work => work.personOrcidWorkId === personOrcidWorkId).linkedAwards;
      if (linkedAwards && linkedAwards.length) {
        duplicatePresent = linkedAwards.find(award => award.awardDetail.moduleItemKey === awardNumber);
      }
      this.isAwardLinkError = duplicatePresent ? true : false;
      this.isDuplicate[personOrcidWorkId] = this.isAwardLinkError ? 'This award already exists' : null;
      return !this.isAwardLinkError;
    } else {
      return true;
    }
    // else {
    //   workIds.forEach(element => {
    //     linkedAwards = this.orcidData.personOrcidWorks.find(work => work.personOrcidWorkId === element).linkedAwards;
    //     if (linkedAwards && linkedAwards.length) {
    //       duplicatePresent = linkedAwards.find(award => award.awardDetail.moduleItemKey === awardNumber);
    //     }
    //     this.isMultiAwardLinkError = linkedAwards ? false : true;
    //     return linkedAwards ? true : false;
    //   });
    // }
  }
  /**
   * @param  {} typeCode
   * for displating the title field
   */
  titleLabelSwitch(typeCode) {
    switch (typeCode) {
      case 'journal-article':
      case 'journal-issue':
      case 'preprint':
      case 'dissertation-thesis': { return 'Journal title'; }
      case 'book':
      case 'dictionary-entry':
      case 'book-chapter': { return 'Book title'; }
      case 'magazine-article': { return 'Magazine title'; }
      case 'newsletter': { return 'Newsletter title'; }
      case 'newspaper-article': { return 'Newspaper title'; }
      case 'report':
      case 'supervised-student-publication':
      case 'working-paper':
      case 'test':
      case 'research-tool': { return 'Institution'; }
      case 'disclosure':
      case 'license':
      case 'artistic-performance':
      case 'data-set':
      case 'invention':
      case 'lecture-speech':
      case 'patent':
      case 'research-technique':
      case 'spin-off-company':
      case 'technical-standard':
      case 'standards-and-policy':
      case 'book-review':
      case 'edited-book':
      case 'encyclopedia-entry':
      case 'other':
      case 'manual':
      case 'online-resource':
      case 'website':
      case 'translation':
      case 'online-resource':
      case 'registered-copyright': { return 'Publisher'; }
      case 'conference-abstract':
      case 'conference-paper':
      case 'conference-poster': { return 'Conference title'; }
      case 'software':
      case 'trademark': { return 'Journal article'; }
      case 'annotation':
      case 'physical-object': { return 'Custodian'; }
      default: {return 'title'; }
    }
  }
  /**
  * @param content
  * This code formats the output to an array. Which in turn is shown as as key value pair in UI.
  * The output array's odd positions(1,3,5,7) will be key and even positions(2,4,6,8)as values.
  * See the HTML ngFor to understand this further.
  * basically the string which comes is formatted in a particular way.
  * sample string <--- @inbook{RID:0317170445696-66, title = {Dual Fluorescence Phenomenon in ‘Push-Pull’ Stilbenes},
  * chapter = {13},pages = {337-352}, publisher = {},year = {2016},
  * author = {Pines, Dina and Pines, Ehud and Steele, TerryW J. and Papper, Vladislav},
  * editor = {Geddes, Chris D.}, booktitle = {Reviews in Fluorescence 2015},
  * series = {Reviews in Fluorescence},volume = {8}} --->
  * the first line of code will remove first comma
  * the second line will replace all the content will empty values with '~' ( eg - publisher in string)
  * the third line will replace all the unwanted comma with '@'. this is used to split the string into array.
  * The last line will remove the empty spaces created by split resolve the string into key-value pair array.
  */
  switchCitationView(content: string) {
    let formattedContent: any = content.replace(',', '@');
    formattedContent = this.selectCitationWithCommaOnly(formattedContent);
    formattedContent = formattedContent.replace(/{},/g, '~ =');
    formattedContent = formattedContent.replace(/},/g, '@');
    formattedContent = formattedContent.replace(/",/g, '@');
    formattedContent = formattedContent.replace(/= [{"]/g, '=');
    formattedContent = formattedContent.replace(/@/g, '=');
    formattedContent = formattedContent.replace(/{/, '=');
    formattedContent = formattedContent.replace(/}\s}/, '=');
    formattedContent = formattedContent.replace(/}}/, '=');
    formattedContent = formattedContent.split('=').map(data => data.trim()).filter(Boolean);
    return formattedContent;
  }
  /**
   * @param  {string} content
   * for handelling the case where there are no braces or quotes
   */
  selectCitationWithCommaOnly(content: string) {
    let matchValue: any, matchBackup: any;
    matchValue = content.match(/= ([A-Za-z0-9])+,/g);
    matchBackup = content.match(/= ([A-Za-z0-9])+,/g);
    if (matchValue && matchBackup) {
      matchValue = this.replaceCommas(matchValue);
      content = this.replaceCitationValues(content, matchValue, matchBackup);
    }
    return content;
  }

  replaceCommas(array) {
    let tempArray = [];
    array.map(element => {
      element = element.replace(',', '@');
      tempArray.push(element);
    });
    return tempArray;
  }

  replaceCitationValues(content, changedValues, oldValues) {
    changedValues.forEach((element, index) => {
      content = content.replace(oldValues[index], element);
    });
    return content;
  }

  setPublishDate(date, month, year) {
    let publicationDate: string;
    if (date) {
      publicationDate = date + '-';
    }
    if (month) {
      publicationDate = publicationDate ? publicationDate + month + '-' : month + '-';
    }
    publicationDate = publicationDate ? publicationDate + year : year;
    return publicationDate;
  }

}
