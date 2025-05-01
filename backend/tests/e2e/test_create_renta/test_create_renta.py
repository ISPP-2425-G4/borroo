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


def _login(driver, wait, username="user1", password="Borroo_25"):
    """Realiza el inicio de sesión en la aplicación."""
    driver.get("http://localhost:5173/login")
    time.sleep(1)
    inputs = wait.until(
        EC.presence_of_all_elements_located((By.TAG_NAME, "input"))
    )
    inputs[0].send_keys(username)
    inputs[1].send_keys(password)
    buttons = driver.find_elements(By.TAG_NAME, "button")
    for btn in buttons:
        if "INGRESAR" in btn.text.upper():
            btn.click()
            break
    time.sleep(1)
    wait.until(EC.url_contains("/"))
    time.sleep(1)


def _go_to_item_detail(driver, wait, item_id=1):
    """Navega a la página de detalle de un objeto."""
    driver.get(f"http://localhost:5173/show-item/{item_id}")
    wait.until(
        EC.presence_of_element_located((By.CLASS_NAME, "rdrCalendarWrapper"))
    )
    time.sleep(1)


def _detect_price_type(driver):
    """Detecta el tipo de precio (hora, día, mes) del objeto."""
    price_p = driver.find_element(
        By.XPATH, "//h6[contains(text(), 'Precio')]/following-sibling::p"
    )
    price_text = price_p.get_attribute("textContent").strip().lower()

    if "/ hora" in price_text:
        return "hour"
    elif "/ mes" in price_text:
        return "month"
    elif "/ día" in price_text or "/ dia" in price_text:
        return "day"
    else:
        raise ValueError(
            (
                f"No se pudo determinar el tipo de precio. "
                f"Texto encontrado: {price_text}"
            )
        )


def _select_days(driver, num_days=2):
    """Selecciona un número específico de días válidos en el calendario."""
    valid_days = [
        day for day in driver.find_elements(By.CLASS_NAME, "rdrDay")
        if "rdrDayDisabled" not in day.get_attribute("class")
        and "rdrDayPassive" not in day.get_attribute("class")
    ]
    if len(valid_days) >= num_days:
        for i in range(num_days):
            valid_days[i].click()
            time.sleep(0.5)
    else:
        raise ValueError(
            "No se encontraron suficientes días disponibles para seleccionar."
        )
    time.sleep(1)


def _select_hours(driver, start_index=5, end_index=6):
    """Selecciona las horas de inicio y fin en los dropdowns."""
    WebDriverWait(driver, 10).until(
        EC.presence_of_all_elements_located((By.TAG_NAME, "select"))
    )
    selects = driver.find_elements(By.TAG_NAME, "select")
    hora_inicio_select = Select(selects[2])
    hora_inicio_select.select_by_index(start_index)
    time.sleep(0.5)
    hora_fin_select = Select(selects[3])
    hora_fin_select.select_by_index(end_index)


def _select_months(driver, wait, num_months_index=2):
    """Selecciona el número de meses en el dropdown."""
    select = wait.until(
        EC.presence_of_element_located((By.TAG_NAME, "select"))
    )
    Select(select).select_by_index(num_months_index)
    time.sleep(1)


def _confirm_rent_request(driver):
    """Hace clic en el botón 'Solicitar alquiler' y confirma en el modal."""
    rent_buttons = driver.find_elements(By.TAG_NAME, "button")
    for btn in rent_buttons:
        if "SOLICITAR ALQUILER" in btn.text.upper():
            btn.click()
            break
    time.sleep(1)
    confirm_buttons = driver.find_elements(By.TAG_NAME, "button")
    for btn in confirm_buttons:
        if "CONFIRMAR" in btn.text.upper():
            btn.click()
            break


def _wait_for_success_message(driver, wait, message="Solicitud enviada"):
    """Espera a que aparezca el mensaje de éxito."""
    wait.until(
        EC.visibility_of_element_located(
            (By.XPATH, f"//*[contains(text(), '{message}')]")
        )
    )
    time.sleep(2)


@pytest.mark.e2e
def test_login_and_create_rent(driver):
    wait = WebDriverWait(driver, 10)

    # Login
    _login(driver, wait)

    # Ir al detalle del objeto
    _go_to_item_detail(driver, wait)

    # Detectar tipo de precio
    price_type = _detect_price_type(driver)
    print("TIPO DE PRECIO DETECTADO:", price_type)

    # Selección según tipo
    if price_type == "day":
        _select_days(driver, num_days=2)
    elif price_type == "hour":
        _select_days(driver, num_days=1)  # Selecciona un día para las horas
        _select_hours(driver)
    elif price_type == "month":
        _select_days(driver, num_days=1)  # Selecciona un día para el mes
        _select_months(driver, wait)

    # Solicitar y confirmar alquiler
    _confirm_rent_request(driver)

    # Esperar mensaje de éxito
    _wait_for_success_message(driver, wait)
