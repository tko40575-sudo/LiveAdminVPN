import requests
import json
import sys

def get_vless_data(xui_url, username, password, client_email):
    session = requests.Session()
    login_url = f"{xui_url}/login"
    login_data = {"username": username, "password": password}
    
    try:
        res = session.post(login_url, data=login_data, timeout=10)
        if not res.cookies:
            print(json.dumps({"error": "Login failed! Check Credentials."}))
            return

        api_url = f"{xui_url}/panel/api/inbounds/getClientTraffics/{client_email}"
        response = session.get(api_url, timeout=10)
        data = response.json()
        
        if data.get('success'):
            client_obj = data['obj']
            up = client_obj.get('up', 0)
            down = client_obj.get('down', 0)
            total = client_obj.get('total', 0)
            
            used_gb = (up + down) / (1024**3)
            total_gb = total / (1024**3) if total > 0 else 0
            
            print(json.dumps({
                "status": "success",
                "usedGB": round(used_gb, 2),
                "totalGB": round(total_gb, 2) if total_gb > 0 else "Unlimited"
            }))
        else:
             print(json.dumps({"error": "Client Email not found!"}))
    except Exception as e:
        print(json.dumps({"error": "Connection Error!"}))

if __name__ == "__main__":
    if len(sys.argv) == 5:
        get_vless_data(sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4])
    else:
        print(json.dumps({"error": "Missing parameters"}))