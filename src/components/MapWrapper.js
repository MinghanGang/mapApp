// react
import React, { useState, useEffect, useRef } from 'react';

// openlayers
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import XYZ from 'ol/source/XYZ'
import {transform, fromLonLat, get} from 'ol/proj'
import {toStringXY} from 'ol/coordinate';

import {Circle as CircleStyle, Fill, Icon, Stroke, Style} from 'ol/style';
import {LineString, MultiPoint, Point} from 'ol/geom';
import {getVectorContext} from 'ol/render';
import { none } from 'ol/centerconstraint';

import { Feature } from 'ol';
import Card from './DropdownMenu'
import Text from 'ol/style/Text';
import { createOrUpdate } from 'ol/tilecoord';
import { makeRegular } from 'ol/geom/Polygon';
import { fromString } from 'ol/color';

function MapWrapper(props) {

  // set intial state
  const [ map, setMap ] = useState()
  const [ featuresLayer, setFeaturesLayer ] = useState()
  const [ selectedCoord , setSelectedCoord ] = useState()
  const [ selectedPerson , setselectedPerson ] = useState()
  const [ selectedSerial , setselectedSerial ] = useState()
  const [ selectedHistory , setselectedHistory ] = useState()

  // array of team colors
  const colorArray = ['red', 'blue', 'green', 'black']

  const TEAM_COUNT = 10;
  const MAX_MEMBER_COUNT = 500;

  const styles = {
    'route': new Style({
      stroke: new Stroke({
        width: 1,
        color: [237, 0, 150, 0.0],  // the 0.0 makes it invisible
      }),
    }),
    'icon': new Style({
      image: new Icon({
        anchor: [0.5, 1],
        src: 'data/icon.png',
      }),
    }),
    'geoMarker': new Style({
      image: new CircleStyle({
        radius: 7,
        fill: new Fill({color: 'black'}),
        stroke: new Stroke({
          color: 'white',
          width: 2,
        }),
      }),
    }),
  };
  
  // color the labels on the checkbox labels according to colorArray
  var num = 1;
  var label_id = 'Team' + num;
  while(document.getElementById(label_id) !== null){
    document.getElementById(label_id).style.color = colorArray[num-1];

    num++;
    label_id = 'Team' + num;
  }

  // sample coords used
  const sampleLat = -120.420219;
  const sampleLatRef = -118.807386;
  const sampleLong = 34.646236;
  const sampleLongRef = 35.440643;

  // animation
  const pointsPerMs = 0.003;
  let route = new Array(MAX_MEMBER_COUNT).fill(undefined);
  let distance = new Array(MAX_MEMBER_COUNT).fill(0);
  let routeFeature = new Array(MAX_MEMBER_COUNT).fill(undefined);
  let position = new Array(MAX_MEMBER_COUNT).fill(0);

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
  const features_all = [];
  for (i = 0; i < 30; i++) {
    features_all.push(new Feature({
      geometry: new Point(fromLonLat([
        getRandomNumber(sampleLat,sampleLatRef), getRandomNumber(sampleLong, sampleLongRef)
        // -121.505173, 37.808917
      ])),
      type: 'marker',
      number_point: i,
      team: Math.floor(i / TEAM_COUNT) + 1,
      is_captain: (i % 10 === 0),
      serial_number: 0,
    }));
  }

  /*
  const features1 = [];
  for (i = 0; i < 10; i++) {
    features1.push(new Feature({
      geometry: new Point(fromLonLat([
        getRandomNumber(sampleLat, sampleLatRef), getRandomNumber(sampleLong, sampleLongRef)
        // -121.505173, 37.808917
      ])),
      number_point: i
    }));
  }

  const features2 = [];
  for (i = 0; i < 10; i++) {
    features2.push(new Feature({
      geometry: new Point(fromLonLat([
        getRandomNumber(sampleLat, sampleLatRef), getRandomNumber(sampleLong, sampleLongRef)
        // -121.505173, 37.808917
      ])),
      number_point: i + 10
    }));
  }

  const features3 = [];
  for (i = 0; i < 10; i++) {
    features3.push(new Feature({
      geometry: new Point(fromLonLat([
        getRandomNumber(sampleLat, sampleLatRef), getRandomNumber(sampleLong, sampleLongRef)
        // -121.505173, 37.808917
      ])),
      number_point: i + 20
    }));
  }
  */

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
    initialMap.on('click', handleMapClick)

    //---------------------------------------------------------------------------------
    // For some reason hovering breaks the movement/animation of the points on the map,
    // along with all rendering (serial number doesn't update)
    // Leaving off for now until a solution is found or hovering is essential
    //---------------------------------------------------------------------------------
    // initialMap.on('pointermove', handleMapHover)

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

  const getPersonStr = (feature) => {
    let feature_str = 'Team ' + feature.get('team') + ' member ' + feature.get('number_point');
    if(feature.get('is_captain')){
      feature_str = 'Team ' + feature.get('team') + ' Captain';
    }
    return feature_str;
  }

  // map click handler
  // not used currently
  const handleMapClick = (event) => {
    // reset box so unhovered items don't keep showing
    if(selectedPerson !== ''){
      setselectedPerson('');
      setselectedSerial('');
    }

    // get clicked coordinate using mapRef to access current React state inside OpenLayers callback
    //  https://stackoverflow.com/a/60643670
    const clickedCoord = mapRef.current.getCoordinateFromPixel(event.pixel);
    console.log('1')
    

    // transform coord to EPSG 4326 standard Lat Long
    const transormedCoord = transform(clickedCoord, 'EPSG:3857', 'EPSG:4326')

    // set React state
    setSelectedCoord( transormedCoord )
    
    // show history
    mapRef.current.forEachFeatureAtPixel(event.pixel, function (feature) {
      let feature_str = getPersonStr(feature);
      setselectedHistory('History for: ' + feature_str);

      setselectedPerson( feature_str );
      setselectedSerial( 'Serial Number: ' + feature.get('serial_number') );
    })  
  }

  const handleMapHover = (event) => {

    // reset box so unhovered items don't keep showing
    if(selectedPerson !== ''){
      setselectedPerson('');
      setselectedSerial('');
    }

    // get clicked coordinate using mapRef to access current React state inside OpenLayers callback
    //  https://stackoverflow.com/a/60643670
    const clickedCoord = mapRef.current.getCoordinateFromPixel(event.pixel);
    console.log('1')
    

    // transform coord to EPSG 4326 standard Lat Long
    const transormedCoord = transform(clickedCoord, 'EPSG:3857', 'EPSG:4326')

    // set React state
    setSelectedCoord( transormedCoord )  

    mapRef.current.forEachFeatureAtPixel(event.pixel, function (feature) {
      // console.log('Team ' + feature.get('team') + ' member ' + feature.get('number_point'));
      let feature_str = getPersonStr(feature);
      setselectedPerson( feature_str );
      setselectedSerial( 'Serial Number: ' + feature.get('serial_number') );
    })
  }

  // Function that dictates how each location point will be styled
  // Color/Text depends on team number, found in colorArray
  // Fill/Radius depends on captain status
  // - feature is the current feature being styled, 
  // - with attributes number_point, team, is_captain
  function styleFunction(feature) {

    if(styles[feature.get('type')]){
      return styles[feature.get('type')];
    }

    const number_point = feature.get('number_point');
    const team = feature.get('team');
    // console.log('Point ' + number_point + ': Team ' + team)
    var stroke = new Stroke({color: colorArray[team - 1], width: 2});
    var text = "Team " + team;
    var fill;
    var radius;
    var yText;
    if(feature.get('is_captain')){
      fill = new Fill({color: 'black'});
      radius = 8;
      yText = 15;
    } else {
      fill = new Fill({color: 'transparent'});
      radius = 4;
      yText = 10;
    }
    return new Style({
      image: new CircleStyle({
        radius: radius,
        fill: fill,
        stroke: stroke,
      }),
      // text: new Text({
      //   text: text,
      //   offsetX: 10,
      //   offsetY: yText
      // })
    })
  }

  // Gets the features that should be drawn from features_all
  // - checkedArray is an array containing the team numbers to draw
  function getFeatures(checkedArray){
    const features = [];

    for(let i = 0; i < features_all.length; i++){
      let feature_team = Math.floor(i / TEAM_COUNT) + 1
      if(checkedArray.indexOf(feature_team) !== -1){
        features.push(features_all[i]);
      }
    }

    // leave the route features if they exist
    const features_and_routes = featuresLayer.getSource().getFeatures();
    for(let i = 0; i < features_and_routes.length; i++){
      if(features_and_routes[i].get('type') === 'route'){
        features.push(features_and_routes[i]);
      }
    }
    return features;
  }

  // Update the drawn features
  // - checks which features to draw by building an array of checked teams
  // - updates the layer with a new source and style
  function update(zoom_to=-1) {
    const checkedArray = [];

    //get checkbox_count
    var i = 1;
    var check_id = 'Team' + i + 'Check';
    while(document.getElementById(check_id) !== null){
      const checked = document.getElementById(check_id).checked;
      if(checked){ checkedArray.push(i) }

      i++;
      check_id = 'Team' + i + 'Check';
    }
    console.log('Checked Teams: ' + checkedArray);
    const features = getFeatures(checkedArray);

    let debug_str = 'Prior Features: ';
    for(let feature of featuresLayer.getSource().getFeatures()){
      debug_str += feature.getGeometry().getCoordinates() + ', '
    }
    console.log(debug_str);

    debug_str = 'Current Features: ';
    for(let feature of features){
      debug_str += feature.getGeometry().getCoordinates() + ', '
    }
    console.log(debug_str);

    const source = new VectorSource({features: features});

    // zoom in on the selected team
    featuresLayer.once('change', function() {
      if(zoom_to !== -1 && checkedArray.indexOf(zoom_to) !== -1 && checkedArray.length === 1){
        var view = map.getView();
        view.animate({
          center: features_all[(zoom_to - 1)*TEAM_COUNT].getGeometry().getCoordinates(),
          zoom: 7
        });
      }
    });

    featuresLayer.setSource(source);
    featuresLayer.setStyle(styleFunction);
  }

  // Given a geojson format (data), set the features list to contain
  // the new locations inside data
  // TODO: breaks if data['coordinates'] is longer than features??
  function updateLocation(data){
    let count = 0;

    startAnimation();

    for (let coord of data['coordinates']){
      console.log('Count: ' + count);
      //get serial number
      features_all[count].set('serial_number', data['serial_number'][count]);
      console.log('Serial: ' + features_all[count].get('serial_number'));

      // create a line between former and future points
      const former_coords = features_all[count].getGeometry().getCoordinates()
      const new_coords = fromLonLat([coord[0], coord[1]])
      const coord_arr = [former_coords, new_coords];
      route[count] = new LineString(coord_arr);
      position[count] = new Point(route[count].getFirstCoordinate())
      routeFeature[count] = new Feature({
        type: 'route',
        geometry: route[count],
      });
      let start = Date.now();
      routeFeature[count].set('start', start);
      featuresLayer.getSource().addFeature(routeFeature[count]);

      // this is done when stopping the animation now
      // features_all[count].setGeometry(new Point(fromLonLat([coord[0], coord[1]])));
      
      count++;
    }
  }

  function startAnimation() {
    featuresLayer.on('postrender', moveFeature);
    // hide geoMarker and trigger map render through change event
    // geoMarker.setGeometry(null);
    console.log('starting animation...')
  }

  function checkForStopAnimation(routeArr) {
    let finished = true;
    for (let count = 0; routeArr[count] !== undefined; count++){
      if(!routeFeature[count].get('finished')){
        finished = false;
      }
    }

    return finished;
  }

  function stopAnimation() {
    distance.fill(0);
    position.fill(0);
    routeFeature.fill(undefined);

    // Keep marker at current animation position
    // geoMarker.setGeometry(position);
    featuresLayer.un('postrender', moveFeature);
  }

  function moveFeature(event) {
    const vectorContext = getVectorContext(event);

    for (let count = 0; routeFeature[count] !== undefined; count++){
      if(!routeFeature[count].get('finished')){
        const elapsedTime = event.frameState.time - routeFeature[count].get('start');

        if(elapsedTime >= 0){
          distance[count] = (pointsPerMs * elapsedTime);
          const currentCoordinate = route[count].getCoordinateAt(distance[count]);
          if(distance[count] >= 1){
            console.log('finished');
            routeFeature[count].set('finished', true);
            features_all[count].getGeometry().setCoordinates(position[count]);
          }

          features_all[count].getGeometry().setCoordinates(currentCoordinate);

          vectorContext.drawGeometry(features_all[count].getGeometry());     
        }   
      }   
    }
    //check to see if all animation is complete
    if(checkForStopAnimation(routeFeature)){
      stopAnimation();
    }
    else{
      // tell OpenLayers to continue the postrender animation
      map.render();
    }
    
  }

  // Test function that simulates the reception of data from the locations
  // sent by the tactical pack
  // - number_times controls the amount of waves of sent locations
  async function simulate (number_times=3) {
    let NUMBER_POINTS = 30;
    let run_number_times = number_times;
    var json_data = {};
    const timer = ms => new Promise(res => setTimeout(res, ms))

    var count = 0;
    var extraLat = 0;
    while (count < run_number_times){
        // reset data
        json_data = {};
        json_data['type'] = 'LineString';
        json_data['coordinates'] = [];
        json_data['serial_number'] = [];

        // populate data with random numbers
        for(let i = 0; i < NUMBER_POINTS; i++){
          // random numbers for now
          var latitude = getRandomNumber(sampleLat + extraLat, sampleLatRef);
          var longitude = getRandomNumber(sampleLong, sampleLongRef);
          var serial_number = Math.floor(getRandomNumber(10000000, 99999999));
          var coord_set = [latitude, longitude, 449.2];
          json_data['coordinates'].push(coord_set);
          json_data['serial_number'].push(serial_number);
        }

        console.log(json_data);

        //send data off to update locations
        updateLocation(json_data)
        
        //wait some amount seconds before sending new location data
        await timer(getRandomNumber(1000, 3000));
        count += 1;
        extraLat += 0.3;
    }
  }


  // render component
  return (      
    <div>

      <div>
        <Card update={update} simulate={simulate}/>
      </div>
      
      <div ref={mapElement} className="map-container"></div>
      
      <div className="clicked-coord-label">
        <p>{ (selectedPerson) }</p>
        <p>{ (selectedSerial) }</p>
        <p>{ (selectedCoord) ? toStringXY(selectedCoord, 5) : '' }</p>
      </div>
      <div className="history-label">
        <p>{ (selectedHistory) }</p>
      </div>

    </div>
  ) 

}

export default MapWrapper