from locust import HttpUser, task, between


class LoginUser(HttpUser):
    wait_time = between(1, 3)

    def on_start(self):
        """Configuración inicial - crear usuarios de prueba si es necesario."""
        self.valid_credentials = {
            "usernameOrEmail": "User1",
            "password": "Borroo_25"
        }
        self.invalid_credentials = [
            {
                "usernameOrEmail": "nonexistent@user.com",
                "password": "Password123!"
            },
            {
                "usernameOrEmail": "testuser",
                "password": "WrongPass123!"
            },
            {
                "usernameOrEmail": "",
                "password": ""
            }
        ]

    @task(3)
    def test_valid_login(self):
        """Prueba de login con credenciales válidas."""
        headers = {
            "Content-Type": "application/json"
        }

        with self.client.post(
            "/usuarios/login/",
            json=self.valid_credentials,
            headers=headers,
            catch_response=True
        ) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Login fallido: {response.text}")

    @task
    def test_invalid_login(self):
        """Prueba de login con credenciales inválidas."""
        headers = {
            "Content-Type": "application/json"
        }

        for invalid_cred in self.invalid_credentials:
            with self.client.post(
                "/usuarios/login/",
                json=invalid_cred,
                headers=headers,
                catch_response=True
            ) as response:
                if response.status_code in [400, 401, 404]:
                    response.success()
                else:
                    response.failure(
                        f"Código de estado inesperado: {response.status_code}"
                    )

    @task
    def test_malformed_request(self):
        """Prueba de login con datos mal formados."""
        headers = {
            "Content-Type": "application/json"
        }
        malformed_data = {
            "wrongField": "wrongValue"
        }

        with self.client.post(
            "/usuarios/login/",
            json=malformed_data,
            headers=headers,
            catch_response=True
        ) as response:
            if response.status_code == 400:
                response.success()
            else:
                response.failure(
                    f"Se esperaba código 400, "
                    f"se recibió: {response.status_code}"
                )
