import { test, expect } from '@playwright/test';
import { HomePage } from '../support/pages/home-page';
import { Commons } from '../support/pages/commons';

test.describe('Search Japan', () => {
  let homePage: HomePage;
  let commons: Commons;
  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    commons = new Commons(page);
    await homePage.visit();
    await homePage.getCookiesAcceptButton().click();
    await homePage.getCookiesAcceptButton().waitFor({ state: 'hidden' });
  });

  test('should search for Japan and validate price', async ({ page }) => {
    await expect(homePage.getSearchIcon()).toBeVisible();
    await test.step('Search for Japan', async () => {
      await homePage.getSearchInput().fill('Japan');
      await expect(homePage.getSearchIconClearButton()).toBeVisible();
      await homePage.getSearchResult().hover();
      await homePage.getSearchResult().click();
      await expect(page).toHaveURL('/japan-esim');
    });
    await test.step('Validate price', async () => {
      await expect(homePage.getPackageHeader()).toBeVisible();
      await commons.scrollToElement(homePage.get7DaysPlanButton());
      await expect(homePage.getUnlimitedPlanTab()).toBeVisible();
      await homePage.get7DaysPlanButton().click();
      await expect(homePage.get7daysPrice()).toBeVisible();
      await expect(homePage.getTotalPrice()).toBeVisible();
      await expect(homePage.getBuyNowButton()).toBeVisible();
      await expect(homePage.getTotalPrice()).toHaveText(await homePage.get7daysPrice().innerText());
    });
  });

  test('should search for invalid country and validate result', async () => {
    await expect(homePage.getSearchIcon()).toBeVisible();
    await test.step('Search for invalid country', async () => {
      await homePage.getSearchInput().fill('invalid country');
      await homePage.getSearchResult().hover();
      await expect(homePage.getSearchResult()).toHaveText('No results');
      await homePage.getSearchResult().click();
      await expect(homePage.getSearchIconClearButton()).toBeVisible();
    });
  });
});
