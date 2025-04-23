import pytest
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC


@pytest.fixture
def driver():
    options = Options()
    driver = webdriver.Chrome(options=options)
    driver.set_window_size(1280, 1024)
    yield driver
    driver.quit()


@pytest.mark.e2e
def test_login_and_create_rent(driver):
    wait = WebDriverWait(driver, 10)

    # Ir al login
    driver.get("http://localhost:5173/login")
    time.sleep(1)

    # Rellenar campos
    inputs = wait.until(
        EC.presence_of_all_elements_located((By.TAG_NAME, "input"))
    )
    inputs[0].send_keys("user1")
    inputs[1].send_keys("Borroo_25")

    # Click en botón "Ingresar"
    buttons = driver.find_elements(By.TAG_NAME, "button")
    for btn in buttons:
        if "INGRESAR" in btn.text.upper():
            btn.click()
            break
    time.sleep(1)
    wait.until(EC.url_contains("/"))
    time.sleep(1)

    # Ir al detalle del objeto
    driver.get("http://localhost:5173/show-item/1")
    wait.until(
        EC.presence_of_element_located((By.CLASS_NAME, "rdrCalendarWrapper"))
    )
    time.sleep(1)

    # Detectar tipo de precio
    price_p = driver.find_element(
        By.XPATH, "//h6[contains(text(), 'Precio')]/following-sibling::p"
    )
    price_text = price_p.get_attribute("textContent").strip().lower()

    if "/ hora" in price_text:
        tipo = "hour"
    elif "/ mes" in price_text:
        tipo = "month"
    elif "/ día" in price_text or "/ dia" in price_text:
        tipo = "day"
    else:
        raise Exception(
            (
                f"No se pudo determinar el tipo de precio. "
                f"Texto encontrado: {price_text}"
            )
        )

    print("TIPO DE PRECIO DETECTADO:", tipo)

    # Selección según tipo
    if tipo == "day":
        valid_days = [
            day for day in driver.find_elements(By.CLASS_NAME, "rdrDay")
            if "rdrDayDisabled" not in day.get_attribute("class")
            and "rdrDayPassive" not in day.get_attribute("class")
        ]
        if len(valid_days) >= 2:
            valid_days[0].click()
            time.sleep(0.5)
            valid_days[1].click()
        else:
            raise Exception(
                (
                    "No se encontraron suficientes días disponibles "
                    "para seleccionar."
                )
            )
        time.sleep(1)

    elif tipo == "hour":
        # Seleccionar un día válido
        valid_days = [
            day for day in driver.find_elements(By.CLASS_NAME, "rdrDay")
            if "rdrDayDisabled" not in day.get_attribute("class")
            and "rdrDayPassive" not in day.get_attribute("class")
        ]
        if len(valid_days) >= 2:
            valid_days[1].click()
            time.sleep(0.5)
        else:
            raise Exception(
                (
                    "No se encontraron suficientes días disponibles "
                    "para seleccionar."
                )
            )

        # Esperar que los dropdowns estén presentes
        WebDriverWait(driver, 10).until(
            EC.presence_of_all_elements_located((By.TAG_NAME, "select"))
        )

        # Usar Select para seleccionar horas
        selects = driver.find_elements(By.TAG_NAME, "select")

        hora_inicio_select = Select(selects[2])
        hora_inicio_select.select_by_index(5)  # Por ejemplo, "5:00"

        time.sleep(0.5)

        hora_fin_select = Select(selects[3])
        hora_fin_select.select_by_index(6)  # Por ejemplo, "6:00"

    elif tipo == "month":
        valid_days = [
            day for day in driver.find_elements(By.CLASS_NAME, "rdrDay")
            if "rdrDayDisabled" not in day.get_attribute("class")
            and "rdrDayPassive" not in day.get_attribute("class")
        ]
        if valid_days:
            valid_days[0].click()
            time.sleep(0.5)

        select = wait.until(
            EC.presence_of_element_located((By.TAG_NAME, "select"))
        )
        # 3 meses (índice 2 porque 1 es "Selecciona una opción")
        Select(select).select_by_index(2)

    time.sleep(1)

    # Botón "Solicitar alquiler"
    rent_buttons = driver.find_elements(By.TAG_NAME, "button")
    for btn in rent_buttons:
        if "SOLICITAR ALQUILER" in btn.text.upper():
            btn.click()
            break
    time.sleep(1)

    # Confirmar en el modal
    confirm_buttons = driver.find_elements(By.TAG_NAME, "button")
    for btn in confirm_buttons:
        if "CONFIRMAR" in btn.text.upper():
            btn.click()
            break

    # Esperar mensaje de éxito
    wait.until(
        EC.visibility_of_element_located(
            (By.XPATH, "//*[contains(text(), 'Solicitud enviada')]")
        )
    )
    time.sleep(2)
