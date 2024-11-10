// // 使用 useState 来管理可能会动态变化的 props
// const [dynamicProps, setDynamicProps] = useState(compProps);
// // 独立的 loading 方式
// const [loading, setLoading] = useState(false);
// 使用 ref 记录上一次的依赖值
// const prevDepsRef = useRef({});
// 处理 watchAttr 配置
// useEffect(() => {
//   if (!watchAttr || !Array.isArray(watchAttr)) return;

//   const handleWatchAttr = async () => {
//     // 检查依赖项是否真的发生变化
//     const hasDepChanged = watchAttr.some((watch) => {
//       const { dep } = watch;
//       const prevValue = prevDepsRef.current[dep];
//       const currentValue = watchedValues[dep];
//       return prevValue !== currentValue;
//     });

//     // 如果依赖项没有变化，直接返回
//     if (!hasDepChanged) return;
//     // 只设置当前字段的 loading 状态
//     setLoading(true);
//     try {
//       // 创建一个新的 props 对象来收集所有更新
//       let newProps = { ...compProps };

//       // 处理每个 watchAttr 配置
//       for (const watch of watchAttr) {
//         const { dep, target, trigger } = watch;

//         // 获取依赖项的当前值
//         const depValue = watchedValues[dep];
//         // 更新 ref 中的依赖值
//         prevDepsRef.current[dep] = depValue;
//         if (depValue !== undefined) {
//           // 生成缓存键
//           const cacheKey = JSON.stringify({
//             dep,
//             depValue,
//             target,
//             name: item.name,
//           });
//           console.log("cacheKey=", cacheKey);
//           // 检查缓存
//           const cachedResult = watchAttrCache.get(cacheKey);
//           if (cachedResult !== null) {
//             newProps = {
//               ...newProps,
//               [target]: cachedResult,
//             };
//             console.log("跳过api调用-newProps", newProps);
//             continue; // 跳过 API 调用
//           }
//           // try {
//           // 执行 trigger 函数（支持异步）
//           let triggerFn = trigger;
//           if (typeof trigger === "string") {
//             // 如果 trigger 是字符串，将其转换为函数
//             triggerFn = new Function("return " + trigger)();
//           }

//           const result = await triggerFn(depValue, form.getFieldsValue());
//           // 存入缓存
//           watchAttrCache.set(cacheKey, result);
//           // 更新对应的 target 属性
//           newProps = {
//             ...newProps,
//             [target]: result,
//           };
//           console.log(" api调用后newProps-", newProps);
//           // } catch (error) {
//           //   console.error(
//           //     `Error executing watchAttr trigger for ${dep}:`,
//           //     error
//           //   );
//           // }
//         }
//       }
//       // 更新 props
//       setDynamicProps(newProps);
//     } catch (error) {
//       console.error("组件内部动态获取-error:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // 使用 debounce 避免频繁调用
//   const debouncedHandle = debounce(handleWatchAttr, 300);
//   debouncedHandle();

//   // 清理函数
//   return () => {
//     debouncedHandle.cancel();
//   };
// }, [watchAttr, watchedValues, form, compProps]); // 依赖项包含 watchedValues 以响应变化
