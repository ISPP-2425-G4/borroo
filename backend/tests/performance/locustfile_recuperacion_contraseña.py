from locust import HttpUser, SequentialTaskSet, task, between


class PasswordResetTasks(SequentialTaskSet):
    def on_start(self):
        """Configuración inicial - crear datos de prueba."""
        self.valid_email = "user1@example.com"
        self.invalid_email = "invalid@example.com"
        self.reset_token = None
        self.invalid_token = "invalid-token"

    @task
    def test_password_reset_request_success(self):
        """Prueba de solicitud de restablecimiento
        de contraseña con email válido."""
        headers = {
            "Content-Type": "application/json"
        }
        data = {"email": self.valid_email}

        with self.client.post(
            "/usuarios/password_reset/",
            json=data,
            headers=headers,
            catch_response=True
        ) as response:
            if response.status_code == 200:
                # Simular un token para pruebas
                self.reset_token = "simulated-token-for-testing"
                response.success()
            else:
                response.failure(
                    f"Failed to request password reset: {response.text}"
                )

    @task
    def test_password_reset_confirm_success(self):
        """Prueba de confirmación de restablecimiento
          de contraseña con token válido."""
        if not self.reset_token:
            # Si no hay token, no se puede realizar esta prueba
            self.environment.runner.quit()
            return

        headers = {
            "Content-Type": "application/json"
        }
        data = {"password": "NewPassword123!"}

        with self.client.post(
            f"/usuarios/password_reset_confirm/{self.reset_token}/",
            json=data,
            headers=headers,
            catch_response=True
        ) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(
                    f"Failed to confirm password reset: {response.text}"
                )

    @task
    def test_password_reset_request_failure_invalid_email(self):
        """Prueba de solicitud de restablecimiento
          de contraseña con email inválido."""
        headers = {
            "Content-Type": "application/json"
        }
        data = {"email": self.invalid_email}

        with self.client.post(
            "/usuarios/password_reset/",
            json=data,
            headers=headers,
            catch_response=True
        ) as response:
            if response.status_code == 404:
                response.success()
            else:
                response.failure(
                    f"Expected 404 for invalid email: {response.text}"
                )

    @task
    def test_password_reset_confirm_failure_invalid_token(self):
        """Prueba de confirmación de restablecimiento
          de contraseña con token inválido."""
        headers = {
            "Content-Type": "application/json"
        }
        data = {"password": "NewPassword123!"}

        with self.client.post(
            f"/usuarios/password_reset_confirm/{self.invalid_token}/",
            json=data,
            headers=headers,
            catch_response=True
        ) as response:
            if response.status_code == 400:
                response.success()
            else:
                response.failure(
                    f"Expected 400 for invalid token: {response.text}"
                )


class PasswordResetUser(HttpUser):
    wait_time = between(1, 3)
    tasks = [PasswordResetTasks]
