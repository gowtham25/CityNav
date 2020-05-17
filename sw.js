importScripts('https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js');

if (workbox) {
  console.log(`Yay! Workbox is loaded 🎉`);
} else {
  console.log(`Boo! Workbox didn't load 😬`);
}

workbox.routing.registerRoute(
    /\.css$/,
    new workbox.strategies.StaleWhileRevalidate({
	cacheName: 'css-cache',
    })
);
workbox.routing.registerRoute(
    /\.js$/,
    new workbox.strategies.StaleWhileRevalidate({
	cacheName: 'js-cache',
    })
);
workbox.routing.registerRoute(
    /\.(?:png|jpg|jpeg|svg|gif)$/,
    new workbox.strategies.CacheFirst({
	cacheName: 'image-cache',
	plugins: [
	    new workbox.expiration.Plugin({
		maxAgeSeconds: 7*24*60*60,
	    })
	],	
    })
);
workbox.routing.registerRoute(
    new RegExp('https://.*openstreetmap\\.org.*\\.png'),
    new workbox.strategies.CacheFirst({
	cacheName: 'ext-image-cache',
	plugins: [
	    new workbox.cacheableResponse.Plugin({
		statuses: [0,200] 
	    })
	],	
    })
);

self.addEventListener('fetch', function(event){
});
