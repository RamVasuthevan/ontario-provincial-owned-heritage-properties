import re
import os
from playwright.sync_api import Playwright, sync_playwright, expect

def run(playwright: Playwright) -> None:
    browser = playwright.chromium.launch(headless=False)
    context = browser.new_context()
    page = context.new_page()
    page.goto("https://www.pastport.mtc.gov.on.ca/OHPWeb/ohp/ohpSearch.xhtml")

    page_number = 1
    os.makedirs("pages/search", exist_ok=True)

    while True:
        try:
            # Save the current page content
            with open(f"pages/search/page_{page_number}.html", "w", encoding="utf-8") as file:
                file.write(page.content())

            next_page_button = page.get_by_role("link", name="next Page")
            if next_page_button:
                next_page_button.click()
                page.wait_for_timeout(1000)  # wait for 1 second for the page to load
                page_number += 1
            else:
                break
        except Exception as e:
            print("No more next page button found or an error occurred:", e)
            break

    # ---------------------
    context.close()
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
