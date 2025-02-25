import React from "react";
import "./index.css";

export const PlanetComponent = () => {
    return (
        <div className="planet-container">
            <div className="orbit orbit-100">
                <div className="planet"></div>
            </div>
            <div className="orbit orbit-150">
                <div className="planet planet-150"></div>
            </div>
            <div className="orbit orbit-200">
                <div className="planet planet-200"></div>
            </div>
        </div>
    );
};
