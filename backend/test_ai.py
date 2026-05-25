import requests

try:
    print('Logging in...')
    res = requests.post('http://127.0.0.1:8000/api/auth/login', json={'username': 'admin', 'password': 'admin123'})
    res.raise_for_status()
    token = res.json()['access_token']
    print('Login successful.')
    
    headers = {'Authorization': f'Bearer {token}'}
    
    print('\nTesting /api/ai/analytics...')
    res = requests.post('http://127.0.0.1:8000/api/ai/analytics', json={'question': 'What are the top 3 most expensive items on the menu?'}, headers=headers)
    print('Status Code:', res.status_code)
    print('Response:', res.json())
    
    print('\nTesting /api/ai/sentiment...')
    res = requests.post('http://127.0.0.1:8000/api/ai/sentiment', json={'review_text': 'The food was absolutely amazing and the service was top notch!'}, headers=headers)
    print('Status Code:', res.status_code)
    print('Response:', res.json())
except Exception as e:
    print('Error:', e)
