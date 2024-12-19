#include <Wifi.h>
#include <LiquidCrystal_I2C.h>
#include <Wire.h>
#include <PubSubClient.h>
#include <MFRC522.h>
#include <ArduinoJson.h>


#define RST_PIN         9 
#define SS_PIN          10  
#define RED_LED         3
#define YELLOW_LED      4
#define GREEN_LED       5
#define BUZZER_PIN      6



LiquidCrystal_I2C lcd(0x27,16,2);

WiFiClient espclient;
PubSubClient client(espclient);


const char* WiFi_SSID = "";
const char* WiFi_Pass = "";
const char* MQTT_IP = "";
const char* MQTT_User = "";
const char* MQTT_Pass = "";


char* MODE = "idle";
char* IDLE_TEXT = "IDLE Mode";
char* IDLE_TEXT2 = "Scan Your Card";


MFRC522::MIFARE_Key key;
key.keyByte = { 0xA6, 0xB5, 0xC4, 0xD3, 0xE2, 0xF1 };


void printlcd(char* message,byte row=0,byte clear=1){
  if(clear){
    lcd.clear();
  }
  lcd.setCursor(0,row);
  lcd.print(message);
}


void showError(char* message){
  printlcd("[X] "+message);
  MODE = "idle";
}




void setup() {
  // put your setup code here, to run once:
  
  SPI.begin();
  MFRC522.PCD_Init();

  lcd.init();
  lcd.backlight();
  printlcd("Welcome");
  delay(500);

  printlcd("Connecting to WiFi")l

  WiFi.begin(WiFi_SSID,WiFi_Pass);
  while(WiFi.status() != WL_CONNECTED){
    lcd.print(".");
    delay(500);
  }
  printlcd("WiFi Connected!!");
  delay(500);


  client.setServer(MQTT_IP,MQTT_User,MQTT_Pass);
  client.setCallback(callback);

  printlcd("Connecting to MQTT Broker");
  while(!client.connected()){
    if(client.connect("ArduinoClient")){
      printlcd("Connected!!",1,0);
      client.subscribe("to_arduino");
    }else{
      lcd.print(".");
    }
    delay(500);
  }


  pinMode(RED_LED,OUTPUT);
  pinMode(GREEN_LED,OUTPUT);
  pinMode(YELLOW_LED,OUTPUT);
  pinMode(BUZZER_PIN,OUTPUT);

}




void callback(char* topic, byte* payload, unsigned int length) {
  char message[length+1];
  strncpy(message,(char*)payload,length);
  message[length] = '\0';

  if(strstr(topic,"to_arduino" == 0)) return;


  DynamicJsonDocument doc(length+1);

  DeserializationError error = deserializeJson(doc,message);

  if(error){
    showError("JSON Parse Error");
    return;
  }

  //write the logic to write

  if(strcmp(doc['operation'],"write") ==0 ){  
    printlcd("Ready to write Card");

    MFRC522::MIFARE_Key newkey;
    for(byte i=0; i<6; i++) newkey.keyByte[i] = 0xFF;


    while(!mfrc522.PICC_IsNewCardPresent()){
      delay(100);
    }

    if(!mfrc522.PICC_ReadCardSerial()){
      showError("Card Read Error");
      client.publish("from_arduino_response","{\"success\":false}");
      return;
    }

    MFRC522::StatusCode status;
    byte block;
    block=1;

    status = mfrc522.PCD_Authenticate(MFRC522::PICC_CMD_MF_AUTH_KEY_A, block, &newkey, &(mfrc522.uid));

    if(status!= MFRC::STATUS_OK){
      showError("Authentication Error")
      client.publish("from_arduino_response","{\"success\":false}");
      return;
    }

    status = mfrc522.MIFARE_Write(block, (byte*)doc["firstname"], strlen(doc["firstname"]));

    if(status!= MFRC::STATUS_OK){
      showError("Error while writing")
      client.publish("from_arduino_response","{\"success\":false}");
      return;
    }

    block++;

    status = mfrc522.PCD_Authenticate(MFRC522::PICC_CMD_MF_AUTH_KEY_A, block, &newkey, &(mfrc522.uid));

    if(status!= MFRC::STATUS_OK){
      showError("Authentication Error")
      client.publish("from_arduino_response","{\"success\":false}");
      return;
    }

    status = mfrc522.MIFARE_Write(block, (byte*)doc["lastname"], strlen(doc["lastname"]));

    if(status!= MFRC::STATUS_OK){
      showError("Error while writing")
      client.publish("from_arduino_response","{\"success\":false}");
      return;
    }


    block++;

    status = mfrc522.PCD_Authenticate(MFRC522::PICC_CMD_MF_AUTH_KEY_A, block, &newkey, &(mfrc522.uid));

    if(status!= MFRC::STATUS_OK){
      showError("Authentication Error")
      client.publish("from_arduino_response","{\"success\":false}");
      return;
    }

    status = mfrc522.MIFARE_Write(block, (byte*)doc["rollno"], strlen(doc["rollno"]));

    if(status!= MFRC::STATUS_OK){
      showError("Error while writing")
      client.publish("from_arduino_response","{\"success\":false}");
      return;
    }


    // change the access bit and set the Card key

    printlcd("Card written successfully!!  ");

    client.publish("from_arduino_response","{\"success\":true}");

    delay(3000);
    lcd.clear();

  }
  else if( strcmp(doc["operation"],"read" ) ){
    IDLE_TEXT = doc["class"] + " " + doc["subject"];
    IDLE_TEXT2 = doc["teacher"];
  }


}


void loop() {
  // put your main code here, to run repeatedly:

  printlcd(IDLE_TEXT);
  printlcd(IDLE_TEXT2,1,0);

  client.loop();

  if(!mfrc522.IsNewCardPresent()){
    return;
  }

  if(!mfrc522.PICC_ReadCardSerial()){
    showError("Card Read Error");
    return;
  }


  MFRC522::StatusCode status;
  byte block;
  block=1;
  byte buffer[18];


  if(strcmp(MODE,"read")==0){ 
    DynamicJsonDocument doc(200);

    status = mfrc522.PCD_Authenticate(MFRC522::PICC_CMD_MF_AUTH_KEY_A, block, &key, &(mfrc522.uid));

    if(status!= MFRC::STATUS_OK){
      showError("Authentication Error")
      return;
    }

    status = mfrc522.MIFARE_Read(block, buffer, 16);

    if(status!= MFRC::STATUS_OK){
      showError("Error while writing")
      return;
    }
    strcpy(doc["firstname"],buffer);
    buffer=0;


    block++;


    status = mfrc522.PCD_Authenticate(MFRC522::PICC_CMD_MF_AUTH_KEY_A, block, &key, &(mfrc522.uid));

    if(status!= MFRC::STATUS_OK){
      showError("Authentication Error")
      return;
    }

    status = mfrc522.MIFARE_Read(block, buffer, 16);

    if(status!= MFRC::STATUS_OK){
      showError("Error while writing")
      return;
    }
    strcpy(doc["lastname"],buffer);

    buffer=0;



  }


}
