from locust import HttpUser, task, between, SequentialTaskSet
from datetime import datetime, timedelta
import random


class RentRequestTasks(SequentialTaskSet):
    def on_start(self):
        response = self.client.post("/usuarios/login/", json={
            "usernameOrEmail": "User1",
            "password": "Borroo_25"
        })

        if response.status_code != 200:
            print("❌ Error de login:", response.text)
            self.interrupt()

        self.token = response.json().get("access")
        self.headers = {"Authorization": f"Bearer {self.token}"}

        self.renter_id = 1
        self.item_ids = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

    @task
    def request_rent(self):
        item_id = random.choice(self.item_ids)

        start_offset = random.randint(1, 36500)
        start_date = datetime.now() + timedelta(days=start_offset)
        end_date = start_date + timedelta(days=2)

        data = {
            "item": item_id,
            "renter": self.renter_id,
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat()
        }

        with self.client.post(
            "/rentas/full/first_request/",
            headers={**self.headers, "Content-Type": "application/json"},
            json=data,
            catch_response=True
        ) as response:
            if response.status_code == 201:
                response.success()
            else:
                print(f"❌ Error ({response.status_code}): {response.text}")
                response.failure(f"{response.status_code} - {response.text}")


class RentRequestUser(HttpUser):
    wait_time = between(1, 3)
    tasks = [RentRequestTasks]
