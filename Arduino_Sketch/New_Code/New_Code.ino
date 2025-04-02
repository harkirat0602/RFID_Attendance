#include <SPI.h>
#include <PubSubClient.h>
#include <MFRC522.h>
#include <ESP8266WiFi.h>


#define RST_PIN         0 
#define SS_PIN          15


WiFiClient espClient;
PubSubClient client(espClient);

MFRC522 mfrc522(SS_PIN, RST_PIN);


void setup() {
  // put your setup code here, to run once:
  SPI.begin();
  mfrc522.PCD_Init();

  Serial.begin(9600);

  Serial.println("Connecting to WiFi");

  WiFi.begin("Kirat","11101970Pa");
  while(WiFi.status() != WL_CONNECTED){
    delay(200);
  }
  Serial.println("WiFi Connected");


  client.setServer("192.168.29.241",1883);

  Serial.println("Connecting to MQTT Broker");
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
  Serial.println("Got New Card");

  if(!mfrc522.PICC_ReadCardSerial()){
    Serial.println("Card Read Error");
    return;
  }

  String UID ="";

  Serial.print("Card UID:");
  for (byte i = 0; i < mfrc522.uid.size; i++) {
    Serial.print(mfrc522.uid.uidByte[i] < 0x10 ? " 0" : " ");
    Serial.print(mfrc522.uid.uidByte[i], HEX);
    UID.concat(mfrc522.uid.uidByte[i] < 0x10 ? " 0" : " ");
    UID.concat(mfrc522.uid.uidByte[i]);
  }
  Serial.println();
  client.publish("sample",UID.c_str());

  // Halt PICC
  mfrc522.PICC_HaltA();
  // Stop encryption on PCD
  mfrc522.PCD_StopCrypto1();

   


}
