import React from 'react';
import Home from './pages/index/Home';
import Map from './pages/map/Map';
import Tour from './pages/tour/Tour';
import Media from './pages/media/Media';
import Main from "./pages/main/Main";
import Intro from "./pages/intro/Intro";
import Error404 from "./pages/error/Error404";
import Help from "./pages/help/Help";
import withTracker from './utils/withTracker';
import { Switch, Route } from "react-router-dom";

function App() {

    return (
        <main>
            <Switch>
                <Route path="/" component={withTracker(Home)} exact />
                <Route path="/map" component={withTracker(Map)} exact />
                <Route path="/tour" component={withTracker(Tour)} exact />
                <Route path="/media" component={withTracker(Media)} exact/>
                <Route path="/main" component={withTracker(Main)} exact />
                <Route path="/help" component={withTracker(Help)} exact />
                <Route path="/intro" component={withTracker(Intro)} exact />
                <Route component={Error404} />
            </Switch>
        </main>
    )
}

export default App;
