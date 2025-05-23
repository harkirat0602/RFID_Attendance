/*
 * Write personal data of a MIFARE RFID card using a RFID-RC522 reader
 * Uses MFRC522 - Library to use ARDUINO RFID MODULE KIT 13.56 MHZ WITH TAGS SPI W AND R BY COOQROBOT. 
 * -----------------------------------------------------------------------------------------
 *             MFRC522      Arduino       Arduino   Arduino    Arduino          Arduino
 *             Reader/PCD   Uno/101       Mega      Nano v3    Leonardo/Micro   Pro Micro
 * Signal      Pin          Pin           Pin       Pin        Pin              Pin
 * -----------------------------------------------------------------------------------------
 * RST/Reset   RST          9             5         D9         RESET/ICSP-5     RST
 * SPI SS      SDA(SS)      10            53        D10        10               10
 * SPI MOSI    MOSI         11 / ICSP-4   51        D11        ICSP-4           16
 * SPI MISO    MISO         12 / ICSP-1   50        D12        ICSP-1           14
 * SPI SCK     SCK          13 / ICSP-3   52        D13        ICSP-3           15
 *
 * More pin layouts for other boards can be found here: https://github.com/miguelbalboa/rfid#pin-layout
 *
 * Hardware required:
 * Arduino
 * PCD (Proximity Coupling Device): NXP MFRC522 Contactless Reader IC
 * PICC (Proximity Integrated Circuit Card): A card or tag using the ISO 14443A interface, eg Mifare or NTAG203.
 * The reader can be found on eBay for around 5 dollars. Search for "mf-rc522" on ebay.com. 
 */

#include <SPI.h>
#include <MFRC522.h>

#define RST_PIN         0           // Configurable, see typical pin layout above
#define SS_PIN          15          // Configurable, see typical pin layout above

MFRC522 mfrc522(SS_PIN, RST_PIN);   // Create MFRC522 instance

MFRC522::MIFARE_Key key;
MFRC522::MIFARE_Key oldkey;

byte buffer[34];
byte len;


void setup() {
  Serial.begin(9600);        // Initialize serial communications with the PC
  SPI.begin();               // Init SPI bus
  mfrc522.PCD_Init();        // Init MFRC522 card
  Serial.println(F("Write personal data on a MIFARE PICC "));
  SPI.setFrequency(1000000);

  key.keyByte[0] = 0xA6;
  key.keyByte[1] = 0xB5;
  key.keyByte[2] = 0xC4;
  key.keyByte[3] = 0xD3;
  key.keyByte[4] = 0xE2;
  key.keyByte[5] = 0xF1;


  oldkey.keyByte[0] = 0xFF;
  oldkey.keyByte[1] = 0xFF;
  oldkey.keyByte[2] = 0xFF;
  oldkey.keyByte[3] = 0xFF;
  oldkey.keyByte[4] = 0xFF;
  oldkey.keyByte[5] = 0xFF;

}

