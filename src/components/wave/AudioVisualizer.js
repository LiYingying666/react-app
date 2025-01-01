import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { Water } from "three-stdlib";

const AudioVisualizer = () => {
  const mountRef = useRef(null); // 用于引用挂载点的 ref
  const audioContextRef = useRef(null); // 用于存储音频上下文的 ref
  const analyserRef = useRef(null); // 用于存储分析器节点的 ref
  const dataArrayRef = useRef(null); // 用于存储音频数据数组的 ref
  const bufferLengthRef = useRef(null); // 用于存储缓冲区长度的 ref
  const waterRef = useRef(null); // 用于存储 Water 实例的 ref

  useEffect(() => {
    const mount = mountRef.current; // 获取挂载点

    // 创建场景
    const scene = new THREE.Scene();
    // 创建相机
    const camera = new THREE.PerspectiveCamera(75, mount.clientWidth / mount.clientHeight, 0.1, 1000);
    // 创建渲染器
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(mount.clientWidth, mount.clientHeight); // 设置渲染器大小
    mount.appendChild(renderer.domElement); // 将渲染器的 DOM 元素添加到挂载点

    camera.position.set(0, 30, 100); // 设置相机位置
    camera.lookAt(0, 0, 0); // 设置相机视角

    // 添加光源
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // 环境光
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1); // 点光源
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    // 创建音频上下文
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    const audioContext = audioContextRef.current;

    // 创建分析器节点
    analyserRef.current = audioContext.createAnalyser();
    const analyser = analyserRef.current;
    analyser.fftSize = 256; // 设置 FFT 大小
    bufferLengthRef.current = analyser.frequencyBinCount; // 获取频率数据的数量
    dataArrayRef.current = new Uint8Array(bufferLengthRef.current); // 创建存储频率数据的数组

    // 获取音频输入
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const source = audioContext.createMediaStreamSource(stream); // 创建媒体流源
      source.connect(analyser); // 将源连接到分析器
      animate(); // 开始动画
    });

    // 创建波浪效果
    const waterGeometry = new THREE.PlaneGeometry(100, 100);
    const water = new Water(waterGeometry, {
      color: 0x00aaff,
      scale: 1,
      flowDirection: new THREE.Vector2(1, 1),
      textureWidth: 512,
      textureHeight: 512,
    });

    
    water.rotation.x = -Math.PI / 2;
    scene.add(water);
    waterRef.current = water;

    // 动画函数
    const animate = () => {
      requestAnimationFrame(animate); // 请求下一帧动画

      analyser.getByteFrequencyData(dataArrayRef.current); // 获取频率数据

      // 更新波浪效果
      if (waterRef.current) {
        const averageFrequency = dataArrayRef.current.reduce((sum, value) => sum + value, 0) / dataArrayRef.current.length;
        const scale = averageFrequency / 128.0; // 根据频率数据计算缩放比例
        waterRef.current.material.uniforms['time'].value += scale * 0.01; // 根据音频数据更新波浪效果
        waterRef.current.material.uniforms['distortionScale'].value = scale * 5; // 调整波浪的高度
      }

      renderer.render(scene, camera); // 渲染场景
    };

    return () => {
      audioContext.close(); // 关闭音频上下文
      mount.removeChild(renderer.domElement); // 从挂载点移除渲染器的 DOM 元素
    };
  }, []);

  return <div ref={mountRef} style={{ width: "100vw", height: "100vh" }} />; // 返回挂载点
};

export default AudioVisualizer;