import { FaPlus, FaMinus } from "react-icons/fa";

const ZoomComponent = ({ zoomIn, zoomOut }: { zoomIn: () => void, zoomOut: () => void }) => {
    return (
      <div className="ol-zoom ol-control flex flex-col items-center space-y-2 p-[5px] bg-gray-100 rounded-lg shadow-lg">
       
        <button 
          onClick={zoomIn} 
          title="Zoom in"
          className="ol-zoom-in text-[#F3F4F6] rounded-full p-3 transition-all focus:outline-none border-none"
        >
          <FaPlus className="h-6 w-6 bg-[#F3F4F6] focus:outline-none border-none" />
        </button>
  
       
        <button 
          onClick={zoomOut} 
          title="Zoom out"
          className="ol-zoom-out text-white rounded-full p-3 transition-all focus:outline-none"
        >
          <FaMinus className="h-6 w-6 bg-[#F3F4F6] focus:outline-none border-none" />
        </button>
      </div>
    );
  };
  
  export default ZoomComponent;