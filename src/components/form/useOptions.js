import { useState, useEffect } from "react";

export const useOptions = ({ optionsConfig, form, watchAttrCache }) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOptions = async () => {
      if (typeof optionsConfig !== "function") {
        setOptions(optionsConfig || []);
        return;
      }

      const cacheKey = JSON.stringify({
        type: "options",
        name: form.getFieldsValue(),
      });

      // 检查缓存
      const cachedResult = watchAttrCache.get(cacheKey);
      if (cachedResult !== null) {
        setOptions(cachedResult);
        return;
      }

      try {
        setLoading(true);
        const result = await optionsConfig(form);
        if (!result) {
          setOptions([]);
          return;
        }

        watchAttrCache.set(cacheKey, result);
        setOptions(result);
      } catch (error) {
        console.error("Error fetching options:", error);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, [optionsConfig, form]);

  return {
    options,
    loading,
  };
};
