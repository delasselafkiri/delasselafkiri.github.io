/* Première carte : Désertification*/
var map = L.map('map_1').setView([29.976974, 5], 4);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibGhhbXphOTgiLCJhIjoiY2todXRzaHQ3MWdlaDJwa3p0MnFkMHphdyJ9.G2u8P1dZqrJOtq86M_E1Cg', {
    id: 'mapbox/light-v9',
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    tileSize: 512,
    zoomOffset: -1
}).addTo(map);


map.addControl(new L.Control.Fullscreen());

// variable vide à laquelle on va ajouter les données geojson par la suite
var geojson;

// Retourner une couleur selon chaque valeur du paramètre d'entrée
function getColor(s) {
    return s === 4 ? '#fef0d9' :
        s === 3 ? '#fdcc8a' :
            s === 2 ? '#fc8d59' :
                s === 1 ? '#e34a33' :
                    '#b30000';
}

// Style des différentes régions selon la valeur de l'indice
// qui correspond dans la table d'attributs
function style(feature) {
    return {
        fillColor: getColor(feature.properties.gridcode),
        weight: 1,
        opacity: 1,
        color: '#7a7a7a',
        dashArray: '3',
        fillOpacity: 0.7
    };
}

// Style du contour des régions du Maroc et des pays du NA
function style3(feature) {
    return {
        fillColor: 'white',
        weight: 2,
        opacity: 1,
        color: "#242424",
        fillOpacity: 0
    };
}

// Action à prendre lorsqu'on met le curseur sur une région
function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7

    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }

    info.update(layer.feature.properties);
}

// Action à prendre lorsqu'on retire le curseur
function resetHighlight(e) {
    geojson.resetStyle(e.target);
    info.update();

}

// Régler le zoom approprié automatiquement afin de voir toutes
// entités de la carte
function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}

// Actions à prendre applicable sur toute entité
// contient les fonctions qu'on vient de définir
function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}

// Afficher les informations sur les régions  
var info = L.control();

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // création d'un div avec une classe "info"
    this.update();
    return this._div;
};

// Méthode qui sert à mettre à jour les informations contenus dans le div qu'on vient de créer
// avec les valeurs correspondantes depuis les propriétés des entités
info.update = function (props) {
    this._div.innerHTML = "<h5>Carte de la sensibilité à la Désertification dans la région de l’Afrique du Nord</h5>" + (props ?
        'Pays : <b>' + props.NAME_0 + '</b><br />Nom de la région : <b>' + props.NAME_1 + '</b><br/>Classe de sensibilité à la désertification : <b>' + props.gridcode + ' '
        : '<b>Basée sur la Dégradation des Sols avec Indice dominant dans les régions</b> <br>' + 'Mettez le curseur sur une région');
};

info.addTo(map);

// Légende
var legend = L.control({ position: 'bottomright' });

legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 1, 2, 3, 4],
        labels = ['Très fort', 'Fort', 'Moyen', 'Faible', 'Très faible'];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i]) + '"></i> ' + ' ' + labels[i] + '<br>';
    }

    return div;
};

legend.addTo(map);

L.control.betterscale().addTo(map);

// ajouter le contour du NA à la carte
var contour_na = L.geoJSON(na, {
    style: style3
},

).addTo(map);

// ajouter les données geojson 
geojson = L.geoJson(na_desertification, {
    style: style,
    onEachFeature: onEachFeature,
}).addTo(map);

/* Fin de la première carte */



/* Deuxième carte : Perte du couvert forestier
*/

var map_2 = L.map('map_2').setView([29.976974, 5], 4);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibGhhbXphOTgiLCJhIjoiY2todXRzaHQ3MWdlaDJwa3p0MnFkMHphdyJ9.G2u8P1dZqrJOtq86M_E1Cg', {
    id: 'mapbox/outdoors-v11',
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    tileSize: 512,
    zoomOffset: -1
}).addTo(map_2);

map_2.addControl(new L.Control.Fullscreen());

// déclaration de la variable à laquelle on va ajouter les données geojson
var deforestation;

// Style des markers à utiliser pour tous les points de la carte
// On représente les points avec des cercles
var markerStyleDefault = {
    fillColor: "#ff7800",
    fillOpacity: 0.6,
    color: "#242424",
    weight: 0.5,
    opacity: 1,
    fillOpacity: 0.5
};

// fonction qui retourne la valeur du rayon du cercle en se basant 
// sur les valeurs log10 dans la table d'attributs
// On multiplie ces valeurs par 8 afin de pouvoir bien distinguer les cercles sur la carte
function markerStyle(feature) {
    return { radius: feature.properties.log10 * 8 }
}

