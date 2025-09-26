import { Button, Form, Input, Modal, Select } from 'antd';
import Password from 'antd/es/input/Password';
import React from 'react';

interface UserFormValues {
  fullname: string;
  email: string;
  password: string;
  role: string;
}
interface AddUserProps {
  roles: {
    id: string;
    name: string;
  }[];
  initialValues?: Partial<UserFormValues>;
  open: boolean;
  onCancel: () => void;
  handleUserCreate?: (value: UserFormValues) => void;
}
const AddUserModal: React.FC<AddUserProps> = ({
  roles,
  initialValues,
  open,
  onCancel,
  handleUserCreate,
}) => {
  const [form] = Form.useForm();

  const handleCancel = () => {
    form.resetFields(); // Clear all form fields
    onCancel();
  };

  return (
    <Modal open={open} title="Add User" onCancel={handleCancel} onOk={form.submit} okText="Add">
      <Form
        form={form}
        layout="horizontal"
        labelCol={{ span: 8 }}
        labelAlign="left"
        wrapperCol={{ span: 16 }}
        colon={false}
        onFinish={(value) => {
          handleUserCreate?.(value);
          form.resetFields(); // Clear form after submission
        }}
        initialValues={initialValues}
      >
        <Form.Item label="Full Name :" name="fullname" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Email :" name="email" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item label="Password :" name="password" rules={[{ required: true }]}>
          <Password />
        </Form.Item>

        <Form.Item label="Role :" name="role" rules={[{ required: true }]}>
          <Select placeholder="Select the role" style={{ width: '40%' }}>
            {roles.map((role: { id: string; name: string }) => (
              <Select.Option key={role.id} value={role.name}>
                {role.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddUserModal;
