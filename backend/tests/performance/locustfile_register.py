from locust import HttpUser, task, between
import secrets
import string


class RegisterUser(HttpUser):
    wait_time = between(1, 3)

    def generate_random_user_data(self):
        """Genera datos aleatorios para el registro de usuario."""
        random_string = ''.join(secrets.choices(string.ascii_lowercase, k=8))
        return {
            "name": f"Test{random_string}",
            "surname": f"User{random_string}",
            "username": f"testuser_{random_string}",
            "email": f"test_{random_string}@example.com",
            "password": "Password123!",
            "cif": None
        }

    @task
    def register_user(self):
        """Tarea principal: registrar un nuevo usuario."""
        headers = {
            "Content-Type": "application/json"
        }
        user_data = self.generate_random_user_data()

        with self.client.post(
            "/usuarios/full/",
            json=user_data,
            headers=headers,
            catch_response=True
        ) as response:
            if response.status_code == 201:
                response.success()
            else:
                response.failure(f"Failed to register user: {response.text}")

    @task(2)
    def check_duplicate_username(self):
        """Probar el registro con un nombre de usuario duplicado."""
        headers = {
            "Content-Type": "application/json"
        }
        user_data = self.generate_random_user_data()
        user_data["username"] = "existing_user"

        with self.client.post(
            "/usuarios/full/",
            json=user_data,
            headers=headers,
            catch_response=True
        ) as response:
            if response.status_code == 400:
                response.success()
            else:
                response.failure(
                    "Expected 400 status code for duplicate username")

    @task(2)
    def register_invalid_data(self):
        """Probar el registro con datos inválidos."""
        headers = {
            "Content-Type": "application/json"
        }
        invalid_data = {
            "name": "123Invalid",
            "surname": "User",
            "username": "test_user",
            "email": "invalid_email",
            "password": "short",
            "cif": None
        }

        with self.client.post(
            "/usuarios/full/",
            json=invalid_data,
            headers=headers,
            catch_response=True
        ) as response:
            if response.status_code == 400:
                response.success()
            else:
                response.failure("Expected 400 status code for invalid data")
