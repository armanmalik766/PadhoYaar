export type ExamStage = 'PRELIMS' | 'MAINS' | 'INTERVIEW';

export type Paper =
    | 'GS-I' | 'GS-II' | 'GS-III' | 'GS-IV' | 'Essay' | 'Optional'
    | 'History' | 'Polity' | 'Geography' | 'Economy' | 'Environment' | 'Science' | 'CSAT'
    | 'Interview';

export interface SubTopic {
    title: string;
    description?: string;
    weightage?: string;
    subtopics?: SubTopic[]; // Recursive for deep nesting if needed
}

export interface Topic {
    title: string;
    subtopics: SubTopic[];
    weightage?: string;
}

export interface SyllabusSection {
    examStage: ExamStage;
    subject: string;
    paper?: Paper;
    topics: Topic[];
}

export interface SyllabusFilter {
    examStage?: ExamStage;
    subject?: string;
    paper?: string;
}
