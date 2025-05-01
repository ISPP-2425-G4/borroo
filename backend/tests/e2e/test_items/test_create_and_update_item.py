import os
import time
import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC

options = Options()
options.add_argument("--start-maximized")
driver = webdriver.Chrome(options=options)
driver.maximize_window()
wait = WebDriverWait(driver, 15)

imagen_local = os.path.abspath("tests/e2e/assets/silla.jpg")
timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
nombre_original = f"Silla ergonómica - {timestamp}"

try:
    # --- LOGIN ---
    driver.get("http://localhost:5173/login")
    inputs = wait.until(EC.presence_of_all_elements_located((
        By.TAG_NAME, "input")))
    inputs[0].send_keys("User1")
    inputs[1].send_keys("Borroo_25")

    wait.until(EC.element_to_be_clickable((
        By.XPATH, "//button[contains(text(), 'Ingresar')]"))).click()
    wait.until(lambda d: d.execute_script(
        "return localStorage.getItem('access_token');") is not None)
    print("✅ Login exitoso")

    # --- CREAR ITEM ---
    driver.get("http://localhost:5173/create-item")
    wait.until(EC.presence_of_element_located((By.NAME, "title")))

    driver.find_element(By.NAME, "title").send_keys(nombre_original)
    driver.find_element(By.NAME, "description").send_keys(
        "Perfecta para oficina o estudio")
    wait.until(lambda d: len(Select(d.find_element(
        By.NAME, "category")).options) > 1)

    Select(driver.find_element(By.NAME, "category")).select_by_value(
        "technology")
    time.sleep(1)
    Select(driver.find_element(By.NAME, "subcategory")).select_by_value(
        "computers")
    Select(driver.find_element(By.NAME, "cancel_type")).select_by_value(
        "flexible")
    Select(driver.find_element(By.NAME, "price_category")).select_by_value(
        "day")
    driver.find_element(By.NAME, "price").send_keys("100.50")
    driver.find_element(By.NAME, "deposit").send_keys("20")

    file_input = driver.find_element(By.CSS_SELECTOR, 'input[type="file"]')
    print("📁 Cargando imagen desde:", imagen_local)
    file_input.send_keys(imagen_local)
    time.sleep(2)

    wait.until(EC.element_to_be_clickable((
        By.XPATH, "//button[contains(text(), 'Publicar')]"))).click()
    time.sleep(2)
    print(f"✅ Item '{nombre_original}' creado exitosamente")

    # --- ZOOM OUT + VOLVER A HOME ---
    wait.until(EC.presence_of_element_located((By.TAG_NAME, "body")))
    driver.execute_script("document.body.style.zoom='50%'")
    time.sleep(1.5)

    logo = wait.until(EC.presence_of_element_located((
        By.XPATH, "//h6[contains(text(), 'BORROO')]")))
    driver.execute_script(
        "arguments[0].scrollIntoView({ behavior: 'smooth', block: 'start' });",
        logo)
    time.sleep(1)
    wait.until(EC.element_to_be_clickable((
        By.XPATH, "//h6[contains(text(), 'BORROO')]"))).click()

    # --- BUSCAR EL ITEM ---
    input_elem = wait.until(EC.presence_of_element_located((
        By.CSS_SELECTOR, "input[placeholder='Buscar productos...']")))
    time.sleep(2)
    driver.execute_script(
        "const input = arguments[0];"
        "const nativeInputValueSetter = Object.getOwnPropertyDescriptor("
        "window.HTMLInputElement.prototype, 'value').set;"
        f"nativeInputValueSetter.call(input, '{nombre_original}');"
        "input.dispatchEvent(new Event('input', { bubbles: true }));"
        "input.dispatchEvent(new Event('change', { bubbles: true }));",
        input_elem
    )

    resultado = wait.until(EC.visibility_of_element_located((
        By.XPATH, f"//h6[contains(text(), '{nombre_original}')]")))
    assert nombre_original in resultado.text
    print("✅ Ítem encontrado correctamente")

    # --- ENTRAR AL DETALLE Y EDITAR ---
    resultado.click()
    editar_btn = wait.until(EC.element_to_be_clickable((
        By.XPATH, "//button[contains(text(), 'Editar')]")))
    editar_btn.click()

    modal = wait.until(EC.presence_of_element_located((
        By.XPATH, "//div[contains(@role, 'dialog')]")))
    botones = modal.find_elements(By.TAG_NAME, "button")
    for btn in botones:
        if "editar" in btn.text.lower():
            wait.until(EC.element_to_be_clickable(btn)).click()
            print("🗝 Botón 'SÍ, EDITAR' pulsado")
            break
    else:
        raise Exception("No se encontró el botón 'SÍ, EDITAR'")

    # --- ACTUALIZAR PRECIO ---
    price_input = wait.until(EC.presence_of_element_located((
        By.NAME, "price")))
    price_input.click()
    price_input.send_keys(Keys.CONTROL + "a")
    price_input.send_keys(Keys.BACKSPACE)
    time.sleep(0.5)
    price_input.send_keys("80.50")
    print("✅ Precio actualizado en el formulario")

    guardar_btn = wait.until(EC.element_to_be_clickable((
        By.XPATH, "//button[contains(text(), 'Actualizar')]")))
    driver.execute_script(
        "arguments[0].scrollIntoView({ behavior: 'smooth', block: 'center' });",  # noqa: E501
        guardar_btn)
    time.sleep(1)
    guardar_btn.click()
    wait.until(EC.staleness_of(guardar_btn))
    print("✅ Ítem actualizado correctamente")

    driver.execute_script("document.body.style.zoom='50%'")
    driver.get("http://localhost:5173")
    input_elem = wait.until(EC.presence_of_element_located((
        By.CSS_SELECTOR, "input[placeholder='Buscar productos...']")))
    time.sleep(1)
    driver.execute_script(
        "const input = arguments[0];"
        "const nativeInputValueSetter = Object.getOwnPropertyDescriptor("
        "window.HTMLInputElement.prototype, 'value').set;"
        f"nativeInputValueSetter.call(input, '{nombre_original}');"
        "input.dispatchEvent(new Event('input', { bubbles: true }));"
        "input.dispatchEvent(new Event('change', { bubbles: true }));",
        input_elem
    )

    resultado_final = wait.until(EC.visibility_of_element_located((
        By.XPATH, f"//h6[contains(text(), '{nombre_original}')]")))
    assert nombre_original in resultado_final.text
    resultado_final.click()

    # Verificar el precio actualizado
    driver.execute_script("document.body.style.zoom='50%'")
    precio_texto = wait.until(EC.visibility_of_element_located(
        (By.XPATH,
         "//*[contains(text(), '80.50') or contains(text(), '80,50')]")
    ))
    assert any(x in precio_texto.text for x in ["80.50", "80,50"])
    print("✅ Verificación final exitosa: precio actualizado visible")

except Exception as e:
    print("❌ Error durante el test:", e)
    driver.save_screenshot("update_item_error.png")
    print("🖼️ Screenshot guardado como update_item_error.png")

finally:
    time.sleep(2)
    driver.quit()
