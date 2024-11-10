import { useEffect, useRef, useState } from "react";
import { debounce } from "lodash";

export const useDynamicProps = ({
  item,
  form,
  watchedValues,
  watchAttrCache,
}) => {
  const { props: compProps, watchAttr, formItemApi } = item;
  // 使用 useState 来管理可能会动态变化的 props
  const [dynamicProps, setDynamicProps] = useState(compProps);
  // formItem 的 props
  const [formItemProps, setFormItemProps] = useState(
    typeof formItemApi === "object" && formItemApi !== null ? formItemApi : {}
  );
  // 独立的 loading 方式
  const [loading, setLoading] = useState(false);
  // 使用 ref 记录上一次的依赖值
  const prevDepsRef = useRef({});
  // 记录已初始化的无依赖项的 watchAttr
  const initializedRef = useRef(new Set());

  // 处理 formItemApi 的函数
  const handleFormItemApi = (result, props) => {
    if (typeof formItemApi === "function") {
      try {
        const newFormItemProps = formItemApi(result, props, form);
        setFormItemProps(newFormItemProps);
      } catch (error) {
        console.error("Error executing formItemApi:", error);
        // 发生错误时保持原有的 formItemProps
      }
    }
  };

  // 处理 watchAttr 配置
  useEffect(() => {
    if (!watchAttr || !Array.isArray(watchAttr)) return;

    const handleWatchAttr = async () => {
      // 分离有依赖和无依赖的配置
      const watchWithDeps = watchAttr.filter((watch) => watch.dep);
      const watchWithoutDeps = watchAttr.filter((watch) => !watch.dep);

      // 检查依赖项是否真的发生变化
      const hasDepChanged = watchWithDeps.some((watch) => {
        const { dep } = watch;
        const prevValue = prevDepsRef.current[dep];
        const currentValue = watchedValues[dep];
        return prevValue !== currentValue;
      });
      console.log("hasDepChanged-", hasDepChanged, initializedRef.current);
      // 如果有依赖的配置没有变化，且无依赖的配置都已初始化，则直接返回
      if (
        !hasDepChanged &&
        watchWithoutDeps.every((w) => initializedRef.current.has(w.target))
      ) {
        return;
      }

      // 只设置当前字段的 loading 状态
      setLoading(true);
      try {
        // 创建一个新的 props 对象来收集所有更新
        let newProps = { ...compProps };

        // 处理无依赖的配置（只在初始化时执行）
        for (const watch of watchWithoutDeps) {
          console.log("item.name", item.name);

          console.log("watchWithoutDeps=", watchWithoutDeps);
          const { target, trigger } = watch;

          // 如果已经初始化过，则跳过
          if (initializedRef.current.has(target)) {
            console.log("无依赖被跳过");
            continue;
          }

          const cacheKey = JSON.stringify({
            target,
            name: item.name,
            type: "init",
          });

          // 检查缓存
          const cachedResult = watchAttrCache.get(cacheKey);
          if (cachedResult !== null) {
            newProps = {
              ...newProps,
              [target]: cachedResult,
            };

            handleFormItemApi(cachedResult, newProps);
          } else {
            let triggerFn = trigger;
            if (typeof trigger === "string") {
              triggerFn = new Function("return " + trigger)();
            }

            const result = await triggerFn(null, form.getFieldsValue(), form);
            // 如果结果为空，跳过后续处理
            if (!result) continue;
            watchAttrCache.set(cacheKey, result);

            newProps = {
              ...newProps,
              [target]: result,
            };

            handleFormItemApi(result, newProps);
          }

          // 标记为已初始化
          initializedRef.current.add(target);
        }

        // 处理有依赖的配置
        for (const watch of watchWithDeps) {
          console.log("item.name", item.name);

          console.log("watchWithDeps=", watchWithDeps);
          const { dep, target, trigger } = watch;

          // 获取依赖项的当前值
          const depValue = watchedValues[dep];
          // 更新 ref 中的依赖值
          prevDepsRef.current[dep] = depValue;
          if (depValue !== undefined) {
            // 生成缓存键
            const cacheKey = JSON.stringify({
              dep,
              depValue,
              target,
              name: item.name,
            });
            console.log("cacheKey=", cacheKey);
            // 检查缓存
            const cachedResult = watchAttrCache.get(cacheKey);
            if (cachedResult !== null) {
              newProps = {
                ...newProps,
                [target]: cachedResult,
              };
              // 如果存在 formItemApi，根据缓存的结果更新校验规则
              handleFormItemApi(cachedResult, newProps);
              console.log("跳过api调用-newProps", newProps);
              continue; // 跳过 API 调用
            }
            // try {
            // 执行 trigger 函数（支持异步）
            let triggerFn = trigger;
            if (typeof trigger === "string") {
              // 如果 trigger 是字符串，将其转换为函数
              triggerFn = new Function("return " + trigger)();
            }

            const result = await triggerFn(depValue, form.getFieldsValue());
            // 如果结果为空，跳过后续处理
            if (!result) continue;
            // 存入缓存
            watchAttrCache.set(cacheKey, result);
            // 更新对应的 target 属性
            newProps = {
              ...newProps,
              [target]: result,
            };
            console.log(" api调用后newProps-", newProps);
            // 如果存在 formItemApi，根据新的结果更新校验规则
            handleFormItemApi(result, newProps);
          }
        }
        // 更新 props
        setDynamicProps(newProps);
      } catch (error) {
        console.error("Error in watchAttr:", error);
      } finally {
        setLoading(false);
      }
    };

    // 使用 debounce 避免频繁调用
    const debouncedHandle = debounce(handleWatchAttr, 300);
    debouncedHandle();

    // 清理函数
    return () => {
      debouncedHandle.cancel();
    };
  }, [watchAttr, watchedValues, form, compProps, item.name, formItemApi]); // 依赖项包含 watchedValues 以响应变化

  return {
    dynamicProps,
    formItemProps,
    loading,
  };
};
