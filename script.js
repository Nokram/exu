// script.js

// Clé de l'API ORS
const apiKey = '5b3ce3597851110001cf6248b5a9f8396fba4a58a7bee5e4ad0a05c8';

// Initialisation de la carte avec un CRS spécifique (par exemple, EPSG:3857)
const map = L.map('map', {
    crs: L.CRS.EPSG3857,
}).setView([46.6034, 1.8883], 6); // Centré sur la France métropolitaine avec un niveau de zoom de 6

// Ajout de la couche de fond
const layers = {
    streets: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    }).addTo(map)
};

// Création des contrôles pour les couches
const layerControls = L.control.layers({
    "Street": layers.streets
}).addTo(map);

// Ajout des options d'édition
const drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

// Initialisation des variables pour stocker les données
let geojsonData;

// Fonction pour charger et afficher les données GeoJSON
function loadGeoJSON() {
    fetch("exu.geojson")  // Assurez-vous que le fichier GeoJSON est accessible
        .then(response => {
            if (!response.ok) {
                throw new Error('Erreur réseau lors du chargement du GeoJSON');
            }
            return response.json();
        })
        .then(data => {
            geojsonData = data; // Stocker les données GeoJSON pour utilisation ultérieure
            const geojsonLayer = L.geoJSON(data, {
                onEachFeature: function (feature, layer) {
                    layer.on('click', function() {
                        const popupContent = `
                            <div>
                                <h3>Détails de l'emplacement</h3>
                                <p><strong>Latitude :</strong> <input type="text" value="${feature.properties.Lat}" id="lat-${feature.id}" /></p>
                                <p><strong>Longitude :</strong> <input type="text" value="${feature.properties.Lon}" id="lon-${feature.id}" /></p>
                                <p><strong>Info :</strong> <input type="text" value="${feature.properties.Info}" id="info-${feature.id}" /></p>
                                <p><strong>X Coord :</strong> <input type="text" value="${feature.properties.xcoord}" id="xcoord-${feature.id}" /></p>
                                <p><strong>Y Coord :</strong> <input type="text" value="${feature.properties.ycoord}" id="ycoord-${feature.id}" /></p>
                                <button onclick="updateFeature(${feature.id})">Modifier</button>
                                <button onclick="getRoute(${feature.properties.Lat}, ${feature.properties.Lon})">Itinéraire</button>
                            </div>
                        `;

                        layer.bindPopup(popupContent).openPopup();
                    });

                    drawnItems.addLayer(layer);
                }
            });
            
            layerControls.addOverlay(geojsonLayer, "Données GeoJSON");
            geojsonLayer.addTo(map);
        })
        .catch(error => console.error('Erreur lors du chargement du GeoJSON :', error));
}

// Fonction pour mettre à jour les propriétés de la feature
function updateFeature(featureId) {
    const lat = document.getElementById(`lat-${featureId}`).value;
    const lon = document.getElementById(`lon-${featureId}`).value;
    const info = document.getElementById(`info-${featureId}`).value;
    const xcoord = document.getElementById(`xcoord-${featureId}`).value;
    const ycoord = document.getElementById(`ycoord-${featureId}`).value;

    const feature = geojsonData.features.find(f => f.id === featureId);
    if (feature) {
        feature.properties.Lat = lat;
        feature.properties.Lon = lon;
        feature.properties.Info = info;
        feature.properties.xcoord = xcoord;
        feature.properties.ycoord = ycoord;

        updateGeoJSONLayer(); // Met à jour le layer GeoJSON pour refléter les changements
    }
}

