import os
import time
import requests
from pymongo import MongoClient
from urllib.parse import urlparse
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import (
    ElementClickInterceptedException,
    NoSuchElementException,
    TimeoutException,
    WebDriverException
)
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# --------------------------- Configuration --------------------------- #

# MongoDB Configuration
MONGO_URI = "mongodb://localhost:27017/"  # Replace with your MongoDB URI
DB_NAME = "plantsdb"
COLLECTION_NAME = "plants"  # Replace with your collection name if different

# Scraping Configuration
NUM_IMAGES = 5  # Number of images to fetch per plant
BASE_IMAGE_PATH = Path("./images2")  # Base directory to save images

# Selenium WebDriver Configuration
# Ensure that the ChromeDriver is installed and added to your PATH
CHROME_DRIVER_PATH = "/usr/local/bin/chromedriver"  # Replace with your ChromeDriver path

# Google Images URL
GOOGLE_IMAGES_URL = "https://www.google.com/imghp?hl=en"

# Logging Configuration
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("scrape_google_images.log"),
        logging.StreamHandler()
    ]
)

# --------------------------------------------------------------------- #

def create_image_directory(plant_name):
    """
    Creates a directory for the plant to store images.
    """
    plant_dir = BASE_IMAGE_PATH / plant_name.replace(" ", "_")
    plant_dir.mkdir(parents=True, exist_ok=True)
    return plant_dir

def setup_selenium(headless=True):
    """
    Sets up the Selenium WebDriver with Chrome.
    """
    chrome_options = Options()
    if headless:
        chrome_options.add_argument("--headless")  # Run Chrome in headless mode
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--log-level=3")  # Suppress logs

    # Initialize the Service object with the path to ChromeDriver
    service = Service(executable_path=CHROME_DRIVER_PATH)

    try:
        driver = webdriver.Chrome(service=service, options=chrome_options)
        logging.info("Chrome WebDriver initialized successfully.")
        return driver
    except WebDriverException as e:
        logging.error(f"Error initializing Chrome WebDriver: {e}")
        raise

def fetch_image_urls(driver, query, num_images):
    """
    Fetches image URLs from Google Images using Selenium.
    """
    try:
        driver.get(GOOGLE_IMAGES_URL)
        logging.info(f"Navigated to {GOOGLE_IMAGES_URL}")
    except WebDriverException as e:
        logging.error(f"Error navigating to Google Images: {e}")
        return []

    # Initialize WebDriverWait
    wait = WebDriverWait(driver, 3)

    # Accept cookies if prompted
    try:
        # Replace the XPath if the consent button has different text
        consent_button = wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(text(),'I agree') or contains(text(),'Accept all')]")
        ))
        consent_button.click()
        logging.info("Clicked on consent button.")
        time.sleep(1)
    except TimeoutException:
        logging.info("No consent button found; continuing without clicking.")
    except Exception as e:
        logging.error(f"Error clicking consent button: {e}")

    # Locate the search box, enter the query, and submit
    try:
        search_box = wait.until(EC.presence_of_element_located((By.NAME, "q")))
        search_box.send_keys(query)
        search_box.submit()
        logging.info(f"Submitted search query: {query}")
    except TimeoutException:
        logging.error("Search box not found.")
        return []
    except Exception as e:
        logging.error(f"Error interacting with search box: {e}")
        return []

    image_urls = set()
    image_count = 0
    results_start = 0

    while image_count < num_images:
        # Scroll to the bottom to load more images
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        logging.info("Scrolled to bottom of the page.")
        time.sleep(2)  # Wait for images to load

        # Locate image thumbnails
        thumbnails = driver.find_elements(By.CSS_SELECTOR, "g-img.mNsIhb")
        logging.info(f"Found {len(thumbnails)} image thumbnails.")

        for img in thumbnails[results_start:]:
            if image_count >= num_images:
                break  # Exit if desired number of images is reached

            try:
                img.click()
                logging.info("Clicked on image thumbnail.")
                time.sleep(1)
                images = driver.find_elements(By.CSS_SELECTOR, "img.sFlh5c.FyHeAf.iPVvYb")
                for image in images:
                    src = image.get_attribute("src")
                    if src and "http" in src and not src.startswith('data:'):
                        if src not in image_urls:
                            image_urls.add(src)
                            image_count += 1
                            logging.info(f"Found image {image_count}: {src}")
                            if image_count >= num_images:
                                break  # Exit if desired number of images is reached
            except ElementClickInterceptedException:
                logging.warning("ElementClickInterceptedException: Could not click on thumbnail.")
                continue  # Skip to the next thumbnail
            except Exception as e:
                logging.error(f"Error clicking thumbnail: {e}")
                continue  # Skip to the next thumbnail

        if image_count >= num_images:
            break  # Exit the while loop if desired number of images is reached
        elif len(thumbnails) == results_start:
            # If no new thumbnails are found, stop the loop
            logging.info("No more images found.")
            break

        results_start = len(thumbnails)  # Update the start index for the next iteration

    return list(image_urls)[:num_images]

