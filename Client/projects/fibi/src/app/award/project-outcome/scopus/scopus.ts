export interface AwardScopusList {
    scopusId: null;
    title: String;
    creator: String;
    sourceType: String;
    coverDate: String;
    scopus?: Scopus[];
}

export interface ScopusDetails {
    scopus: Scopus[];
    title: String;
    scopusId: String;
    sourceTitle: String;
    doi: String;
    issn: String;
    sourceType: String;
    affiliations: String;
    authors: String;
    reference: String;
    coverDate: String;
    creator: String;
    citations: String;
    pubMedId: String;
}

export interface Scopus {
    title: String;
    scopusId: String;
    sourceTitle: String;
    doi: String;
    issn: String;
    sourceType: String;
    affiliations: String;
    authors: String;
    reference: String;
    coverDate: String;
}
