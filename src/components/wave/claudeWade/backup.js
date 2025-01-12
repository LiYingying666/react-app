import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

// 首先定义 Particle 类
class Particle {
    constructor(position, baseSpeed, intensity) {
        // 增大正方体尺寸
        const size = Math.random() * 0.5 + 0.5;
        const geometry = new THREE.BoxGeometry(size, size, size);
        // 创建边缘几何体 - 只显示边线
        const edgesGeometry = new THREE.EdgesGeometry(geometry);

        // 根据深度生成颜色，远处偏蓝，近处偏红
        const depthFactor = (position.z + 50) / 100; // 归一化深度值
        const color = new THREE.Color().setHSL(
            0.6 - depthFactor * 0.5, // 色相从蓝到红
            0.8,
            0.4 + depthFactor * 0.3 // 远处略暗，近处略亮
        );
        // 创建线条材质
        // const material = new THREE.LineBasicMaterial({
        //     color: 0xffffff, // 白色
        //     transparent: true, // 开启透明
        //     opacity: 0.6, // 设置透明度
        //     linewidth: 1, // 线条宽度
        // });
        const material = new THREE.MeshPhongMaterial({
            color: color,
            shininess: 50,
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(position);
        this.baseSpeed = baseSpeed;
        this.currentSpeed = baseSpeed;
        this.intensity = intensity;
        this.lastAudioIntensity = 0; // 添加上一帧的音频强度记录
        this.velocityZ = baseSpeed; // 添加Z轴速度变量
        this.lastBeat = 0;
        this.beatDecayStart = 0;
        this.beatPhase = 0; // 0: 正常, 1: 加速, 2: 减速
        // 添加轻微的旋转
        this.rotationSpeed = {
            x: (Math.random() - 0.5) * 0.01,
            y: (Math.random() - 0.5) * 0.01,
            z: (Math.random() - 0.5) * 0.01,
        };
        this.lastFrequencyData = new Array(3).fill(0); // 存储上一帧的低中高频数据
        this.velocityMultiplier = 1; // 速度倍增器
        this.lastBeat = 0; // 上一次节拍时间
    }
    update(audioData) {
        // 将频率数据分成低中高三个频段
        // 低频分析（重音检测）
        const bassSum = audioData.slice(0, 8).reduce((a, b) => a + b, 0) / 8;
        const currentTime = Date.now();

        const midSum = audioData.slice(8, 24).reduce((a, b) => a + b, 0) / 16;
        const trebleSum =
            audioData.slice(24, 32).reduce((a, b) => a + b, 0) / 8;

        // 检测突变（节拍）- 调整阈值
        const bassThreshold = 140; // 可以根据实际音频调整
        const minBeatInterval = 250; // 最小节拍间隔(ms)

        // 重音检测改进
        const bassDelta = bassSum - this.lastFrequencyData[0]; // 低频变化量
        // 重音检测改进
        if (
            bassDelta > 40 && // 降低突变检测阈值
            bassSum > bassThreshold &&
            currentTime - this.lastBeat > minBeatInterval
        ) {
            this.beatPhase = 1; // 进入加速阶段
            this.velocityMultiplier = 3.0; // 增加初始加速度
            this.lastBeat = currentTime;
            this.beatDecayStart = currentTime;

            // 重音时的形变效果
            this.mesh.scale.x = this.mesh.scale.y = this.mesh.scale.z = 1.3;
        }

        // 处理节拍后的速度变化
        const timeSinceLastBeat = currentTime - this.beatDecayStart;
        if (this.beatPhase === 1) {
            // 加速阶段
            if (timeSinceLastBeat > 80) {
                // 80ms后进入减速阶段
                this.beatPhase = 2;
                this.velocityMultiplier = 0.1; // 显著减速
            }
        } else if (this.beatPhase === 2) {
            // 减速阶段
            if (timeSinceLastBeat > 400) {
                // 300ms后恢复正常
                this.beatPhase = 0;
                this.velocityMultiplier = 1.0;
            }
        }
        // 加速阶段也可以提高速度
        // if (this.beatPhase === 1) {
        //     this.velocityMultiplier = 4.0; // 增加加速阶段的速度
        // }
        // 缓慢恢复正常大小
        // this.mesh.scale.x = this.mesh.scale.x * 0.9 + 1 * 0.1;
        // this.mesh.scale.y = this.mesh.scale.y * 0.9 + 1 * 0.1;
        // this.mesh.scale.z = this.mesh.scale.z * 0.9 + 1 * 0.1;

        if (bassSum > bassThreshold && currentTime - this.lastBeat > 100) {
            this.velocityMultiplier = 2.5; // 节拍时突然加速
            this.lastBeat = currentTime;
        }

        // 速度倍增器衰减
        this.velocityMultiplier *= 0.95;
        if (this.velocityMultiplier < 1) this.velocityMultiplier = 1;

        // 平滑音频强度变化
        const smoothFactor = 0.3;
        this.lastAudioIntensity =
            this.lastAudioIntensity * (1 - smoothFactor) +
            bassSum * smoothFactor;

        // 计算目标速度
        const baseSpeed = this.baseSpeed * 0.6; // 降低基础速度
        const intensityFactor = bassSum / 255;
        const speedVariation = Math.sin(currentTime * 0.003) * 0.3; // 降低周期性变化的影响

        // 添加音量阈值检测
        const volumeThreshold = 30; // 音量阈值
        let targetSpeed;
        if (bassSum < volumeThreshold) {
            // 声音很小时，速度接近停止
            targetSpeed = baseSpeed * 0.1; // 保持微小移动
        } else {
            // 正常情况下的速度计算
            targetSpeed =
                baseSpeed *
                (1 + intensityFactor + speedVariation) *
                this.velocityMultiplier;
        }

        // // 根据节拍阶段计算最终速度
        // let targetSpeed =
        //     baseSpeed *
        //     (1 + intensityFactor + speedVariation) *
        //     this.velocityMultiplier;

        // 更平滑的速度过渡
        // this.velocityZ = this.velocityZ * 0.85 + targetSpeed * 0.15;

        // 更平滑的速度过渡
        // 当声音很小时使用更快的过渡
        const transitionFactor = bassSum < volumeThreshold ? 0.7 : 0.85;
        this.velocityZ =
            this.velocityZ * transitionFactor +
            targetSpeed * (1 - transitionFactor);

        // 应用速度
        this.mesh.position.z += this.velocityZ;

        // 横向漂移根据中频调整
        const driftIntensity = 0.02 * (1 + midSum / 255);
        // this.mesh.position.x +=
        //     Math.sin(this.mesh.position.z * 0.1) * driftIntensity;
        // this.mesh.position.y +=
        //     Math.cos(this.mesh.position.z * 0.1) * driftIntensity;

        // 应用速度
        this.mesh.position.z += this.velocityZ;

        // 更新记录
        this.lastFrequencyData = [bassSum];

        // 旋转速度根据高频调整
        const rotationIntensity = 1 + (trebleSum / 255) * 2;
        this.mesh.rotation.x += this.rotationSpeed.x * rotationIntensity;
        this.mesh.rotation.y += this.rotationSpeed.y * rotationIntensity;
        this.mesh.rotation.z += this.rotationSpeed.z * rotationIntensity;

        // 更新上一帧数据
        this.lastFrequencyData = [bassSum, midSum, trebleSum];

        // 重置位置逻辑
        if (this.mesh.position.z > 10) {
            this.mesh.position.z = -50;
            // this.mesh.position.x = (Math.random() - 0.5) * 20;
            // this.mesh.position.y = (Math.random() - 0.5) * 20;
            this.velocityZ = this.baseSpeed;
            this.beatPhase = 0;
        }
    }
}

const MusicVisualizer = () => {
    const containerRef = useRef(null);
    const sceneRef = useRef(null);
    const particlesRef = useRef([]);
    const analyserRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(true);
    const audioContextRef = useRef(null);
    const audioRef = useRef(null);
    const dataArrayRef = useRef(null); // 用于存储音频数据数组的 ref

    const streamRef = useRef(null);
    const startCapture = async () => {
        try {
            // 获取系统音频流
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
            });

            streamRef.current = stream;

            // 初始化音频上下文
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext ||
                    window.webkitAudioContext)();
                const analyser = audioContextRef.current.createAnalyser();
                analyser.fftSize = 256;
                analyserRef.current = analyser;
            }

