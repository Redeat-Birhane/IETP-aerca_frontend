import serial
import requests
import time
import threading
import tkinter as tk
from tkinter import ttk, scrolledtext
import traceback
import subprocess
import os
import nbformat

# ---------------- CONFIG ----------------
SERIAL_PORT = "COM5"
BAUD_RATE = 9600
API_BASE = "https://ietp-aerca-backend.onrender.com"
API_LAWS_URL = f"{API_BASE}/users/laws/"
API_SEARCH_URL = f"{API_BASE}/users/search/"
NOTEBOOK_PATH = "Housing.ipynb"

API_TOKEN = "YOUR_API_TOKEN_HERE"  # Optional token (if needed)
HEADERS = {"Authorization": f"Token {API_TOKEN}"}

# ---------------- SERIAL CONNECTION ----------------
try:
    ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1)
    print(f"✅ Connected to {SERIAL_PORT}")
except Exception as e:
    print(f"❌ Could not open serial port: {e}")
    exit()

# ---------------- GUI ----------------
root = tk.Tk()
root.title("AERCA Law & Analysis System")
root.geometry("700x600")

label = tk.Label(root, text="Select Law Category", font=("Arial", 12))
label.pack(pady=5)

law_var = tk.StringVar()
law_dropdown = ttk.Combobox(root, textvariable=law_var, state="readonly", width=70)
law_dropdown.pack(pady=5)

law_list = scrolledtext.ScrolledText(root, width=80, height=25, state="disabled")
law_list.pack(padx=10, pady=10)

def add_to_gui(text):
    law_list.config(state="normal")
    law_list.insert(tk.END, text + "\n")
    law_list.see(tk.END)
    law_list.config(state="disabled")

# ---------------- FETCH ALL LAWS ----------------
def fetch_all_laws():
    try:
        resp = requests.get(API_LAWS_URL, headers=HEADERS, timeout=10)
        resp.raise_for_status()
        data = resp.json()

        laws = data.get("laws", [])
        categories = sorted(set(
            law.get("category") for law in laws if law.get("category")
        ))

        law_dropdown["values"] = categories
        if categories:
            law_var.set(categories[0])
            add_to_gui(f"✅ {len(categories)} law categories loaded successfully.")
        else:
            add_to_gui("⚠️ No law categories found from backend.")
    except Exception as e:
        add_to_gui(f"❌ Error fetching laws: {e}")

# Initial fetch
fetch_all_laws()

# ---------------- HANDLE UPDATE ----------------
def handle_update_command():
    ser.write(b"PROCESSING\n")
    selected_category = law_var.get()

    if not selected_category:
        ser.write(b"NO_UPDATE\n")
        add_to_gui("⚠️ No category selected.")
        return

    try:
        params = {
            "category": "laws",
            "query": selected_category,
            "new": "true"
        }

        resp = requests.get(API_SEARCH_URL, params=params, headers=HEADERS, timeout=10)
        resp.raise_for_status()

        results = resp.json().get("results", [])

        if results:
            # Sort newest → oldest
            results.sort(key=lambda x: x.get("created_at", ""), reverse=True)

            # Take the newest law
            newest = results[0]
            name = newest.get("name", "Unknown Law")

            # ✅ Send law name with UPDATE message
            message = f"UPDATE:{name}\n"
            ser.write(message.encode())

            add_to_gui(f"🆕 New law found for category '{selected_category}': {name}")
            for law in results:
                created_at = law.get("created_at", "")
                lname = law.get("name", "Unknown Law")
                desc = law.get("description", "No description available.")
                add_to_gui(f"[{created_at}] {lname}: {desc}")

        else:
            ser.write(b"NO_UPDATE\n")
            add_to_gui(f"ℹ️ No new laws in the last 30 days for category: {selected_category}")

    except Exception as e:
        ser.write(b"NO_UPDATE\n")
        add_to_gui(f"❌ Error fetching updates: {e}")

# ---------------- HANDLE ANALYSIS ----------------
def handle_analysis_command():
    try:
        ser.write(b"PROCESSING\n")
        add_to_gui("📊 Launching Housing notebook outputs in browser...")notebook_abs_path = os.path.abspath(NOTEBOOK_PATH)
        if not os.path.exists(notebook_abs_path):
            add_to_gui(f"❌ Notebook not found: {notebook_abs_path}")
            ser.write(b"ANALYSIS_ERROR\n")
            return

        nb = nbformat.read(notebook_abs_path, as_version=4)
        for cell in nb.cells:
            if cell.cell_type == 'code':
                cell.metadata['jupyter'] = cell.metadata.get('jupyter', {})
                cell.metadata['jupyter']['source_hidden'] = True

        output_notebook_path = notebook_abs_path.replace(".ipynb", "_output.ipynb")
        nbformat.write(nb, output_notebook_path)
        subprocess.Popen(["jupyter", "notebook", output_notebook_path])
        add_to_gui("✅ Notebook launched with all code hidden. Only outputs visible.")
        ser.write(b"ANALYSIS_DONE\n")

    except Exception as e:
        ser.write(b"ANALYSIS_ERROR\n")
        add_to_gui("❌ Error launching notebook:\n" + traceback.format_exc())

# ---------------- ARDUINO LISTENER ----------------
def arduino_loop():
    while True:
        try:
            if ser.in_waiting:
                msg = ser.readline().decode(errors="ignore").strip()
                if not msg:
                    continue
                print(f"📩 From Arduino: {msg}")

                if msg == "CHECK_UPDATE":
                    handle_update_command()
                elif msg == "RUN_ANALYSIS":
                    handle_analysis_command()
                else:
                    add_to_gui(f"Unknown command: {msg}")
            else:
                time.sleep(0.1)
        except Exception as e:
            add_to_gui(f"❌ Error in loop: {e}")
            time.sleep(0.5)

# ---------------- START THREAD ----------------
threading.Thread(target=arduino_loop, daemon=True).start()

# ---------------- RUN GUI ----------------
root.mainloop()