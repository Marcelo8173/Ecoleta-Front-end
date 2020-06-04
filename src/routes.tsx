import React from 'react';
import { Route, BrowserRouter } from 'react-router-dom';

import Home from './pages/home';
import CreatePoints from './pages/CreatePoint';

const Routes: React.FC = () =>{
    return(
        <BrowserRouter>
            <Route exact path='/' component={Home} />
            <Route exact path='/cadastrar' component={CreatePoints}/>
        </BrowserRouter>
    )
};

export default Routes;