void loop() {


  if(buffer[0]==0){
    Serial.println(F("Type Roll no, ending with #"));
    delay(2000);
    while(!Serial.available());
    len = Serial.readBytesUntil('#', (char *) buffer, 30) ; // read family name from serial
    for (byte i = len; i < 30; i++) buffer[i] = ' '; 
    Serial.println(len);
  }



  // Reset the loop if no new card present on the sensor/reader. This saves the entire process when idle.
  if ( ! mfrc522.PICC_IsNewCardPresent()) {
    return;
  }

  // Select one of the cards
  if ( ! mfrc522.PICC_ReadCardSerial()) {
    return;
  }

  Serial.print(F("Card UID:"));    //Dump UID
  for (byte i = 0; i < mfrc522.uid.size; i++) {
    Serial.print(mfrc522.uid.uidByte[i] < 0x10 ? " 0" : " ");
    Serial.print(mfrc522.uid.uidByte[i], HEX);
  }
  Serial.print(F(" PICC type: "));   // Dump PICC type
  MFRC522::PICC_Type piccType = mfrc522.PICC_GetType(mfrc522.uid.sak);
  Serial.println(mfrc522.PICC_GetTypeName(piccType));


  byte block;
  MFRC522::StatusCode status;
  


  // Ask personal data: Family name


  delay(100);
  SPI.beginTransaction(SPISettings(500000, MSBFIRST, SPI_MODE0));
  mfrc522.PCD_StopCrypto1();  // End previous session (super important!)
  delay(100);
  mfrc522.PCD_Init();


  if (!mfrc522.PICC_IsNewCardPresent() || !mfrc522.PICC_ReadCardSerial()) {
  Serial.println("Card removed or not detected anymore");
  return;
  }


  block = 1;
  //Serial.println(F("Authenticating using key A..."));
  status = mfrc522.PCD_Authenticate(MFRC522::PICC_CMD_MF_AUTH_KEY_A, 1, &key, &(mfrc522.uid));
  if (status != MFRC522::STATUS_OK) {
    // Serial.print(F("PCD_Authenticate() failed: "));
    // Serial.println(mfrc522.GetStatusCodeName(status));
    // return;
    status = mfrc522.PCD_Authenticate(MFRC522::PICC_CMD_MF_AUTH_KEY_A, 1, &oldkey, &(mfrc522.uid));
    if (status != MFRC522::STATUS_OK) {
      Serial.print(F("PCD_Authenticate() failed: "));
      Serial.println(mfrc522.GetStatusCodeName(status));
      delay(1000);
      return;
    }
    else Serial.println(F("PCD_Authenticate() success: "));
  }
  else Serial.println(F("PCD_Authenticate() success: "));

  // Write block
  status = mfrc522.MIFARE_Write(block, buffer, 16);
  if (status != MFRC522::STATUS_OK) {
    Serial.print(F("MIFARE_Write() failed: "));
    Serial.println(mfrc522.GetStatusCodeName(status));
    return;
  }
  else Serial.println(F("MIFARE_Write() success: "));


  byte trailerBlock=3;

  byte newTrailerBlock[] = {0xA6, 0xB5, 0xC4, 0xD3, 0xE2, 0xF1, 
                              0xFF, 0x07, 0x80, 0x69, 
                              0xA6, 0xB5, 0xC4, 0xD3, 0xE2, 0xF1};


  // status = mfrc522.PCD_Authenticate(MFRC522::PICC_CMD_MF_AUTH_KEY_A, 3, &oldkey, &(mfrc522.uid));
  // if (status != MFRC522::STATUS_OK) {
  //   // Serial.print(F("PCD_Authenticate() failed: "));
  //   // Serial.println(mfrc522.GetStatusCodeName(status));
  //   // return;
  //   status = mfrc522.PCD_Authenticate(MFRC522::PICC_CMD_MF_AUTH_KEY_A, 3, &key, &(mfrc522.uid));
  //   if (status != MFRC522::STATUS_OK) {
  //     Serial.print(F("PCD_Authenticate() failed: "));
  //     Serial.println(mfrc522.GetStatusCodeName(status));
  //     mfrc522.PCD_StopCrypto1();
  //     mfrc522.PCD_Reset();
  //     delay(50);
  //     return;
  //   }
  //   else Serial.println(F("PCD_Authenticate() success: "));
  // }
  // else Serial.println(F("PCD_Authenticate() success: "));


  status = (MFRC522::StatusCode)mfrc522.MIFARE_Write(trailerBlock, newTrailerBlock, 16);
    if (status != MFRC522::STATUS_OK) {
       Serial.println("Failed to write new key!");
    } else {
        Serial.println("Authentication key updated successfully!");
    }

  buffer[0]= 0;


  Serial.println(" ");
  mfrc522.PICC_HaltA(); // Halt PICC
  mfrc522.PCD_StopCrypto1();  // Stop encryption on PCD

}
