#include <Wifi.h>
#include <LiquidCrystal_I2C.h>
#include <Wire.h>
#include <PubSubClient.h>
#include <MFRC522.h>


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


char* MODE = "IDLE";
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
    lcd_print(".");
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

void loop() {
  // put your main code here, to run repeatedly:

}
