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

export const CustomForm = (props) => {
  const { list } = props;
  const [form] = Form.useForm();
  // 获取所有需要被监视的字段
  const fieldsToWatch = useMemo(() => {
    return list
      .filter((item) => item.show)
      .map((item) => {
        const match = item.show.match(/formData\.(\w+)/);
        return match ? match[1] : null;
      })
      .filter(Boolean);
  }, [list]);
  // 使用自定义 Hook 监视字段
  useWatchFields(form, fieldsToWatch);
  // const map = useRef(new Map());
  // const nameValue = Form.useWatch("name", form);
  // [2].forEach((item) => {
  //   Form.useWatch("name", form);
  // });
  const onGenderChange = (value) => {
    console.log("value--", value);
  };
  const onFinish = (values) => {
    console.log("finish--values--", values);
  };
  const onReset = () => {
    form.resetFields();
  };

  const renderItem = (item) => {
    const { type, props: compProps, show, child } = item;
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
  // console.log("form--", form);
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
        {list.map((item) => {
          return <>{renderItem(item)}</>;
        })}

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
      name: "name",
      label: "Name",
      props: {
        placeholder: "请输入...",
      },
    },
    {
      type: "inputnumber",
      name: "age",
      label: "Age",
      show: "formData.name.length >=3",
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
      name: "area",
      label: "Area",
      props: {
        placeholder: "请输入...",
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
  ];
  return (
    <>
      <CustomForm list={list} />
    </>
  );
};
