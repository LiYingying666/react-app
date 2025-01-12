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
let tha = 0;
let ctha = 0;

// 动画函数，用于更新颜色、发射器和相机，并递归调用自身以实现动画效果
const animate = ({ color1, color2, emitter, camera, scene }) => {
  hcolor += 0.01; // 更新颜色的色调
  tha += Math.PI / 150; // 更新发射器的位置
  ctha += 0.016; // 更新相机的位置

  updateColors(color1, color2, hcolor); // 更新颜色
  updateEmitter(emitter, tha); // 更新发射器
  updateCamera(camera, scene, ctha); // 更新相机

  // 递归调用自身以实现动画效果
  requestAnimationFrame(() =>
    animate({ color1, color2, emitter, camera, scene })
  );
};

// 更新颜色函数，根据色调更新两个颜色对象
const updateColors = (color1, color2, hcolor = 0) => {
  color1.setHSL(hcolor - (hcolor >> 0), 1, 0.5); // 更新 color1 的色调
  color2.setHSL(hcolor - (hcolor >> 0) + 0.3, 1, 0.5); // 更新 color2 的色调
};

// 更新发射器函数，根据角度更新发射器的位置
const updateEmitter = (emitter, tha = 0) => {
  const p = 100 * Math.sin(2 * tha); // 计算发射器的位置

  emitter.position.x = p * Math.cos(tha); // 更新发射器的 x 坐标
  emitter.position.y = p * Math.sin(tha); // 更新发射器的 y 坐标
  emitter.position.z = (p * Math.tan(tha)) / 2; // 更新发射器的 z 坐标
};

// 更新相机函数，根据角度更新相机的位置
const updateCamera = (camera, scene, ctha = 0) => {
  const radius = 300; // 相机的半径

  camera.lookAt(scene.position); // 相机看向场景的中心

  camera.position.x = Math.sin(ctha) * radius; // 更新相机的 x 坐标
  camera.position.z = Math.cos(ctha) * radius; // 更新相机的 z 坐标
  camera.position.y = Math.sin(ctha) * radius; // 更新相机的 y 坐标
};

// 创建发射器函数，初始化发射器并设置其属性和行为
const createEmitter = (color1, color2) => {
  const emitter = new Emitter(); // 创建发射器实例

  return emitter
    .setRate(new Rate(new Span(4, 16), new Span(0.01))) // 设置发射速率
    .addInitializers([
      new Position(new PointZone(0, 0)), // 设置发射器的位置
      new Mass(1), // 设置粒子的质量
      new Radius(6, 12), // 设置粒子的半径
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
export default async (three, { scene, camera }) => {
  THREE = three;

  const system = new ParticleSystem();
  const color1 = new THREE.Color();
  const color2 = new THREE.Color();
  const emitter = createEmitter(color1, color2);

  animate({ color1, color2, emitter, camera, scene });

  return system
    .addEmitter(emitter)
    .addRenderer(new SpriteRenderer(scene, THREE));
};
