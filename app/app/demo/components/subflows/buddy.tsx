'use client';

import { SubflowActions } from '../subflow-actions';
import { DemoPanel } from '../demo-ui';

const BUDDY = {
  name: 'Sophie Vermeulen',
  email: 'sophie.vermeulen@degage.be',
  phone: '+32 478 12 34 56',
  hub: 'Leuven',
};

export function BuddySubflow() {
  return (
    <>
      <DemoPanel title="Je buddy in de buurt">
        <p className="mb-4 text-[15px] leading-relaxed text-[#5a5248]">
          Sophie is je aanspreekpunt tijdens de eerste weken. Stel gerust vragen over delen, boekingen of de opstart.
        </p>
        <dl style={{ display: 'grid', gap: 12, fontSize: 15 }}>
          <div>
            <dt className="text-xs font-semibold tracking-wider text-[#9c9489] uppercase">Naam</dt>
            <dd className="text-[#181510]">{BUDDY.name}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold tracking-wider text-[#9c9489] uppercase">E-mail</dt>
            <dd>
              <a href={`mailto:${BUDDY.email}`} className="text-[#388e3c] underline">
                {BUDDY.email}
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold tracking-wider text-[#9c9489] uppercase">Telefoon</dt>
            <dd>
              <a href={`tel:${BUDDY.phone}`} className="text-[#388e3c] underline">
                {BUDDY.phone}
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold tracking-wider text-[#9c9489] uppercase">Buurthub</dt>
            <dd className="text-[#181510]">{BUDDY.hub}</dd>
          </div>
        </dl>
      </DemoPanel>

      <SubflowActions subflowId="buddy" />
    </>
  );
}