def download_image(url, save_path):
    """
    Downloads an image from a URL to the specified path.
    """
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        with open(save_path, "wb") as f:
            f.write(response.content)
        logging.info(f"Downloaded: {save_path}")
    except Exception as e:
        logging.error(f"Failed to download {url}: {e}")

def main():
    # Ensure base image directory exists
    BASE_IMAGE_PATH.mkdir(parents=True, exist_ok=True)
    logging.info(f"Base image directory set to: {BASE_IMAGE_PATH.resolve()}")

    # Connect to MongoDB
    try:
        client = MongoClient(MONGO_URI)
        db = client[DB_NAME]
        collection = db[COLLECTION_NAME]
        logging.info("Connected to MongoDB successfully.")
    except Exception as e:
        logging.error(f"Error connecting to MongoDB: {e}")
        return

    # Set up Selenium WebDriver
    try:
        driver = setup_selenium(headless=False)  # Set headless=True for headless mode
    except Exception as e:
        logging.error(f"Selenium setup failed: {e}")
        return

    try:
        # Fetch all plant documents
        plants = collection.find({})
        for plant in plants:
            plant_name = plant.get("name")  # Adjust the field name if different
            if not plant_name:
                logging.warning("Plant document without a name field found. Skipping.")
                continue

            logging.info(f"\nProcessing plant: {plant_name}")
            plant_dir = create_image_directory(plant_name)

            try:
                # Fetch image URLs
                search_query = f"{plant_name} plant"
                image_urls = fetch_image_urls(driver, search_query, NUM_IMAGES)
                if not image_urls:
                    logging.warning(f"No images found for {plant_name}.")
                    continue

                image_fields = {}
                for idx, url in enumerate(image_urls, start=1):
                    # Determine the image extension
                    parsed_url = urlparse(url)
                    image_ext = os.path.splitext(parsed_url.path)[1]
                    if not image_ext.lower() in ['.jpg', '.jpeg', '.png', '.gif', '.bmp']:
                        image_ext = '.jpg'  # Default extension

                    image_name = f"image{idx}{image_ext}"
                    save_path = plant_dir / image_name
                    download_image(url, save_path)

                    # Store relative path using os.path.relpath to avoid path issues
                    relative_path = os.path.relpath(save_path, Path.cwd())
                    image_fields[f"image{idx}"] = relative_path

                # Update the MongoDB document with image paths
                collection.update_one(
                    {"_id": plant["_id"]},
                    {"$set": image_fields}
                )
                logging.info(f"Updated MongoDB document for {plant_name} with image paths.")

            except Exception as e:
                logging.error(f"An error occurred while processing {plant_name}: {e}")

    finally:
        # Close Selenium WebDriver and MongoDB connection
        driver.quit()
        client.close()
        logging.info("\nImage scraping and downloading completed.")

if __name__ == "__main__":
    main()
