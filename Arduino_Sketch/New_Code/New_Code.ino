#include <SPI.h>
#include <PubSubClient.h>
#include <MFRC522.h>
#include <ESP8266WiFi.h>
#include <LiquidCrystal_PCF8574.h>


#define RST_PIN         0 
#define SS_PIN          15


WiFiClient espClient;
PubSubClient client(espClient);

MFRC522 mfrc522(SS_PIN, RST_PIN);

LiquidCrystal_PCF8574 lcd(0x27);


void printlcd(const char* message,byte row=0,byte clear=1){
  static char lasttext[] ="";
  if(strcmp(lasttext,message)==0) return;
  if(clear){
    lcd.clear();
  }
  lcd.setCursor(0,row);
  lcd.print(message);
  Serial.println(message);
  // strcpy(lasttext,message);
}




void setup() {
  // put your setup code here, to run once:
  SPI.begin();
  mfrc522.PCD_Init();

  lcd.begin(16, 2);  // Initialize 16x2 LCD
  lcd.setBacklight(255);

  Serial.begin(9600);

  printlcd("Connecting to WiFi");

  WiFi.begin("Kirat","11101970Pa");
  while(WiFi.status() != WL_CONNECTED){
    delay(200);
  }
  printlcd("WiFi Connected");


  client.setServer("192.168.29.241",1883);

  printlcd("Connecting to MQTT Broker");
  short int attempts=0;
  while(!client.connected() && attempts<5){
    attempts++;
    if(client.connect("ArduinoClient","harkirat","Harkirat123")){
      Serial.println("Connected!!");
      // client.subscribe("to_arduino_command");
      // client.subscribe("to_arduino_response");
      break;
    }
      delay(5000);
  }


}

void loop() {
  // put your main code here, to run repeatedly:
  if(!mfrc522.PICC_IsNewCardPresent()){
    return;
  }
  printlcd("Got New Card");

  if(!mfrc522.PICC_ReadCardSerial()){
    printlcd("Card Read Error");
    return;
  }

  String UID ="";

  printlcd("Card UID:");
  for (byte i = 0; i < mfrc522.uid.size; i++) {
    UID.concat(mfrc522.uid.uidByte[i] < 0x10 ? " 0" : " ");
    UID.concat(mfrc522.uid.uidByte[i]);
  }
  client.publish("sample",UID.c_str());
  printlcd(UID.c_str());

  // Halt PICC
  mfrc522.PICC_HaltA();
  // Stop encryption on PCD
  mfrc522.PCD_StopCrypto1();

   


}
