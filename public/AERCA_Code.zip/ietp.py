import serial  # type: ignore
import requests  # type: ignore
import time
from datetime import datetime
import threading
import tkinter as tk
from tkinter import scrolledtext

# ---------------- CONFIG ----------------
SERIAL_PORT = "COM4"  # change if needed
BAUD_RATE = 9600
API_URL = "https://ietp-aerca-backend.onrender.com/users/laws/?new=true"

# ---------------- SERIAL ----------------
ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1)

# ---------------- LAST UPDATE ----------------
last_seen = None

# ---------------- TIME PARSER ----------------
def parse_time(ts):
    return datetime.fromisoformat(ts.replace("Z", "+00:00"))

# ---------------- GUI ----------------
root = tk.Tk()
root.title("AERCA Updates")
root.geometry("400x300")

label = tk.Label(root, text="Latest Laws:", font=("Arial", 12))
label.pack(pady=5)

law_list = scrolledtext.ScrolledText(root, width=50, height=15, state="disabled")
law_list.pack(padx=10, pady=5)

def add_law_to_gui(law_text):
    law_list.config(state="normal")
    law_list.insert(tk.END, law_text + "\n")
    law_list.see(tk.END)  # auto-scroll
    law_list.config(state="disabled")

# ---------------- ARDUINO LOOP ----------------
def arduino_loop():
    global last_seen
    print("AERCA PC Service Running...")

    while True:
        try:
            if ser.in_waiting:
                msg = ser.readline().decode().strip()
                if msg != "CHECK_UPDATE":
                    continue

                ser.write(b"PROCESSING\n")
                print("Processing backend check...")

                try:
                    response = requests.get(API_URL, timeout=10)
                    response.raise_for_status()
                    laws = response.json().get("laws", [])

                    if not laws:
                        ser.write(b"NO_UPDATE\n")
                        print("No data from backend")
                    else:
                        latest = laws[0]  # newest law first
                        latest_time = parse_time(latest["created_at"])

                        if last_seen is None or latest_time > last_seen:
                            last_seen = latest_time
                            law_name = latest["name"]
                            law_category = latest["category"]
                            ser.write(f"UPDATE:{law_name}\n".encode())
                            print(f"New update: {law_name}")

                            # Update GUI
                            add_law_to_gui(f"{law_name} ({law_category})")
                        else:
                            ser.write(b"NO_UPDATE\n")
                            print("No new update")
                except Exception as e:
                    print("Error fetching backend:", e)
            else:
                time.sleep(0.1)

        except Exception as e:
            print("Error:", e)
            time.sleep(0.5)

# ---------------- START THREAD ----------------
threading.Thread(target=arduino_loop, daemon=True).start()

# ---------------- START GUI LOOP ----------------
root.mainloop()
