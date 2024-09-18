const baseUrl = import.meta.env.VITE_BASEURL;
import axios from 'axios';


export const getAllCoordinates = async () => {
  try {
    const response = await axios.get(baseUrl);
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

