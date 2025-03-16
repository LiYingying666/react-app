import { Form, Button } from "antd";
import JsonEditor from "./index";

const FormTestJson = () => {
    const [form] = Form.useForm();

    const submit = () => {
        const values = form.getFieldsValue();
        console.log(
            "Submitted:",
            values.config,
            typeof values.config,
            JSON.parse(values.config)
        );
    };
    const handleSetting = () => {
        form.setFieldsValue({ config: '{"name":"test"}' });
    };
    return (
        <Form
            form={form}
            // initialValues={{ config: '{"name":"test"}' }}
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 20 }}
            style={{ width: "100vw" }}
        >
            <Form.Item name="config" label="配置项">
                <JsonEditor width="100%" />
            </Form.Item>

            <Button type="primary" onClick={submit}>
                提交
            </Button>
            <Button onClick={handleSetting}>设置数据</Button>
        </Form>
    );
};
export default FormTestJson;
