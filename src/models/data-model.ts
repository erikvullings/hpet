export type DataModel = {
	version: number,
	lastUpdate: number,
	technologies: Technology[],
	literature: Literature[],
	users: User[],
};

export const defaultModel = {
	version: 1,
	lastUpdate: (new Date()).valueOf(),
	technologies: [],
	literature: [],
	users: [],
} as DataModel;

export enum TECHNOLOGY_CATEGORY {
	HARDWARE,
	BIO_ENHANCEMENT,
	PHARMACOLOGICAL_SUBSTANCES_SUPPLEMENTS_AND_NUTRITION,
	TRAINING,
	SELF_REGULATION,
	NUTRITION,
	OTHER,
}

export enum STATUS {
	FIRST_DRAFT,
	READY_FOR_REVIEW,
	UNDER_REVIEW,
	REVIEWED,
	FINISHED,
}

export enum HPE_CLASSIFICATION { OPTIMIZATION, ENHANCEMENT, DEGRADATION }

export enum MAIN_CAPABILITY {
	COGNITION,
	PHYSICAL,
	MENTAL,
	SOCIAL,
	PHYSIOLOGICAL,
	PERSONALITY,
}

export enum COGNITION_CAPABILITY {
	SITUATION_AWARENESS,
	EXECUTIVE_FUNCTIONS,
	LONG_TERM_MEMORY,
	SHORT_TERM_MEMORY,
	DECLARATIVE_MEMORY,
	VIGILANCE,
	PSYCHOMOTOR,
	VISUAL_PERCEPTION,
	AUDITORY_PERCEPTION,
	TACTILE_PERCEPTION,
	PAIN,
	ATTENTION,
	SPEECH,
	LEARNING,
	ARITHMETIC,
	SOCIAL_INTERACTION,
	RECOVERY,
	WORKING_MEMORY,
}

export enum PHYSICAL_CAPABILITY {
	STRENGTH,
	ENDURANCE,
	RECOVERY,
	SPEED,
	STRUCTURAL_TOUGHNESS,
	PRECISION,
	VISION,
	HEARING,
	SENSE_OF_TOUCH,
	ENERGY_EFFICIENCY,
	SLEEP_REGULATION,
}

export enum MENTAL_CAPABILITY {
	EMOTION,
	STRESS,
	RESILIENCE,
	MOTIVATION,
	SELF_ESTEEM,
	PAIN,
	SELF_REPORTED_FATIGUE,
	EMPATHY,
}

export enum SOCIAL_CAPABILITY {
	COLLABORATION,
	COMMUNICATION,
	SOCIAL_INTELLIGENCE,
}

export enum PERSONALITY_CAPABILITY {
	LEADERSHIP,
	OBEDIENCE,
	MORALE,
	RISK_TAKING,
	PERSISTANCE,
}

export enum YES_NO {
	//CAN BE USED AS A BOOSTER
	YES,
	NO,
}

export enum INVASIVENESS_OBTRUSIVENESS { LOW, MEDIUM, HIGH }

export enum EFFECT_DIRECTION { NEGATIVE, POSITIVE }

export enum MATURITY { LOW, MEDIUM, HIGH }

export enum LITERATURE_TYPE {
	CASE_STUDY,
	THESIS,
	REPORT,
	TECHNICAL_REPORT,
	PRODUCER_WEBSITE,
	WHITE_PAPER,
	CONFERENCE_PROCEEDING,
	PATENT,
	POPULAR_MEDIA,
	CONSENSUS_STATEMENT,
	EMPERICAL_PR,
	REVIEW_PR,
	SYSTEMATIC_REVIEW_PR,
	META_ANALYSIS_PR,
}

export enum EVIDENCE_LEVEL { A, B, C }

export enum EVIDENCE_DIRECTION {
	GENERALLY_IN_FAVOR,
	GENERALLY_AGAINST,
	UNDECIDED,
}

export enum AVAILABILITY {
	YES_WITHIN_THE_NETHERLANDS,
	YES_WITHIN_THE_EU,
	YES_OUTSIDE_THE_EU,
	NO,
	UNKNOWN,
}

export type ID = string;

export type Literature = {
	id: ID,
	doi: string,
	title: string,
	type: LITERATURE_TYPE,
};

export type Technology = {
	id: ID,
	owner: User,
	reviewer: User[],
	status: STATUS,
	technology: string,
	category: TECHNOLOGY_CATEGORY,
	application: string,
	hpeClassification: HPE_CLASSIFICATION,
	/** Similar technologies */
	similar: ID[],
	/** Main capability */
	mainCap: MAIN_CAPABILITY,
	/** Specific capabilities */
	specificCap: string[],
	invasive: INVASIVENESS_OBTRUSIVENESS,
	mechanism: string,
	effectDuration: string,
	booster: YES_NO,
	/** Effect incubation */
	incubation?: string,
	/** Individual differences */
	diff?: string,
	maturity: MATURITY,
	/** Practical execution */
	practical: string,
	sideEffects: string,
	/** Ethical considerations */
	ethical: string,
	/** Examples of the intervention being used in practice */
	examples: string[],
	/** Literature ID's */
	litID: ID[],
	/** Evidence direction */
	evidenceDir: EVIDENCE_DIRECTION,
	/** Evidence score */
	evidenceScore: EVIDENCE_LEVEL,
	availability: string,
	url: string[],
};

export type User = { id: ID, name: string, phone?: string, email?: string };
