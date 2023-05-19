import { useEffect, useState } from "react";
import { Box } from '@mui/material';
import "./Cards.css";

//spring configuration
const dampen = 0.020; //dampen the rotation (higher number = less rotation)
const showcaseScale = 1.6; //scale of the showcased card

function Card({cardURL, activeCard, setActiveCard}) { //individual card element

    const root = document.documentElement; //get CSS root element

    //getting card from API call
    const [thisCard, setThisCard] = useState(null);
    useEffect(() => {
        getCardFromAPI(cardURL)
        .then((result) => { //result is in this format: https://zoombies.world/services/card_types/mb/37.json (parsed JSON)
            setThisCard({ //set card object
                name: result.name,
                imageURL: result.image,
                description: result.description,
                
                id: result.attributes[0].value,
                rarity: result.attributes[4].value,
            });
        })
        .catch((error) => {
            console.log(error);
        })
    }, [cardURL]);


    //animation and showcase precondition
    useEffect(() => {
        if (thisCard) {
            if (activeCard && (activeCard !== thisCard)) { //if this card is not the showcased card, prevent interaction
                document.getElementById(thisCard.id).style.pointerEvents = "none";
            }
            else { //if this card is the showcased card OR there is no showcased card, allow interaction
                const timeout = setTimeout(() => { //wait out the transition
                    document.getElementById(thisCard.id).style.pointerEvents = "auto";
                }, 500);
                return () => clearTimeout(timeout);
            }
        }
    }, [activeCard, thisCard])


    //card animation
    const [rotation, setRotation] = useState({ x: 0, y: 0 }); //degrees to rotate card (with dampening)
    const [xy, setXy] = useState({ x: 0, y: 0 }); //mouse position within the card
    const [delta, setDelta] = useState({ x: 0, y: 0 }); //distance from card to center of screen (for translation);
    const [isHovered, setIsHovered] = useState(false); //keep track of whether card is hovered

    function handleMouseMove(event) {
        const { clientX, clientY, target } = event;
        const { left, top, width, height } = target.getBoundingClientRect(); //left = left edge of viewport to left edge of card, top = top edge of viewport to top edge of card

        //mouse position within the card
        const x = (clientX - left) / width; //ranges from 0 to 1
        const y = (clientY - top) / height; //ranges from 0 to 1
        setXy({ x: x, y: y });

        //calculate rotation
        const rotationX = (xy.y - 0.5) / dampen; // y - 0.5 to center the rotation (y ranges from -0.5 to 0.5)
        const rotationY = (xy.x - 0.5) / dampen; // x - 0.5 to center the rotation

        setRotation({ x: rotationX, y: rotationY });
    }

    function handleMouseEnter() {
        setIsHovered(true);
        document.getElementById(thisCard.id).style.transition = ""; //card rotates responsively (no transition time)
    }

    function handleMouseLeave() {
        setIsHovered(false);
        setRotation({ x: 0, y: 0 }); //reset to default
        document.getElementById(thisCard.id).style.transition = "transform 0.5s"; //card returns to rest gracefully
    }


    //card showcase
    const [showcase, setShowcase] = useState(false);

    function startShowcase() {
        setCenter(); //set card to center of screen
        setShowcase(true);
        setActiveCard(thisCard); //let other cards know this card is being showcased
    }

    function handleOnClick() {
        if (!showcase) { //start showcasing when card clicked
            startShowcase();
        }
        else { //flip the card when clicked again

        }
    }

    //set card to center of screen for showcasing
    function setCenter() { //set card to center of screen
        const cardHtmlElement = document.getElementById(thisCard.id).parentElement; //parent element has constant width and height
        const { left, top, width, height } = cardHtmlElement.getBoundingClientRect(); //get element's position relative to viewport
        const view = document.documentElement; //get viewport size

        const delta = { //distance to center of screen
            x: Math.round(view.clientWidth / 2 - left - (width / 2)),
            y: Math.round(view.clientHeight / 2 - top - (height / 2)),
        };

        setDelta(delta);
    }

    //reposition showcased card when window is resized
    useEffect(() => {
        if (!showcase) {
            return;
        }

        let timeout;
        function reposition() {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                setCenter();
            }, 300);
        }

        document.addEventListener("scroll", reposition);

        return () => {
            clearTimeout(timeout);
            document.removeEventListener("scroll", reposition);
        }
    }, [showcase]);

    //stop showcasing when clicked outside of card
    useEffect(() => {
        if (!showcase) {
            return;
        }

        function stopShowcase() {
            setShowcase(false);
            setActiveCard(null); //let other cards know this card is no longer being showcased
            document.getElementById(thisCard.id).style.pointerEvents = "none"; //prevent interaction with this card during transition
        }

        let timeout = setTimeout(() => { //wait out the transition time before attaching listener
            document.addEventListener("click", stopShowcase);
        }, 500);

        return () => {
            clearTimeout(timeout);
            document.removeEventListener("click", stopShowcase);
        }
    }, [showcase, activeCard, setActiveCard, thisCard]);


    return (
        <div>
            {thisCard && (
                <div 
                    className={"card" + (isHovered ? " enlarged" : "") + (showcase ? " showcase" : "")} //add classnames for CSS
                    style={{transform: showcase ? `translate(${delta.x}px, ${delta.y}px) scale(${showcaseScale})` : ""}}
                >

                    <div
                        id={thisCard.id}
                        className="card-content"
                        onMouseEnter={handleMouseEnter}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                        onClick={handleOnClick}

                        style = {{
                            transform: `perspective(600px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
                        }}
                    >

                        <img src={thisCard.imageURL} alt="" style={{maxWidth: "250px"}} />

                        <div
                            className="glare"
                            style={{
                                transform: isHovered ? `translate(${xy.x*120}px, ${xy.y*120}px) scale(${isHovered ? 1.1 : 1})`: "",
                            }}
                        />

                    </div>

                </div>
            )}
        </div>
    )

}

export default function Cards() {

    const [activeCard, setActiveCard] = useState(null); //card that is being showcased

    return (
        <Box
            sx={{
                position: "relative",
                p: 1,
                m: 1,
            }}
        >

            <b>Card showcase:</b>

            <Card cardURL={"https://zoombies.world/nft/moonbeam/100" /*common*/} activeCard={activeCard} setActiveCard={setActiveCard} />
            <Card cardURL={"https://zoombies.world/nft/moonbeam/1090" /*uncommon*/} activeCard={activeCard} setActiveCard={setActiveCard} />
            <Card cardURL={"https://zoombies.world/nft/moonbeam/6" /*rare*/} activeCard={activeCard} setActiveCard={setActiveCard} />
            {/* <Card cardURL={card4} /> */}
            <Card cardURL={"https://zoombies.world/nft/moonbeam/79" /*platinum*/} activeCard={activeCard} setActiveCard={setActiveCard} />

        </Box>
    )
}

async function getCardFromAPI(URL) {
    const response = await fetch(URL);
    const data = await response.json();
    return data; //return is in this format: https://zoombies.world/services/card_types/mb/37.json
}