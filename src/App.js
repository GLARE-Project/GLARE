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
                <Route path={encodeURI("/")} component={withTracker(Home)} exact />
                <Route path={encodeURI("/map")} component={withTracker(Map)} exact />
                <Route path={encodeURI("/tour")} component={withTracker(Tour)} exact />
                <Route path={encodeURI("/media")} component={withTracker(Media)} exact/>
                <Route path={encodeURI("/main")} component={withTracker(Main)} exact />
                <Route path={encodeURI("/help")} component={withTracker(Help)} exact />
                <Route path={encodeURI("/intro")} component={withTracker(Intro)} exact />
                <Route component={Error404} />
            </Switch>
        </main>
    )
}

export default App;
