import React, { useEffect, useContext, useState } from 'react';
import { useLocation } from "react-router-dom";
import {
    Accordion,
    AccordionItem,
    AccordionItemHeading,
    AccordionItemButton,
    AccordionItemPanel,
} from 'react-accessible-accordion';
import { CarouselProvider, Slider, Slide, ButtonBack, ButtonNext, DotGroup } from 'pure-react-carousel';
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import 'pure-react-carousel/dist/react-carousel.es.css';
import BackButton from '../../components/BackButton';
import './media.css';
import { Context } from "./../../index";


library.add(faChevronLeft, faChevronRight);

function Media(props) {
    let query = new URLSearchParams(useLocation().search);
    let name = query.get("name");
    let type = query.get("type");

    const [content, setContent] = useState([]);

    const { markerData, tourBasePath } = useContext(Context);



    useEffect(() => {
        // remove the image from loading in from the homepages
        document.body.classList.add("no-image");
        return () => { document.body.classList.remove("no-image"); }

    });

    useEffect(() => { // to set the content 
        const { media_pages } = markerData.filter(marker => marker.name === name).pop() || { media_pages: [] };
        if (JSON.stringify(media_pages) !== JSON.stringify(content)) setContent(media_pages);
    }, [content, markerData, name]);

    return (
        <main>
            <h1 className="header">Library</h1>
            <Accordion>
                {content.map(media => {
                    if (type === null || type === media.title) {
                        return (
                            <AccordionItem allowZeroExpanded={true}>
                                <div className="text">
                                    <AccordionItemHeading>
                                        <AccordionItemButton id="title">
                                            {media.title}
                                        </AccordionItemButton>
                                    </AccordionItemHeading>
                                    <AccordionItemPanel>
                                        {media.title === "Pictures" ? (
                                            <CarouselProvider
                                                naturalSlideWidth={100}
                                                naturalSlideHeight={100}
                                                infinite
                                                totalSlides={media.content_items.length}
                                            >
                                                <Slider>
                                                    {media.content_items.map((content, index) => {
                                                        return (
                                                            <PictureContent URL={content.item} description={content.item_description} index={index} tourBasePath={tourBasePath} />
                                                        )
                                                    })}
                                                </Slider>
                                                <DotGroup />
                                                <ButtonBack>
                                                    <FontAwesomeIcon
                                                        className={"back-icon"}
                                                        icon={faChevronLeft}
                                                    />
                                                </ButtonBack>
                                                <ButtonNext>
                                                    <FontAwesomeIcon
                                                        className={"next-icon"}
                                                        icon={faChevronRight}
                                                    />
                                                </ButtonNext>
                                            </CarouselProvider>) : (
                                                (media.content_items.map(content => {
                                                    return (<LinksContent URL={content.item} description={content.item_description} />)
                                                }))
                                            )}
                                    </AccordionItemPanel>
                                </div>
                            </AccordionItem>
                        );
                    }
                    return null;
                })}
            </Accordion>
            <BackButton history={props.history} />
        </main>
    )
}

function PictureContent({ URL, description, index, tourBasePath }) {
    return (
        <Slide index={index}>
            <p>{description}</p>
            <img src={tourBasePath + URL} alt={description} />
        </Slide>
    );
}


function LinksContent(props) {
    return (
        <React.Fragment>
            <a rel="noopener noreferrer" target="_blank" href={props.URL} alt={props.description}>
                {props.description}
            </a>
        </React.Fragment>
    );
}

export default Media;
