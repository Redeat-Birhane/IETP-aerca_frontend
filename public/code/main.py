import serial
import requests
import time
import threading
import tkinter as tk
from tkinter import ttk, scrolledtext

# ---------------- CONFIG ----------------
SERIAL_PORT = "COM4"   # change if needed
BAUD_RATE = 9600

API_BASE = "https://ietp-aerca-backend.onrender.com"
API_LAWS_URL = f"{API_BASE}/users/laws/"
API_SEARCH_URL = f"{API_BASE}/users/search/"

# ---------------- SERIAL ----------------
ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1)

# ---------------- GUI ----------------
root = tk.Tk()
root.title("AERCA Law Updates")
root.geometry("600x450")

# Dropdown for law categories
law_var = tk.StringVar()
law_dropdown = ttk.Combobox(
    root,
    textvariable=law_var,
    state="readonly",
    width=70
)
law_dropdown.pack(pady=10)

# Display area
law_list = scrolledtext.ScrolledText(
    root,
    width=70,
    height=18,
    state="disabled"
)
law_list.pack(padx=10, pady=10)

def add_law_to_gui(text):
    law_list.config(state="normal")
    law_list.insert(tk.END, text + "\n")
    law_list.see(tk.END)
    law_list.config(state="disabled")

# ---------------- FETCH LAW CATEGORIES ----------------
def fetch_all_laws():
    try:
        resp = requests.get(API_LAWS_URL, timeout=10)
        resp.raise_for_status()

        laws = resp.json().get("laws", [])

        # Extract unique categories
        categories = sorted(set(
            law["category"] for law in laws if law.get("category")
        ))

        law_dropdown["values"] = categories

        if categories:
            law_var.set(categories[0])
            add_law_to_gui("Select a law category from the dropdown above")

    except Exception as e:
        add_law_to_gui(f"Error fetching law categories: {e}")

fetch_all_laws()

# ---------------- ARDUINO LOOP ----------------
def arduino_loop():
    while True:
        try:
            if ser.in_waiting:
                msg = ser.readline().decode().strip()

                if msg != "CHECK_UPDATE":
                    continue

                ser.write(b"PROCESSING\n")

                selected_category = law_var.get()
                if not selected_category:
                    ser.write(b"NO_UPDATE\n")
                    add_law_to_gui("No category selected")
                    continue

                try:
                    params = {
                        "category": "laws",
                        "query": selected_category,
                        "new": "true"
                    }

                    resp = requests.get(API_SEARCH_URL, params=params, timeout=10)
                    resp.raise_for_status()

                    results = resp.json().get("results", [])

                    if results:
                        # Sort newest → oldest
                        results.sort(
                            key=lambda x: x.get("created_at", ""),
                            reverse=True
                        )

                        # Notify Arduino ONCE
                        ser.write(b"UPDATE\n")

                        # Display ALL new laws
                        add_law_to_gui(f"New laws for category: {selected_category}")
                        for law in results:
                            created_at = law.get("created_at", "")
                            name = law.get("name", "Unknown")
                            description = law.get("description", "No description")

                            add_law_to_gui(
                                f"[{created_at}] {name}: {description}"
                            )
                    else:
                        ser.write(b"NO_UPDATE\n")
                        add_law_to_gui(
                            f"No new laws in the last 30 days for category: {selected_category}"
                        )

                except Exception as e:
                    ser.write(b"NO_UPDATE\n")
                    add_law_to_gui(f"Error fetching updates: {e}")

            else:
                time.sleep(0.1)

        except Exception as e:
            add_law_to_gui(f"Serial error: {e}")
            time.sleep(0.5)


# ---------------- START THREAD ----------------
threading.Thread(target=arduino_loop, daemon=True).start()

# ---------------- START GUI ----------------
root.mainloop()