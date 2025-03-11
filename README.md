# Borroo

**Borroo** es una plataforma de alquiler de objetos entre particulares o pequeñas empresas y particulares. Permite a los usuarios ofrecer y alquilar productos de manera segura y eficiente.

## Índice

- [Descripción](#descripción)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Instalación](#instalación)
- [Ejecutar el proyecto](#ejecutar-el-proyecto)
- [Ejecutar Tests](#ejecutar-tests)

## Descripción

Borroo facilita el intercambio temporal de bienes, permitiendo a los usuarios encontrar productos cercanos para alquilar o poner en alquiler sus propios objetos. La plataforma garantiza la seguridad y gestión eficiente de los alquileres.

## Tecnologías Utilizadas

- **Frontend:** React + Vite
- **Backend:** Django
- **Tests:** Pytest
- **Base de Datos:** MariaDB

## Instalación

### Requisitos previos

Asegúrate de tener instalados los siguientes componentes:
- Node.js y npm
- Python 3
- MariaDB 

### Pasos de instalación

1. **Clonar el repositorio**
   ```sh
   git clone https://github.com/ISPP-2425-G4/borroo
   cd borroo
   ```

2. **Instalar dependencias del frontend**
   ```sh
   cd frontend
   npm install
   ```

3. **Crear y activar entorno virtual**
    ```sh
    cd backend
    python -m venv venv
    venv/Scripts/activate
    ```

4. **Instalar dependencias del backend**
   ```sh
   cd backend
   pip install -r requirements.txt
   ```

5. **Copiar archivo .env**
   ```sh
   cd backend
   copy .env.local.example .env
   ```

6. **Configurar la base de datos**
   ```sh
   mysql -u root -p

   DROP DATABASE IF EXISTS borroo;
   DROP USER IF EXISTS 'borroo'@'localhost';
   CREATE DATABASE borroo;
   CREATE USER 'borroo'@'localhost' IDENTIFIED BY 'Borroo2025';
   GRANT ALL PRIVILEGES ON borroo.* TO 'borroo'@'localhost';
   FLUSH PRIVILEGES;
   EXIT;
   ```

7. **Ejecutar migraciones en Django**
   ```sh
   python manage.py makemigrations
   python manage.py migrate
   ```

## Ejecutar el proyecto
   ```sh
   # Backend
   cd backend
   python manage.py runserver
   ```
   ```sh
   # Frontend
   cd frontend
   npm run dev
   ```
## Ejecutar Tests
   ```sh
   # Backend
   cd backend
   pytest
   ```