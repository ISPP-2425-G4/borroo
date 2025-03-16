# Borroo

**Borroo** es una plataforma de alquiler de objetos entre particulares o pequeñas empresas y particulares. Permite a los usuarios ofrecer y alquilar productos de manera segura y eficiente.

## Índice

- [Descripción](#descripción)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Instalación](#instalación)
- [Ejecutar el proyecto](#ejecutar-el-proyecto)
- [Ejecutar Tests](#ejecutar-tests)
- [Indicaciones respecto al desarrollo](#indicaciones-respecto-al-desarrollo)

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

   cd frontend
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

## Indicaciones respecto al desarrollo

### Uso de Axios para Fetching de Datos

En este proyecto, las solicitudes HTTP al backend se realizan utilizando la biblioteca **Axios**. Para asegurar que la aplicación funcione tanto en un entorno local como en un entorno desplegado, se utiliza la variable de entorno `VITE_API_BASE_URL` para definir la URL base de la API.

Ejemplo de uso:

```javascript
useEffect(() => {
    const fetchEnums = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/objetos/enum-choices/`, {
          withCredentials: true,
        });

        const data = response.data;

        setOptions({
          categories: data.categories || [],
          cancel_types: data.cancel_types || [],
          price_categories: data.price_categories || [],
        });
      } catch (error) {
        console.error("Error fetching enums:", error);
        setErrorMessage("No se pudieron cargar las opciones.");
      }
    };

    fetchEnums();
}, []); 
```
En este ejemplo, se realiza una solicitud GET para obtener una lista de enums desde el backend. La URL de la API se construye dinámicamente utilizando `import.meta.env.VITE_API_BASE_URL`, lo que permite que la aplicación sea flexible en diferentes entornos.

### Manejo de Imágenes en el Backend

Las imágenes en el backend se manejan como URLs. Para subir las imágenes a un servidor externo, se utiliza el servicio **ImgBB**, que permite alojar imágenes de manera gratuita y obtener una URL pública para acceder a ellas.

La función `upload_image_to_imgbb` se encarga de subir la imagen a ImgBB y devolver la URL correspondiente, puedes reusarla en tu clase donde necesites una imagen:

```python
def upload_image_to_imgbb(self, image):
    url = "https://api.imgbb.com/1/upload"
    image_base64 = base64.b64encode(image.read()).decode('utf-8')
    payload = {
        "key": os.getenv("IMGBB_API_KEY"),
        "image": image_base64,
    }
    response = requests.post(url, data=payload)
    response_data = response.json()
    if 'data' in response_data:
        return response_data['data']['url']
    else:
        print(response_data)
        raise Exception("Error uploading image to Imgbb")
```
Esta función convierte la imagen a base64 y la envía al servidor de ImgBB utilizando una solicitud POST. Si la subida es exitosa, se devuelve la URL de la imagen, que luego puede ser almacenada en la base de datos y utilizada en la aplicación.