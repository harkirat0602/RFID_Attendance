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


void setup() {
  // put your setup code here, to run once:
  
  SPI.begin();
  MFRC522.PCD_Init();

  lcd.init();
  lcd.backlight();
  lcd.setCursor(0,0);
  lcd.print("Welcome");
  delay(500);

  lcd.clear();
  lcd.setCursor(0,0);
  lcd.print("Connecting to WiFi");

  WiFi.begin(WiFi_SSID,WiFi_Pass);
  while(WiFi.status() != WL_CONNECTED){
    lcd.print(".");
    delay(500);
  }
  lcd.clear();
  lcd.setCursor(0,0);
  lcd.print("WiFi Connected!!");
  delay(500);
  lcd.clear();
  lcd.setCursor(0,0);

  client.setServer(MQTT_IP,MQTT_User,MQTT_Pass);
  client.setCallback(callback);

  lcd.print("Connecting to MQTT Broker");
  while(!client.connected()){
    if(client.connect("ArduinoClient")){
      lcd.setCursor(0,1);
      lcd.print("Connected!!");
      client.subscribe("attendance/command");
      client.subscribe("attendance/data");
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

  if(strstr(message,"\"sender\":\"arduino\"") != 0){
    return;
  }


  if(strstr(topic,"attendance/command") != 0){
    strncpy(MODE,message,length);
    return;
  }else if(strstr(topic,"attendance/data") != 0){
    if(strcmp(MODE,"write") =! 0){
      return;
    }

    DynamicJsonDocument doc(length+1);

    DeserializationError error = deserializeJson(doc,message);

    if(error){
      lcd.setCursor(0,0);
      lcd.print("JSON Parse Error");
      MODE = "idle";
      return;
    }

    //write the logic to write



  }


}


void loop() {
  // put your main code here, to run repeatedly:

}
