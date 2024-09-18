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

export const updateCoordinateById = async (id: string, status: boolean, details: string) => {
    try {
        await axios.put(`${baseUrl}/${id}`, { status, details });
    } catch (error) {
        console.error(error);
    }
}
