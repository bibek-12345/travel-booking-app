mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map', // container ID
    center: listing.geometry.coordinates, // startingposition [lng, lat]. Note that lat must be setbetween -90 and 90
    zoom: 9 // starting zoom
});


 // Create a Marker and add it to the map.
const marker1 = new mapboxgl.Marker({color:'red', rotation: 45 })
    .setLngLat(listing.geometry.coordinates) //Listing.geometry.coordinates
    .setPopup(new mapboxgl.Popup({offset: 25})
    .setHTML(`<h4>${listing.location}</h4><p>Exact Location provided after booking</p>`))
    .addTo(map);
