#include <WiFiEsp.h>
// #include <SoftwareSerial.h>
#include <LiquidCrystal_I2C.h>
#include <Wire.h>
#include <PubSubClient.h>
#include <SPI.h>
#include <MFRC522.h>
#include <ArduinoJson.h>


#define RST_PIN         9 
#define SS_PIN          10  
#define RED_LED         3
#define YELLOW_LED      4
#define GREEN_LED       5
#define BUZZER_PIN      6



LiquidCrystal_I2C lcd(0x27,16,2);

// SoftwareSerial Serial1(2,3);

WiFiEspClient espclient;
PubSubClient client(espclient);

MFRC522 mfrc522(SS_PIN, RST_PIN);



char* MODE = "idle";
const char* IDLE_TEXT = "IDLE Mode";
const char* IDLE_TEXT2 = "Scan Your Card";


MFRC522::MIFARE_Key key;


void printlcd(const char* message,byte row=0,byte clear=1){
  static char* lasttext ="";
  if(strcmp(lasttext,message)==0) return;
  if(clear){
    lcd.clear();
  }
  lcd.setCursor(0,row);
  lcd.print(message);
  lasttext=message;
}


void showError(char* message){
  printlcd((String("[X] ")+message).c_str());
  MODE = "idle";
}

byte successResponse=0;




void setup() {
  // put your setup code here, to run once:
  
  SPI.begin();
  mfrc522.PCD_Init();

  key.keyByte[0] = 0xA6;
  key.keyByte[1] = 0xB5;
  key.keyByte[2] = 0xC4;
  key.keyByte[3] = 0xD3;
  key.keyByte[4] = 0xE2;
  key.keyByte[5] = 0xF1;

  Serial.begin(115200);
  WiFi.init(&Serial);


  lcd.init();
  lcd.backlight();
  printlcd("Welcome");
  delay(500);

  printlcd("Connecting to WiFi");
  if (WiFi.status() == WL_NO_SHIELD) {
    printlcd("WiFi shield not present");
    while (true);
  }


  WiFi.begin("Kirat","11101970Pa");
  while(WiFi.status() != WL_CONNECTED){
    lcd.print(".");
    delay(100);
    printlcd(WiFi.status());
  }
  printlcd("WiFi Connected!!");
  delay(1000);


  client.setServer("192.168.29.241",1883);
  client.setCallback(callback);

  printlcd("Connecting to MQTT Broker");
  short int attempts=0;
  while(!client.connected() && attempts<5){
    attempts++;
    if(client.connect(String("ArduinoClient").c_str(),"harkirat","Harkirat123")){
      printlcd("Connected!!",1,0);
      client.subscribe("to_arduino");
    }else{
      lcd.setCursor(0,1);
      lcd.print(client.state());
    }
    delay(5000);
  }


  // pinMode(RED_LED,OUTPUT);
  // pinMode(GREEN_LED,OUTPUT);
  // pinMode(YELLOW_LED,OUTPUT);
  // pinMode(BUZZER_PIN,OUTPUT);

}




