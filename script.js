// script.js

// Initialiser la carte
const map = L.map('map').setView([46.8, 2.3], 5);

// Ajouter une couche de tuiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
}).addTo(map);

// Initialiser le groupe de points spécifiques
const specificPointsLayer = L.layerGroup().addTo(map);

// Fonction pour charger le fichier CSV et ajouter les points
function loadCSV() {
    fetch('exu.csv')
        .then(response => response.text())
        .then(data => {
            const parsedData = Papa.parse(data, { header: true }).data;

            // Filtrer les données avec des lat/lon valides
            parsedData.forEach(row => {
                const lat = parseFloat(row.lat);
                const lon = parseFloat(row.lon);

                // Vérifier si lat et lon sont valides avant d'ajouter le point
                if (!isNaN(lat) && !isNaN(lon)) {
                    const point = {
                        lat: lat,
                        lon: lon,
                        info: row.info || 'Aucune info disponible'
                    };
                    addSpecificPoint(point);
                } else {
                    console.warn(`Point ignoré: lat=${row.lat}, lon=${row.lon} (invalide)`);
                }
            });
        })
        .catch(error => console.error('Erreur lors du chargement du CSV:', error));
}

// Fonction pour ajouter un point spécifique
function addSpecificPoint(point) {
    const marker = L.marker([point.lat, point.lon]).addTo(specificPointsLayer);

    // Afficher l'infobulle au survol
    marker.bindTooltip(point.info || '', { permanent: true, direction: 'top' });

    // Événement de clic pour éditer les informations
    marker.on('click', () => {
        document.getElementById('companyName').value = point.companyName || '';
        document.getElementById('address').value = point.address || '';
        document.getElementById('contact').value = point.contact || '';
        document.getElementById('phone').value = point.phone || '';
        document.getElementById('email').value = point.email || '';

        // Enregistrer le point à modifier
        currentEditingPoint = point;
        showInfoModal();
    });

    // Événement de drag pour déplacer le point
    marker.on('dragend', (e) => {
        const markerPosition = e.target.getLatLng();
        point.lat = markerPosition.lat;
        point.lon = markerPosition.lng;
    });

    // Rendre le marqueur déplaçable
    marker.dragging.enable();
}

// Charger les points à partir du fichier CSV au démarrage
loadCSV();

// Fonction pour afficher la modale
function showInfoModal() {
    document.getElementById('infoModal').style.display = 'block';
}

// Événement de clic pour sauvegarder les informations
document.getElementById('saveInfo').addEventListener('click', () => {
    currentEditingPoint.companyName = document.getElementById('companyName').value;
    currentEditingPoint.address = document.getElementById('address').value;
    currentEditingPoint.contact = document.getElementById('contact').value;
    currentEditingPoint.phone = document.getElementById('phone').value;
    currentEditingPoint.email = document.getElementById('email').value;

    // Fermer la modale
    document.getElementById('infoModal').style.display = 'none';

    // Mettre à jour l'infobulle
    specificPointsLayer.clearLayers();
    loadCSV();  // Recharger les points pour mettre à jour l'affichage
});

// Événement de clic pour annuler les modifications
document.getElementById('cancelInfo').addEventListener('click', () => {
    document.getElementById('infoModal').style.display = 'none';
});

// Ajouter une couche de contrôle
const overlayMaps = {
    "Points Spécifiques": specificPointsLayer
};

// Ajouter le contrôle des couches
L.control.layers(null, overlayMaps).addTo(map);
