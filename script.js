// Créer la carte
const map = L.map('map').setView([48.8566, 2.3522], 13); // Centré sur Paris par défaut

// Ajouter une couche de fond
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
}).addTo(map);

// Initialiser une couche pour les points spécifiques
const specificPointsLayer = L.layerGroup().addTo(map);

// Tableau pour stocker les points spécifiques
let specificPoints = [
    { lat: 48.8566, lon: 2.3522, companyName: '', address: '', contact: '', phone: '', email: '' }
];

// Fonction pour ajouter un point spécifique à la carte
function addSpecificPoint(point) {
    const specificMarker = L.marker([point.lat, point.lon], {
        draggable: true
    }).addTo(specificPointsLayer);

    // Afficher l'infobulle au survol
    specificMarker.bindPopup(`
        <strong>${point.companyName || "Cliquez pour éditer"}</strong><br>
        Adresse: ${point.address || ""}<br>
        Contact: ${point.contact || ""}<br>
        Téléphone: ${point.phone || ""}<br>
        Mail: ${point.email || ""}
    `);

    specificMarker.on('mouseover', function() {
        specificMarker.openPopup();
    });

    specificMarker.on('mouseout', function() {
        specificMarker.closePopup();
    });

    specificMarker.on('dragend', function() {
        const newLatLng = specificMarker.getLatLng();
        point.lat = newLatLng.lat;
        point.lon = newLatLng.lng;

        // Sauvegarder les points spécifiques dans localStorage
        localStorage.setItem('specificPoints', JSON.stringify(specificPoints));
    });

    specificMarker.on('click', function() {
        const modal = document.getElementById('infoModal');
        modal.style.display = 'block';
        
        // Remplir le formulaire avec les informations du point
        document.getElementById('companyName').value = point.companyName || '';
        document.getElementById('address').value = point.address || '';
        document.getElementById('contact').value = point.contact || '';
        document.getElementById('phone').value = point.phone || '';
        document.getElementById('email').value = point.email || '';

        // Gérer le clic sur le bouton d'enregistrement
        document.getElementById('saveInfo').onclick = function() {
            point.companyName = document.getElementById('companyName').value;
            point.address = document.getElementById('address').value;
            point.contact = document.getElementById('contact').value;
            point.phone = document.getElementById('phone').value;
            point.email = document.getElementById('email').value;

            specificMarker.bindPopup(`
                <strong>${point.companyName}</strong><br>
                Adresse: ${point.address}<br>
                Contact: ${point.contact}<br>
                Téléphone: ${point.phone}<br>
                Mail: ${point.email}
            `).openPopup();
            
            localStorage.setItem('specificPoints', JSON.stringify(specificPoints)); // Sauvegarder les modifications
            modal.style.display = 'none';
        };

        // Gérer le clic sur le bouton d'annulation
        document.getElementById('cancelInfo').onclick = function() {
            modal.style.display = 'none';
        };
    });

    specificPointsLayer.addLayer(specificMarker);
}

// Ajouter les points spécifiques à la carte
specificPoints.forEach(addSpecificPoint);

// Gérer le chargement des points depuis localStorage
if (localStorage.getItem('specificPoints')) {
    specificPoints = JSON.parse(localStorage.getItem('specificPoints'));
    specificPoints.forEach(addSpecificPoint);
}

// Fonction pour traiter le fichier CSV et mettre à jour les points
function handleCSVUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const csvData = e.target.result;
            const parsedData = Papa.parse(csvData, { header: true });
            updateSpecificPoints(parsedData.data);
        };
        reader.readAsText(file);
    }
}

// Fonction pour mettre à jour les points spécifiques sur la carte
function updateSpecificPoints(newPoints) {
    specificPointsLayer.clearLayers(); // Effacer les points existants
    specificPoints = []; // Réinitialiser le tableau des points

    // Ajouter les nouveaux points
    newPoints.forEach(data => {
        const point = {
            lat: parseFloat(data.lat),
            lon: parseFloat(data.lon),
            companyName: data["Nom de la Société"] || '',
            address: data.Adresse || '',
            contact: data.Contact || '',
            phone: data.Téléphone || '',
            email: data.Mail || ''
        };
        specificPoints.push(point);
        addSpecificPoint(point);
    });

    // Sauvegarder les nouveaux points dans localStorage
    localStorage.setItem('specificPoints', JSON.stringify(specificPoints));
}

// Ajouter l'événement pour le chargement du CSV
document.getElementById('csvFileInput').addEventListener('change', handleCSVUpload);

// Fonction pour télécharger les points au format CSV
function downloadCSV() {
    const csvContent = "data:text/csv;charset=utf-8," 
        + specificPoints.map(e => `${e.lat},${e.lon},${e.companyName},${e.address},${e.contact},${e.phone},${e.email}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "points.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Ajouter l'événement pour le téléchargement du CSV
document.getElementById('downloadCSV').addEventListener('click', downloadCSV);
