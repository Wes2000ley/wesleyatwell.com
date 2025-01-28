# plantscrape.py

import time
import logging
import random
from urllib.parse import urljoin, urlparse

import undetected_chromedriver as uc
from selenium_stealth import stealth
from bs4 import BeautifulSoup
from pymongo import MongoClient

# -------------------- Configuration --------------------

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.FileHandler("plant_scraper.log"),
        logging.StreamHandler()
    ]
)

# MongoDB Configuration
MONGO_URI = "mongodb://localhost:27017/"
DATABASE_NAME = "plantai"
COLLECTION_NAME = "plants"

# Base URL
BASE_URL = "https://www.portlandnursery.com"

# Plant Categories and their URLs
PLANT_CATEGORIES = [
    {"name": "Annuals", "url": "https://www.portlandnursery.com/annuals"},
    {"name": "Bamboo", "url": "https://www.portlandnursery.com/bamboo"},
    {"name": "Bonsai", "url": "https://www.portlandnursery.com/bonsai"},
    {"name": "Bulbs", "url": "https://www.portlandnursery.com/bulbs"},
    {"name": "Container Gardening", "url": "https://www.portlandnursery.com/container-gardening"},
    {"name": "Ferns", "url": "https://www.portlandnursery.com/ferns"},
    {"name": "Fruit & Nut Trees", "url": "https://www.portlandnursery.com/fruit-nut-trees"},
    {"name": "Grasses", "url": "https://www.portlandnursery.com/grasses"},
    {"name": "Ground Covers", "url": "https://www.portlandnursery.com/ground-covers"},
    {"name": "Herbs", "url": "https://www.portlandnursery.com/herbs"},
    {"name": "Houseplants", "url": "https://www.portlandnursery.com/houseplants"},
    {"name": "Lawns", "url": "https://www.portlandnursery.com/lawns"},
    {"name": "Natives", "url": "https://www.portlandnursery.com/natives"},
    {"name": "Perennials", "url": "https://www.portlandnursery.com/perennials"},
    {"name": "Roses", "url": "https://www.portlandnursery.com/roses"},
    {"name": "Seeds", "url": "https://www.portlandnursery.com/seeds"},
    {"name": "Shrubs", "url": "https://www.portlandnursery.com/shrubs"},
    {"name": "Trees: Conifers", "url": "https://www.portlandnursery.com/trees-conifers"},
    {"name": "Trees: Leafy", "url": "https://www.portlandnursery.com/trees-leafy"},
    {"name": "Vegetables", "url": "https://www.portlandnursery.com/vegetables"},
    {"name": "Vines", "url": "https://www.portlandnursery.com/vines"},
    {"name": "Water Plants", "url": "https://www.portlandnursery.com/water-plants"},
]

# Delay between requests (in seconds)
MIN_DELAY = 2
MAX_DELAY = 4

# -------------------- Functions --------------------

def init_driver():
    """
    Initializes the Undetected ChromeDriver with Selenium Stealth in headless mode.
    """
    try:
        # Initialize Undetected ChromeDriver
        options = uc.ChromeOptions()
        options.headless = True  # Run in headless mode

        # Additional stealth options
        options.add_argument('--disable-blink-features=AutomationControlled')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--window-size=1920,1080')  # Optional: Set window size

        # Initialize the driver
        driver = uc.Chrome(options=options, headless=True)
        logging.info("Undetected ChromeDriver initialized successfully.")

        # Apply Selenium Stealth
        stealth(driver,
                languages=["en-US", "en"],
                vendor="Google Inc.",
                platform="Win32",
                webgl_vendor="Intel Inc.",
                renderer="Intel Iris OpenGL Engine",
                fix_hairline=True,
                )
        logging.info("Selenium Stealth applied successfully.")
        return driver
    except Exception as e:
        logging.error(f"Error initializing WebDriver: {e}")
        return None

def get_soup(html_content):
    """
    Parses HTML content using BeautifulSoup and returns a soup object.
    """
    return BeautifulSoup(html_content, 'html.parser')

def connect_mongodb(uri, db_name, collection_name):
    """
    Connects to MongoDB and returns the collection object.
    """
    try:
        client = MongoClient(uri)
        db = client[db_name]
        collection = db[collection_name]
        logging.info("Connected to MongoDB successfully.")
        return collection
    except Exception as e:
        logging.error(f"Error connecting to MongoDB: {e}")
        return None

