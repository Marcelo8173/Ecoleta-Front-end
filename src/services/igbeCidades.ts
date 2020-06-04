import axios from 'axios';

const City = axios.create({
    baseURL:`https://servicodados.ibge.gov.br/api/v1/localidades/estados`
});

export default City;