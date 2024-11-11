import React, { useEffect, useMemo, useRef, useState } from "react";
import { cloneDeep, debounce, last } from "lodash";
import { Button, Form, Input, Select, Space, InputNumber, Divider } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import CacheManager from "./cacheManage";
import { useDynamicProps } from "./useDaynamicProps";
import { useOptions } from "./useOptions";

const { Option } = Select;
// 创建一个全局的缓存实例
const watchAttrCache = new CacheManager();

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
const FormItem = ({ item, form, watchedValues, dependencies }) => {
  const { type, props: compProps, show, child, options, computed } = item;

  const {
    dynamicProps,
    loading: dynamicLoading,
    formItemProps,
  } = useDynamicProps({
    item,
    form,
    watchedValues,
    watchAttrCache,
  });
  // 处理 options
  const { options: selectOptions, loading: optionsLoading } = useOptions({
    optionsConfig: compProps?.options,
    form,
    watchAttrCache,
  });

  // 处理 Form.List 类型
  // if (type === "form-list") {
  //   return (
  //     <Form.List name={item.name}>
  //       {(fields, { add, remove }) => (
  //         <>
  //           {fields.map((field, index) => (
  //             <Space
  //               key={field.key}
  //               style={{ display: "flex", marginBottom: 8 }}
  //               align="baseline"
  //             >
  //               {item.children.map((childItem) => (
  //                 <MemoizedFormItem
  //                   key={`${childItem.name}-${field.key}`}
  //                   item={{
  //                     ...childItem,
  //                     name: field.name,
  //                     label: `${childItem.label}-${index}`,
  //                   }}
  //                   form={form}
  //                   watchedValues={watchedValues}
  //                 />
  //               ))}
  //               {fields.length > 1 && (
  //                 <MinusCircleOutlined onClick={() => remove(field.name)} />
  //               )}
  //             </Space>
  //           ))}
  //           <Form.Item>
  //             <Button
  //               type="dashed"
  //               onClick={() => add()}
  //               block
  //               icon={<PlusOutlined />}
  //             >
  //               Add {item.label}
  //             </Button>
  //           </Form.Item>
  //         </>
  //       )}
  //     </Form.List>
  //   );
  // }
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
  // console.log("item-name-", item.name);

  let value;
  if (computed) {
    // compProps.disabled = true; // 计算字段应该是只读的
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
  // 合并 props 和 loading 状态
  const finalProps = {
    ...compProps,
    options: type === "select" ? selectOptions : undefined,
    ...dynamicProps,
    loading: dynamicLoading || optionsLoading,
  };
  console.log("compProps=", compProps);
  console.log("dynamicProps=", dynamicProps);
  return (
    <Form.Item
      name={item.name}
      label={item.label}
      dependencies={dependencies}
      {...formItemProps}
    >
      {child ? (
        <Comp {...finalProps}>{child.render()}</Comp>
      ) : (
        <Comp {...finalProps} />
      )}
    </Form.Item>
  );
};

// 使用 React.memo 包裹 FormItem 组件，只有在依赖项变化时才重新渲染
const MemoizedFormItem = React.memo(FormItem, (prevProps, nextProps) => {
  const { item: prevItem, watchedValues: prevDependencyValues } = prevProps;
  const { item: nextItem, watchedValues: nextDependencyValues } = nextProps;
  // console.log("prevItem-", prevItem);
  // console.log("nextItem-", nextItem);
  // 检查当前字段的值是否发生变化
  const currentFieldChanged =
    prevDependencyValues[prevItem.name] !== nextDependencyValues[nextItem.name];

  // 检查依赖项的值是否发生变化
  const dependenciesChanged = (prevItem.dependencies || []).some(
    (dep) => prevDependencyValues[dep] !== nextDependencyValues[dep]
  );
  const propsChanged =
    JSON.stringify(prevItem.props) !== JSON.stringify(nextItem.props);
  console.log("propsChanged=", propsChanged);
  // 比较依赖项的值是否发生变化
  return !(currentFieldChanged || dependenciesChanged || propsChanged);
});

export const UForm = (props) => {
  const { list } = props;
  const [form] = Form.useForm();
  // 获取所有需要被监视的字段
  const fieldsToWatch = useMemo(() => {
    const fields = new Set();
    const addFieldsRecursively = (items, isChild = false) => {
      items.forEach((item, index) => {
        if (item.dependencies && item.dependencies.length > 0) {
          item.dependencies.forEach((dep) => fields.add(dep));
          if (!isChild) {
            fields.add(item.name);
          } else {
            fields.add(`${item.name}-${index}`);
          }
        }

        // 处理 Form.List 的情况
        if (item.type === "form-list" && item.children) {
          // 为 Form.List 的每个子项添加一个通配符字段
          fields.add(`${item.name}`);

          // 递归处理 Form.List 的子项
          addFieldsRecursively(item.children, true);
        }
      });
    };

    addFieldsRecursively(list, false);
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
    watchAttrCache.clear();
    // formItemApiCache.clear(); // 清除 formItemApi 缓存
  };

  window.form = form;

  const renderListItems = (list) => {
    return list.map((item) => {
      if (item.type === "form-list") {
        return (
          <MemoizedFormItem
            key={item.name}
            item={item}
            form={form}
            watchedValues={watchedValues}
          />
        );
      }
      return (
        <MemoizedFormItem
          key={item.name}
          item={item}
          form={form}
          watchedValues={watchedValues}
        />
      );
    });
  };

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
        {renderListItems(list)}

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
            <Button htmlType="button" onClick={onReset}>
              Reset
            </Button>
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
      type: "select",
      name: "number0",
      label: "选择数字",
      dependencies: [],

      props: {
        placeholder: "请选择数字动态获取...",
        options: (form) => {
          return [
            {
              label: 1,
              value: 1,
            },
          ];
        },
        options: async (form) => {
          const ret = await fetch(`/api/getOptions?id=${1}`);
          const res = await ret.json();
          console.log("res--", res);
          return res;
        },
      },
    },
    {
      type: "select",
      name: "number1",
      label: "根据数字动态获取options",
      dependencies: ["number0"],
      formItemApi: {
        rules: [{ required: true }],
      },
      formItemApi: (currentVal, currentProps, form) => {
        const res = currentVal;
        console.log("formItemApi-currentVal-=", currentVal);
        if (!res) return {};
        return {
          rules: [
            { required: res.length < 2 },
            {
              validator: () => {
                // currentVal 是 watchAttr trigger 返回的数据
                if (!currentVal || currentVal.length < 2) {
                  return Promise.reject(new Error("选项数量必须大于2"));
                }
                // 可以访问当前组件的所有 props
                console.log("Current props:", currentProps);
                // 可以访问表单实例
                console.log("Form values:", form.getFieldsValue());
                return Promise.resolve();
              },
            },
          ],
        };
      },
      watchAttr: [
        {
          // dep: "number0",
          target: "options",
          trigger: async (depValue, formData, form) => {
            console.log("depValue-", depValue);
            // return [
            //   {
            //     label: "qqq",
            //     value: 7,
            //   },
            // ];
            const ret = await fetch(`/api/getOptions?id=${depValue}`);
            const res = await ret.json();
            console.log("res--", res);
            return res;
          },
        },
      ],
      props: {
        placeholder: "根据数字动态获取options",
      },
    },
    {
      type: "select",
      name: "number3",
      label: "选择数字2",
      dependencies: [],

      props: {
        placeholder: "请选择数字动态获取...",
        options: [
          { value: "1", label: "1" },
          { value: "2", label: "2" },
          { value: "3", label: "3" },
        ],
      },
    },
    {
      type: "select",
      name: "number4",
      label: "根据数字动态获取options2",
      dependencies: ["number3"],
      watchAttr: [
        {
          dep: "number3",
          target: "options",
          trigger: async (depValue) => {
            console.log("depValue-", depValue);
            const ret = await fetch(`/api/getOptions?id=${depValue}`);
            const res = await ret.json();
            console.log("res--", res);
            return res;
          },
        },
      ],
      props: {
        placeholder: "根据数字动态获取options",
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
      show: "formData.name && formData.age > 0 ",
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
  const [formList, setFormList] = useState(list);
  const handleClick = () => {
    const cloneList = cloneDeep(formList);
    cloneList[1].props.options = [
      { value: "1", label: "1" },
      { value: "2", label: "2" },
      { value: "3", label: "3" },
    ];
    setFormList(cloneList);
  };
  return (
    <>
      <Button type="primary" onClick={handleClick}>
        变化数据
      </Button>
      <Divider />
      <UForm list={formList} />
    </>
  );
};
