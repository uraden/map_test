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
import { getAllCoordinates, updateCoordinateById } from '../api/apiRequests';
import ZoomComponent from './ZoomComponent';


type CoordinateType = {
  id: string;
  latitude: number;
  longitude: number;
  status: boolean;
  details: string;
}


const MapComponent = () => {
  const [apiCoordinates, setApiCoordinates] = useState<[]>([]);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [currentFeature, setCurrentFeature] = useState<CoordinateType | null>(null);
  const [commentInput, setCommentInput] = useState<string>('');
  const [statusSelect, setStatusSelect] = useState<boolean>(false);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const [popupContent, setPopupContent] = useState<string>('');
  const mapObjRef = useRef<Map | null>(null);

  const updateCoordinate = async (id: string, status: boolean, details: string) => {
    try {
      await updateCoordinateById(id, status, details);
      window.location.reload();
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      const coordinates = await getAllCoordinates();
      setApiCoordinates(coordinates);
    };

    fetchData();
  }, []);

  
  useEffect(() => {
    if (!mapRef.current || apiCoordinates.length === 0) return;

    
    const features = apiCoordinates.map((coord: { latitude: number; longitude: number; status: boolean }) => {
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
     controls: [

     ]

    });
 
    mapObj.setTarget(mapRef.current);

    mapObjRef.current = mapObj;
    
    mapObj.getView().fit(vectorSource.getExtent(), { padding: [50, 50, 50, 50] });

   
    const overlay = new Overlay({
      element: popupRef.current as HTMLElement,
      positioning: 'bottom-center',
      stopEvent: true,
      offset: [0, -10],
    });
    mapObj.addOverlay(overlay);

    mapObj.on('click', (event) => {
      const feature = mapObj.forEachFeatureAtPixel(event.pixel, (feature) => feature);
      if (feature) {
        const properties = feature.get('properties');
        setCurrentFeature(properties);
        setCommentInput(properties.comment || '');
        setStatusSelect(properties.status);
        setEditMode(false);
        console.log('edit mode', editMode);

        setPopupContent(`
          <div class="ol-popup-save">
            <p class='new text'>Comment: ${properties.details}</p>
            <p>Status: <span class="pop-status">${properties.status ? 'Active' : 'Inactive'}</span></p>
            <button class="btn-change" onclick="window.editDetails()">Edit</button>
          </div>
        `);
        overlay.setPosition(event.coordinate);
      } else {
        overlay.setPosition(undefined); 
        setPopupContent('');
      }
    });

    return () => mapObj.setTarget(''); 
  }, [apiCoordinates]);

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
        <div><label>Comment: <input type="text" id="commentInput" /></label></div>
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
  
    setTimeout(() => {
      const inputField = document.getElementById('commentInput') as HTMLInputElement;
      if (inputField) {
        inputField.value = currentFeature?.details || '';
      }
  
      const statusSelectField = document.getElementById('statusSelect') as HTMLSelectElement;
      if (statusSelectField) {
        statusSelectField.value = statusSelect ? 'true' : 'false';
      }
    }, 0);
  };

  const saveDetails = async () => {
    const newComment = (document.getElementById('commentInput') as HTMLInputElement).value;
    const newStatus = (document.getElementById('statusSelect') as HTMLSelectElement).value === 'true';
  
    
    if (!currentFeature || typeof currentFeature.latitude !== 'number' || typeof currentFeature.longitude !== 'number' || !currentFeature.id) {
      console.error("Current feature is missing id, latitude, or longitude.");
      return;
    }
  
    try {
      await updateCoordinate(currentFeature.id, newStatus, newComment);
      setCommentInput(newComment);
      console.log('new status', commentInput);
      setStatusSelect(newStatus);
      setEditMode(false);
      setPopupContent(`
        <div>
          <p class='new text'>Comment: ${newComment}</p>
          <p>Status: <span class="pop-status">${newStatus ? 'Active' : 'Inactive'}</span></p>
          <button class="btn-change" onclick="window.editDetails()">Edit</button>
        </div>
      `);

    } catch (error) {
      console.error("Failed to update the coordinate", error);
    }
  };
  

  window.editDetails = editDetails;
  window.saveDetails = saveDetails;

  const handleZoomIn = () => {
    const map = mapObjRef.current;
    if (map) {
      const view = map.getView();
      const zoom = view.getZoom();
      if (zoom !== undefined) { 
        view.setZoom(zoom + 1);
      }
    }
  };

  const handleZoomOut = () => {
    const map = mapObjRef.current;
    if (map) {
      const view = map.getView();
      const zoom = view.getZoom();
      if (zoom !== undefined) {
        view.setZoom(zoom - 1);
      }
    }
  };

  return (
    <>
      <div className="map" ref={mapRef} />
      <div id="popup" ref={popupRef} className="ol-popup" dangerouslySetInnerHTML={{ __html: popupContent }} />
      <ZoomComponent 
        zoomIn={handleZoomIn} 
        zoomOut={handleZoomOut}
      />
    </>
  );
};

export default MapComponent;