def is_plant_url(url, category_url):
    """
    Determines if a URL corresponds to a plant page within the given category.
    """
    parsed_base = urlparse(category_url)
    parsed_url = urlparse(url)
    # Ensure the link is within the same domain and starts with the category path
    return (parsed_url.scheme in ['http', 'https'] and
            parsed_url.netloc == parsed_base.netloc and
            parsed_url.path.startswith(parsed_base.path + '/'))

def scrape_category(driver, category):
    """
    Scrapes all plant URLs within a specific category, handling pagination.
    """
    category_name = category['name']
    category_url = category['url']
    logging.info(f"Starting scraping for category: {category_name}")
    
    plant_urls = set()

    # Handle pagination
    page_urls = handle_pagination(driver, category_url)
    logging.info(f"Total pages to scrape in '{category_name}': {len(page_urls)}")

    for idx, page_url in enumerate(page_urls, start=1):
        logging.info(f"Scraping page {idx} of '{category_name}': {page_url}")
        driver.get(page_url)
        time.sleep(random.uniform(MIN_DELAY, MAX_DELAY))  # Wait for the page to load

        soup = get_soup(driver.page_source)
        links = soup.find_all('a', href=True)

        for link in links:
            href = link['href']
            full_url = urljoin(BASE_URL, href)
            if is_plant_url(full_url, category_url):
                plant_urls.add(full_url)
                logging.info(f"Found plant URL: {full_url}")

        # Respectful delay between pages
        time.sleep(random.uniform(MIN_DELAY, MAX_DELAY))

    logging.info(f"Total unique plant URLs found in '{category_name}': {len(plant_urls)}")
    return plant_urls

def handle_pagination(driver, initial_url):
    """
    Handles pagination by collecting all page URLs in the plant library.
    """
    page_urls = [initial_url]
    try:
        driver.get(initial_url)
        logging.info(f"Navigating to initial page: {initial_url}")
        time.sleep(random.uniform(MIN_DELAY, MAX_DELAY))  # Wait for the page to load

        while True:
            soup = get_soup(driver.page_source)

            # Identify the 'Next' button/link
            # Adjust the selector based on actual 'Next' button text or attributes
            # For example, if the 'Next' button has a specific class or data attribute
            # Here, we assume it's a link with text 'Next'
            next_button = soup.find('a', text='Next')

            if next_button and 'href' in next_button.attrs:
                next_url = urljoin(BASE_URL, next_button['href'])
                if next_url not in page_urls:
                    page_urls.append(next_url)
                    logging.info(f"Found next page: {next_url}")
                    driver.get(next_url)
                    time.sleep(random.uniform(MIN_DELAY, MAX_DELAY))  # Wait for the next page to load
                else:
                    logging.info("No new pages found. Ending pagination.")
                    break
            else:
                logging.info("No 'Next' button found. Reached the last page.")
                break

    except Exception as e:
        logging.error(f"Error handling pagination: {e}")

    logging.info(f"Total pages collected: {len(page_urls)}")
    return page_urls

