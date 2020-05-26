import React from 'react';
import { Link } from 'react-router-dom';

function Error404() {
    return (
        <React.Fragment>
            <h1>404 Not found</h1>
            <Link to="/"><p>Please considering going back to the homepage.</p></Link>
        </React.Fragment>
    );
}

export default Error404;
