# BORROO

Plan de Pruebas
![](../imagenes/borrooLogo.png)

Sprint 3 – G4

Repositorio: [https://github.com/ISPP-2425-G4/borroo](https://github.com/ISPP-2425-G4/borroo)

02/04/2025

Miembros:

-   David Blanco Mora
-   Pablo Díaz Ordóñez
-   Pablo Espinosa Naranjo
-   Jesús Fernández Rodríguez
-   Francisco Fernández Mota
-   Javier García Rodríguez
-   Miguel González Ortiz
-   Álvaro Martín Muñoz
-   Ignacio Naredo Bernardos
-   Javier Nieto Vicioso
-   Marco Padilla Gómez
-   Miguel Palomo García
-   Luis Javier Periáñez Franco
-   Alexander Picón Garrote
-   Santiago Rosado Raya
-   Julia Sánchez Márquez
-   Alejandro Sevillano Barea

----------------
## **Histórico de modificaciones**

| Fecha      | Versión | Realizada por   | Descripción de los cambios |
| ---------- | ------- | --------------- | -------------------------- |
| 02-04-2025 | v1.0    | Javier García Rodríguez | Creación del documento |

----------------

## 1. Introducción
Este documento describe el plan de pruebas seguido en el proyecto. Subrayar que desde el Sprint 1, se estuvieron ya realizando pruebas a los distintos módulos, para poder garantizar la consistencia del código, así como su legibilidad y mantenibilidad.

Se realizarán pruebas mostradas en las píldoras teóricas de la asignatura.


## 2. Tipos de Pruebas Implementadas
- **Pruebas Unitarias:** Validación de componentes individuales.
- **Pruebas de Integración:** Verificación de la interacción entre módulos.
- **Pruebas End-to-End/Interfaz:** Verificación de la interfaz de usuario.
- **Pruebas de Rendimiento:** Medición de velocidad, carga y estabilidad.

## 3. Entorno de Pruebas

### 3.1. Pruebas Unitarias

Se ha incluido en el archivo **requirements.txt** la librería **pytest**, la cual incluye a  pytest-cov y pytest-django. El objetivo es obtener una cobertura superior al **70%**.

Estas pruebas contemplan 3 tipos de casos distintos, caso positivo, caso negativo y caso destructivo. 

Las pruebas desarrolladas están asociadas a las funcionalidades de la aplicación y módulos, respectivamente.

#### Escenarios contemplados:

- Solicitud de alquiler: [Archivo test_crud_ask_for_a_rent.py](https://github.com/ISPP-2425-G4/borroo/blob/main/backend/tests/unit/test_crud_ask_for_a_rent.py)
- Operaciones CRUD asociadas a objetos: [Archivo test_crud_items.py](https://github.com/ISPP-2425-G4/borroo/blob/main/backend/tests/unit/test_crud_items.py)
- Operaciones CRUD asociadas a usuarios: [Archivo test_crud_user.py](https://github.com/ISPP-2425-G4/borroo/blob/main/backend/tests/unit/test_crud_user.py)
- Recuperación de contraseña: [Archivo test_recuperacion_contraseña.py](https://github.com/ISPP-2425-G4/borroo/blob/main/backend/tests/unit/test_recuperacion_contrase%C3%B1a.py)
- Búsqueda de objetos: [Archivo test_search_items.py](https://github.com/ISPP-2425-G4/borroo/blob/main/backend/tests/unit/test_search_items.py)
- Planes de suscripción: [Archivo test_suscription_plan.py](https://github.com/ISPP-2425-G4/borroo/blob/main/backend/tests/unit/test_suscription_plan.py) y [archivo test_suscription_plan_upgrade.py](https://github.com/ISPP-2425-G4/borroo/blob/main/backend/tests/unit/test_suscription_plan_upgrade.py)


### 3.2. Pruebas de Integración

Se ha incluido en el archivo **requirements.txt** la librería **selenium**, la cual permite probar la interacción entre módulos y garantizar la consistencia y usabilidad de la aplicación.

#### Escenarios contemplados:

Intencionadamente en blanco.


### 3.3. Pruebas End-to-End

Se ha incluido en el archivo **requirements.txt** la librería **selenium**, la cual permite probar la interfaz de usuario con la aplicación al completo.

#### Escenarios contemplados:

Intencionadamente en blanco.


### 3.4. Pruebas de Rendimiento

Se ha incluido en el archivo **requirements.txt** la librería **locust**, la cual permite realizar 2 tipos de pruebas, de carga y de estrés.

Ambas se realizarán en los archivos denominados `locustfile.py`.

#### Escenarios contemplados:

Intencionadamente en blanco.


## 8. Anexos y Referencias

Intencionadamente en blanco.