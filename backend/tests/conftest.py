import pytest
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager


@pytest.fixture(scope="session")
def driver():

    service = Service(ChromeDriverManager().install())
    options = webdriver.ChromeOptions()

    driver = webdriver.Chrome(service=service, options=options)
    yield driver

    driver.quit()
