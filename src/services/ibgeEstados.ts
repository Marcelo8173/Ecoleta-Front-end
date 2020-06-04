import axios from 'axios';

const state = axios.create({
    baseURL: 'https://servicodados.ibge.gov.br/api/v1/localidades'
});

export default state;