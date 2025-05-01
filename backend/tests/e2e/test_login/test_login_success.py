import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

driver = webdriver.Chrome()
driver.get("http://localhost:5173/login")

try:
    wait = WebDriverWait(driver, 10)

    inputs = wait.until(EC.presence_of_all_elements_located((
        By.TAG_NAME, "input")))
    user_input, pass_input = inputs[0], inputs[1]

    user_input.send_keys("User1")
    pass_input.send_keys("Borroo_25")

    login_button = wait.until(EC.element_to_be_clickable((
        By.XPATH, "//button[contains(text(), 'Ingresar')]")))
    login_button.click()

    wait.until(lambda d: d.execute_script(
        "return localStorage.getItem('access_token');") is not None)

    time.sleep(1.5)

    print("✅ Prueba de login exitosa")

except Exception as e:
    print(f"❌ Prueba fallida: {e}")

finally:
    driver.quit()
