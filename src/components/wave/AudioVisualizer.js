import React, { useEffect, useRef } from "react";
import * as THREE from "three";

const AudioVisualizer = () => {
  const mountRef = useRef(null); // 用于引用挂载点的 ref
  const audioContextRef = useRef(null); // 用于存储音频上下文的 ref
  const analyserRef = useRef(null); // 用于存储分析器节点的 ref
  const dataArrayRef = useRef(null); // 用于存储音频数据数组的 ref
  const bufferLengthRef = useRef(null); // 用于存储缓冲区长度的 ref
  const circlesRef = useRef([]); // 用于存储所有球体的 ref


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

    camera.position.z = 10; // 设置相机位置


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
      console.log('dataArray', dataArrayRef.current);
      animate(); // 开始动画
    });

    // 创建球体
    const createSphere = () => {
      const geometry = new THREE.SphereGeometry(1, 32, 32); // 创建球体几何体
      const material = new THREE.MeshStandardMaterial({ color: 0xffffff }); // 创建标准材质
      const sphere = new THREE.Mesh(geometry, material); // 创建球体网格
      sphere.position.set(0, 0, 0); // 设置球体位置
      sphere.userData = {
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.2, // 随机 x 方向速度
          (Math.random() - 0.5) * 0.2, // 随机 y 方向速度
          -0.1 // 固定 z 方向速度
        ),
      };
      circlesRef.current.push(sphere); // 将球体添加到数组中
      scene.add(sphere); // 将球体添加到场景中
//       const geometry2 = new THREE.BoxGeometry( 1, 1, 1 );
// const material2 = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
// const cube = new THREE.Mesh( geometry2, material2 );
// scene.add( cube );
    };


    // 动画函数
    const animate = () => {
      requestAnimationFrame(animate); // 请求下一帧动画
        // console.log('dataArrayRef.current=', dataArrayRef.current);
      analyser.getByteFrequencyData(dataArrayRef.current); // 获取频率数据

      // 创建新的球体
      if (Math.random() < 0.05) {
        createSphere();
      }

      // 更新球体的大小、颜色和位置
      circlesRef.current.forEach((sphere, index) => {
        const scale = dataArrayRef.current[index % bufferLengthRef.current] / 128.0; // 根据频率数据计算缩放比例
        sphere.scale.set(scale, scale, scale); // 设置球体缩放

        const colorValue = dataArrayRef.current[index % bufferLengthRef.current]; // 获取颜色值
        sphere.material.color.setHSL(colorValue / 255, 1, 0.5); // 设置球体颜色

        // 使球体向外移动
        sphere.position.add(sphere.userData.velocity);

        // 检查球体速度是否接近零
        if (sphere.userData.velocity.length() < 0.01) {
          scene.remove(sphere); // 从场景中移除球体
          circlesRef.current.splice(index, 1); // 从数组中移除球体
        }

        // 移除超出屏幕的球体
        if (sphere.position.length() > 50) {
          scene.remove(sphere); // 从场景中移除球体
          circlesRef.current.splice(index, 1); // 从数组中移除球体
        }
      });

      renderer.render(scene, camera); // 渲染场景
    };
    animate()

    return () => {
      audioContext.close(); // 关闭音频上下文
      mount.removeChild(renderer.domElement); // 从挂载点移除渲染器的 DOM 元素
    };
  }, []);

  
  return <div ref={mountRef} style={{ width: "800px", height: "400px" }} />; // 返回挂载点
};

export default AudioVisualizer;