            // 连接音频流
            const source =
                audioContextRef.current.createMediaStreamSource(stream);
            source.connect(analyserRef.current);
            //   analyserRef.current.connect(audioContextRef.current.destination);

            setIsPlaying(true);
        } catch (err) {
            console.error("无法访问系统音频:", err);
            console.error("无法访问系统音频,请检查浏览器权限设置");
        }
    };

    useEffect(() => {
        // 基础场景设置
        const scene = new THREE.Scene();

        scene.fog = new THREE.Fog(0x000000, 20, 60); // 添加雾效增加深度感

        // 调整相机位置和角度
        const camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        camera.position.set(0, 0, 30); // 略微上移并后退
        camera.lookAt(0, 0, -50); // 看向远处
        // 创建电梯竖井
        const createElevatorShaft = () => {
            const width = 30;
            const height = 30;
            const depth = 100;

            // 调亮线条颜色
            const lineMaterial = new THREE.LineBasicMaterial({
                color: "yellow", // 更亮的灰色
                // transparent: true,
                opacity: 0.9, // 提高不透明度
            });

            // 创建竖线的顶点
            const corners = [
                new THREE.Vector3(-width / 2, -height / 2, -depth),
                new THREE.Vector3(width / 2, -height / 2, -depth),
                new THREE.Vector3(width / 2, height / 2, -depth),
                new THREE.Vector3(-width / 2, height / 2, -depth),
            ];

            // 添加竖线和横线
            corners.forEach((corner) => {
                // 竖线
                const lineGeometry = new THREE.BufferGeometry().setFromPoints([
                    corner,
                    new THREE.Vector3(corner.x, corner.y, 10),
                ]);
                const line = new THREE.Line(lineGeometry, lineMaterial);
                scene.add(line);

                // 横线
                const crossLineGeometry =
                    new THREE.BufferGeometry().setFromPoints([
                        corner,
                        new THREE.Vector3(
                            corner.x === -width / 2 ? width / 2 : -width / 2,
                            corner.y,
                            corner.z
                        ),
                    ]);
                const crossLine = new THREE.Line(
                    crossLineGeometry,
                    lineMaterial
                );
                scene.add(crossLine);
            });

            // 半透明蓝色面材质
            const planeMaterial = new THREE.MeshBasicMaterial({
                color: "#000", // 蓝色
                transparent: true,
                opacity: 0.2, // 降低透明度
                side: THREE.DoubleSide,
            });

            // 四个面的几何体和位置保持不变，只更改材质
            const leftGeometry = new THREE.PlaneGeometry(depth, height);
            const leftPlane = new THREE.Mesh(leftGeometry, planeMaterial);
            leftPlane.position.x = -width / 2;
            leftPlane.position.z = -depth / 2 + 5;
            leftPlane.rotation.y = Math.PI / 2;
            scene.add(leftPlane);

            const rightPlane = new THREE.Mesh(leftGeometry, planeMaterial);
            rightPlane.position.x = width / 2;
            rightPlane.position.z = -depth / 2 + 5;
            rightPlane.rotation.y = -Math.PI / 2;
            scene.add(rightPlane);

            const topGeometry = new THREE.PlaneGeometry(width, depth);
            const topPlane = new THREE.Mesh(topGeometry, planeMaterial);
            topPlane.position.y = height / 2;
            topPlane.position.z = -depth / 2 + 5;
            topPlane.rotation.x = Math.PI / 2;
            scene.add(topPlane);

            const bottomPlane = new THREE.Mesh(topGeometry, planeMaterial);
            bottomPlane.position.y = -height / 2;
            bottomPlane.position.z = -depth / 2 + 5;
            bottomPlane.rotation.x = -Math.PI / 2;
            scene.add(bottomPlane);
        };
        createElevatorShaft();

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setClearColor(0x000000);
        renderer.setSize(window.innerWidth, window.innerHeight);

        // 添加光源
        const ambientLight = new THREE.AmbientLight(0x404040);
        scene.add(ambientLight);

        // 添加环境光
        // const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        // scene.add(ambientLight);

        // 添加平行光
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(0, 0, 10); // 从相机方向照射
        scene.add(directionalLight);

        // 添加两侧点光源
        const leftLight = new THREE.PointLight(0xffffff, 0.3);
        leftLight.position.set(-15, 0, 0);
        scene.add(leftLight);

        const rightLight = new THREE.PointLight(0xffffff, 0.3);
        rightLight.position.set(15, 0, 0);
        scene.add(rightLight);
        const pointLight = new THREE.PointLight(0xffffff, 1, 100);
        pointLight.position.set(0, 10, 10);
        scene.add(pointLight);

        // renderer.setSize(window.innerWidth, window.innerHeight);
        containerRef.current?.appendChild?.(renderer.domElement);
        camera.position.z = 20;
        sceneRef.current = scene;

        // // 音频分析器设置
        // const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        // const analyser = audioContext.createAnalyser();
        // analyser.fftSize = 256;
        // analyserRef.current = analyser;

        // 加载音频
        // const audio = new Audio('https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3');
        // const source = audioContext.createMediaElementSource(audio);
        // source.connect(analyser);
        // analyser.connect(audioContext.destination);
        // audio.play();

        // 初始化粒子
        const initParticles = () => {
            for (let i = 0; i < 100; i++) {
                const particle = new Particle(
                    new THREE.Vector3(
                        (Math.random() - 0.5) * 20, // x范围
                        (Math.random() - 0.5) * 20, // y范围
                        Math.random() * -50 // z范围（远处）
                    ),
                    0.05, // 基础速度
                    0
                );
                scene.add(particle.mesh);
                particlesRef.current.push(particle);
            }
        };

        initParticles();

        // 动画循环
        const animate = () => {
            requestAnimationFrame(animate);

            let audioIntensity = 0;
            if (analyserRef.current && isPlaying) {
                const dataArray = new Uint8Array(
                    analyserRef.current.frequencyBinCount
                );
                analyserRef.current.getByteFrequencyData(dataArray);

                // 更新所有粒子，传入完整频率数据
                particlesRef.current.forEach((particle) => {
                    particle.update(dataArray);
                });
            }

            renderer.render(scene, camera);
        };
        //   animate()
        startCapture();
        animate();

        // 清理函数
        return () => {
            if (streamRef.current) {
                // streamRef.current.getTracks().forEach(track => track.stop());
            }
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
            particlesRef.current.forEach((particle) => {
                sceneRef.current.remove(particle.mesh);
            });
            containerRef.current?.removeChild?.(renderer.domElement);
        };
    }, []);

    return (
        <div>
            <div ref={containerRef} />
            {/* <button
      onClick={isPlaying ? stopCapture : startCapture}
      style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        padding: '10px 20px',
        zIndex: 1000,
        background: '#ffffff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer'
      }}
    >
      {isPlaying ? '停止捕获' : '开始捕获'}
    </button> */}
        </div>
    );
};

export default MusicVisualizer;
