import React, { useEffect, useRef } from 'react';
const AudioCanvas = ({ audioData }) => {
    const canvasRef = useRef(null);
    const mountRef = useRef(null); // 用于引用挂载点的 ref
    const audioContextRef = useRef(null); // 用于存储音频上下文的 ref
    const analyserRef = useRef(null); // 用于存储分析器节点的 ref
    const dataArrayRef = useRef(null); // 用于存储音频数据数组的 ref
    const bufferLengthRef = useRef(null); // 用于存储缓冲区长度的 ref
    const circlesRef = useRef([]); // 用于存储所有圆圈的 ref
  
    const animate = () => {
        const analyser = analyserRef.current;
        analyser.fftSize = 2048;
        var bufferLength = analyser.fftSize;
        var dataArray = new Uint8Array(bufferLength);
        // canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
    }
    
    useEffect(() => {
          // 创建音频上下文
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        const audioContext = audioContextRef.current;
        // console.log(audioContext);

        
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

    }, []);
    
    return <canvas ref={canvasRef} style={{width: 800, height: 400, border: '1px solid #000'}} />;
    }
export default AudioCanvas;