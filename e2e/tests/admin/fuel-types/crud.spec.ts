import { expect, test } from '../../../fixtures';
import {
  FUEL_TYPES_LIST_PATH,
  FUEL_TYPES_NEW_PATH,
  createFuelTypeViaUi,
  defaultFuelTypeFormData,
  deleteFuelTypeFromList,
  fillFuelTypeForm,
  openFuelTypeEditFromList,
  uniqueFuelTypeCode,
} from './fuel-type.helpers';

test.describe('admin fuel types', () => {
  test('lists seeded fuel types', async ({ page, appServer, asAdmin }) => {
    void asAdmin;

    await page.goto(`${appServer.baseURL}${FUEL_TYPES_LIST_PATH}`);

    await expect(page.locator('header').getByText('Fuel Types', { exact: true })).toBeVisible();
    await expect(page.getByRole('table')).toBeVisible();
    await expect(page.getByRole('table').getByText('Diesel')).toBeVisible();
  });

  test('creates a fuel type', async ({ page, appServer, asAdmin }) => {
    void asAdmin;

    const code = uniqueFuelTypeCode();
    const data = defaultFuelTypeFormData(code);

    await createFuelTypeViaUi(page, appServer.baseURL, data);

    await expect(page.getByRole('table').getByText(data.nameEn)).toBeVisible();
  });

  test('updates a fuel type', async ({ page, appServer, asAdmin }) => {
    void asAdmin;

    const code = uniqueFuelTypeCode();
    const data = defaultFuelTypeFormData(code);
    const updatedNameEn = `${data.nameEn} updated`;

    await createFuelTypeViaUi(page, appServer.baseURL, data);
    await openFuelTypeEditFromList(page, data.nameEn);

    await page.getByRole('button', { name: 'en', exact: true }).click();
    await page.getByPlaceholder('Name (EN)').fill(updatedNameEn);
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Saved successfully.')).toBeVisible();
    await expect(page.getByPlaceholder('Name (EN)')).toHaveValue(updatedNameEn);

    await page.goto(`${appServer.baseURL}${FUEL_TYPES_LIST_PATH}`);
    await expect(page.getByRole('table').getByText(updatedNameEn)).toBeVisible();
  });

  test('deletes a fuel type', async ({ page, appServer, asAdmin }) => {
    void asAdmin;

    const code = uniqueFuelTypeCode();
    const data = defaultFuelTypeFormData(code);

    await createFuelTypeViaUi(page, appServer.baseURL, data);
    await deleteFuelTypeFromList(page, data.nameEn);

    await expect(page.getByRole('table').getByText(data.nameEn)).not.toBeVisible();
  });

  test('creates a fuel type via the list New action', async ({ page, appServer, asAdmin }) => {
    void asAdmin;

    const code = uniqueFuelTypeCode();
    const data = defaultFuelTypeFormData(code);

    await page.goto(`${appServer.baseURL}${FUEL_TYPES_LIST_PATH}`);
    await page.getByRole('link', { name: 'New' }).click();
    await expect(page).toHaveURL(new RegExp(`${FUEL_TYPES_NEW_PATH.replace(/\//g, '\\/')}$`));

    await fillFuelTypeForm(page, data);
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page).toHaveURL(new RegExp(`${FUEL_TYPES_LIST_PATH.replace(/\//g, '\\/')}$`));
    await expect(page.getByRole('table').getByText(data.nameEn)).toBeVisible();
  });
});
