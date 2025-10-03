from playwright.sync_api import sync_playwright, Page, expect
import re

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        # Navigate to the local server
        page.goto("http://127.0.0.1:8080")

        # Find and click the settings button
        settings_button = page.locator("#settings-button")
        expect(settings_button).to_be_visible()
        settings_button.click()

        # Verify the settings panel is visible
        settings_panel = page.locator("#settings-panel")
        expect(settings_panel).to_be_visible()
        expect(settings_panel).not_to_have_class(re.compile(r"\bhidden\b"))

        # Check default HSK level
        hsk_level_select = page.locator("#hsk-level")
        expect(hsk_level_select).to_have_value("3")

        # Change the HSK level
        hsk_level_select.select_option("5")
        expect(hsk_level_select).to_have_value("5")

        # Take a screenshot of the open settings panel
        page.screenshot(path="jules-scratch/verification/verification.png")

        # Click the settings button again to close the panel
        settings_button.click()

        # Verify the settings panel is hidden
        expect(settings_panel).to_have_class(re.compile(r"\bhidden\b"))

    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)