void callback(char* topic, byte* payload, unsigned int length) {
  char message[length+1];
  strncpy(message,(char*)payload,length);
  message[length] = '\0';



  DynamicJsonDocument doc(length+1);

  DeserializationError error = deserializeJson(doc,message);

  if(error){
    showError("JSON Parse Error");
    return;
  }


  if(strstr(topic,"to_arduino_response") != 0) {
    if(strcmp( doc["success"],"true") ==0 ) successResponse=1;
    return;
  }

  if(strstr(topic,"to_arduino_command") == 0) return;

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
    block=4;

    status = mfrc522.PCD_Authenticate(MFRC522::PICC_CMD_MF_AUTH_KEY_A, block, &newkey, &(mfrc522.uid));

    if(status!= MFRC522::STATUS_OK){
      showError("Authentication Error");
      client.publish("from_arduino_response","{\"success\":false}");
      return;
    }

    status = mfrc522.MIFARE_Write(block, (byte*)doc["firstname"], strlen(doc["firstname"]));

    if(status!= MFRC522::STATUS_OK){
      showError("Error while writing");
      client.publish("from_arduino_response","{\"success\":false}");
      return;
    }

    block++;

    status = mfrc522.PCD_Authenticate(MFRC522::PICC_CMD_MF_AUTH_KEY_A, block, &newkey, &(mfrc522.uid));

    if(status!= MFRC522::STATUS_OK){
      showError("Authentication Error");
      client.publish("from_arduino_response","{\"success\":false}");
      return;
    }

    status = mfrc522.MIFARE_Write(block, (byte*)doc["lastname"], strlen(doc["lastname"]));

    if(status!= MFRC522::STATUS_OK){
      showError("Error while writing");
      client.publish("from_arduino_response","{\"success\":false}");
      return;
    }


    block++;

    status = mfrc522.PCD_Authenticate(MFRC522::PICC_CMD_MF_AUTH_KEY_A, block, &newkey, &(mfrc522.uid));

    if(status!= MFRC522::STATUS_OK){
      showError("Authentication Error");
      client.publish("from_arduino_response","{\"success\":false}");
      return;
    }

    status = mfrc522.MIFARE_Write(block, (byte*)doc["rollno"], strlen(doc["rollno"]));

    if(status!= MFRC522::STATUS_OK){
      showError("Error while writing");
      client.publish("from_arduino_response","{\"success\":false}");
      return;
    }


    block++;
    byte trailerblockdata[16] = {  0xA6, 0xB5, 0xC4, 0xD3, 0xE2, 0xF1, 0x78, 0x77, 0x88, 0x69, 0xA9, 0xB8, 0xC7, 0xD6, 0xE5, 0xF4  };

    status = mfrc522.MIFARE_Write(block, trailerblockdata, 16);

    if(status!= MFRC522::STATUS_OK){
      showError("Error while writing");
      client.publish("from_arduino_response","{\"success\":false}");
      return;
    }


    // change the access bit and set the Card key

    printlcd("Card written successfully!!  ");

    client.publish("from_arduino_response","{\"success\":true}");

    delay(3000);
    lcd.clear();
    MODE="idle";

    mfrc522.PICC_HaltA();
    mfrc522.PCD_StopCrypto1();

  }
  else if( strcmp(doc["operation"],"read" ) ){

    MODE="read";
    IDLE_TEXT = doc["subject"];
    IDLE_TEXT2 = doc["teacher"];
    client.publish("from_arduino_response","{\"success\":true}");

  } else if( strcmp(doc["operation"],"idle") ){

    MODE="idle";
    IDLE_TEXT = "IDLE Mode";
    IDLE_TEXT2 = "Scan Your Card";
    client.publish("from_arduino_response","{\"success\":true}");

  }


}


MFRC522::StatusCode readblock(byte block,const char *json){
  MFRC522::StatusCode status;
  byte buffer[18];

  status = mfrc522.PCD_Authenticate(MFRC522::PICC_CMD_MF_AUTH_KEY_A, block, &key, &(mfrc522.uid));

  if(status!= MFRC522::STATUS_OK){
    showError("Authentication Error");
    return status;
  }

  status = mfrc522.MIFARE_Read(block, buffer, 16);

  if(status!= MFRC522::STATUS_OK){
    showError("Error while writing");
    return status;
  }
  strcpy(json,buffer);
  return status;
}



void loop() {
  client.loop();

  if(!mfrc522.PICC_IsNewCardPresent()){
    printlcd(IDLE_TEXT);
    return;
  }

  if(!mfrc522.PICC_ReadCardSerial()){
    showError("Card Read Error");
    return;
  }


  MFRC522::StatusCode status;


  if(strcmp(MODE,"read")==0){ 
    JsonDocument doc;
    char jsonstring[60];

    

    status= readblock(1,doc["firstname"]);
    if(status != MFRC522::STATUS_OK){
      return;
    }

    status= readblock(2,doc["lastname"]);
    if(status != MFRC522::STATUS_OK){
      return;
    }
    
    status= readblock(3,doc["rollno"]);
    if(status != MFRC522::STATUS_OK){
      return;
    }

    printlcd(doc["firstname"]);
    printlcd("Marking Attendance",1,0);


    serializeJson(doc, jsonstring);
    client.publish("from_arduino_data",jsonstring);


    unsigned long int startTimeout = millis();
    while(successResponse!=1){
      client.loop();
      if(millis() - startTimeout > 5000) return;
    }
    if(successResponse==1){
      printlcd(doc["firstname"]);
      printlcd("Attendance Marked",1,0);
    }
    successResponse=0;

    // Write the code to wait for MQTT Response


  }else if( strcmp(MODE,"idle")==0 ){
    const char *data;
    const char *data2;

    // For Roll No
    status= readblock(3,data);
    if(status != MFRC522::STATUS_OK){
      return;
    }
    printlcd(data);


    //For First name
    status= readblock(1,data);
    if(status != MFRC522::STATUS_OK){
      return;
    }
    //For Last name
    status= readblock(2,data2);
    if(status != MFRC522::STATUS_OK){
      return;
    }


    printlcd((data+String(" ")+data2).c_str(),1,0);
    
    delay(5000);

  }


  mfrc522.PICC_HaltA();
  mfrc522.PCD_StopCrypto1();


}
