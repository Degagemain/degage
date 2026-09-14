import type { FaqPanelClassNames } from '@/app/components/documentation/faq-by-tags';
import type { DocumentationTag } from '@/domain/documentation.model';

import styles from './car-onboarding-public.module.css';
import type { StepId } from './lib/types';

export const CAR_ONBOARDING_FAQ_TAG_ALL = 'car_onboarding_all' satisfies DocumentationTag;

export const CAR_ONBOARDING_STEP_FAQ_TAGS = {
  'play-connector': 'car_onboarding_play_connector',
  'info-session': 'car_onboarding_info_session',
  'user-info': 'car_onboarding_user_info',
  'car-info': 'car_onboarding_car_info',
  insurer: 'car_onboarding_insurer',
  'road-assistance-plan': 'car_onboarding_road_assistance_plan',
  'car-value': 'car_onboarding_car_value',
  'car-stickers': 'car_onboarding_car_stickers',
  'share-start': 'car_onboarding_share_start',
} as const satisfies Record<StepId, DocumentationTag>;

export const carOnboardingFaqTags = (stepId?: StepId): DocumentationTag[] =>
  stepId ? [CAR_ONBOARDING_FAQ_TAG_ALL, CAR_ONBOARDING_STEP_FAQ_TAGS[stepId]] : [CAR_ONBOARDING_FAQ_TAG_ALL];

export const CAR_ONBOARDING_FAQ_PANEL: Partial<FaqPanelClassNames> = {
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
