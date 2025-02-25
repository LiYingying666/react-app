import { useEffect, useRef } from "react";
import * as THREE from "three";

export const SimpleVisualizer = () => {
    const containerRef = useRef(null);

    useEffect(() => {
        // 1. 场景初始化
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / (window.innerHeight / 3),
            0.1,
            1000
        );
        const renderer = new THREE.WebGLRenderer({ antialias: true });

        renderer.setSize(window.innerWidth, window.innerHeight / 3);
        containerRef.current.appendChild(renderer.domElement);

        // 2. 创建波浪网格
        const geometry = new THREE.PlaneGeometry(20, 10, 128, 128);
        const material = new THREE.MeshPhongMaterial({
            color: 0x00ffff,
            side: THREE.DoubleSide,
            wireframe: false,
            transparent: true,
            opacity: 0.8,
            shininess: 100,
        });

        const plane = new THREE.Mesh(geometry, material);
        scene.add(plane);

        // 3. 添加光源
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(0, 1, 1);
        scene.add(directionalLight);

        const ambientLight = new THREE.AmbientLight(0x404040);
        scene.add(ambientLight);

        // 4. 设置相机位置
        camera.position.z = 10;

        // 5. 音频分析器设置
        const audioContext = new (window.AudioContext ||
            window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        // 6. 连接音频输入
        navigator.mediaDevices
            .getUserMedia({ audio: true })
            .then((stream) => {
                const source = audioContext.createMediaStreamSource(stream);
                source.connect(analyser);
            })
            .catch((err) => console.error("音频输入错误:", err));

        // 7. 动画函数
        const animate = () => {
            requestAnimationFrame(animate);

            analyser.getByteFrequencyData(dataArray);

            // 更新顶点位置
            const positions = geometry.attributes.position.array;
            for (let i = 0; i < positions.length; i += 3) {
                const x = positions[i];
                const y = positions[i + 1];

                // 使用音频数据调制z轴
                const index = Math.floor(
                    (i / positions.length) * dataArray.length
                );
                const value = dataArray[index];
                positions[i + 2] =
                    Math.sin(x + y + Date.now() * 0.001) * (value / 50);
            }

            geometry.attributes.position.needsUpdate = true;
            plane.rotation.x = Math.PI * 0.25;

            renderer.render(scene, camera);
        };

        animate();

        // 8. 响应式处理
        const handleResize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight / 3;

            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            containerRef.current?.removeChild(renderer.domElement);
            if (audioContext.state !== "closed") {
                audioContext.close();
            }
        };
    }, []);

    return (
        <div
            ref={containerRef}
            style={{ position: "fixed", bottom: 0, left: 0 }}
        />
    );
};
