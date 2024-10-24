// attributeTable.js

let geojsonData; // Stocker les données GeoJSON

// Fonction pour remplir la table attributaire
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

// Fonction pour mettre à jour le layer GeoJSON avec les modifications
function updateGeoJSONLayer() {
    drawnItems.clearLayers(); // Effacer les layers précédents
    L.geoJSON(geojsonData, {
        onEachFeature: function (feature, layer) {
            layer.on('click', function() {
                const popupContent = `
                    <div>
                        <h3>Détails de l'emplacement</h3>
                        <p><strong>Latitude :</strong> ${feature.properties.Lat}</p>
                        <p><strong>Longitude :</strong> ${feature.properties.Lon}</p>
                        <p><strong>Info :</strong> ${feature.properties.Info}</p>
                        <p><strong>X Coord :</strong> ${feature.properties.xcoord}</p>
                        <p><strong>Y Coord :</strong> ${feature.properties.ycoord}</p>
                    </div>
                `;
                layer.bindPopup(popupContent).openPopup();
            });

            // Édition du marker
            layer.on('edit', function() {
                updateGeoJSONLayer();
            });

            drawnItems.addLayer(layer); // Ajout du layer mis à jour
        }
    }).addTo(drawnItems);
}

// Événement pour afficher ou masquer la table attributaire
document.getElementById('toggleTable').addEventListener('click', () => {
    const tableDiv = document.getElementById('attributeTable');
    tableDiv.style.display = tableDiv.style.display === 'none' ? 'block' : 'none';
    fillAttributeTable(); // Remplir la table chaque fois qu'elle est affichée
});
