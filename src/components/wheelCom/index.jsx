import React, { useEffect } from "react";
import "./index.css";

export const WheelCom = () => {
    useEffect(() => {
        window.addEventListener("wheel", (e) => {
            console.log("deltaY", e.deltaY);
        });
    }, []);
    return (
        <div className="wheelCom-container">
            <div className="first">first</div>
            <div className="second">second</div>
        </div>
    );
};
