'use server';

import axios from 'axios';
import https from 'https';

const api = axios.create({
  baseURL: 'https://evaluacionprofesores.cuc.edu.co:4000',
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  },
  httpsAgent: new https.Agent({  
    rejectUnauthorized: false
  }),
});

export async function checkStudentStatus(documento: string) {
  try {
    const { data } = await api.post('/external/consultaEstudiante', {
      app_id: 'zGQs97!a^u',
      key_id: 'Z8p!JjEAAMq!e2z2Jj$&d7aULR#8Up',
      documento: documento
    });

    if (data && data.status === false) {
      return { 
        status: false, 
        error: data.message || 'El servicio no pudo validar los datos proporcionados.' 
      };
    }

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const serverMessage = error.response?.data?.message;
      console.error('API Error:', error.response?.data || error.message);
      return { 
        status: false, 
        error: serverMessage || 'Hubo un problema al conectar con el servidor de evaluación.' 
      };
    }
    console.error('Unexpected Error:', error);
    return { status: false, error: 'Ocurrió un error inesperado al procesar la solicitud.' };
  }
}
