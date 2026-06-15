import { Locator, Page } from "@playwright/test";

export class HomePage {
  constructor(private page: Page    ) {}

  visit() {
    return this.page.goto('/');
  }

  getCookiesAcceptButton() {
    return this.page.locator('[id="onetrust-accept-btn-handler"]');
  }

  getSearchIcon() {
    return this.page.locator('[data-testid="search-input_search-icon"]');
  }

  getSearchIconClearButton() {
    return this.page.locator('[data-testid="search-input_clear-icon"]');
  }

  getSearchInput() {
    return this.page.locator('[data-testid="search-input_text-field"]');
  }

  getSearchResult() {
    return this.page.locator('[tabindex] ul li').nth(0);
  }

  getPackageHeader() {
    return this.page.locator('[data-testid="package-location-header_title"]');
  }

  getUnlimitedPlanTab() {
    return this.page.locator('[data-testid="segmented-control_tab-unlimited"]');
  }

  get7DaysPlanButton() {
    return this.page.locator('[data-testid="package-grouped-packages_package-button"]').nth(2);
  }

  get7daysPrice() {
    return this.page.locator('[data-testid="card-package_container"] [data-testid="price_amount"]').nth(2);
  }

  getTotalPrice() {
    return this.page.locator('[data-testid="cart-navigation_container"] [data-testid="price_amount"]');
  }

  getBuyNowButton() {
    return this.page.locator('[data-testid="cart-navigation_select-package-cta"]');
  }

  scrollToElement(locator: Locator) {
    return locator.scrollIntoViewIfNeeded();
  }

}
