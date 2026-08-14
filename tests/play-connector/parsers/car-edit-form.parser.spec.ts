import { describe, expect, it } from 'vitest';

import { parsePlayCarEditFormFields } from '@/play-connector/parsers/car-edit-form.parser';

const editFormHtml = `
<form action="/cars/edit?id=3961" method="POST" enctype="multipart/form-data">
  <input type="text" name="name" value="temporary" />
  <input type="text" name="brand" value="Opel" />
  <input type="checkbox" name="min23" value="true" checked />
  <input type="checkbox" name="gps" />
  <input type="file" name="contractfile" />
  <select name="fuel">
    <option value="PETROL" selected>Benzine</option>
    <option value="DIESEL">Diesel</option>
  </select>
  <select name="CategoryId">
    <option value="0">0</option>
    <option value="1">1</option>
  </select>
  <textarea name="comments">hello</textarea>
</form>
`;

describe('parsePlayCarEditFormFields', () => {
  it('parses text, checked checkboxes, selected options, and textareas', () => {
    expect(parsePlayCarEditFormFields(editFormHtml)).toEqual({
      name: 'temporary',
      brand: 'Opel',
      min23: 'true',
      fuel: 'PETROL',
      CategoryId: '0',
      comments: 'hello',
    });
  });

  it('returns an empty object when there is no edit form', () => {
    expect(parsePlayCarEditFormFields('<html></html>')).toEqual({});
  });
});