// Action à prendre lorsqu'on met le curseur sur un symbole
function highlightFeature_2(e) {
    var layer_2 = e.target;

    layer_2.setStyle({
        fillColor: "#fff",
        fillOpacity: 0.6,
        color: "#242424",
        weight: 0.5,
        opacity: 1,
        fillOpacity: 0.5
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer_2.bringToFront();
    }

    info_2.update(layer_2.feature.properties);
}

// Action à prendre lorsqu'on retire le curseur
function resetHighlight_2(e) {
    deforestation.resetStyle(e.target);
    info_2.update();
}

// action à prendre pour chaque entité
// appliquer la fonction highlightFeature_2 lorsqu'on met le curseur
// appliquer la fonction resetHighlight_2 lorsqu'on retire le curseur
function onEachFeature2(feature, layer_2) {
    layer_2.on({
        mouseover: highlightFeature_2,
        mouseout: resetHighlight_2
    });
}


// Afficher les informations concernant chaque entité     
var info_2 = L.control();

info_2.onAdd = function (map_2) {
    this._div = L.DomUtil.create('div', 'info_2'); // create a div with a class "info"
    this.update();
    return this._div;
};

// method that we will use to update the control based on feature properties passed
info_2.update = function (props) {
    this._div.innerHTML = "<h5>Carte de perte du couvert forestier en Afrique du Nord: </h5>" + (props ?
        'Région : <b>' + props.NAME_1 + '</b><br />Perte du couvert forestier : <b>' + props.perte + '</b>' + ' ha'
        : 'Mettez le curseur sur un symbole <br> Zoomer pour voir les informations des régions du Maroc');
};

info_2.addTo(map_2);



// Ajouter les données geojson à la carte

// Utilisation du plugin markercluster qui rassemble les symboles qui se chevauchent
// suivant chaque niveau de zoom
var markers = L.markerClusterGroup();

deforestation = L.geoJSON(defor, {
    style: markerStyle,
    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, markerStyleDefault);
    },
    onEachFeature: onEachFeature2,
}
);
markers.addLayer(deforestation);
map_2.addLayer(markers);

// Légende
// On utilise le plugin leaflet.legend
// Chaque élément de la légende est défini par un label, et un ensemble
// de propriétés concernant son style d'affichage 
var legend_2 = L.control.Legend({
    position: "bottomright",
    collapsed: false,
    symbolWidth: 24,
    opacity: 0.7,
    weight: 0.5,
    column: 1,
    legends: [{
        label: "3 ha",
        type: "circle",
        radius: 3.817,
        color: "#242424",
        fillColor: "#ff7800",
        fillOpacity: 0.5,
        weight: 0.5,
        inactive: false,
    },
    {
        label: "70000 ha",
        type: "circle",
        radius: 38,
        color: "#242424",
        fillColor: "#ff7800",
        fillOpacity: 0.5,
        weight: 0.5,
        inactive: false,
    }]
}).addTo(map_2);

/* Fin de la deuxième carte */


/* Début de la troisième carte : Incendies de foret */

var map_3 = L.map('map_3').setView([29.976974, 5], 4);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibGhhbXphOTgiLCJhIjoiY2todXRzaHQ3MWdlaDJwa3p0MnFkMHphdyJ9.G2u8P1dZqrJOtq86M_E1Cg', {
    id: 'mapbox/dark-v10',
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    tileSize: 512,
    zoomOffset: -1
}).addTo(map_3);

map_3.addControl(new L.Control.Fullscreen());

// Style des markers représentant les points
var markerStyleIncendies = {
    radius: 2,
    fillColor: "#ff7800",
    fillOpacity: 0.6,
    color: "#242424",
    weight: 0.5,
    opacity: 1,
    fillOpacity: 0.5
};

//Titre de la carte
var info_3 = L.control();

info_3.onAdd = function (map_3) {
    this._div = L.DomUtil.create('div', 'info_2'); // create a div with a class "info"
    this.update();
    return this._div;
};

info_3.update = function () {
    this._div.innerHTML = "<h5>Carte d'alertes sur les incendies de forêt en Afrique du Nord: </h5> <br><p>Glissez le slider pour changer la date de visualisation</p>";
};

info_3.addTo(map_3);

// Assigner les données geojson à la variable incendies_na
// Notez qu'on ne les ajoute pas directement à la carte
var incendies_na = L.geoJSON(inc_na_7j, {
    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, markerStyleIncendies);
    },
}
);

// Utilisation du plugin leaflet.slider qui permet l'affichage des markers selon l'attribut 
// qui correspond à une date donnée (ou bien dans ce cas un intervalle; range: true)

// On spécifie la position du slider, le nom de la variable à représenter et la propriété qui
//contient les dates, ainsi qu'un ensemble de paramètres du slider
var sliderControl = L.control.sliderControl({ position: "topright", layer: incendies_na, timeStrLength: 10, timeAttribute: "ACQ_DATE", alwaysShowDate: false, range: true });

//Ajouter le slider à la carte
map_3.addControl(sliderControl);

//Méthode pour initier le slider
sliderControl.startSlider();

