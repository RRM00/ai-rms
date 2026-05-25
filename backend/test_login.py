import sqlite3
import bcrypt

conn = sqlite3.connect('ai_rms.db')
c = conn.cursor()
c.execute("SELECT hashed_password FROM users WHERE username='admin'")
row = c.fetchone()
if row:
    hp = row[0]
    print(f"Hash: {hp}")
    match = bcrypt.checkpw(b"admin123", hp.encode('utf-8'))
    print(f"Match: {match}")
else:
    print("User not found")
