import React from "react";
import { useEffect } from "react";
import { Carousel } from "antd";
import "./index.css";

export const Zoumadeng = () => {
    const [current, setCurrent] = React.useState(0);
    const [next, setNext] = React.useState(0);
    const contentStyle = {
        margin: 0,
        height: "160px",
        color: "#fff",
        lineHeight: "160px",
        textAlign: "center",
        background: "#364d79",
    };
    console.log("current", current);
    const handleBeforeChange = (from, to) => {
        console.log("from", from);
        console.log("to", to);
        setNext(to);
    };
    return (
        <div className="zoumadeng-container">
            <Carousel
                dots={false}
                slidesToShow={3}
                afterChange={(slide) => setCurrent(slide)}
                beforeChange={handleBeforeChange}
                focusOnSelect
                centerMode
                centerPadding="0"
            >
                <div>
                    <div className="my-card">
                        <div
                            className={`inner-card ${
                                next === 0 ? "scale" : ""
                            }`}
                        >
                            1
                        </div>
                    </div>
                </div>
                <div>
                    <div className="my-card">
                        <div
                            className={`inner-card ${
                                next === 1 ? "scale" : ""
                            }`}
                        >
                            2
                        </div>
                    </div>
                </div>
                <div>
                    <div className="my-card">
                        <div
                            className={`inner-card ${
                                next === 2 ? "scale" : ""
                            }`}
                        >
                            3
                        </div>
                    </div>
                </div>
                <div>
                    <div className="my-card">
                        <div
                            className={`inner-card ${
                                next === 3 ? "scale" : ""
                            }`}
                        >
                            4
                        </div>
                    </div>
                </div>
            </Carousel>
        </div>
    );
};
