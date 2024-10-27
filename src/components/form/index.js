import React, { useEffect, useMemo } from "react";
import { Button, Form, Input, Select, Space, InputNumber } from "antd";
const { Option } = Select;

// 自定义 Hook 用于监视多个字段
const useWatchFields = (form, fields) => {
  const watchedValues = {};
  fields.forEach((field) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    watchedValues[field] = Form.useWatch(field, form);
  });
  return watchedValues;
};

const getFields = (str) => {
  let filedReg = /formData\.(\w+)/g;
  let match;
  const arr = [];
  while ((match = filedReg.exec(str))) {
    arr.push(match[1]);
  }
  return arr;
};

const FormItem = ({ item, form }) => {
  const { type, props: compProps, show, child, options, computed } = item;
  let Comp = Input;
  switch (type) {
    case "input":
      Comp = Input;
      break;
    case "inputnumber":
      Comp = InputNumber;
      break;
    case "select":
      Comp = Select;
      break;
    default:
      Comp = Input;
      break;
  }
  // 处理计算字段
  console.log("item-name-", item.name);

  let value;
  if (computed) {
    compProps.disabled = true; // 计算字段应该是只读的
    const formValues = form.getFieldsValue();

    // 获取依赖字段
    const dependentFields =
      typeof computed === "string" ? getFields(computed) : [];

    // 检查所有依赖字段是否都有值
    const allFieldsHaveValue = dependentFields.every(
      (field) =>
        formValues[field] !== undefined &&
        formValues[field] !== null &&
        formValues[field] !== ""
    );

    if (allFieldsHaveValue) {
      if (typeof computed === "string") {
        // 如果 computed 是字符串，将其作为表达式计算
        const computeFunction = new Function("formData", `return ${computed}`);
        value = computeFunction(formValues);
      } else if (typeof computed === "function") {
        // 如果 computed 是函数，直接调用
        value = computed(formValues, form);
      }
      // 使用 setTimeout 来避免在渲染周期中修改表单值
      setTimeout(() => {
        form.setFieldValue(item.name, value);
      }, 0);
    } else {
      // 如果有依赖字段没有值，则将计算字段置为空
      value = undefined;
      setTimeout(() => {
        form.setFieldValue(item.name, undefined);
      }, 0);
    }
  }
  if (show) {
    const safeShow = show.replace(/formData(\.[\w]+)+/g, (match) => {
      const parts = match.split(".");
      return parts.reduce((acc, part, index) => {
        if (index === 0) return part;
        return `${acc}?.["${part}"]`;
      }, "");
    });
    const showCondition = new Function(
      "formData",
      `
      try {
        const result = ${safeShow};
        return typeof result === 'boolean' ? result : Boolean(result);
      } catch (error) {
        console.warn("Error evaluating show condition:", error);
        return false;
      }
    `
    );
    if (!showCondition(form.getFieldsValue())) {
      return null;
    }
  }
  let finalOptions = options;
  if (typeof options === "function") {
    finalOptions = options(form.getFieldsValue());
  }
  return (
    <Form.Item name={item.name} label={item.label}>
      {child ? (
        <Comp {...compProps}>{child.render()}</Comp>
      ) : (
        <Comp {...compProps} />
      )}
    </Form.Item>
  );
};

// 使用 React.memo 包裹 FormItem 组件，只有在依赖项变化时才重新渲染
const MemoizedFormItem = React.memo(FormItem, (prevProps, nextProps) => {
  const { item: prevItem, watchedValues: prevDependencyValues } = prevProps;
  const { item: nextItem, watchedValues: nextDependencyValues } = nextProps;
  // 检查当前字段的值是否发生变化
  const currentFieldChanged =
    prevDependencyValues[prevItem.name] !== nextDependencyValues[nextItem.name];

  // 检查依赖项的值是否发生变化
  const dependenciesChanged = (prevItem.dependencies || []).some(
    (dep) => prevDependencyValues[dep] !== nextDependencyValues[dep]
  );
  // 比较依赖项的值是否发生变化
  return !(currentFieldChanged || dependenciesChanged);
});

