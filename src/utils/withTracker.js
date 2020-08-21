import React, { useEffect } from "react";
import ReactGA from "react-ga";

const { ga_tracking_id } =  JSON.parse(localStorage.getItem("markerData")) || { ga_tracking_id: "" };

if (ga_tracking_id && process.env.NODE_ENV === 'production') ReactGA.initialize(ga_tracking_id);

const withTracker = (WrappedComponent, options = { debug: true}) => {
  const trackPage = page => {
    ReactGA.set({
      page,
      ...options
    });
    ReactGA.pageview(page);
  };

  const HOC = props => {
    useEffect(() => trackPage(props.location.pathname), [
      props.location.pathname
    ]);

    return <WrappedComponent {...props} />;
  };

  return HOC;
};

export default withTracker;