import React, { useEffect } from "react";
import { gsap } from "gsap";
import { MotionPathPlugin } from "gsap/all";
import "./index.css";

export const PlanetComponent = () => {
    useEffect(() => {
        // 注册MotionPathPlugin插件
        gsap.registerPlugin(MotionPathPlugin);

        // 为第一个行星创建动画
        gsap.to(".planet1", {
            motionPath: {
                path: "#planet1-line-id",
                align: "#planet1-line-id",
                alignOrigin: [0.5, 0.5],
                autoRotate: false,
            },
            duration: 10,
            repeat: -1,
            ease: "none",
        });

        // 为第二个行星创建动画
        gsap.to(".planet2", {
            motionPath: {
                path: "#planet2-line-id",
                align: "#planet2-line-id",
                alignOrigin: [0.5, 0.5],
                autoRotate: false,
            },
            duration: 10,
            repeat: -1,
            ease: "none",
        });

        // 为第三个行星创建动画
        gsap.to(".planet3", {
            motionPath: {
                path: "#planet3-line-id",
                align: "#planet3-line-id",
                alignOrigin: [0.5, 0.5],
                autoRotate: false,
            },
            duration: 10,
            repeat: -1,
            ease: "none",
        });
    }, []);
    return (
        <div className="planet-container">
            {/* <svg width="694" height="694">
                <path
                    id="planet1-line-id"
                    d="M 579,347 a 232,232 0 1,1 -464,0 a 232,232 0 1,1 464,0"
                    fill="none"
                />
                <path
                    id="planet2-line-id"
                    d="M 627,347 a 280,280 0 1,1 -560,0 a 280,280 0 1,1 560,0"
                    fill="none"
                />
                <path
                    id="planet3-line-id"
                    d="M 694,347 a 347,347 0 1,1 -694,0 a 347,347 0 1,1 694,0"
                    fill="none"
                />
            </svg> */}
            {/* 绝对路径 */}
            <svg width="694" height="694">
                <path
                    id="planet1-line-id"
                    d="M 579,347 
       A 232 232 0 1 1 115 347 
       A 232 232 0 1 1 579 347"
                    fill="none"
                />
                <path
                    id="planet2-line-id"
                    d="M 627,347 
       A 280 280 0 1 1 67 347 
       A 280 280 0 1 1 627 347"
                    fill="none"
                />
                <path
                    id="planet3-line-id"
                    d="M 694,347 
       A 347 347 0 1 1 0 347 
       A 347 347 0 1 1 694 347"
                    fill="none"
                />
            </svg>
            <div className="orbit orbit1">
                <div className="planet planet1">1</div>
            </div>
            <div className="orbit orbit2">
                <div className="planet planet2">2</div>
            </div>
            <div className="orbit orbit3">
                <div className="planet planet3">3</div>
            </div>
        </div>
    );
};
