// routing.js

// Clé de l'API ORS
const apiKey = '5b3ce3597851110001cf6248b5a9f8396fba4a58a7bee5e4ad0a05c8';

// Fonction pour obtenir l'itinéraire entre deux points
function getRoute(startCoords, endCoords) {
    const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${startCoords[1]},${startCoords[0]}&end=${endCoords[1]},${endCoords[0]}`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Erreur réseau lors du chargement de l\'itinéraire');
            }
            return response.json();
        })
        .then(data => {
            const route = data.routes[0]; // Prend le premier itinéraire
            if (route) {
                addRouteToMap(route); // Ajoute l'itinéraire à la carte
            }
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

// Exemple d'utilisation
const startCoords = [46.6034, 1.8883]; // Coordonnées de départ
const endCoords = [47.43679, 0.80195]; // Coordonnées d'arrivée

// Obtenir l'itinéraire
getRoute(startCoords, endCoords);
