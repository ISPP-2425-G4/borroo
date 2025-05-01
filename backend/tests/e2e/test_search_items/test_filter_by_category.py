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
    time.sleep(2)
    driver.quit()


@pytest.mark.e2e
def test_e2e_filter_by_category(driver):
    wait = WebDriverWait(driver, 10)

    print("🌐 Navegando al frontend...")
    driver.get("http://localhost:5173")

    time.sleep(3)

    categoria_select = wait.until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, "div.MuiSelect-select"))
    )
    categoria_select.click()

    time.sleep(3)

    ropa_option = wait.until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, 'li[data-value="Ropa"]'))
    )
    ropa_option.click()

    producto_con_categoria = wait.until(
        EC.presence_of_element_located((By.XPATH,
                                        "//span[contains(text(), 'Ropa')]"))
    )

    assert "Ropa" in producto_con_categoria.text