def scrape_plant_page(driver, url):
    """
    Scrapes a specific plant's detailed page to extract additional information.
    """
    try:
        driver.get(url)
        logging.info(f"Navigated to plant page: {url}")
        time.sleep(random.uniform(MIN_DELAY, MAX_DELAY))  # Wait for the page to load

        soup = get_soup(driver.page_source)

        details = {}

        # Extract Plant Name
        h2_tag = soup.find('h2')
        if h2_tag:
            details['name'] = h2_tag.get_text(separator=' ', strip=True)
        else:
            details['name'] = "N/A"

        # Extract Description
        description_div = soup.find('div', class_='col-md-8 left-inner')
        if description_div:
            paragraphs = description_div.find_all('p')
            details['description'] = ' '.join([p.get_text(strip=True) for p in paragraphs if p.get_text(strip=True)])
        else:
            details['description'] = "N/A"

        # Extract Varieties
        varieties = []
        plant_tables = description_div.find_all('div', class_='row planttable') if description_div else []
        for plant_table in plant_tables:
            try:
                image_tag = plant_table.find('img')
                image_url = urljoin(BASE_URL, image_tag['src']) if image_tag else "N/A"
                image_alt = image_tag['alt'] if image_tag and 'alt' in image_tag.attrs else "N/A"

                details_col = plant_table.find_all('div', class_='col-md-6')[1]  # Second column
                plant_h2 = details_col.find('h2')
                plant_name = plant_h2.get_text(separator=' ', strip=True) if plant_h2 else "N/A"

                p_tags = details_col.find_all('p')
                plant_description = ' '.join([p.get_text(strip=True) for p in p_tags[:-1]]) if len(p_tags) > 1 else "N/A"
                zones = p_tags[-1].get_text(strip=True) if p_tags else "N/A"

                varieties.append({
                    "name": plant_name,
                    "description": plant_description,
                    "zones": zones,
                    "image_url": image_url,
                    "image_alt": image_alt
                })
            except Exception as e:
                logging.error(f"Error extracting variety details: {e}")
                continue

        details['varieties'] = varieties

        # Extract Facts from Sidebar
        facts = {}
        facts_div = soup.find('div', class_='treatment')
        if facts_div:
            for p in facts_div.find_all('p'):
                if p.find('strong'):
                    key = p.find('strong').get_text(strip=True).rstrip(':')
                    value = p.get_text(strip=True).replace(p.find('strong').get_text(strip=True), '').strip()
                    facts[key] = value
                else:
                    facts['Additional Info'] = p.get_text(strip=True)
        details['facts'] = facts

        return details

    except Exception as e:
        logging.error(f"Error scraping plant page {url}: {e}")
        return {}

def store_in_mongodb(collection, data):
    """
    Stores the provided data into MongoDB.
    """
    try:
        collection.insert_one(data)
        logging.info(f"Inserted data for plant: {data.get('name')}")
    except Exception as e:
        logging.error(f"Error inserting data into MongoDB: {e}")

def scrape_all_plants(plant_urls, driver, collection):
    """
    Iterates through the list of plant URLs, scrapes each plant's detailed page, and stores the data.
    """
    for idx, plant_url in enumerate(plant_urls, start=1):
        logging.info(f"Processing plant {idx}/{len(plant_urls)}: {plant_url}")

        # Scrape the plant's specific page for details
        plant_details = scrape_plant_page(driver, plant_url)
        if not plant_details:
            logging.warning(f"No details found for plant at {plant_url}. Skipping.")
            continue

        # Extract plant name from URL or page details
        # Example: Extracting from URL
        plant_name = plant_details.get('name') or plant_url.rstrip('/').split('/')[-1].replace('-', ' ').title()

        # Combine all data into a single document
        plant_data = {
            "name": plant_name,
            "url": plant_url,
            "image_url": plant_details.get('image_url', "N/A"),  # Adjust if image URL is extracted differently
            "details": plant_details
        }

        # Store the data in MongoDB
        store_in_mongodb(collection, plant_data)

        # Random delay to mimic human behavior
        time.sleep(random.uniform(MIN_DELAY, MAX_DELAY))

# -------------------- Main Execution --------------------

def main():
    # Initialize WebDriver
    driver = init_driver()
    if not driver:
        logging.error("WebDriver initialization failed. Exiting.")
        return

    # Connect to MongoDB
    collection = connect_mongodb(MONGO_URI, DATABASE_NAME, COLLECTION_NAME)
    if collection is None:
        logging.error("MongoDB connection failed. Exiting.")
        driver.quit()
        return

    try:
        all_plant_urls = set()

        # Iterate through each plant category
        for category in PLANT_CATEGORIES:
            category_plant_urls = scrape_category(driver, category)
            all_plant_urls.update(category_plant_urls)
            logging.info(f"Total plant URLs collected so far: {len(all_plant_urls)}")

        logging.info(f"Total unique plant URLs found across all categories: {len(all_plant_urls)}")

        # Scrape detailed information for each plant and store in MongoDB
        scrape_all_plants(all_plant_urls, driver, collection)

        logging.info("Scraping completed successfully.")

    finally:
        # Close the WebDriver
        driver.quit()
        logging.info("WebDriver closed.")

if __name__ == "__main__":
    main()
