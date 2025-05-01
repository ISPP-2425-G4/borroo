from locust import HttpUser, task, between, SequentialTaskSet
from PIL import Image
from django.core.files.uploadedfile import SimpleUploadedFile
import io

APPEND_SLASH = False


class ItemCRUDTasks(SequentialTaskSet):
    def on_start(self):
        """Setup inicial - login y configuración"""
        # Login para obtener token
        response = self.client.post("/usuarios/login/", json={
            "usernameOrEmail": "User1",
            "password": "Borroo_25"
        })
        self.token = response.json().get("access")
        self.headers = {"Authorization": f"Bearer {self.token}"}
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
            headers=self.headers,
            files=files,
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
                "draft_mode": "false",
                "images": []
            }

            # Archivos para enviar
            files = {
                "image_files": ("test.jpg", self.image.read(), "image/jpeg")
            }

            with self.client.put(
                f"/objetos/full/{self.created_item_id}/",
                data=data,
                headers=self.headers,
                files=files,
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

    @task
    def test_item_limitations(self):
        """Probar las limitaciones de publicación de ítems"""
        for i in range(20):  # Intentar crear más de 15 ítems
            self.image.seek(0)
            data = {
                "title": f"Objeto {i}",
                "description": f"Descripción del objeto {i}",
                "category": "technology",
                "cancel_type": "flexible",
                "price_category": "day",
                "price": "25.50",
                "deposit": "10.00",
                "draft_mode": "false",  # Intentar publicar directamente
                "images": []
            }

            files = {
                "image_files": ("test.jpg", self.image.read(), "image/jpeg")
            }

            with self.client.post(
                "/objetos/full/",
                data=data,
                headers=self.headers,
                files=files,
                catch_response=True
            ) as response:
                if response.status_code == 201:
                    print(f"Ítem {i} creado exitosamente.")
                elif response.status_code == 400:
                    print(f"Error al crear ítem {i}: {response.json()}")
                    if ("No puedes tener más de 10 ítems publicados"
                            in response.text):
                        print("Límite de ítems publicados alcanzado.")
                        break
                    elif ("No puedes tener más de 15 ítems en total"
                            in response.text):
                        print("Límite total de ítems alcanzado.")
                        break
                else:
                    response.failure(f"Error inesperado: {response.text}")


class ItemCRUDUser(HttpUser):
    wait_time = between(1, 5)
    tasks = [ItemCRUDTasks]