export const UForm = (props) => {
  const { list } = props;
  const [form] = Form.useForm();
  // 获取所有需要被监视的字段
  const fieldsToWatch = useMemo(() => {
    const fields = new Set();
    list.forEach((item) => {
      if (item.dependencies && item.dependencies.length > 0) {
        item.dependencies.forEach((dep) => fields.add(dep));
        fields.add(item.name); // 添加字段本身
      }
    });
    return Array.from(fields);
  }, [list]);
  // 使用自定义 Hook 监视字段
  const watchedValues = useWatchFields(form, fieldsToWatch);
  console.log("watchedValues-", watchedValues, fieldsToWatch);
  // const watchedValues = Form.useWatch(fieldsToWatch, form);
  const onFinish = (values) => {
    console.log("finish--values--", values);
  };
  const onReset = () => {
    form.resetFields();
  };

  window.form = form;

  return (
    <>
      <Form
        form={form}
        name="control-hooks"
        onFinish={onFinish}
        style={{
          maxWidth: 600,
        }}
      >
        {list.map((item) => (
          <MemoizedFormItem
            key={item.name}
            item={item}
            form={form}
            watchedValues={watchedValues}
          />
        ))}

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
            <Button htmlType="button" onClick={onReset}>
              Reset
            </Button>
            {/* <Button type="link" htmlType="button" onClick={onFill}>
            Fill form
          </Button> */}
          </Space>
        </Form.Item>
      </Form>
    </>
  );
};
export const MyForm = () => {
  const list = [
    {
      type: "input",
      name: "unique",
      label: "独立的一项",
      dependencies: [],
      props: {
        placeholder: "请输入...",
      },
    },
    {
      type: "input",
      name: "name",
      label: "Name",
      dependencies: [],
      props: {
        placeholder: "请输入...",
      },
    },

    {
      type: "select",
      name: "area",
      label: "Area",
      show: "formData.name & formData.age > 0 ",
      dependencies: ["name", "age"],
      props: {
        placeholder: "请输入...",
        mode: "multiple",
      },
      child: {
        render: () => (
          <>
            <Option value="hh" label="hh" />
            <Option value="jj" label="jj" />
          </>
        ),
      },
    },
    {
      type: "inputnumber",
      name: "age",
      label: "Age",
      dependencies: [],
      // show: (formData) => {
      //   console.log("formData=", formData);
      //   console.log("bool=", formData?.name?.length);
      //   return (formData?.name?.length || 0) >= 3;
      // },
      props: {
        placeholder: "请输入...",
      },
    },
    {
      type: "select",
      name: "country",
      label: "Country",
      dependencies: [],

      props: {
        placeholder: "请选择国家...",
        options: [
          { value: "china", label: "China" },
          { value: "usa", label: "USA" },
          { value: "japan", label: "Japan" },
        ],
      },
    },
    {
      type: "select",
      name: "city",
      label: "City",
      dependencies: [],

      props: {
        placeholder: "请选择城市...",
        options: [
          { value: "beijing", label: "Beijing" },
          { value: "shanghai", label: "Shanghai" },
        ],
      },
    },
    {
      type: "input",
      name: "country-city",
      dependencies: ["city", "country"],

      label: "国家-城市",
      computed: "formData.country +'-'+ formData.city",
      props: {
        placeholder: "请输入...",
      },
    },
    {
      type: "input",
      name: "country-city2",
      label: "国家-城市2",
      dependencies: ["city", "country"],

      computed: (formData, form) => {
        if (!formData.country || !formData.city) return undefined;
        console.log(`我的国家：${formData.country}+城市:${formData.city}`);
        return `我的国家：${formData.country}+城市:${formData.city}`;
      },
      props: {
        placeholder: "请输入...",
      },
    },
  ];
  return (
    <>
      <UForm list={list} />
    </>
  );
};
