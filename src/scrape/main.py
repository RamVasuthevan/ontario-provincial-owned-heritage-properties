from playwright.sync_api import sync_playwright
import os
import pandas as pd
import json

def download_xlsx():
    url = "https://www.pastport.mtc.gov.on.ca/OHPWeb/ohp/ohpSearch.xhtml"
    download_selector = "#ohpSearchForm > div:nth-child(6) > div.addborder.subhead > a"
    output_folder = os.path.join(os.path.dirname(__file__), '..', '..', 'output')  # Adjust the path to the output folder
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)  # Set to True for headless mode
        context = browser.new_context()

        page = context.new_page()
        page.goto(url)
        
        # Wait for the download to be initiated and save the file
        with page.expect_download() as download_info:
            page.click(download_selector)
        download = download_info.value
        #file_name = download.suggested_filename
        file_name = "APS_Heritage_Properties_Information.xlsx"
        download_path = os.path.join(output_folder, file_name)
        download.save_as(download_path)
        
        print(f"File downloaded and saved as {download_path}")

        context.close()
        browser.close()
    
    return download_path

def extract_data_from_excel(excel_file_path, output_json_path):
    # Read the Excel file, skipping the first two rows
    df = pd.read_excel(excel_file_path, skiprows=2, engine='xlrd')

    # Extract relevant columns
    columns_to_extract = [
        "Property Name", "Street Name", "Authority Name", "Other Name(s):", 
        "Recognition Type:", "Address:", "Description of Property:", 
        "Statement of Cultural Heritage Value or Interest:", 
        "Description of Heritage Attributes:", "Current Functional Category:", 
        "Current Functional Type:"
    ]
    df = df[columns_to_extract]

    # Replace NaN values with empty strings
    df.fillna('', inplace=True)

    # Split 'Recognition Type:' and 'Other Name(s):' columns on commas
    df['Recognition Type:'] = df['Recognition Type:'].apply(lambda x: x.split(',') if x else [])
    df['Other Name(s):'] = df['Other Name(s):'].apply(lambda x: x.split(',') if x else [])

    # Convert to list of dictionaries
    data = df.to_dict(orient='records')

    # Save to JSON file
    with open(output_json_path, 'w', encoding='utf-8') as json_file:
        json.dump(data, json_file, ensure_ascii=False, indent=4)

    return data

if __name__ == "__main__":
    # Download the XLSX file
    excel_file_path = download_xlsx()

    # Define output JSON path
    output_json_path = os.path.join(os.path.dirname(__file__), '..', '..', 'output', 'overview.json')

    # Extract data and save to JSON
    data = extract_data_from_excel(excel_file_path, output_json_path)
