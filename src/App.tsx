import './App.css'
import MapComponent from './components/Map'
import {coordinates} from "./services/mapData"

function App() {

  // if (!localStorage.getItem('coordinates')) {
  //   localStorage.setItem('coordinates', JSON.stringify(coordinates));
  // }

  return (
    <>
      <MapComponent />
    </>
  )
}

export default App
