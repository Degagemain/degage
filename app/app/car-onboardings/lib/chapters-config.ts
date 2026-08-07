export type ChapterActor = 'you' | 'degage';

export type DummyChapterStep = {
  id: string;
  titleKey: string;
  subtitleKey: string;
  actor: ChapterActor;
};

export type ChapterId = 'preparation' | 'transition' | 'readyToShare';

export type ChapterDefinition = {
  id: ChapterId;
  num: string;
  accent: 'green' | 'amber' | 'purple';
  shortKey: string;
  titleKey: string;
  taglineKey: string;
  metaBodyKey: string;
  /** When set, chapter shows these static placeholder steps (always locked for now). */
  dummySteps?: DummyChapterStep[];
};

export const CHAPTER_DEFINITIONS: ChapterDefinition[] = [
  {
    id: 'preparation',
    num: '01',
    accent: 'green',
    shortKey: 'chapters.preparation.short',
    titleKey: 'chapters.preparation.title',
    taglineKey: 'chapters.preparation.tagline',
    metaBodyKey: 'chapters.preparation.metaBody',
  },
  {
    id: 'transition',
    num: '02',
    accent: 'amber',
    shortKey: 'chapters.transition.short',
    titleKey: 'chapters.transition.title',
    taglineKey: 'chapters.transition.tagline',
    metaBodyKey: 'chapters.transition.metaBody',
    dummySteps: [
      {
        id: 'contract',
        titleKey: 'chapters.transition.steps.contract.title',
        subtitleKey: 'chapters.transition.steps.contract.subtitle',
        actor: 'you',
      },
      {
        id: 'new-insurance',
        titleKey: 'chapters.transition.steps.newInsurance.title',
        subtitleKey: 'chapters.transition.steps.newInsurance.subtitle',
        actor: 'degage',
      },
      {
        id: 'parking-card',
        titleKey: 'chapters.transition.steps.parkingCard.title',
        subtitleKey: 'chapters.transition.steps.parkingCard.subtitle',
        actor: 'degage',
      },
      {
        id: 'admin-handoff',
        titleKey: 'chapters.transition.steps.adminHandoff.title',
        subtitleKey: 'chapters.transition.steps.adminHandoff.subtitle',
        actor: 'degage',
      },
    ],
  },
  {
    id: 'readyToShare',
    num: '03',
    accent: 'purple',
    shortKey: 'chapters.readyToShare.short',
    titleKey: 'chapters.readyToShare.title',
    taglineKey: 'chapters.readyToShare.tagline',
    metaBodyKey: 'chapters.readyToShare.metaBody',
    dummySteps: [
      {
        id: 'buddy',
        titleKey: 'chapters.readyToShare.steps.buddy.title',
        subtitleKey: 'chapters.readyToShare.steps.buddy.subtitle',
        actor: 'degage',
      },
      {
        id: 'survey',
        titleKey: 'chapters.readyToShare.steps.survey.title',
        subtitleKey: 'chapters.readyToShare.steps.survey.subtitle',
        actor: 'you',
      },
    ],
  },
];
