import React, { FC } from 'react';
import { RoutesList } from '@routes/index';
import { BrowserRouter as Router } from "react-router-dom";
import { RecoilRoot } from 'recoil';
const App = () => {
    return (
        <RecoilRoot>
            <Router basename="/">
                <RoutesList />
            </Router>
        </RecoilRoot>
    )
}
export default App;