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
    driver.get("http://localhost:5173/login")
    time.sleep(1)
    inputs = wait.until(
        EC.presence_of_all_elements_located((By.TAG_NAME, "input"))
    )
    inputs[0].send_keys(username)
    inputs[1].send_keys(password)
    for btn in driver.find_elements(By.TAG_NAME, "button"):
        if "INGRESAR" in btn.text.upper():
            btn.click()
            break
    time.sleep(1)
    wait.until(EC.url_contains("/"))
    time.sleep(1)


def _logout(driver, wait):
    # Paso 1: Clic en el botón de "Mi cuenta" (icono)
    perfil_btn = wait.until(EC.element_to_be_clickable(
        (By.XPATH, "//button[@aria-label='Mi cuenta']")
    ))
    perfil_btn.click()
    time.sleep(1)

    # Paso 2: Esperar el botón "Cerrar sesión" dentro del menú desplegado
    cerrar_sesion_btn = wait.until(EC.element_to_be_clickable(
        (By.XPATH, "//li[contains(., 'Cerrar sesión')]")
    ))
    cerrar_sesion_btn.click()


def _go_to_item_detail(driver, wait, item_id):
    driver.get(f"http://localhost:5173/show-item/{item_id}")
    wait.until(
        EC.presence_of_element_located((By.CLASS_NAME, "rdrCalendarWrapper"))
    )
    time.sleep(1)


def _es_dueno_del_objeto(driver):
    mensajes = driver.find_elements(
        By.XPATH, "//*[contains(text(), 'Eres el propietario')]"
    )
    return bool(mensajes)


def _get_owner_username(driver, wait):
    """Devuelve el nombre de usuario del dueño del objeto."""
    return wait.until(
        EC.presence_of_element_located(
            (
                By.XPATH,
                (
                    "//span[contains(text(), 'Publicado por')]"
                    "/following::button[1]"
                )
            )
        )
    ).text.strip()


def _detect_price_type(driver):
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
            f"No se pudo determinar el tipo de precio: {price_text}"
        )


def _select_days(driver, num_days=2):
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


def _get_object_name(driver):
    """Devuelve el nombre del objeto desde la pantalla de detalle."""
    titulo = driver.find_element(By.XPATH, "//h1[contains(text(), 'Objeto')]")
    return titulo.text.strip()


def _select_hours(driver, start_index=5, end_index=6):
    valid_days = [
        day for day in driver.find_elements(By.CLASS_NAME, "rdrDay")
        if "rdrDayDisabled" not in day.get_attribute("class")
        and "rdrDayPassive" not in day.get_attribute("class")
    ]
    if len(valid_days) >= 2:
        valid_days[1].click()
        time.sleep(0.5)
    else:
        raise Exception("No se encontraron suficientes días disponibles.")
    WebDriverWait(driver, 10).until(
        EC.presence_of_all_elements_located((By.TAG_NAME, "select"))
    )
    selects = driver.find_elements(By.TAG_NAME, "select")
    Select(selects[2]).select_by_index(start_index)
    time.sleep(0.5)
    Select(selects[3]).select_by_index(end_index)


def _select_months(driver, wait, num_months_index=2):
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
    Select(select).select_by_index(num_months_index)
    time.sleep(1)


def _confirm_rent_request(driver):
    for btn in driver.find_elements(By.TAG_NAME, "button"):
        if "SOLICITAR ALQUILER" in btn.text.upper():
            btn.click()
            break
    time.sleep(1)
    for btn in driver.find_elements(By.TAG_NAME, "button"):
        if "CONFIRMAR" in btn.text.upper():
            btn.click()
            break


def _volver_al_menu_principal(driver):
    """Pulsa el botón 'Volver al Menú Principal' tras la solicitud enviada."""
    for btn in driver.find_elements(By.TAG_NAME, "button"):
        if "VOLVER AL MENÚ PRINCIPAL" in btn.text.upper():
            btn.click()
            break
    time.sleep(1)


def _wait_for_success_message(driver, wait, message="Solicitud enviada"):
    wait.until(
        EC.visibility_of_element_located(
            (By.XPATH, f"//*[contains(text(), '{message}')]")
        )
    )
    time.sleep(2)


def _go_to_requests_panel(driver, wait):
    driver.get("http://localhost:5173/rental_requests")
    wait.until(
        EC.presence_of_element_located(
            (By.XPATH, "//h5[contains(text(), 'Solicitudes de Alquiler')]")
        )
    )
    time.sleep(1)


def _aceptar_solicitud(driver, wait, object_name):
    """
    Acepta la solicitud de un objeto concreto, identificado por su nombre
    y marcado como 'Solicitada'.
    """
    tarjetas = driver.find_elements(By.CLASS_NAME, "MuiCardContent-root")

    for tarjeta in tarjetas:
        texto = tarjeta.text.lower()
        if object_name.lower() in texto and "solicitada" in texto:
            try:
                # Paso 1: Clic en botón "Aceptar"
                aceptar_btn = tarjeta.find_element(
                    By.XPATH, ".//button[contains(text(), 'Aceptar')]"
                )
                aceptar_btn.click()
                time.sleep(1)

                # Paso 2: Confirmar en el modal
                confirmar_btn = wait.until(
                    EC.element_to_be_clickable(
                        (By.XPATH, "//button[contains(text(), 'Confirmar')]")
                    )
                )
                confirmar_btn.click()
                time.sleep(1)
                return
            except Exception as e:
                raise Exception(
                    (
                        "Se encontró la tarjeta correcta, pero falló la "
                        f"aceptación: {e}"
                    )
                )

    raise Exception(
        f"No se encontró una solicitud con nombre '{object_name}' "
        "y estado 'Solicitada'."
    )


@pytest.mark.e2e
def test_request_and_accept_rent(driver):
    wait = WebDriverWait(driver, 10)

    # Paso 1: Login usuario solicitante
    _login(driver, wait, username="user1")

    # Paso 2: Buscar objeto que no sea suyo
    item_id = 63
    for _ in range(5):
        _go_to_item_detail(driver, wait, item_id)
        if not _es_dueno_del_objeto(driver):
            owner_username = _get_owner_username(driver, wait)
            # 💡 Obtener nombre del objeto
            object_name = _get_object_name(driver)
            break
        item_id += 1
    else:
        raise Exception("No se encontró un objeto válido para alquilar.")

    # Paso 3: Detectar tipo de precio y seleccionar fechas
    tipo = _detect_price_type(driver)
    if tipo == "day":
        _select_days(driver)
    elif tipo == "hour":
        _select_days(driver, 1)
        _select_hours(driver)
    elif tipo == "month":
        _select_days(driver, 1)
        _select_months(driver, wait)

    # Paso 4: Hacer solicitud y esperar confirmación
    _confirm_rent_request(driver)
    _wait_for_success_message(driver, wait)
    _volver_al_menu_principal(driver)

    # Paso 5: Logout y login como dueño del objeto
    _logout(driver, wait)
    _login(driver, wait, username=owner_username)

    # Paso 6: Aceptar la solicitud
    _go_to_requests_panel(driver, wait)
    _aceptar_solicitud(driver, wait, object_name)
