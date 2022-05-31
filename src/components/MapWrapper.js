// react
import React, { useState, useEffect, useRef } from 'react';

// openlayers
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import XYZ from 'ol/source/XYZ'
import {transform, fromLonLat} from 'ol/proj'
import {toStringXY} from 'ol/coordinate';

import {Circle as CircleStyle, Fill, Stroke, Style} from 'ol/style';
import {MultiPoint, Point} from 'ol/geom';
import {getVectorContext} from 'ol/render';
import { none } from 'ol/centerconstraint';

import { Feature } from 'ol';
import Card from './DropdownMenu'
import Text from 'ol/style/Text';

function MapWrapper(props) {

  // set intial state
  const [ map, setMap ] = useState()
  const [ featuresLayer, setFeaturesLayer ] = useState()
  const [ selectedCoord , setSelectedCoord ] = useState()

  // coord for 3 teams
  // const [ pointsCoordT1, setPointsCoordT1 ] = useState()
  // const [ pointsCoordT2, setPointsCoordT2 ] = useState()
  // const [ pointsCoordT3, setPointsCoordT3 ] = useState()

  // pull refs
  const mapElement = useRef()
  
  // create state ref that can be accessed in OpenLayers onclick callback function
  //  https://stackoverflow.com/a/60643670
  const mapRef = useRef()
  mapRef.current = map

  // compute the features
  const getRandomNumber = function (min, ref) {
    return Math.random() * (ref - min) + min;
  }

  let i;
  const features1 = [];
  for (i = 0; i < 10; i++) {
    features1.push(new Feature({
      geometry: new Point(fromLonLat([
        getRandomNumber(-121.920219, -120.207386), getRandomNumber(35.646236, 36.440643)
        // -121.505173, 37.808917
      ]))
    }));
  }

  const features2 = [];
  for (i = 0; i < 10; i++) {
    features2.push(new Feature({
      geometry: new Point(fromLonLat([
        getRandomNumber(-121.920219, -120.207386), getRandomNumber(35.646236, 36.440643)
        // -121.505173, 37.808917
      ]))
    }));
  }

  const features3 = [];
  for (i = 0; i < 10; i++) {
    features3.push(new Feature({
      geometry: new Point(fromLonLat([
        getRandomNumber(-121.920219, -120.207386), getRandomNumber(35.646236, 36.440643)
        // -121.505173, 37.808917
      ]))
    }));
  }

  // initialize map on first render
  useEffect( () => {

    // const source = new VectorSource();
    // source.addFeatures(features);

    // create and add vector source layer
    const initalFeaturesLayer = new VectorLayer({
      source: new VectorSource({}),
      // source: source, 
      // adding the style and plot
      style: new Style({
        image: new CircleStyle({
          radius: 5,
          fill: new Fill({color: 'yellow'}),
          stroke: new Stroke({color: 'red', width: 1}),
        }),
      })
    })

    // create map
    const initialMap = new Map({
      target: mapElement.current,
      layers: [
        
        // USGS Topo
        new TileLayer({
          source: new XYZ({
            url: 'https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}',
          })
        }),

        // Google Maps Terrain
        /* new TileLayer({
          source: new XYZ({
            url: 'http://mt0.google.com/vt/lyrs=p&hl=en&x={x}&y={y}&z={z}',
          })
        }), */

        initalFeaturesLayer
        
      ],
      view: new View({
        projection: 'EPSG:3857',
        center: [0, 0],
        zoom: 2
      }),
      controls: []
    })

    // set map onclick handler
    // initialMap.on('click', handleMapClick)
    // initalFeaturesLayer.on('postrender', handleLayerClick)

    // save map and vector layer references to state
    setMap(initialMap)
    setFeaturesLayer(initalFeaturesLayer)

  },[])



  // update map if features prop changes - logic formerly put into componentDidUpdate
  /* useEffect( () => {

    if (props.features.length) { // may be null on first render

      // set features to map
      featuresLayer.setSource(
        new VectorSource({
          features: props.features // make sure features is an array
        })
      )

      // fit map to feature extent (with 100px of padding)
      map.getView().fit(featuresLayer.getSource().getExtent(), {
        padding: [100,100,100,100]
      })

    }

  },[])*/

  // map click handler
  const handleMapClick = (event) => {
    
    // get clicked coordinate using mapRef to access current React state inside OpenLayers callback
    //  https://stackoverflow.com/a/60643670
    const clickedCoord = mapRef.current.getCoordinateFromPixel(event.pixel);
    console.log('1')
    

    // transform coord to EPSG 4326 standard Lat Long
    const transormedCoord = transform(clickedCoord, 'EPSG:3857', 'EPSG:4326')

    // set React state
    setSelectedCoord( transormedCoord )
    
  }

  const selectTeam1 = () => {

    map.removeLayer(featuresLayer);
    /* const FeaturesLayer1 = new VectorLayer({
      source: new VectorSource({features: features1}),
      // adding the style and plot
      style: new Style({
        image: new CircleStyle({
          radius: 5,
          fill: new Fill({color: 'yellow'}),
          stroke: new Stroke({color: 'red', width: 1}),
          text: "3"
        }),
      })
    }) */

    const FeaturesLayer1 = new VectorLayer({
      source: new VectorSource({features: features1}),
      // adding the style and plot
      style: new Style({
        image: new CircleStyle({
          radius: 5,
          fill: new Fill({color: 'transparent'}),
          stroke: new Stroke({color: 'red', width: 1}),
        }),
        text: new Text({
          text: "Team 1",
          offsetX: 10,
          offsetY: 10
        })
      })
    })

    map.addLayer(FeaturesLayer1);
    setFeaturesLayer(FeaturesLayer1);

  }
  const selectTeam2 = () => {

    map.removeLayer(featuresLayer);
    const FeaturesLayer2 = new VectorLayer({
      source: new VectorSource({features: features2}),
      // adding the style and plot
      style: new Style({
        image: new CircleStyle({
          radius: 5,
          fill: new Fill({color: 'blue'}),
          stroke: new Stroke({color: 'red', width: 1}),
        }),
      })
    })
    map.addLayer(FeaturesLayer2);
    setFeaturesLayer(FeaturesLayer2);

  }

  const selectTeam3 = () => {
    map.removeLayer(featuresLayer);
    const FeaturesLayer3 = new VectorLayer({
      source: new VectorSource({features: features3}),
      // adding the style and plot
      style: new Style({
        image: new CircleStyle({
          radius: 5,
          fill: new Fill({color: 'green'}),
          stroke: new Stroke({color: 'red', width: 1}),
        }),
      })
    })
    map.addLayer(FeaturesLayer3);
    setFeaturesLayer(FeaturesLayer3);
  }


  // render component
  return (      
    <div>

      <div>
        <Card selectTeam1={selectTeam1} selectTeam2={selectTeam2} selectTeam3={selectTeam3}/>
      </div>
      
      <div ref={mapElement} className="map-container"></div>
      
      <div className="clicked-coord-label">
        <p>{ (selectedCoord) ? toStringXY(selectedCoord, 5) : '' }</p>
      </div>

    </div>
  ) 

}

export default MapWrapper