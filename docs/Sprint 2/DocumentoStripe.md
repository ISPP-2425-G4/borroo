# Guía: Cómo Realizar un Pago con Stripe en Django

## Introducción
Esta guía explica paso a paso cómo realizar un pago con Stripe. 
---

## Pasos para Realizar un Pago

### 1. Iniciar el Pago
- Dirígete a la pantalla de pago dentro de la aplicación.
- Haz clic en el botón **"Pagar"** para iniciar el proceso de pago.
- Se abrirá una ventana de Stripe donde podrás introducir los datos de la tarjeta.

### 2. Introducir los Datos de la Tarjeta
Para realizar pagos en modo de prueba en Stripe, utiliza los siguientes datos:

- **Número de tarjeta:** `4242 4242 4242 4242`
- **Fecha de expiración:** Cualquier fecha futura (Ejemplo: `12/34`)
- **CVC:** `123`
- **Nombre del titular:** Cualquier nombre
- **Correo electrónico:** Un correo válido (Ejemplo: `usuario@ejemplo.com`)

### 3. Confirmar el Pago
- Una vez introducidos los datos, haz clic en **"Pagar"**.
- Si todo es correcto, Stripe procesará la transacción.
- Serás redirigido a la página de éxito si el pago se ha completado.
- Si decides cancelar, serás redirigido a la página de cancelación.

---

## Verificación del Pago

Para confirmar que el pago se ha realizado correctamente:
- Puedes revisar en el panel de administración de la aplicación si el estado del pago aparece como **"Completado"**.
- En la cuenta de Stripe, revisa la sección de pagos y verifica que la transacción aparece con estado **"Pagado"**.

---

## Notas Adicionales

- Esta guía usa Stripe en **modo de prueba**, por lo que no se realizarán cargos reales.
- Si deseas hacer pruebas con otros tipos de tarjetas (como pagos fallidos o autenticaciones 3D Secure), consulta la documentación de [Stripe](https://stripe.com/docs/testing).

---

## Conclusión
Siguiendo estos pasos, podrás completar un pago de prueba con Stripe.