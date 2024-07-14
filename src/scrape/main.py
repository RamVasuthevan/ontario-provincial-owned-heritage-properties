import re
import os
from playwright.sync_api import Playwright, sync_playwright, expect
from bs4 import BeautifulSoup
import json
import time

def wait_for_stable_content(page):
    max_retries = 5
    retries = 0
    content = None
    while retries < max_retries:
        try:
            content = page.content()
            break
        except Exception as e:
            retries += 1
            time.sleep(1)
    if content is None:
        raise Exception("Unable to retrieve content after multiple retries.")
    return content

def scrape_with_playwright(playwright: Playwright) -> None:
    browser = playwright.chromium.launch(headless=False)
    context = browser.new_context()
    page = context.new_page()
    page.goto("https://www.pastport.mtc.gov.on.ca/OHPWeb/ohp/ohpSearch.xhtml")
    page.locator("[id=\"ohpSearchForm\\:resultSize\"]").select_option("40")

    page_number = 1
    os.makedirs("pages/search", exist_ok=True)
    os.makedirs("pages/overview", exist_ok=True)

    while True:
        try:
            # Ensure the page is fully loaded
            page.wait_for_load_state('load')
            # Wait for the content to be stable
            print(f"Saving page {page_number} content.")
            page.wait_for_load_state('networkidle')
            content = page.content()
            with open(f"pages/search/page_{page_number}.html", "w", encoding="utf-8") as file:
                file.write(content)
            print(f"Saved page {page_number} content.")

            for link_count in range(1, 41):
                link = page.locator(f'#ohpSearchForm > div:nth-child(6) > table > tbody > tr:nth-child({link_count+1}) > td:nth-child(4) > a')
                link.click()
                page.wait_for_load_state('networkidle')
                overview_page_content = page.content()
                with open(f"pages/overview/{page_number}_{link_count}.html", "w", encoding="utf-8") as file:
                    file.write(overview_page_content)
                print(f"Saved overview page {page_number}_{link_count} content.")
                page.go_back()
                page.wait_for_load_state('networkidle')

            print("Attempting to find 'next Page' button.")
            next_page_button = page.get_by_role("link", name="next Page")
            if next_page_button.count():
                print("Clicking 'next Page' button.")
                with page.expect_navigation():
                    next_page_button.click()
                print(f"Clicked 'next Page' button on page {page_number}.")
                page_number += 1
            else:
                print("No 'next Page' button found.")
                break
        except Exception as e:
            import traceback
            print(traceback.format_exc())
            print(f"An error occurred on page {page_number}: {e}")
            exit()

    context.close()
    browser.close()

def extract_search_pages_with_bs4(directory: str) -> list:
    # List to hold the data
    data = []

    # Loop through all files in the directory
    for filename in os.listdir(directory):
        if filename.endswith(".html"):
            filepath = os.path.join(directory, filename)
            
            with open(filepath, 'r', encoding='utf-8') as file:
                soup = BeautifulSoup(file, 'html.parser')
                rows = soup.select('.datadisplay')

                for row in rows:
                    cols = row.find_all('td')
                    if len(cols) == 4:  # Ensure the row has all the necessary columns
                        property_name = cols[0].get_text(strip=True)
                        street_name = cols[1].get_text(strip=True)
                        authority_name = cols[2].get_text(strip=True)
                        
                        data.append({
                            "property_name": property_name,
                            "street_name": street_name,
                            "authority_name": authority_name
                        })
    
    return data

def extract_overview_pages_with_bs4(directory: str) -> list:
    data = []

    for filename in os.listdir(directory):
        if filename.endswith(".html"):
            filepath = os.path.join(directory, filename)

            with open(filepath, 'r', encoding='utf-8') as file:
                soup = BeautifulSoup(file, 'html.parser')
                property_name = soup.select_one('span + span').get_text(strip=True)
                other_name = soup.select_one('tr:nth-child(1) .datadisplay').get_text(strip=True)
                recognition_type = soup.select_one('tr:nth-child(2) .datadisplay').get_text(strip=True)
                address = soup.select_one('tr:nth-child(3) .datadisplay').get_text(strip=True)
                authority_name = soup.select_one('tr:nth-child(4) .datadisplay').get_text(strip=True)
                description_of_property = soup.select_one('tr:nth-child(5) .datadisplay').get_text(strip=True)
                statement_of_value = soup.select_one('tr:nth-child(6) .datadisplay').get_text(strip=True)
                description_of_attributes = soup.select_one('tr:nth-child(7) .datadisplay').get_text(strip=True)
                current_functional_category = soup.select_one('tr:nth-child(8) .datadisplay').get_text(strip=True)
                current_functional_type = soup.select_one('tr:nth-child(9) .datadisplay').get_text(strip=True)

                data.append({
                    "property_name": property_name,
                    "other_name": other_name,
                    "recognition_type": recognition_type,
                    "address": address,
                    "authority_name": authority_name,
                    "description_of_property": description_of_property,
                    "statement_of_value": statement_of_value,
                    "description_of_attributes": description_of_attributes,
                    "current_functional_category": current_functional_category,
                    "current_functional_type": current_functional_type
                })

    return data

def write_to_json(data: list, output_json: str) -> None:
    os.makedirs(os.path.dirname(output_json), exist_ok=True)
    # Write the data to a JSON file
    with open(output_json, 'w', encoding='utf-8') as file:
        json.dump(data, file, ensure_ascii=False, indent=4)

    print(f"Data has been saved to {output_json}")

# Run the Playwright script
# with sync_playwright() as playwright:
#     scrape_with_playwright(playwright)

# Extract data with BeautifulSoup
search_data = extract_search_pages_with_bs4('pages/search/')
write_to_json(search_data, '../../output/heritage_properties.json')

overview_data = extract_overview_pages_with_bs4('pages/overview/')
write_to_json(overview_data, '../../output/heritage_overview.json')
