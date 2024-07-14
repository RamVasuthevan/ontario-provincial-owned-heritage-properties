import re
import os
from playwright.sync_api import Playwright, sync_playwright, expect
from bs4 import BeautifulSoup
import csv

def scrape_with_playwright(playwright: Playwright) -> None:
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

    context.close()
    browser.close()

def extract_data_with_bs4(directory: str) -> list:
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
                        
                        data.append([property_name, street_name, authority_name])
    
    return data

def write_to_csv(data: list, output_csv: str) -> None:
    os.makedirs(os.path.dirname(output_csv), exist_ok=True)
    # Write the data to a CSV file
    with open(output_csv, 'w', newline='', encoding='utf-8') as file:
        writer = csv.writer(file)
        writer.writerow(['Property Name', 'Street Name', 'Authority Name'])
        writer.writerows(data)

    print(f"Data has been saved to {output_csv}")

# Run the Playwright script
with sync_playwright() as playwright:
    scrape_with_playwright(playwright)

# Extract data with BeautifulSoup
data = extract_data_with_bs4('pages/search/')
write_to_csv(data, '../../output/heritage_properties.csv')
