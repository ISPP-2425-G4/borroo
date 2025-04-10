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
def test_e2e_filter_by_cancel_type(driver):
    wait = WebDriverWait(driver, 10)
    actions = ActionChains(driver)

    driver.get("http://localhost:5173")
    time.sleep(2)

    driver.execute_script("window.scrollBy(0, 600);")
    time.sleep(1)

    cancel_select = wait.until(
        EC.element_to_be_clickable((By.CSS_SELECTOR,
                                    "[data-testid='select-cancel-type']"))
    )
    driver.execute_script(
        (
            "arguments[0].scrollIntoView({ "
            "behavior: 'smooth', block: 'center' });"
        ),
        cancel_select
    )
    time.sleep(0.5)
    cancel_select.click()

    flexible_option = wait.until(
        EC.element_to_be_clickable(
            (
                By.CSS_SELECTOR,
                "[data-testid='cancel-type-flexible']"
            )
        )
    )

    driver.execute_script(
        (
            "arguments[0].scrollIntoView({ "
            "behavior: 'smooth', block: 'center' });"
        ),
        flexible_option
    )
    time.sleep(1)
    actions.move_to_element(flexible_option).click().perform()

    driver.execute_script("window.scrollBy(0, 1200);")
    time.sleep(1)

    producto_con_cancelacion = wait.until(
        EC.presence_of_element_located(
            (
                By.XPATH,
                (
                    "//*[contains(translate(text(), 'FLEXIBLE', 'flexible'), "
                    "'flexible')]"
                )
            )
        )
    )

    assert "flexible" in producto_con_cancelacion.text.lower()

    time.sleep(2)
