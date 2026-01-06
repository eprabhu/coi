import { CoiDisclosureType } from "../../common/services/coi-common.interface"

export class EntityDetail {
  coiDisclosure: any
  person: any
  numberOfSFI: any
  personEntity: any
  coiEntity: any
  personId: any
  proposals: any
  awards: any
  searchString: any
  entityStatus: any
  entityType: any
  validPersonEntityRelTypes: ValidPersonEntityRelType = new ValidPersonEntityRelType();
  coiConflictStatusTypes: any
  personEntityRelationships: any
  personEntityRelationship: any
  personEntities: any
  moduleCode: any
  moduleItemId: any
  coiDisclEntProjDetails: any
  disclosureId: any
  sfiCompleted: any
  conflictIdentifiedCount: any
  newSubmissionsCount: any
  unassignedCount: any
  pendingEntityApproval: any
  reviewCommentsCount: any
  revisionComment: any
  submoduleCode: any
  disclosureSequenceStatusCode: any
  coiDisclosures: any
  coiFinancialEntityId: any
  coiSectionsType: any
  coiReview: any
  coiReviews: any
  adminGroup: any
  coiReviewActivitys: any
  coiReviewComments: any
  coiReviewComment: any
  coiReviewCommentAttachment: any
  disclosureStatusCode: any
  numberOfProposal: any
  numberOfAward: any
  coiSubSectionsId: any
  coiSectionsTypeCode: any
  commentCount: number
  tagGroupId: any
  sort: any
  coiDisclEntProjDetail: any
  disclosureCategoryType: any
  proposalIdlinkedInDisclosure: any
  disclosureNumber: any
  proposalDisclosureWithNoSfi: any
  coiEntityId: any
  entityStatusCode: any
  inProgressDisclosureCount: any
  approvedDisclosureCount: any
  travelDisclosureCount: any
  disclosureHistoryCount: any
  filterType: any
  coiEntityList: any
  isActive: any
  coiTravelDisclosure: any
  coiTravelDisclosureList: any
  personEntityList: any
  coiProjectTypes: any
  personEntityRelType: any
  personEntityId: any
  coiProjectProposal: any
  coiProjectAward: any
  active: any
}

export class ValidPersonEntityRelType {
  validPersonEntityRelTypeCode: number
  disclosureTypeCode: string
  coiDisclosureType: CoiDisclosureType
  relationshipTypeCode?: string
  personEntityRelType: PersonEntityRelType
  description: string
  questionnaireNumber: any
  isActive: boolean
  updateTimestamp: number
  updateUser: string
}

export interface PersonEntityRelType {
  relationshipTypeCode: string
  description: string
  updateTimestamp: number
  updateUser: string
  isActive: boolean
}
