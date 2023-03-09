self.addEventListener("install", function(event) {
   console.log("Service worker installed");});
self.addEventListener("activate", function(event) {
   console.log("Service worker activated");});
self.addEventListener('fetch', function(event) {});
self.addEventListener('message', function(event) {});
self.addEventListener('push', function(event) {});


