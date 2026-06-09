'use client';

import { useOnboarding } from '../../lib/onboarding-context';
import type { AdminHandlingTaskId } from '../../lib/types';
import { SubflowActions } from '../subflow-actions';
import { DemoBtn, DemoPanel } from '../demo-ui';
import styles from '../../demo.module.css';

type AdminTask = {
  id: AdminHandlingTaskId;
  label: string;
  link?: { href: string; label: string };
};

const ADMIN_TASKS: AdminTask[] = [
  {
    id: 'starter-bundle',
    label: 'We sturen je een bundel met starter info.',
  },
  {
    id: 'degapp-fiche',
    label: 'We voegen je wagenfiche toe in Degapp.',
    link: { href: 'https://degapp.be', label: 'Bekijk in Degapp' },
  },
  {
    id: 'website-map',
    label: 'We voegen je wagen toe aan de kaart op de website.',
    link: { href: 'https://www.degage.be', label: 'Bekijk op de kaart' },
  },
  {
    id: 'car-email',
    label: 'We maken een mailadres aan voor je wagen.',
  },
];

export function AdminAfhandelingSubflow() {
  const { state, updateSubflow } = useOnboarding();
  const data = state['admin-afhandeling'];

  const markDone = (taskId: AdminHandlingTaskId) => {
    updateSubflow('admin-afhandeling', { [taskId]: true });
  };

  const allDone = ADMIN_TASKS.every((task) => data[task.id]);

  return (
    <>
      <DemoPanel title="Checklist">
        <ul className={styles.checklist}>
          {ADMIN_TASKS.map((task) => {
            const done = data[task.id];
            return (
              <li key={task.id} className={`${styles.checklistItem} ${done ? styles.checklistItemDone : ''}`}>
                <div className={styles.checklistItemMain}>
                  <span className={styles.checklistIcon} aria-hidden>
                    {done ? '✓' : '○'}
                  </span>
                  <div>
                    <p className={styles.checklistLabel}>{task.label}</p>
                    {task.link ? (
                      <a href={task.link.href} target="_blank" rel="noopener noreferrer" className={styles.checklistLink}>
                        {task.link.label} →
                      </a>
                    ) : null}
                  </div>
                </div>
                {!done ? (
                  <DemoBtn small variant="secondary" onClick={() => markDone(task.id)}>
                    Afgerond (simulatie)
                  </DemoBtn>
                ) : (
                  <span className={styles.checklistDoneTag}>Afgerond</span>
                )}
              </li>
            );
          })}
        </ul>
      </DemoPanel>

      {allDone ? <div className={styles.bannerSuccess}>Alle administratieve stappen zijn afgerond.</div> : null}

      <SubflowActions subflowId="admin-afhandeling" />
    </>
  );
}
