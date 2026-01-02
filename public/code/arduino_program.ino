#include <LiquidCrystal.h>
#include <SoftwareSerial.h>
#include <EEPROM.h>

// -------------------- LCD --------------------
LiquidCrystal lcd(13, 12, 4, 5, 6, 7);

// -------------------- Bluetooth --------------------
SoftwareSerial bt(10, 11); // RX, TX

// -------------------- LEDs --------------------
const int redLED = 8;
const int greenLED = 9;

// -------------------- EEPROM SETTINGS --------------------
const int EEPROM_ADDR = 0;
const int MAX_NAME_LEN = 32;

// -------------------- VARIABLES --------------------
String lastLawName = "";

// -------------------- EEPROM FUNCTIONS --------------------
String readLawFromEEPROM() {
  char data[MAX_NAME_LEN + 1];
  for (int i = 0; i < MAX_NAME_LEN; i++) {
    data[i] = EEPROM.read(EEPROM_ADDR + i);
    if (data[i] == '\0') break;
  }
  data[MAX_NAME_LEN] = '\0';
  return String(data);
}

void writeLawToEEPROM(String law) {
  int len = law.length();
  if (len > MAX_NAME_LEN) len = MAX_NAME_LEN;
  for (int i = 0; i < len; i++) {
    EEPROM.write(EEPROM_ADDR + i, law[i]);
  }
  EEPROM.write(EEPROM_ADDR + len, '\0');
}

// -------------------- SETUP --------------------
void setup() {
  lcd.begin(16, 2);
  lcd.clear();

  pinMode(redLED, OUTPUT);
  pinMode(greenLED, OUTPUT);
  digitalWrite(redLED, LOW);
  digitalWrite(greenLED, LOW);

  bt.begin(9600);
  Serial.begin(9600);

  lastLawName = readLawFromEEPROM();

  lcd.setCursor(0, 0);
  lcd.print("AERCA Device");
  lcd.setCursor(0, 1);
  lcd.print("Ready...");
  delay(1500);
  lcd.clear();

  Serial.println("Arduino Ready");
}

// -------------------- LOOP --------------------
void loop() {
  // -------- BLUETOOTH COMMANDS --------
  if (bt.available()) {
    String cmd = bt.readStringUntil('\n');
    cmd.trim();
    cmd.toLowerCase();

    if (cmd == "update" || cmd == "start") {
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("Checking...");
      lcd.setCursor(0, 1);
      lcd.print("Please wait");
      digitalWrite(redLED, LOW);
      digitalWrite(greenLED, LOW);
      Serial.println("CHECK_UPDATE");
    }
    else if (cmd == "analysis") {
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("Running...");
      lcd.setCursor(0, 1);
      lcd.print("Analysis");
      digitalWrite(redLED, LOW);
      digitalWrite(greenLED, LOW);
      Serial.println("RUN_ANALYSIS");
    }
  }

  // -------- PC RESPONSE HANDLING --------
  if (Serial.available()) {
    String pcMsg = Serial.readStringUntil('\n');
    pcMsg.trim();

    if (pcMsg == "PROCESSING") {
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("Processing...");
      lcd.setCursor(0, 1);
      lcd.print("Backend...");
      digitalWrite(redLED, LOW);
      digitalWrite(greenLED, LOW);
    }
    else if (pcMsg.startsWith("UPDATE:")) {
      String lawName = pcMsg.substring(7);

      if (lawName == lastLawName && lawName != "") {
        lcd.clear();
        lcd.setCursor(0, 0);
        lcd.print("No new update");
        digitalWrite(greenLED, LOW);
        digitalWrite(redLED, HIGH);
      } else {
        lastLawName = lawName;
        writeLawToEEPROM(lawName);

        digitalWrite(redLED, LOW);
        digitalWrite(greenLED, HIGH);
        delay(100);

        lcd.clear();
        lcd.setCursor(0, 0);
        lcd.print("Update Found");
        lcd.setCursor(0, 1);
        lcd.print(lawName.substring(0, 16));
      }
    }
    else if (pcMsg == "NO_UPDATE") {
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("No new update");
      digitalWrite(greenLED, LOW);
      digitalWrite(redLED, HIGH);
    }
    else if (pcMsg == "ANALYSIS_DONE") {
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("Analysis Done!");
      lcd.setCursor(0, 1);
      lcd.print("Success");
      digitalWrite(redLED, LOW);
      digitalWrite(greenLED, HIGH);
    }
    else if (pcMsg == "ANALYSIS_ERROR") {
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("Analysis Error");
      lcd.setCursor(0, 1);
      lcd.print("Check PC");
      digitalWrite(greenLED, LOW);
      digitalWrite(redLED, HIGH);
    }
  }
}