import { Locator, Page } from "@playwright/test";

export class Commons {
  constructor(private page: Page ) {}

  scrollToElement(locator: Locator) {
    return locator.scrollIntoViewIfNeeded();
  }

}
