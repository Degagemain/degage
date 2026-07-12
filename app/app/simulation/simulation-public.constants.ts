import type { FaqPanelClassNames } from '@/app/components/documentation/faq-by-tags';
import type { DocumentationTag } from '@/domain/documentation.model';

import styles from './simulation.module.css';

export const STEP_RESULT = 1;
export const STEP_COST_SCENARIOS = 2;
export const STEP_CONFIRMATION = 3;

export const NUMBERED_STEP_TOTAL = 4;

export const COST_SCENARIO_PEOPLE_BY_INDEX = [8, 14, 20] as const;

export const NEW_REGION_START_DOC_HREF =
  'https://www.degage.be/wp-content/uploads/2021/03/Degage-starten-als-particulier-in-jouw-stad_gemeente.pdf';

export const SIM_FAQ_PANEL: Partial<FaqPanelClassNames> = {
  panel: styles.faqPanel,
  headerButton: styles.faqPanelHeaderBtn,
  headerRight: styles.faqPanelHeaderRight,
  title: styles.faqPanelTitle,
  countBadge: styles.faqPanelCount,
  sectionChevron: styles.faqPanelSectionChevron,
  item: styles.faqPanelItem,
  itemTrigger: styles.faqPanelQBtn,
  questionText: styles.faqPanelQText,
  questionChevron: styles.faqPanelQChevron,
  itemContent: styles.faqPanelAnswer,
};

export const SIMULATION_FAQ_TAGS = {
  step1: ['simulation_step_1'],
  step2Approved: ['simulation_step_2_approved'],
  step2Rejected: ['simulation_step_2_rejected'],
  step2Review: ['simulation_step_2_review'],
  step3: ['simulation_step_3'],
  step4: ['simulation_step_4'],
} as const satisfies Record<string, DocumentationTag[]>;

export type ConfirmationMemberPath = 'infosessie' | 'lid' | 'nieuw';

export type ConfirmationStepDef = {
  n: number;
  labelKey: string;
  metaKey: string;
  cta?: boolean;
};

export const CONFIRMATION_STEPS_BY_PATH: Record<ConfirmationMemberPath, ConfirmationStepDef[]> = {
  infosessie: [
    { n: 1, labelKey: 'insStep1Label', metaKey: 'insStep1Meta' },
    { n: 2, labelKey: 'insStep2Label', metaKey: 'insStep2Meta' },
    { n: 3, labelKey: 'insStep3Label', metaKey: 'insStep3Meta' },
    { n: 4, labelKey: 'insStep4Label', metaKey: 'insStep4Meta' },
  ],
  lid: [
    { n: 1, labelKey: 'lidStep1Label', metaKey: 'lidStep1Meta', cta: true },
    { n: 2, labelKey: 'lidStep2Label', metaKey: 'lidStep2Meta' },
    { n: 3, labelKey: 'lidStep3Label', metaKey: 'lidStep3Meta' },
    { n: 4, labelKey: 'lidStep4Label', metaKey: 'lidStep4Meta' },
    { n: 5, labelKey: 'lidStep5Label', metaKey: 'lidStep5Meta' },
  ],
  nieuw: [
    { n: 1, labelKey: 'newStep1Label', metaKey: 'newStep1Meta' },
    { n: 2, labelKey: 'newStep2Label', metaKey: 'newStep2Meta', cta: true },
    { n: 3, labelKey: 'newStep3Label', metaKey: 'newStep3Meta' },
    { n: 4, labelKey: 'newStep4Label', metaKey: 'newStep4Meta' },
    { n: 5, labelKey: 'newStep5Label', metaKey: 'newStep5Meta' },
    { n: 6, labelKey: 'newStep6Label', metaKey: 'newStep6Meta' },
  ],
};

export const CONFIRMATION_PATH_OPTIONS: { id: ConfirmationMemberPath; labelKey: string }[] = [
  { id: 'infosessie', labelKey: 'pathInfosessie' },
  { id: 'lid', labelKey: 'pathLid' },
  { id: 'nieuw', labelKey: 'pathNieuw' },
];
