import { Form, Input, Button } from "antd";

export const DynamicForm = () => {
  const [form] = Form.useForm();

  const onFinish = (values) => {
    console.log("Received values:", values);
  };

  return (
    <Form form={form} onFinish={onFinish}>
      <Form.Item
        name="name111"
        validateTrigger={["onChange", "onBlur"]}
        rules={[
          {
            required: true,
            whitespace: true,
            message: "Please input user's name or delete this field.",
          },
        ]}
      >
        <Input placeholder="User name" style={{ width: "60%" }} />
      </Form.Item>
      <Form.List name="users">
        {(fields, { add, remove }) => (
          <>
            {fields.map((field, index) => (
              <Form.Item required={false} key={field.key}>
                <Form.Item
                  {...field}
                  validateTrigger={["onChange", "onBlur"]}
                  rules={[
                    {
                      required: true,
                      whitespace: true,
                      message: "Please input user's name or delete this field.",
                    },
                  ]}
                >
                  <Input placeholder="User name" style={{ width: "60%" }} />
                </Form.Item>
                {fields.length > 1 && (
                  <Button type="link" onClick={() => remove(field.name)}>
                    Delete
                  </Button>
                )}
              </Form.Item>
            ))}
            <Form.Item>
              <Button type="dashed" onClick={() => add()} block>
                Add User
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
};
