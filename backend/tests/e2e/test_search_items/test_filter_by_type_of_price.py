import pytest
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains


@pytest.fixture
def driver():
    options = Options()
    driver = webdriver.Chrome(options=options)
    driver.set_window_size(1280, 1024)
    yield driver
    driver.quit()


@pytest.mark.e2e
def test_e2e_filter_by_price_type_mes(driver):
    wait = WebDriverWait(driver, 10)
    actions = ActionChains(driver)

    driver.get("http://localhost:5173")
    time.sleep(2)

    price_type_select = wait.until(
        EC.element_to_be_clickable((
            By.CSS_SELECTOR,
            "[data-testid='select-price-type']"
        ))
    )

    driver.execute_script(
        "arguments[0].scrollIntoView({ behavior: 'smooth', "
        "block: 'center' });",
        price_type_select
    )

    time.sleep(1)
    price_type_select.click()

    wait.until(
        EC.presence_of_element_located((
            By.CSS_SELECTOR,
            'ul[role="listbox"]'
        ))
    )

    mes_option = wait.until(
        EC.element_to_be_clickable((
            By.CSS_SELECTOR,
            "[data-testid='price-type-month']"
        ))
    )

    driver.execute_script(
        "arguments[0].scrollIntoView({ block: 'center' });",
        mes_option
    )
    time.sleep(1)
    actions.move_to_element(mes_option).click().perform()
    time.sleep(2)

    driver.execute_script(
        "document.documentElement.scrollIntoView({ "
        "behavior: 'smooth', block: 'start' });"
    )
    time.sleep(1.5)

    cards = driver.find_elements(By.CSS_SELECTOR, ".MuiCardContent-root")
    hay_mes = any("mes" in card.text.lower() for card in cards)
    assert hay_mes, (
        "No se encontró ningún producto con tipo de precio 'Mes'"
    )
