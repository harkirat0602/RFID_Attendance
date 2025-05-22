#include <SPI.h>
#include <PubSubClient.h>
#include <MFRC522.h>
#include <ESP8266WiFi.h>
#include <LiquidCrystal_PCF8574.h>
#include <Wire.h>


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



void gotsuccess(){
  // tone(SIGNAL_PIN, 1000, 200);  // Beep at 1kHz for 200ms
  Wire.beginTransmission(0x20);
  Wire.write(0b00000101); 
  Wire.endTransmission();
  
  delay(1500);

  Wire.beginTransmission(0x20);
  Wire.write(0b00000000); 
  Wire.endTransmission();
  printlcd("IDLE");
  

}


void gotfailure(){
  byte error;
  for(int i=0; i<4; i++){
    Wire.beginTransmission(0x20);
    Wire.write(0b00000110); 
    error = Wire.endTransmission();
    if(error==0){
      Serial.println("LED Glowing?");
    }else{
      Serial.println("LED Not Glowing");
      Serial.print("I2C Error: ");
      Serial.println(error);
    }

    delay(200);
    Wire.beginTransmission(0x20);
    Wire.write(0b00000010); 
    error = Wire.endTransmission();
    
    delay(200);
  }

  Wire.beginTransmission(0x20);
  Wire.write(0b00000000); 
  error = Wire.endTransmission();
}


unsigned long startTime;
const long timeout = 5000;  // 5 seconds timeout
bool receivedResponse = false;



void mqttCallback(char* topic, byte* payload, unsigned int length) {
    // Serial.print("MQTT Message received: ");
    String message = "";
    for (unsigned int i = 0; i < length; i++) {
        message += (char)payload[i];
    }
    printlcd(message.c_str());

    if (String(topic) == "to_arduino_response" && message == "SUCCESS") {
        printlcd("Attendance Marked!!");
        gotsuccess();
        receivedResponse = true;
    }else{
        gotfailure();
        receivedResponse = true;
    }
}


void reconnectMQTT() {
  if (WiFi.status() != WL_CONNECTED) return;  // wait for WiFi

  static unsigned long lastAttempt = 0;
  unsigned long now = millis();

  if (now - lastAttempt > 5000) {  // retry every 5 seconds
    lastAttempt = now;
    printlcd("Attempting MQTT connection...");
    if (client.connect("ArduinoClient","harkirat","Harkirat123")) {
      printlcd("connected");
      client.subscribe("to_arduino_response"); // optional
      printlcd("IDLE");
    } else {
      printlcd("failed");
    }
  }
}




void setup() {
  // put your setup code here, to run once:
  SPI.begin();
  mfrc522.PCD_Init();

  Wire.begin();
  Wire.setClock(50000);
  Wire.beginTransmission(0x20);
  Wire.write(0x00); // all HIGH
  Wire.endTransmission();

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


  // pinMode(SIGNAL_PIN,OUTPUT);

  // digitalWrite(SIGNAL_PIN,LOW);


  printlcd("Connecting to WiFi");

  WiFi.begin("CMF by Nothing Phone 1_3250","gfzvkh6mf79tkyn");
  // WiFi.begin("Kirat","11101970Pa");
  while(WiFi.status() != WL_CONNECTED){
    delay(200);
  }
  printlcd("WiFi Connected");


  client.setServer("192.168.238.165",1883);
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
  
  if (!client.connected()) {
    reconnectMQTT();  // your custom function to reconnect
  }


  
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
      gotfailure();
      return;
  }


  
  delayMicroseconds(50);
  status = mfrc522.MIFARE_Read(1, buffer, &len);
  if (status != MFRC522::STATUS_OK) {
    printlcd("Reading failed: ");
    // Serial.println(mfrc522.GetStatusCodeName(status));
    gotfailure();
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
          receivedResponse=false;
          return;
      }
  }

  printlcd("No Response");

}