// Fonction pour mettre à jour le layer GeoJSON avec les modifications
function updateGeoJSONLayer() {
    drawnItems.clearLayers(); // Effacer les layers précédents
    L.geoJSON(geojsonData, {
        onEachFeature: function (feature, layer) {
            layer.on('click', function() {
                const popupContent = `
                    <div>
                        <h3>Détails de l'emplacement</h3>
                        <p><strong>Latitude :</strong> <input type="text" value="${feature.properties.Lat}" id="lat-${feature.id}" /></p>
                        <p><strong>Longitude :</strong> <input type="text" value="${feature.properties.Lon}" id="lon-${feature.id}" /></p>
                        <p><strong>Info :</strong> <input type="text" value="${feature.properties.Info}" id="info-${feature.id}" /></p>
                        <p><strong>X Coord :</strong> <input type="text" value="${feature.properties.xcoord}" id="xcoord-${feature.id}" /></p>
                        <p><strong>Y Coord :</strong> <input type="text" value="${feature.properties.ycoord}" id="ycoord-${feature.id}" /></p>
                        <button onclick="updateFeature(${feature.id})">Modifier</button>
                        <button onclick="getRoute(${feature.properties.Lat}, ${feature.properties.Lon})">Itinéraire</button>
                    </div>
                `;
                layer.bindPopup(popupContent).openPopup();
            });

            drawnItems.addLayer(layer); // Ajout du layer mis à jour
        }
    }).addTo(drawnItems);
}

// Fonction pour obtenir l'itinéraire entre deux points
function getRoute(startLat, startLon) {
    const endLat = 47.43679; // Remplace avec la latitude de la destination
    const endLon = 0.80195; // Remplace avec la longitude de la destination
    const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${startLon},${startLat}&end=${endLon},${endLat}`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Erreur réseau lors du chargement de l\'itinéraire');
            }
            return response.json();
        })
        .then(data => {
            if (!data.routes || data.routes.length === 0) {
                throw new Error('Aucun itinéraire trouvé');
            }
            const route = data.routes[0]; // Prend le premier itinéraire
            addRouteToMap(route); // Ajoute l'itinéraire à la carte
        })
        .catch(error => console.error('Erreur lors du chargement de l\'itinéraire :', error));
}

// Fonction pour ajouter l'itinéraire à la carte
function addRouteToMap(route) {
    const coordinates = route.geometry.coordinates;
    const latlngs = coordinates.map(coord => [coord[1], coord[0]]); // Conversion en [lat, lng]

    // Création de la polyline pour l'itinéraire
    const routeLine = L.polyline(latlngs, { color: 'blue' }).addTo(map);
    
    // Centrer la carte sur l'itinéraire
    map.fitBounds(routeLine.getBounds());
}

// Fonction pour mettre à jour la table attributaire
function fillAttributeTable() {
    const tbody = document.getElementById('attributeBody');
    tbody.innerHTML = ''; // Réinitialiser le corps de la table

    geojsonData.features.forEach((feature, index) => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td><input type="text" value="${feature.properties.Lat}" onchange="updateProperty(${index}, 'Lat', this.value)" /></td>
            <td><input type="text" value="${feature.properties.Lon}" onchange="updateProperty(${index}, 'Lon', this.value)" /></td>
            <td><input type="text" value="${feature.properties.Info}" onchange="updateProperty(${index}, 'Info', this.value)" /></td>
            <td><input type="text" value="${feature.properties.xcoord}" onchange="updateProperty(${index}, 'xcoord', this.value)" /></td>
            <td><input type="text" value="${feature.properties.ycoord}" onchange="updateProperty(${index}, 'ycoord', this.value)" /></td>
        `;
        
        tbody.appendChild(row);
    });
}

// Fonction pour mettre à jour une propriété dans le GeoJSON
function updateProperty(index, property, value) {
    geojsonData.features[index].properties[property] = value;
    updateGeoJSONLayer(); // Met à jour le layer GeoJSON pour refléter les changements
}

// Événement pour afficher ou masquer la table attributaire
document.getElementById('toggleTable').addEventListener('click', () => {
    const tableDiv = document.getElementById('attributeTable');
    tableDiv.style.display = tableDiv.style.display === 'none' ? 'block' : 'none';
    fillAttributeTable(); // Remplir la table chaque fois qu'elle est affichée
});

// Charger les données GeoJSON dès que la carte est prête
loadGeoJSON();

// Ajout d'un marker
const drawControl = new L.Control.Draw({
    edit: {
        featureGroup: drawnItems,
        remove: false // Désactiver la suppression des objets
    },
    draw: {
        polyline: false,
        polygon: false,
        rectangle: false,
        circle: false,
        marker: true, // On permet seulement d'ajouter des markers
        circlemarker: false
    }
});
map.addControl(drawControl);

// Écoute des événements de dessin
map.on(L.Draw.Event.CREATED, (event) => {
    const layer = event.layer;
    drawnItems.addLayer(layer); // Ajout du marker au groupe de couches
});
