import urllib.request
import mimetypes
import os

with open("dummy.csv", "w") as f:
    f.write("Diagnosis,Feat1,Feat2\nIBD,1.2,3.4\nnonIBD,0.5,1.1\nIBD,1.5,3.1\nnonIBD,0.6,1.0\n")

boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
body = (
    f"--{boundary}\r\n"
    f'Content-Disposition: form-data; name="file"; filename="dummy.csv"\r\n'
    f"Content-Type: text/csv\r\n\r\n"
    f"{open('dummy.csv').read()}\r\n"
    f"--{boundary}--\r\n"
)

req = urllib.request.Request("http://127.0.0.1:8000/api/upload")
req.add_header('Content-Type', f'multipart/form-data; boundary={boundary}')
req.data = body.encode()

try:
    with urllib.request.urlopen(req) as response:
        print("Status:", response.status)
        print("Response:", response.read().decode())
except urllib.error.HTTPError as e:
    print("Status:", e.code)
    print("Response:", e.read().decode())
