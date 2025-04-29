from locust import HttpUser, task, between


class SubscriptionUser(HttpUser):
    wait_time = between(1, 3)

    def on_start(self):
        """Al iniciar, hacemos login y guardamos el token y user ID."""
        self.login_credentials = {
            "usernameOrEmail": "User1",
            "password": "Borroo_25"
        }
        self.token = None
        self.user_id = None
        self.login()

    def login(self):
        """Login inicial para obtener token y user ID."""
        with self.client.post(
            "/usuarios/login/",
            json=self.login_credentials,
            headers={"Content-Type": "application/json"},
            catch_response=True
        ) as response:
            if response.status_code == 200:
                data = response.json()
                self.token = data["access"]
                self.user_id = data["user"]["id"]
                response.success()
            else:
                response.failure("Login fallido")

    @task
    def create_subscription_checkout(self):
        """Simula el inicio de un checkout de suscripción."""
        if not self.token or not self.user_id:
            return

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.token}"
        }
        body = {
            "price": 5,
            "currency": "eur",
            "user_id": self.user_id
        }

        with self.client.post(
            "/pagos/create-subscription-checkout/",
            json=body,
            headers=headers,
            catch_response=True
        ) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(
                    f"Falló create_subscription_checkout: {response.text}"
                )
