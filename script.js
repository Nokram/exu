// Initialize map
const map = L.map('map').setView([51.505, -0.09], 13);  // Center the map on a default location

// Add OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Placeholder for route
let routeLayer = L.geoJSON().addTo(map);

// Function to fetch route from ORS API
async function fetchRoute(start, end) {
    const apiKey = "5b3ce3597851110001cf6248b5a9f8396fba4a58a7bee5e4ad0a05c8";
    const mode = document.getElementById("transport-mode").value; // Get selected transport mode

    const url = `https://api.openrouteservice.org/v2/directions/${mode}?api_key=${apiKey}&start=${start.lng},${start.lat}&end=${end.lng},${end.lat}&language=fr`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data && data.features && data.features.length) {
            // Clear the old route
            routeLayer.clearLayers();
            // Add new route
            routeLayer.addData(data.features[0]);
            map.fitBounds(routeLayer.getBounds());

            // Update route summary
            updateRouteSummary(data.features[0]);
        } else {
            alert("Aucun trajet trouvé.");
        }
    } catch (error) {
        console.error("Erreur lors de la récupération du trajet :", error);
        alert("Échec de la récupération du trajet.");
    }
}

// Function to update the route summary
function updateRouteSummary(routeFeature) {
    const routeSummary = document.getElementById("route-summary");
    const instructions = routeFeature.properties.segments[0].steps; // Instructions

    let summaryText = "";
    instructions.forEach(step => {
        const distance = (step.distance / 1000).toFixed(2); // Convert to km
        const instruction = step.instruction; // Get instruction
        summaryText += `${instruction} (${distance} km)<br>`;
    });

    routeSummary.innerHTML = summaryText || "Aucun trajet sélectionné.";
}

// Initialize markers for start and end points
let startMarker, endMarker;

// Load GeoJSON data and add points to the map
async function loadGeoJSON() {
    const response = await fetch('exu.geojson'); // Chemin vers le fichier GeoJSON
    const geojsonData = await response.json();
    
    const geoJsonLayer = L.geoJSON(geojsonData, {
        onEachFeature: (feature, layer) => {
            layer.on('click', () => {
                if (endMarker) {
                    // Si un marqueur d'arrivée existe, recalculer le trajet
                    fetchRoute(startMarker.getLatLng(), feature.geometry.coordinates);
                } else {
                    // Sinon, définir le marqueur d'arrivée
                    endMarker = L.marker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], { draggable: true }).addTo(map)
                        .bindPopup(feature.properties.name)
                        .openPopup();
                    endMarker.on('dragend', () => {
                        fetchRoute(startMarker.getLatLng(), endMarker.getLatLng());
                    });

                    // Fetch route once both markers are set
                    fetchRoute(startMarker.getLatLng(), endMarker.getLatLng());
                }
            });
        }
    }).addTo(map);
}

// Call the function to load GeoJSON data
loadGeoJSON();

// Add click event to set start and end points on map click
map.on('click', (e) => {
    if (!startMarker) {
        // Set the start point
        startMarker = L.marker(e.latlng, { draggable: true }).addTo(map)
            .bindPopup("Point de départ")
            .openPopup();
        startMarker.on('dragend', () => {
            if (endMarker) {
                fetchRoute(startMarker.getLatLng(), endMarker.getLatLng());
            }
        });
    } else if (!endMarker) {
        // Set the end point (enabling user to set a point manually)
        endMarker = L.marker(e.latlng, { draggable: true }).addTo(map)
            .bindPopup("Point d'arrivée")
            .openPopup();
        endMarker.on('dragend', () => {
            fetchRoute(startMarker.getLatLng(), endMarker.getLatLng());
        });

        // Fetch route once both markers are set
        fetchRoute(startMarker.getLatLng(), endMarker.getLatLng());
    }
});

// Allow user to reset start and end points
function resetRoute() {
    if (startMarker) {
        map.removeLayer(startMarker);
        startMarker = null;
    }
    if (endMarker) {
        map.removeLayer(endMarker);
        endMarker = null;
    }
    routeLayer.clearLayers();
    document.getElementById("route-summary").innerHTML = "Aucun trajet sélectionné.";
}

// Add event listener for reset button
document.getElementById("resetButton").addEventListener("click", resetRoute);

// Add event listener for transport mode change
document.getElementById("transport-mode").addEventListener("change", () => {
    if (startMarker && endMarker) {
        fetchRoute(startMarker.getLatLng(), endMarker.getLatLng()); // Recalculate the route
    }
});
