import React, {useEffect, useState, ChangeEvent, FormEvent} from 'react';
import './styles.css';
import { Link, useHistory } from 'react-router-dom';
import logo from '../../assets/logo.svg'
import { FiArrowLeft } from 'react-icons/fi';
import { Map, TileLayer, Marker} from 'react-leaflet'
import { LeafletMouseEvent} from 'leaflet';
import api from '../../services/api';
import UFsApi from '../../services/ibgeEstados';
import CityApi from '../../services/igbeCidades';

//estado para um array ou objeto é preciso criar um interface
interface ItemsData{
    id: number;
    title: string;
    image_url: string;
}

interface UfsData{
    sigla: string;
}

interface CityData{
    nome: string;
}

const CreatePoints:React.FC = () =>{

    // estados
    const [items, setItems] = useState<ItemsData[]>([]);
    const [ufs, setUfs] = useState<string[]>([]);
    const [cities, setCity] = useState<string[]>([]);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        Whatsapp: ''
    })

    const [selectedUf, setSelectedUf] = useState('0');
    const [selectedCity, setSelectedCity] = useState('0');
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0,0]);
    const [initialPosition, setInitialPosition] = useState<[number, number]>([0,0]);
    const histoy = useHistory();

        //pegando os dados da localização atual do computador
        useEffect(()=>{
            navigator.geolocation.getCurrentPosition(position =>{
                const { latitude, longitude } = position.coords;
                setInitialPosition([latitude,longitude]);
            });
        })

        //pegando os dados dos items salvos no banco
        useEffect(()=>{
            api.get('/items').then(response =>{
                setItems(response.data);
            });
        },[]);
        
        //pegando os dados dos estados
        useEffect(()=>{
            UFsApi.get<UfsData[]>('/estados').then(response =>{
                const ufInitials = response.data.map(uf => uf.sigla);
                setUfs(ufInitials);
            });
        });

        //pegando os dados dos municipios
        useEffect(() =>{
            if(selectedUf === '0'){
                return;
            };

            CityApi.get<CityData[]>(`/${selectedUf}/municipios`).then(response =>{
                const cityNames = response.data.map(city => city.nome);
                setCity(cityNames);
            })
        },[selectedUf]); //só executa quando a selectedUF

        function handleSelectedUf(event: ChangeEvent<HTMLSelectElement>){
            const uf = event.target.value;
            setSelectedUf(uf);
        };

        function handleSelectedCity(event: ChangeEvent<HTMLSelectElement>){
            const city = event.target.value;
            setSelectedCity(city);
            console.log(selectedCity);
        };

        function handleMapCity(event: LeafletMouseEvent){
            setSelectedPosition([
                event.latlng.lat,
                event.latlng.lng
            ]);
        }

        function handleInputChange(event:ChangeEvent<HTMLInputElement> ){
            const { name, value} = event.target;
            
            setFormData({...formData, [name]:value});
        }

        function handleSelectedItem(id:number){
            const alreadySelected = selectedItems.findIndex(item => item ===id);
            
            if(alreadySelected >=0){
                const filterItem = selectedItems.filter(item => item !==id);
                setSelectedItems(filterItem);
            }else{
                setSelectedItems([...selectedItems, id]);
            }

        }

        async function handleSubmit(event: FormEvent){
            event.preventDefault();
            const { Whatsapp, email, name} = formData;
            const uf = selectedUf;
            const city = selectedCity;
            const [latitude, longitude] = selectedPosition;
            const items = selectedItems;

            const data = {
                Whatsapp, 
                email, 
                name,
                uf,
                city,
                latitude,
                longitude,
                items
            };

            await api.post('points', data); 
            alert('Ponto de coleta criado');
            histoy.push('/')
        }
    return(
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Ecoleta"/>
                <Link to='/'>
                    <FiArrowLeft/>
                    Voltar para home
                </Link>
            </header>

            <form onSubmit={handleSubmit}>
                <h1>Cadastro do <br/> ponto de coleta</h1>

                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>
                    
                    <div className="field">
                        <label htmlFor="name">Nome da entiadade</label>
                        <input type="text"
                            name="name"
                            id="name"
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">E-mail</label>
                            <input type="email"
                                name="email"
                                id="email"
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="field">
                            <label htmlFor="name">Whatsapp</label>
                            <input type="text"
                                name="Whatsapp"
                                id="Whatsapp"
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                </fieldset>


        {/* mapa */}
                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione um endereço no mapa</span>
                    </legend>
                    
                    <Map center={initialPosition} zoom={15} onClick={handleMapCity} >
                        <TileLayer
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={selectedPosition} />
                    </Map>

                    <div className="field-goup">
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <select 
                            name="uf" 
                            id="uf" 
                            value={selectedUf} 
                            onChange={handleSelectedUf}>
                                <option value="0">Selecione uma UF</option>
                                {ufs.map(uf =>(
                                    <option key={uf} value={uf} >{uf}</option>
                                ))}
                            </select>
                        </div>

                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select 
                            name="city" 
                            id="city"
                            value={selectedCity}
                            onChange={handleSelectedCity}>
                                <option value="0">Selecione uma cidade</option>
                                {cities.map(city =>(
                                    <option key={city} value={city}> {city}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </fieldset>

        {/* itens de coleta */}
                <fieldset>
                    <legend>
                        <h2>Ítems de coleta</h2>
                        <span>Selecione um ou mais itens abaixo</span>
                    </legend>
                
                    <ul className="items-grid">
                        {items.map(item => (
                            <li 
                            onClick={()=>handleSelectedItem(item.id)} 
                            key={item.id}
                            className={selectedItems.includes(item.id) ? 'selected': ''}
                            >
                                <img src={item.image_url} alt={item.title}/>
                                <span>{item.title}</span>
                            </li>
                        ))}
                       
                    </ul>
                </fieldset>
                <button type="submit">Cadastrar ponto de coleta</button>
            </form>
        </div>
    );
};

export default CreatePoints;