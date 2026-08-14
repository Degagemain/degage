import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { parsePlayProfileBasicInfo, parsePlayProfileName, parsePlayResidenceAddress } from '@/play-connector/parsers/profile-page.parser';

const fixturePath = join(process.cwd(), 'tests/fixtures/play-connector/profile-page.html');

describe('parsePlayProfileName', () => {
  it('parses last name and first name from Play format', () => {
    expect(parsePlayProfileName('Doe, Jane')).toEqual({
      lastName: 'Doe',
      firstName: 'Jane',
    });
  });

  it('returns null when the format has no comma', () => {
    expect(parsePlayProfileName('Profiel')).toBeNull();
  });
});

describe('parsePlayResidenceAddress', () => {
  it('parses street, house number, zip, and city from a Belgian address', () => {
    expect(parsePlayResidenceAddress('Teststraat 1, 9000 Gent (België)')).toEqual({
      street: 'Teststraat',
      houseNumber: '1',
      zip: '9000',
      city: 'Gent',
    });
  });

  it('parses house numbers with a letter suffix or bus box', () => {
    expect(parsePlayResidenceAddress('Teststraat 12A, 9000 Gent (België)')).toEqual({
      street: 'Teststraat',
      houseNumber: '12A',
      zip: '9000',
      city: 'Gent',
    });
    expect(parsePlayResidenceAddress('Teststraat 1 bus 2, 9000 Gent (België)')).toEqual({
      street: 'Teststraat',
      houseNumber: '1 bus 2',
      zip: '9000',
      city: 'Gent',
    });
  });

  it('keeps the full street when no house number is present', () => {
    expect(parsePlayResidenceAddress('Teststraat, 9000 Gent (België)')).toEqual({
      street: 'Teststraat',
      houseNumber: '',
      zip: '9000',
      city: 'Gent',
    });
  });

  it('returns null for malformed addresses', () => {
    expect(parsePlayResidenceAddress('No comma here')).toBeNull();
    expect(parsePlayResidenceAddress('Teststraat 1, ABC Gent')).toBeNull();
  });
});

describe('parsePlayProfileBasicInfo', () => {
  it('parses basic profile info from the real profile fixture', () => {
    const html = readFileSync(fixturePath, 'utf8');
    const profile = parsePlayProfileBasicInfo(html);

    expect(profile).toEqual({
      firstName: 'Jane',
      lastName: 'Doe',
      degageId: '123456',
      residenceAddress: 'Teststraat 1, 9000 Gent (België)',
      street: 'Teststraat',
      houseNumber: '1',
      zip: '9000',
      city: 'Gent',
      mobilePhone: '0470000001',
    });
  });

  it('returns null when the profile page is missing', () => {
    expect(parsePlayProfileBasicInfo('<html><body></body></html>')).toBeNull();
  });
});
