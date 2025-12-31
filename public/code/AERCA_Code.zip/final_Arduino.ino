#include <LiquidCrystal.h>
#include <SoftwareSerial.h>

// -------------------- LCD --------------------
LiquidCrystal lcd(13, 12, 4, 5, 6, 7);

// -------------------- Bluetooth --------------------
SoftwareSerial bt(10, 11); // RX, TX

// -------------------- LEDs --------------------
const int redLED = 8;
const int greenLED = 9;

void setup() {
  // LCD (start blank)
  lcd.begin(16, 2);
  lcd.clear();

  // LEDs
  pinMode(redLED, OUTPUT);
  pinMode(greenLED, OUTPUT);

  digitalWrite(redLED, LOW);
  digitalWrite(greenLED, LOW);

  // Serial
  bt.begin(9600);
  Serial.begin(9600);

  Serial.println("Arduino Ready");
}

void loop() {

  // -------- Bluetooth Voice Command --------
  if (bt.available()) {
    String cmd = bt.readStringUntil('\n');
    cmd.trim();

    // convert to lowercase
    for (int i = 0; i < cmd.length(); i++) {
      cmd[i] = tolower(cmd[i]);
    }

    if (cmd == "update" || cmd == "start") {
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("Checking...");
      lcd.setCursor(0, 1);
      lcd.print("Please wait");

      // Ask PC to check backend
      Serial.println("CHECK_UPDATE");
    }
  }

  // -------- PC Response --------
  if (Serial.available()) {
    String pcMsg = Serial.readStringUntil('\n');
    pcMsg.trim();

    // PC is processing
    if (pcMsg == "PROCESSING") {
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("Checking...");
      lcd.setCursor(0, 1);
      lcd.print("Backend...");
    }

    // UPDATE with law name
    else if (pcMsg.startsWith("UPDATE:")) {
      String lawName = pcMsg.substring(7);

      // LEDs
      digitalWrite(greenLED, HIGH);
      digitalWrite(redLED, LOW);

      // LCD
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("Update Found");
      lcd.setCursor(0, 1);
      lcd.print(lawName.substring(0, 16));

    }

    // NO UPDATE
    else if (pcMsg == "NO_UPDATE") {
      digitalWrite(redLED, HIGH);
      digitalWrite(greenLED, LOW);

      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("There is");
      lcd.setCursor(0, 1);
      lcd.print("no update");
    }
  }
}
