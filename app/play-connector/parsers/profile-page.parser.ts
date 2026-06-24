import * as cheerio from 'cheerio';

const PROFILE_NAME_PATTERN = /^([^,]+),\s*(.+)$/;
const RESIDENCE_ADDRESS_PATTERN = /^(.+?),\s*(\d{4})\s+(.+?)(?:\s+\([^)]+\))?\s*$/;

export type PlayProfileName = {
  firstName: string;
  lastName: string;
};

export type PlayResidenceAddress = {
  street: string;
  zip: string;
  city: string;
};

export type PlayProfileBasicInfo = PlayProfileName &
  PlayResidenceAddress & {
    degageId: string;
    residenceAddress: string;
    mobilePhone: string;
  };

export const parsePlayProfileName = (raw: string): PlayProfileName | null => {
  const match = raw.trim().match(PROFILE_NAME_PATTERN);
  if (!match) {
    return null;
  }

  return {
    lastName: match[1].trim(),
    firstName: match[2].trim(),
  };
};

export const parsePlayResidenceAddress = (raw: string): PlayResidenceAddress | null => {
  const match = raw.trim().match(RESIDENCE_ADDRESS_PATTERN);
  if (!match) {
    return null;
  }

  return {
    street: match[1].trim(),
    zip: match[2].trim(),
    city: match[3].trim(),
  };
};

const normalizeDdText = (html: string): string =>
  cheerio
    .load(html)
    .root()
    .text()
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const buildDefinitionListMap = ($: cheerio.CheerioAPI): Map<string, string> => {
  const map = new Map<string, string>();

  $('dl').each((_, dl) => {
    $(dl)
      .find('dt')
      .each((__, dt) => {
        const label = $(dt).text().replace(/\s+/g, ' ').trim();
        const dd = $(dt).next('dd');
        if (!label || !dd.length) {
          return;
        }

        const telLink = dd.find('a[href^="tel:"]').first();
        const value = telLink.length ? telLink.text().replace(/\s+/g, ' ').trim() : normalizeDdText(dd.html() ?? '');

        map.set(label, value);
      });
  });

  return map;
};

export const parsePlayProfileBasicInfo = (html: string): PlayProfileBasicInfo | null => {
  const $ = cheerio.load(html);

  const name = $('.panel-body h3')
    .toArray()
    .map((heading) => parsePlayProfileName($(heading).text()))
    .find((parsed): parsed is PlayProfileName => parsed !== null);

  if (!name) {
    return null;
  }

  const fields = buildDefinitionListMap($);
  const degageId = fields.get('Dégage ID');
  const residenceAddress = fields.get('Verblijfsadres');
  const mobilePhone = fields.get('GSM');

  if (!degageId || !residenceAddress || !mobilePhone) {
    return null;
  }

  const parsedAddress = parsePlayResidenceAddress(residenceAddress);
  if (!parsedAddress) {
    return null;
  }

  return {
    firstName: name.firstName,
    lastName: name.lastName,
    degageId,
    residenceAddress,
    street: parsedAddress.street,
    zip: parsedAddress.zip,
    city: parsedAddress.city,
    mobilePhone,
  };
};
