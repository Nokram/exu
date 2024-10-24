// Initialisation de la carte
var map = L.map('map').setView([48.8566, 2.3522], 13); // Vue centrée sur Paris

// Ajout d'une couche de base (OpenStreetMap)
var osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Création d'un groupe de couches pour gérer plusieurs couches
var layersControl = {
    "OpenStreetMap": osmLayer
};

// Ajout d'autres couches (exemple avec une couche satellite)
var satelliteLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenTopoMap contributors'
});

// Ajout de la gestion des couches (activation/désactivation)
L.control.layers(layersControl, {
    "Satellite": satelliteLayer
}).addTo(map);

// Activation de l'édition avec Leaflet Draw
var drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

// Configuration des outils de dessin
var drawControl = new L.Control.Draw({
    edit: {
        featureGroup: drawnItems
    },
    draw: {
        polyline: true,    // Permet le dessin de lignes
        polygon: true,     // Permet le dessin de polygones
        rectangle: true,   // Permet le dessin de rectangles
        circle: true,      // Permet le dessin de cercles
        marker: true       // Permet le placement de marqueurs
    }
});
map.addControl(drawControl);

// Gestion des événements de dessin
map.on(L.Draw.Event.CREATED, function (event) {
    var layer = event.layer;
    drawnItems.addLayer(layer);
});

// Gestion des événements d'édition
map.on('draw:edited', function (event) {
    var layers = event.layers;
    layers.eachLayer(function (layer) {
        // Exécution d'une action après l'édition
        console.log('Objet édité:', layer);
    });
});

// Gestion des événements de suppression
map.on('draw:deleted', function (event) {
    var layers = event.layers;
    layers.eachLayer(function (layer) {
        // Exécution d'une action après suppression
        console.log('Objet supprimé:', layer);
    });
});
