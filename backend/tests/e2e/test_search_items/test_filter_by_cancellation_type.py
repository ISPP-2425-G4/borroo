import pytest
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


@pytest.fixture
def driver():
    options = Options()
    driver = webdriver.Chrome(options=options)
    driver.set_window_size(1280, 1024)
    yield driver
    driver.quit()


@pytest.mark.e2e
def test_e2e_filter_by_cancel_type(driver):
    wait = WebDriverWait(driver, 10)

    driver.get("http://localhost:5173")
    time.sleep(2)

    driver.execute_script("window.scrollBy(0, 600);")
    time.sleep(1)

    cancel_select = wait.until(
        EC.element_to_be_clickable((
            By.CSS_SELECTOR,
            "[data-testid='select-cancel-type']"
        ))
    )
    cancel_select.click()
    time.sleep(1.5)

    flexible_option = wait.until(
        EC.element_to_be_clickable((
            By.XPATH,
            "//li[contains(text(), 'Flexible')]"
        ))
    )
    flexible_option.click()
    time.sleep(1)

    driver.execute_script("window.scrollBy(0, 1200);")
    time.sleep(1)

    producto_con_cancelacion = wait.until(
        EC.visibility_of_element_located((
            By.XPATH,
            "//*[contains(translate(., 'FLEXIBLE', 'flexible'), 'flexible')]"
        ))
    )

    assert "flexible" in producto_con_cancelacion.text.lower()
    time.sleep(2)
