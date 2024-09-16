import 'ol/ol.css';
import { useEffect, useRef, useState } from 'react';
import { Map, View } from 'ol';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { OSM, Vector as VectorSource } from 'ol/source';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import { Style, Circle, Fill, Stroke } from 'ol/style';
import { fromLonLat } from 'ol/proj';
import Overlay from 'ol/Overlay';
import "./Map.css";
import {coordinates} from "../services/mapData";

const MapComponent = () => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [setSelectedFeature] = useState<Feature | null>(null);
  const [popupContent, setPopupContent] = useState<string>('');

  useEffect(() => {
    if (!mapRef.current) return;

    const features = coordinates.map((coord) => {
      const feature = new Feature({
        geometry: new Point(fromLonLat([coord.longitude, coord.latitude])),
        properties: coord,
      });
      feature.setStyle(getPointStyle(coord.status));
      return feature;
    });

    const vectorSource = new VectorSource({ features });
    const vectorLayer = new VectorLayer({ source: vectorSource });

    const mapObj = new Map({
      view: new View({
        center: [0, 0],
        zoom: 2,
      }),
      layers: [
        new TileLayer({ source: new OSM() }),
        vectorLayer,
      ],
    });

    mapObj.setTarget(mapRef.current);

    // Fit view to show all points
    mapObj.getView().fit(vectorSource.getExtent(), { padding: [50, 50, 50, 50] });

    // Add click interaction
    mapObj.on('click', (event) => {
      const feature = mapObj.forEachFeatureAtPixel(event.pixel, (feature) => feature);
      if (feature) {
        const properties = feature.get('properties');
        setSelectedFeature(feature as Feature);
        setPopupContent(`
          <h3>Point Details</h3>
          <p>Comment: ${properties.comment}</p>
          <p>Status: ${properties.status}</p>
          <button onclick="window.changeStatus('${properties.id}')">Change Status</button>
          <button onclick="window.editComment('${properties.id}')">Edit Comment</button>
        `);
        // Show popup
        const overlay = new Overlay({
          element: document.getElementById('popup') as HTMLElement,
          positioning: 'bottom-center',
          stopEvent: false,
        });
        overlay.setPosition(event.coordinate);
        mapObj.addOverlay(overlay);
      } else {
        setSelectedFeature(null);
        setPopupContent('');
        mapObj.getOverlays().clear();
      }
    });

    return () => mapObj.setTarget('');
  }, []);

  // Function to get point style based on status
  const getPointStyle = (status: string) => {
    let color = 'blue';
    if (status === 'completed') color = 'green';
    else if (status === 'in-progress') color = 'orange';
    else if (status === 'not-started') color = 'red';

    return new Style({
      image: new Circle({
        radius: 6,
        fill: new Fill({ color }),
        stroke: new Stroke({ color: 'white', width: 2 }),
      }),
    });
  };

  // Functions to change status and edit comment
  const changeStatus = (id: string) => {
    // Implement status change logic here
    console.log('Change status for point:', id);
  };

  const editComment = (id: string) => {
    // Implement comment editing logic here
    console.log('Edit comment for point:', id);
  };

  // Expose functions to window object for popup buttons
  (window as any).changeStatus = changeStatus;
  (window as any).editComment = editComment;

  return (
    <>
      <div className="map" ref={mapRef} />
      <div id="popup" className="ol-popup">{popupContent}</div>
    </>
  );
};

export default MapComponent;