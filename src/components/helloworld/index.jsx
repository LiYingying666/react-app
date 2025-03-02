import React, { useState, useRef } from "react";
import { Button } from "antd";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import "./index.css";

export const HelloWorld = () => {
    const [showOverlay, setShowOverlay] = useState(false);
    const overlayRef = useRef(null);
    const textRef = useRef(null);
    const timerRef = useRef(null);

    const handleButtonClick = () => {
        setShowOverlay(true);
    };

    // 使用 useGSAP 管理动画
    useGSAP(
        () => {
            if (showOverlay && overlayRef.current && textRef.current) {
                // 淡入动画
                const tl = gsap.timeline();
                tl.fromTo(
                    overlayRef.current,
                    { opacity: 0 },
                    { opacity: 1, duration: 1 }
                );

                // 3秒后自动淡出，先文字后背景
                timerRef.current = setTimeout(() => {
                    const fadeOutTl = gsap.timeline();

                    // 文字先消失 - 0.5秒
                    fadeOutTl.to(textRef.current, {
                        opacity: 0,
                        duration: 0.5,
                    });

                    // 背景再消失 - 0.5秒
                    fadeOutTl.to(overlayRef.current, {
                        opacity: 0,
                        duration: 0.5,
                        onComplete: () => setShowOverlay(false),
                    });
                }, 3000);
            }

            // 清理计时器
            return () => {
                if (timerRef.current) {
                    clearTimeout(timerRef.current);
                }
            };
        },
        { dependencies: [showOverlay] }
    );

    return (
        <div className="hello-world">
            <Button type="primary" onClick={handleButtonClick}>
                点击显示HelloWorld
            </Button>

            {showOverlay && (
                <div ref={overlayRef} className="overlay">
                    <div ref={textRef} className="overlay-text">
                        HelloWorld
                    </div>
                </div>
            )}
        </div>
    );
};
