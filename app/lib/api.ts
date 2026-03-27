import axios from 'axios';

const api = axios.create({
  baseURL: 'https://evaluacionprofesores.cuc.edu.co:4000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const checkStudentStatus = async (documento: string) => {
  try {
    const { data } = await api.post('/external/consultaEstudiante', {
      app_id: 'zGQs97!a^u',
      key_id: 'Z8p!JjEAAMq!e2z2Jj$&d7aULR#8Up',
      documento: documento
    });
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('API Error:', error.response?.data || error.message);
    } else {
      console.error('Unexpected Error:', error);
    }
    throw error;
  }
};

export default api;
