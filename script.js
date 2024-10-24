// Initialiser la carte
const map = L.map('map').setView([46.8, 2.3], 5);

// Ajouter une couche de tuiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
}).addTo(map);

// Initialiser les layers
let editableLayer = new L.FeatureGroup();
let nonEditableLayer = L.layerGroup().addTo(map);

// Ajouter des points à la couche non éditable (par exemple)
const point1 = L.marker([46.8, 2.3]).bindPopup("Point spécifique 1").addTo(nonEditableLayer);
const point2 = L.marker([47.0, 2.1]).bindPopup("Point spécifique 2").addTo(nonEditableLayer);

// Activer l'édition seulement pour `editableLayer`
map.addLayer(editableLayer);

// Ajouter le contrôle de dessin pour la carte
const drawControl = new L.Control.Draw({
    edit: {
        featureGroup: editableLayer, // Les objets à modifier
        remove: true // Autoriser la suppression
    },
    draw: {
        polygon: false,  // Désactiver le dessin de polygones
        polyline: false, // Désactiver le dessin de lignes
        rectangle: false, // Désactiver le dessin de rectangles
        circle: false, // Désactiver le dessin de cercles
        marker: true // Autoriser uniquement les marqueurs
    }
});

map.addControl(drawControl);

// Gestion des événements de dessin
map.on(L.Draw.Event.CREATED, function (e) {
    const layer = e.layer;

    // Ajout d'un popup pour éditer les infos
    layer.bindPopup(createPopupContent(layer)).openPopup();

    // Ajouter à la couche éditable
    editableLayer.addLayer(layer);
});

// Fonction pour créer un contenu de popup éditable
function createPopupContent(layer) {
    const popupContent = `
        <form>
            <label for="name">Nom:</label>
            <input type="text" id="name" name="name" value="Point sans nom"><br><br>
            <label for="description">Description:</label>
            <textarea id="description" name="description">Description du point</textarea><br><br>
            <input type="button" value="Enregistrer" onclick="saveData(${layer._leaflet_id})">
        </form>
    `;
    return popupContent;
}

// Sauvegarde des données (simulation dans cet exemple)
function saveData(layerId) {
    const layer = editableLayer.getLayer(layerId);
    const popup = layer.getPopup();

    // Récupérer les données du formulaire
    const name = document.getElementById("name").value;
    const description = document.getElementById("description").value;

    // Mettre à jour le popup avec les nouvelles infos
    layer.bindPopup(`<b>${name}</b><br>${description}`).openPopup();
}

// Ajouter un contrôle pour cocher/décocher les layers
L.control.layers(null, {
    'Points non éditables': nonEditableLayer,
    'Points éditables': editableLayer
}).addTo(map);
