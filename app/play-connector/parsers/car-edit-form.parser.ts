import * as cheerio from 'cheerio';

const skippedInputTypes = new Set(['file', 'submit', 'button', 'image', 'reset']);

export const parsePlayCarEditFormFields = (html: string): Record<string, string> => {
  const $ = cheerio.load(html);
  const form = $('form[action*="/cars/edit"]').first();
  const fields: Record<string, string> = {};
  const controls = form.length > 0 ? form.find('input, select, textarea') : $('input, select, textarea');

  controls.each((_, el) => {
    const name = $(el).attr('name');
    if (!name) return;

    const tag = el.tagName.toLowerCase();
    if (tag === 'input') {
      const type = ($(el).attr('type') ?? 'text').toLowerCase();
      if (skippedInputTypes.has(type)) return;
      if (type === 'checkbox' || type === 'radio') {
        if (!$(el).is('[checked]')) return;
        fields[name] = $(el).attr('value') ?? 'true';
        return;
      }
      fields[name] = $(el).attr('value') ?? '';
      return;
    }

    if (tag === 'select') {
      const selected = $(el).find('option[selected]').first();
      const option = selected.length > 0 ? selected : $(el).find('option').first();
      fields[name] = option.attr('value') ?? option.text().replace(/\s+/g, ' ').trim();
      return;
    }

    fields[name] = $(el).text();
  });

  return fields;
};
