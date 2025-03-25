#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <WiFiClientSecure.h>
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>
#include <SoftwareSerial.h>
#include <TinyGPS++.h> 

void handleRoot();
void handleSetup();
void handleDashboard();
void handleReset();
void sendUpdate();

#define AP_SSID "SetupEsp"
#define gpsRxPin D1
#define gpsTxPin D2
SoftwareSerial neo6m(gpsTxPin, gpsRxPin);

TinyGPSPlus gps;

String latitude = "9.8944885";
String longitude = "76.7132559";

ESP8266WebServer server(80);
String conductorId;
String conductorPass;
String wifiSSID;
String wifiPass;
bool configured = false;
unsigned long lastUpdate = 0;
const unsigned long updateInterval = 10000;

void setup() {
  Serial.begin(115200);
  neo6m.begin(9600);
  startSetupMode();
}

void loop() {
  while (neo6m.available() > 0) {
    if (gps.encode(neo6m.read())) {
      latitude = String(gps.location.lat(), 6);
      longitude = String(gps.location.lng(), 6);
    }
  }
  server.handleClient();
  
  if (configured) {
    if (WiFi.status() != WL_CONNECTED) {
      WiFi.reconnect();
    }
    
    if (millis() - lastUpdate >= updateInterval) {
      sendUpdate();
      lastUpdate = millis();
    }
  }
}

void startSetupMode() {
  WiFi.disconnect(true);
  WiFi.mode(WIFI_AP_STA);
  WiFi.softAP(AP_SSID);
  
  server.on("/", HTTP_GET, handleRoot);
  server.on("/setup", HTTP_POST, handleSetup);
  server.on("/dashboard", HTTP_GET, handleDashboard);
  server.on("/reset", HTTP_POST, handleReset);
  server.begin();
  
  Serial.println("Setup mode started");
  Serial.print("AP IP address: ");
  Serial.println(WiFi.softAPIP());
}

// Add the improved HTML styling from previous answer here

void handleDashboard() {
  String html = R"(
  <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    .config-table { width: 100%; margin: 20px 0; border-collapse: collapse; }
    .config-table td { padding: 10px; border-bottom: 1px solid #eee; }
    .config-table tr:last-child td { border-bottom: none; }
    #map { height: 400px; width: 100%; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Device Dashboard</h1>
    <div class="status-screen">
      <h2>Current Configuration</h2>
      <table class="config-table">
        <tr><td>Conductor ID</td><td>%CONDUCTOR_ID%</td></tr>
        <tr><td>WiFi Network</td><td>%WIFI_SSID%</td></tr>
        <tr><td>WiFi Status</td><td>%WIFI_STATUS%</td></tr>
        <tr><td>Last Update</td><td>%LAST_UPDATE%</td></tr>
      </table>
      <form action="/reset" method="post" onsubmit="return confirm('Are you sure you want to reset?');">
        <button type="submit" class="retry-button" style="background: #ea4335; margin-top: 20px;">
          Reset Configuration
        </button>
      </form>
    </div>
  </div>

  <h1>Location</h1>
  <div id="map"></div>

  <script>
    function initMap() {
      var options = {
        zoom: 16,
        center: { lat: %latitude%, lng: %longitude% },
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };
      var map = new google.maps.Map(document.getElementById('map'), options);
      var marker = new google.maps.Marker({
        position: { lat: %latitude%, lng: %longitude% },
        map: map,
        title: 'Bus Location'
      });
    }
  </script>
  <script async defer src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCy9YxG0MyZd7K8ejF1UK1XujIfks4byHU&callback=initMap"></script>
</body>
</html>
  )";

  html.replace("%CONDUCTOR_ID%", conductorId);
  html.replace("%WIFI_SSID%", wifiSSID);
  html.replace("%WIFI_STATUS%", WiFi.status() == WL_CONNECTED ? "Connected" : "Disconnected");
  html.replace("%LAST_UPDATE%", String(millis()/1000) + " seconds ago");
  html.replace("%latitude%", latitude);
  html.replace("%longitude%", longitude);
  
  server.send(200, "text/html", html);
}

