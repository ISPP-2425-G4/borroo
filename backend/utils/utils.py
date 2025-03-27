import os
import requests
import base64


def upload_image_to_imgbb(image):
    url = "https://api.imgbb.com/1/upload"
    image.seek(0)
    image_base64 = base64.b64encode(image.read()).decode('utf-8')
    payload = {
        "key": os.getenv("IMGBB_API_KEY"),
        "image": image_base64,
    }
    response = requests.post(url, data=payload, timeout=10)
    response_data = response.json()
    if 'data' in response_data:
        return response_data['data']['url']
    else:
        print(response_data)
        raise Exception("Error uploading image to Imgbb")
