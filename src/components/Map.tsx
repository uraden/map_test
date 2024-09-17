import 'ol/ol.css';
import { useEffect, useRef, useState } from 'react';
import { Map, View } from 'ol';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { OSM, Vector as VectorSource } from 'ol/source';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import { Style, Icon } from 'ol/style';
import { fromLonLat } from 'ol/proj';
import Overlay from 'ol/Overlay';
import "./Map.css";
import { coordinates } from "../services/mapData";

const MapComponent = () => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const [popupContent, setPopupContent] = useState<string>('');


  const [editMode, setEditMode] = useState<boolean>(false);
  const [currentFeature, setCurrentFeature] = useState<any>(null);
  const [commentInput, setCommentInput] = useState<string>('');
  const [statusSelect, setStatusSelect] = useState<boolean>(false);

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

    // Create Overlay for popup
    const overlay = new Overlay({
      element: popupRef.current as HTMLElement,
      positioning: 'bottom-center',
      stopEvent: true,
      offset: [0, -10], // Offset to ensure popup doesn't cover the point
    });
    mapObj.addOverlay(overlay);

    // Add click event to display popup
    mapObj.on('click', (event) => {
      const feature = mapObj.forEachFeatureAtPixel(event.pixel, (feature) => feature);
      if (feature) {
        const properties = feature.get('properties');
        setCurrentFeature(properties);
        setCommentInput(properties.comment || '');
        setStatusSelect(properties.status);
        setEditMode(false);

        setPopupContent(`
          <div class="ol-popup-save">
            <p class='new text'>Comment: ${properties.details}</p>
            <p>Status: <span class="pop-status">${properties.status ? 'Active' : 'Inactive'}</span></p>
            <button class="btn-change" onclick="window.editDetails()">Edit</button>
          </div>
        `);
        overlay.setPosition(event.coordinate);
      } else {
        overlay.setPosition(undefined); // Hide popup if no feature is clicked
        setPopupContent('');
      }
    });

    return () => mapObj.setTarget('');
  }, []);


  const getPointStyle = (status: boolean) => {
    const color = status ? 'green' : 'red';
    const pinIconSVG = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="24px" height="24px">
        <path d="M12 2C8.1 2 5 5.1 5 9c0 5.3 6 13 7 13s7-7.7 7-13c0-3.9-3.1-7-7-7zm0 9.5c-1.4 0-2.5-1.1-2.5-2.5S10.6 6.5 12 6.5s2.5 1.1 2.5 2.5S13.4 11.5 12 11.5z"/>
      </svg>
    `;

    return new Style({
      image: new Icon({
        anchor: [0.5, 1],
        anchorXUnits: 'fraction',
        anchorYUnits: 'fraction',
        src: `data:image/svg+xml;base64,${btoa(pinIconSVG)}`,
        scale: 1,
      }),
    });
  };



  const editDetails = () => {
    setEditMode(true);
    setPopupContent(`
      <div>
        <div><label>Comment: <input type="text" id="commentInput" value="${commentInput}" /></label></div>
       <div>
        <label>Status: 
          <select id="statusSelect">
            <option value="true" ${statusSelect ? 'selected' : ''}>Active</option>
            <option value="false" ${!statusSelect ? 'selected' : ''}>Inactive</option>
          </select>
        </label>
        </div>
        <button class="btn-save" onclick="window.saveDetails()">Save</button>
      </div>
    `);
  };


  const saveDetails = () => {
    const newComment = (document.getElementById('commentInput') as HTMLInputElement).value;
    const newStatus = (document.getElementById('statusSelect') as HTMLSelectElement).value === 'true';
    
    setCommentInput(newComment);
    setStatusSelect(newStatus);
    
    // Simulate saving to backend or updating feature details
    console.log('Saving details for:', currentFeature.id);
    console.log('New Comment:', newComment);
    console.log('New Status:', newStatus);

    setEditMode(false);
    setPopupContent(`
      <div>
        <p class='new text'>Comment: ${newComment}</p>
        <p>Status: <span class="pop-status">${newStatus ? 'Active' : 'Inactive'}</span></p>
        <button class="btn-change" onclick="window.editDetails()">Edit</button>
      </div>
    `);
  };

  window.editDetails = editDetails;
  window.saveDetails = saveDetails;


  return (
    <>
      <div className="map" ref={mapRef} />
      <div id="popup" ref={popupRef} className="ol-popup" dangerouslySetInnerHTML={{ __html: popupContent }} />
    </>
  );
};

export default MapComponent;