void handleReset() {
  configured = false;
  conductorId = "";
  conductorPass = "";
  wifiSSID = "";
  wifiPass = "";
  
  String html = R"(
  <!DOCTYPE html>
  <html>
  <head>
    <meta http-equiv="refresh" content="5;url=/">
    <style>/* Include status screen styles */</style>
  </head>
  <body>
    <div class="container">
      <div class="status-screen">
        <h1 class="success">Configuration Reset</h1>
        <p>Device will restart in 5 seconds...</p>
        <div class="loader"></div>
      </div>
    </div>
  </body>
  </html>
  )";
  
  server.send(200, "text/html", html);
  delay(5000);
  ESP.restart();
}
void handleRoot() {
  String html = R"(
  <!DOCTYPE html>
  <html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      * { box-sizing: border-box; font-family: Arial, sans-serif; }
      body { background: #f0f2f5; margin: 0; padding: 20px; }
      .container { max-width: 400px; margin: 40px auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
      h1 { color: #1a73e8; margin: 0 0 25px 0; text-align: center; }
      .form-group { margin-bottom: 20px; }
      label { display: block; margin-bottom: 5px; color: #5f6368; }
      input { width: 100%; padding: 12px; border: 1px solid #dadce0; border-radius: 5px; font-size: 16px; }
      input:focus { outline: none; border-color: #1a73e8; box-shadow: 0 0 0 2px #e8f0fe; }
      button { width: 100%; padding: 12px; background: #1a73e8; color: white; border: none; border-radius: 5px; font-size: 16px; cursor: pointer; }
      button:hover { background: #1557b0; }
      .status-screen { text-align: center; padding: 30px; }
      .success { color: #34a853; }
      .error { color: #ea4335; }
      .loader { border: 4px solid #f3f3f3; border-top: 4px solid #1a73e8; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 20px auto; }
      @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Device Setup</h1>
      <form action="/setup" method="post">
        <div class="form-group">
          <label>Conductor ID</label>
          <input type="text" name="conductorId" required>
        </div>
        <div class="form-group">
          <label>Conductor Password</label>
          <input type="password" name="conductorPass" required>
        </div>
        <div class="form-group">
          <label>WiFi SSID</label>
          <input type="text" name="ssid" required>
        </div>
        <div class="form-group">
          <label>WiFi Password</label>
          <input type="password" name="pass" required>
        </div>
        <button type="submit">Save Configuration</button>
      </form>
    </div>
  </body>
  </html>
  )";

  if(configured){
    server.sendHeader("Location", "/dashboard", true);
    server.send(302, "text/plain", "");
    return;
  }

  server.send(200, "text/html", html);
}

void handleSetup() {
  // Store credentials in memory
  conductorId = server.arg("conductorId");
  conductorPass = server.arg("conductorPass");
  wifiSSID = server.arg("ssid");
  wifiPass = server.arg("pass");

  // Create response HTML
  String html = R"(
  <!DOCTYPE html>
  <html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      * { box-sizing: border-box; font-family: Arial, sans-serif; }
      body { background: #f0f2f5; margin: 0; padding: 20px; }
      .container { max-width: 400px; margin: 40px auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; }
      h1 { margin: 0 0 25px 0; }
      .success { color: #34a853; }
      .error { color: #ea4335; }
      .loader { border: 4px solid #f3f3f3; border-top: 4px solid #1a73e8; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 20px auto; }
      @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      .retry-button { background: #1a73e8; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; }
    </style>
  </head>
  <body>
    <div class="container">
  )";

  // Send initial response
  server.send(200, "text/html", html);

  Serial.println("Wait 10");
  delay(10000);
  // Attempt WiFi connection
  WiFi.mode(WIFI_STA);
  WiFi.begin(wifiSSID.c_str(), wifiPass.c_str());

  if (WiFi.waitForConnectResult(15000) == WL_CONNECTED) {
    configured = true;
    WiFi.mode(WIFI_AP_STA);

    html += R"(
      <div class="status-screen">
        <h1 class="success">Setup Successful!</h1>
        <p>Device is connecting to network...</p>
        <div class="loader"></div>
        <p>You can now close this page</p>
      </div>
    )";
  } else {
    html += R"(
      <div class="status-screen">
        <h1 class="error">Setup Failed</h1>
        <p>Could not connect to WiFi network. Please check your credentials.</p>
        <button class="retry-button" onclick="window.location.href='/'" style="margin-top: 20px;">Try Again</button>
      </div>
    )";
    startSetupMode();
  }

  html += "</div></body></html>";
  server.send(200, "text/html", html);
}
void sendUpdate() {
  if (WiFi.status() != WL_CONNECTED) return;

  WiFiClientSecure client;
  client.setInsecure();

  HTTPClient http;
  http.begin(client, "https://bus-tracker-backend-one.vercel.app/api/hardware/update");
  http.addHeader("Content-Type", "application/json");

  DynamicJsonDocument doc(200);
  doc["conductor_id"] = conductorId;
  doc["password"] = conductorPass;
  doc["latitude"] = latitude;
  doc["longitude"] = longitude;

  String payload;
  serializeJson(doc, payload);

  int httpCode = http.POST(payload);
  Serial.println("Latitude: " + latitude);
  Serial.println("Longitude: " + longitude);
  Serial.println("Payload: " + payload);

  if (httpCode > 0) {
    Serial.printf("HTTP POST code: %d\n", httpCode);
    String response = http.getString();
    Serial.println(response);
  } else {
    Serial.printf("HTTP POST failed, error: %s\n", http.errorToString(httpCode).c_str());
  }

  http.end();
}
