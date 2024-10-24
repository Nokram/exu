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

// Liste des points spécifiques
let specificPoints = [];

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

        // Mettre à jour l'infobulle
        marker.bindTooltip(point.info || '', { permanent: true, direction: 'top' });
        console.log(`Point déplacé à: ${point.lat}, ${point.lon}`);
    });

    // Rendre le marqueur déplaçable
    marker.dragging.enable();
}

// Fonction pour charger les points depuis le CSV
function loadCSV() {
    Papa.parse('exu.csv', {
        download: true,
        header: true,
        complete: function(results) {
            specificPoints = results.data.map(row => ({
                lat: parseFloat(row.lat),
                lon: parseFloat(row.lon),
                info: row.info
            }));
            specificPoints.forEach(point => addSpecificPoint(point));
        },
        error: function(err) {
            console.error("Erreur lors du chargement du CSV:", err);
        }
    });
}

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
    specificPoints.forEach(point => addSpecificPoint(point));
});

// Événement de clic pour annuler les modifications
document.getElementById('cancelInfo').addEventListener('click', () => {
    document.getElementById('infoModal').style.display = 'none';
});

// Charger les points initiaux depuis le CSV
loadCSV();
