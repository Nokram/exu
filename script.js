const map = L.map('map').setView([48.8566, 2.3522], 13); // Centre sur Paris

// Ajoute la couche de rue par défaut
layers.streets.addTo(map);

// Création des contrôles pour les couches
const layerControls = L.control.layers({
    "Street": layers.streets,
    "Satellite": layers.satellite
}).addTo(map);

// Ajout des options d'édition
const drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

const drawControl = new L.Control.Draw({
    edit: {
        featureGroup: drawnItems
    },
    draw: {
        polyline: true,
        polygon: true,
        rectangle: true,
        circle: true,
        marker: true,
        circlemarker: true
    }
});
map.addControl(drawControl);

// Écoute les événements de dessin
map.on(L.Draw.Event.CREATED, (event) => {
    const layer = event.layer;
    drawnItems.addLayer(layer);
});
