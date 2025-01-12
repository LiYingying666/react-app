import React, { useRef } from 'react';
import ParticleSystem, {
  Alpha,
  Color,
  Emitter,
  Life,
  Mass,
  PointZone,
  Position,
  RadialVelocity,
  Radius,
  Rate,
  Scale,
  Span,
  SpriteRenderer,
  Vector3D,
} from 'three-nebula';

let THREE;
let hcolor = 0;

let dataArray;

// 新增：计算频段能量的辅助函数
const calculateEnergy = (dataArray, startBin, endBin) => {
  let sum = 0;
  for (let i = startBin; i < endBin; i++) {
    sum += dataArray[i] * dataArray[i];
  }
  return sum / (endBin - startBin);
};
// 动画函数，用于更新颜色、发射器和相机，并递归调用自身以实现动画效果
const animate = ({ color1, color2, emitter, camera, scene, analyser }) => {
  const tha = Date.now() * 0.001;
  const ctha = Date.now() * 0.0005;
  // 获取音频数据
  analyser.getByteFrequencyData(dataArray);
   
  // 添加数据验证
  if (!dataArray.some(value => value > 0)) {
    // console.log('No audio data detected');
  }
  //  console.log('dataArray', dataArray);
  // hcolor += 0.01; // 更新颜色的色调
  // tha += Math.PI / 150; // 更新发射器的位置
  // ctha += 0.016; // 更新相机的位置

 // 计算不同频段的能量
 const bassEnergy = calculateEnergy(dataArray, 0, 60);     // 低频 20-250Hz
 const midEnergy = calculateEnergy(dataArray, 60, 250);    // 中频 250-2000Hz
 const trebleEnergy = calculateEnergy(dataArray, 250, 512); // 高频 2000-20000Hz

 // 使用对数标度计算scale以获得更好的视觉效果
 const scale = Math.log10(bassEnergy + 1) / 2;
 
  // console.log('scale', scale);
  updateColors(color1, color2, tha);
  updateEmitter(emitter, tha, scale);
  updateCamera(camera, scene, ctha);

  // 递归调用自身以实现动画效果
  requestAnimationFrame(() =>
    animate({ color1, color2, emitter, camera, scene, analyser })
  );

};


// 更新颜色函数，根据色调更新两个颜色对象
const updateColors = (color1, color2, hcolor = 0) => {
  color1.setHSL(hcolor - (hcolor >> 0), 1, 0.5); // 更新 color1 的色调
  color2.setHSL(hcolor - (hcolor >> 0) + 0.3, 1, 0.5); // 更新 color2 的色调
};

// 更新发射器函数，根据角度更新发射器的位置
const updateEmitter = (emitter, tha = 0,) => {
  const p = 100 * Math.sin(2 * tha); // 计算发射器的位置

  // emitter.position.x = p * Math.cos(tha); // 更新发射器的 x 坐标
  // emitter.position.y = p * Math.sin(tha); // 更新发射器的 y 坐标
  // emitter.position.z = (p * Math.tan(tha)) / 2; // 更新发射器的 z 坐标
  const averageFrequency = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
  const scale = averageFrequency / 128.0; // 根据频率数据计算缩放比例
  // console.log('scale', scale);
  // 更新发射器的位置
  emitter.position.x = p * Math.cos(scale);
  emitter.position.y = p * Math.cos(scale);
  emitter.position.z = p * Math.cos(scale);
  // console.log('emitter', emitter?.rate?.numPan);
  // 更新发射速率
  if (emitter?.rate){
    emitter.rate.numPan.a = 4 * 1;
    emitter.rate.numPan.b = 16 * 1;
  }
 
  // emitter.setRate(new Rate(new Span(4 * scale, 16 * scale), new Span(0.01 * scale))).emit();
  // 更新粒子的半径
  // (emitter.initializers || []).forEach(initializer => {
  //   if (initializer instanceof Radius && initializer?.raduis) {
      
  //     initializer.raduis.a = 3 * scale;
  //     initializer.raduis.b = 6 * scale;
  //   }
  // });
};

// 更新相机函数，根据角度更新相机的位置
const updateCamera = (camera, scene, ctha = 0) => {
  const radius = 150; // 相机的半径

  camera.lookAt(scene.position); // 相机看向场景的中心

  camera.position.x = radius; // 更新相机的 x 坐标
  camera.position.z = radius; // 更新相机的 z 坐标
  camera.position.y = radius; // 更新相机的 y 坐标
};

// 创建发射器函数，初始化发射器并设置其属性和行为
const createEmitter = (color1, color2) => {
  const emitter = new Emitter(); // 创建发射器实例

  return emitter
    .setRate(new Rate(new Span(4, 16), new Span(0.01))) // 设置发射速率
    .addInitializers([
      new Position(new PointZone(0, 0)), // 设置发射器的位置
      new Mass(1), // 设置粒子的质量
      new Radius(3, 6), // 设置粒子的半径
      new Life(3), // 设置粒子的寿命
      new RadialVelocity(45, new Vector3D(0, 1, 0), 180), // 设置粒子的速度
    ])
    .addBehaviours([
      new Alpha(1, 0), // 设置粒子的透明度
      new Scale(0.3, 0.6), // 设置粒子的缩放
      new Color(color1, color2), // 设置粒子的颜色
    ])
    .emit(); // 开始发射粒子
};

// 默认导出函数，用于初始化粒子系统
// eslint-disable-next-line import/no-anonymous-default-export
export default async (three, { scene, camera }) => {
   
  THREE = three;

 
  // 创建音频上下文
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 2048; // 设置 FFT 大小
  analyser.minDecibels = -90;
  analyser.maxDecibels = -10;
  analyser.smoothingTimeConstant = 0.85;

  const bufferLength = analyser.frequencyBinCount; // 获取频率数据的数量
   dataArray = new Uint8Array(bufferLength); // 创建存储频率数据的数组
  //  console.log('dataArray', dataArray);
  //  analyser.getByteTimeDomainData(dataArray);
  // 获取音频输入
  const stream = await navigator.mediaDevices.getUserMedia({ audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false
      }  })
  const source = audioContext.createMediaStreamSource(stream); // 创建媒体流源
  source.connect(analyser); // 将源连接到分析器
  // 初始化其他组件
  const system = new ParticleSystem();
  const color1 = new THREE.Color();
  const color2 = new THREE.Color();
  const emitter = createEmitter(color1, color2);
  // animate({ emitter, analyser, dataArray }); // 开始动画
  console.log('data', dataArray);
  animate({ color1, color2, emitter, camera, scene, analyser });

  // 在animate函数开始处添加
const debugAudio = () => {
  const max = Math.max(...dataArray);
  const min = Math.min(...dataArray);
  const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
  console.log(`Audio levels - Max: ${max}, Min: ${min}, Avg: ${avg}`);
};

// 每秒执行一次调试
if (Date.now() % 1000 < 16) {
  debugAudio();
}
    // animate({ color1, color2, emitter, camera, scene, analyser });

  return system
    .addEmitter(emitter)
    .addRenderer(new SpriteRenderer(scene, THREE));
};

