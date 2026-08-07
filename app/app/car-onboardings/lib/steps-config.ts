import type { ChapterActor } from './chapters-config';
import type { StepId } from './types';

export type StepDefinition = {
  id: StepId;
  titleKey: string;
  subtitleKey: string;
  actors: ChapterActor[];
};

export const STEP_DEFINITIONS: StepDefinition[] = [
  {
    id: 'play-connector',
    titleKey: 'steps.playConnector.title',
    subtitleKey: 'steps.playConnector.subtitle',
    actors: ['you'],
  },
  {
    id: 'info-session',
    titleKey: 'steps.infoSession.title',
    subtitleKey: 'steps.infoSession.subtitle',
    actors: ['you'],
  },
  {
    id: 'user-info',
    titleKey: 'steps.userInfo.title',
    subtitleKey: 'steps.userInfo.subtitle',
    actors: ['you'],
  },
  {
    id: 'car-info',
    titleKey: 'steps.carInfo.title',
    subtitleKey: 'steps.carInfo.subtitle',
    actors: ['you'],
  },
  {
    id: 'insurer',
    titleKey: 'steps.insurer.title',
    subtitleKey: 'steps.insurer.subtitle',
    actors: ['you'],
  },
  {
    id: 'road-assistance-plan',
    titleKey: 'steps.roadAssistancePlan.title',
    subtitleKey: 'steps.roadAssistancePlan.subtitle',
    actors: ['you'],
  },
  {
    id: 'car-value',
    titleKey: 'steps.carValue.title',
    subtitleKey: 'steps.carValue.subtitle',
    actors: ['you', 'degage'],
  },
  {
    id: 'car-stickers',
    titleKey: 'steps.carStickers.title',
    subtitleKey: 'steps.carStickers.subtitle',
    actors: ['you'],
  },
];

export const getStepDefinition = (id: StepId): StepDefinition | undefined => STEP_DEFINITIONS.find((s) => s.id === id);
