from locust import HttpUser, task, between
from PIL import Image
from django.core.files.uploadedfile import SimpleUploadedFile
import io

APPEND_SLASH = False


class ItemCRUDUser(HttpUser):
    wait_time = between(1, 5)

    def on_start(self):
        """Setup inicial - login y configuración"""
        # Login para obtener token
        with self.client.post("/usuarios/login/", json={
            "usernameOrEmail": "User1",
            "password": "Borroo_25"
        }, headers={
            "Content-Type": "application/json"
        }, catch_response=True) as response:
            if response.status_code == 200:
                self.token = response.json().get("access")
                self.headers = {
                    "Authorization": f"Bearer {self.token}",
                    "Content-Type": "application/json"
                }
                response.success()
            else:
                response.failure(f"Login failed: {response.text}")

        # Crear imagen en memoria
        self.image = self.generate_test_image()

    def generate_test_image(self):
        """Generar una imagen de prueba"""
        file = io.BytesIO()
        image = Image.new('RGB', (100, 100), color='red')
        image.save(file, 'JPEG')
        file.seek(0)
        return SimpleUploadedFile(
            name='test.jpg',
            content=file.read(),
            content_type='image/jpeg'
        )

    @task
    def create_item(self):
        """Crear un nuevo item"""
        # Reiniciar el puntero del archivo de la imagen
        self.image.seek(0)

        # Datos del item
        data = {
            "title": "Nuevo Objeto",
            "description": "Descripción del nuevo objeto",
            "category": "technology",
            "cancel_type": "flexible",
            "price_category": "day",
            "price": "25.50",
            "deposit": "10.00",
            "draft_mode": "false",
            "images": []  # Si el servidor espera una lista vacía
        }

        # Archivos para enviar
        files = {
            "image_files": ("test.jpg", self.image.read(), "image/jpeg")
        }

        # Enviar datos como multipart/form-data
        with self.client.post(
            "/objetos/full/",
            data=data,
            files=files,
            headers={"Authorization": self.headers["Authorization"]},  # No incluir Content-Type
            catch_response=True
        ) as response:
            if response.status_code == 201:
                self.created_item_id = response.json()["id"]
                response.success()
            else:
                response.failure(f"Failed to create item: {response.text}")

    @task
    def get_items(self):
        """Listar todos los items"""
        with self.client.get(
            "/objetos/full/?ordering=-created_at",
            headers=self.headers,
            catch_response=True
        ) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Failed to get items: {response.text}")

    @task
    def update_item(self):
        """Actualizar un item existente"""
        if hasattr(self, "created_item_id"):
            self.image.seek(0)
            data = {
                "title": "Item actualizado",
                "description": "Descripción modificada",
                "category": "technology",
                "cancel_type": "medium",
                "price_category": "day",
                "price": "30.00",
                "deposit": "15.00",
                "draft_mode": "false"
            }
            with self.client.put(
                f"/objetos/full/{self.created_item_id}/",
                data=data,
                headers=self.headers,
                catch_response=True
            ) as response:
                if response.status_code == 200:
                    response.success()
                else:
                    response.failure(f"Failed to update item: {response.text}")

    @task
    def delete_item(self):
        """Eliminar un item"""
        if hasattr(self, "created_item_id"):
            with self.client.delete(
                f"/objetos/full/{self.created_item_id}/",
                headers=self.headers,
                catch_response=True
            ) as response:
                if response.status_code == 204:
                    response.success()
                else:
                    response.failure(f"Failed to delete item: {response.text}")
