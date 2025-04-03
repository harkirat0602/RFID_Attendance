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

MFRC522::MIFARE_Key key;


void printlcd(const char* message,byte row=0,byte clear=1){
  if(clear){
    lcd.clear();
  }
  lcd.setCursor(0,row);
  lcd.print(message);
  Serial.println(message);
  // strcpy(lasttext,message);
}


unsigned long startTime;
const long timeout = 5000;  // 5 seconds timeout
bool receivedResponse = false;



void mqttCallback(char* topic, byte* payload, unsigned int length) {
    Serial.print("MQTT Message received: ");
    String message = "";
    for (unsigned int i = 0; i < length; i++) {
        message += (char)payload[i];
    }
    printlcd(message.c_str());

    if (String(topic) == "to_arduino_response" && message == "SUCCESS") {
        printlcd("Operation successful!");
        receivedResponse = true;
    }
}



void setup() {
  // put your setup code here, to run once:
  SPI.begin();
  mfrc522.PCD_Init();

  SPI.setFrequency(1000000);

  lcd.begin(16, 2);  // Initialize 16x2 LCD
  lcd.setBacklight(255);

  Serial.begin(9600);

  key.keyByte[0] = 0xA6;
  key.keyByte[1] = 0xB5;
  key.keyByte[2] = 0xC4;
  key.keyByte[3] = 0xD3;
  key.keyByte[4] = 0xE2;
  key.keyByte[5] = 0xF1;



  printlcd("Connecting to WiFi");

  WiFi.begin("Kirat","11101970Pa");
  while(WiFi.status() != WL_CONNECTED){
    delay(200);
  }
  printlcd("WiFi Connected");


  client.setServer("192.168.29.241",1883);
  client.setCallback(mqttCallback);

  printlcd("Connecting to MQTT Broker");
  short int attempts=0;
  while(!client.connected() && attempts<5){
    attempts++;
    if(client.connect("ArduinoClient","harkirat","Harkirat123")){
      Serial.println("Connected!!");
      // client.subscribe("to_arduino_command");
      client.subscribe("to_arduino_response");
      delay(500);
      printlcd("IDLE");
      break;
    }
      delay(5000);
  }


}

void loop() {
  // put your main code here, to run repeatedly:
  

  
  if(!mfrc522.PICC_IsNewCardPresent()){
    // printlcd("IDLE");
    return;
  }
  printlcd("Got New Card");

  if(!mfrc522.PICC_ReadCardSerial()){
    printlcd("Card Read Error");
    printlcd("IDLE");
    return;
  }

  byte buffer[18];
  byte len= sizeof(buffer);
  MFRC522::StatusCode status;


  SPI.beginTransaction(SPISettings(1000000, MSBFIRST, SPI_MODE0));

  status = mfrc522.PCD_Authenticate(MFRC522::PICC_CMD_MF_AUTH_KEY_A, 1, &key, &(mfrc522.uid));
  if(status!= MFRC522::STATUS_OK){
      printlcd("Authentication Error");
      delay(5000);
      printlcd("IDLE");
      return;
  }


  
  delayMicroseconds(50);
  status = mfrc522.MIFARE_Read(1, buffer, &len);
  if (status != MFRC522::STATUS_OK) {
    printlcd("Reading failed: ");
    Serial.println(mfrc522.GetStatusCodeName(status));
    delay(5000);
    printlcd("IDLE");
    return;
  }


  buffer[7] = '\0';

  
  client.publish("from_arduino_data",(char *)buffer);
  printlcd((char *)buffer);

  // Halt PICC
  mfrc522.PICC_HaltA();
  // Stop encryption on PCD
  mfrc522.PCD_StopCrypto1();

  startTime=millis();
  while (millis() - startTime < timeout) {  // Wait within the timeout period
      client.loop();  // Keep listening for MQTT messages

      if (receivedResponse) {
          printlcd("Attendance Marked!!");
          delay(5000);
          receivedResponse=false;
          printlcd("IDLE");
          return;
      }
  }

  printlcd("Error while marking attendance");

  delay(1000);
  printlcd("IDLE");


}
