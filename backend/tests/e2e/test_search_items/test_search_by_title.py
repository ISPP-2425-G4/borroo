import pytest
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


@pytest.mark.e2e
def test_search_by_title():
    options = Options()
    driver = webdriver.Chrome(options=options)

    try:
        print("🌐 Navegando al frontend...")
        driver.get("http://localhost:5173")

        input_elem = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located(
                (
                    By.CSS_SELECTOR,
                    "input[placeholder='Buscar productos...']"
                )
            )
        )

        time.sleep(3)

        search_script = (
            "const input = arguments[0];"
            "const nativeInputValueSetter = Object.getOwnPropertyDescriptor("
            "window.HTMLInputElement.prototype, 'value').set;"
            "nativeInputValueSetter.call(input, 'Objeto 3');"
            "input.dispatchEvent(new Event('input', { bubbles: true }));"
            "input.dispatchEvent(new Event('change', { bubbles: true }));"
        )

        driver.execute_script(search_script, input_elem)

        time.sleep(3)

        result = WebDriverWait(driver, 10).until(
            EC.visibility_of_element_located(
                (
                    By.XPATH,
                    "//h6[contains(text(), 'Objeto 3')]"
                )
            )
        )

        assert "Objeto 3" in result.text

    except Exception as e:
        print("❌ Test fallido:", e)
        driver.save_screenshot("screenshot_error.png")
        print("🖼️ Screenshot guardado como screenshot_error.png")
        raise

    finally:
        time.sleep(3)
        driver.quit()
