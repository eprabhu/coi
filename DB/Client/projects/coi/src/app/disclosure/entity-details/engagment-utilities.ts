import { SFI_YES_CHECKING_QUEST_IDS, SFI_MAX_RANGE, INVALID_COMPENSATION, SFI_MIN_RANGE } from "../../app-constants";
import { COIMatrix } from "./engagement-interface";

export function groupBy(jsonData: any, key: string, innerKey: string): { [groupKey: string]: any[] } {
	return jsonData.reduce((relationsTypeGroup, item) => {
		if (item?.isActive) {
			const GROUP_KEY = item[key]?.[innerKey];
			if (GROUP_KEY !== null) {
				(relationsTypeGroup[GROUP_KEY] = relationsTypeGroup[GROUP_KEY] || []).push(item);
			}
		}
		return relationsTypeGroup;
	}, {});
}

export function isMatrixReadyForSubmission(data: COIMatrix[]): boolean {
	let hasAtLeastOneYes = false;
	let hasAtLeastOne5000Plus = false;
	for (const item of data) {
		const QUESTION_ID = item?.coiMatrixQuestion?.matrixQuestionId;
		const ANSWERS = item?.coiMatrixAnswer;
		if (!Array.isArray(ANSWERS)) continue;
		if (SFI_YES_CHECKING_QUEST_IDS.includes(QUESTION_ID)) {
			if (ANSWERS.some(ans => ans?.columnValue === 'Yes')) {
				hasAtLeastOneYes = true;
			}
		}
		if (ANSWERS.some(ans => ans?.columnValue === SFI_MAX_RANGE)) {
			hasAtLeastOne5000Plus = true;
		}
	}
	return hasAtLeastOneYes || hasAtLeastOne5000Plus;
}

export function checkAllAreUncomp(data: COIMatrix[]): boolean {
	if (!Array.isArray(data) || !data.length) return false;
	return data.every(item => {
		const QUESTION_ID = item?.coiMatrixQuestion?.matrixQuestionId;
		const ANSWERS = item?.coiMatrixAnswer;
		if (SFI_YES_CHECKING_QUEST_IDS.includes(QUESTION_ID)) {
			return true;
		}
		if (!Array.isArray(ANSWERS)) return true;
		return ANSWERS.every(ans => [null, '', INVALID_COMPENSATION].includes(ans?.columnValue));
	});
}

export function checkHasAnyLowRange(data: COIMatrix[]): boolean {
	if (!Array.isArray(data)) return false;
	return data.some((ele: any) => {
		const ANSWERS = ele?.coiMatrixAnswer;
		if (!Array.isArray(ANSWERS)) return false;
		return ANSWERS?.some((ans: any) => ans?.columnValue === SFI_MIN_RANGE);
	});
}
