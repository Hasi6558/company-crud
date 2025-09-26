'use client';
import React from 'react';
import { Form, Input, Select, Button } from 'antd';
import { Role } from '@/types';

const { Password } = Input;

interface UserFormValues {
  fullname: string;
  email: string;
  password: string;
  role: string;
}

interface UserFormProps {
  form: import('antd').FormInstance;
  roles: Role[];
  onFinish: (values: UserFormValues) => void | Promise<void>;
  submitText?: string;
  initialValues?: Partial<UserFormValues>;
}

const UserForm: React.FC<UserFormProps> = ({
  form,
  roles,
  onFinish,
  submitText = 'Submit',
  initialValues,
}) => {
  return (
    <Form
      form={form}
      layout="horizontal"
      labelCol={{ span: 8 }}
      labelAlign="right"
      wrapperCol={{ span: 16 }}
      colon={false}
      style={{ minWidth: 500 }}
      onFinish={onFinish}
      initialValues={initialValues}
    >
      <Form.Item label="Full Name :" name="fullname" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item label="Email :" name="email" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      {submitText === 'Add' && (
        <Form.Item label="Password :" name="password" rules={[{ required: true }]}>
          <Password />
        </Form.Item>
      )}
      <Form.Item label="Role :" name="role" rules={[{ required: true }]}>
        <Select placeholder="Select the role" style={{ width: '40%' }}>
          {roles.map((role) => (
            <Select.Option key={role.id} value={role.name}>
              {role.name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item className="flex justify-end">
        <Button type="primary" htmlType="submit">
          {submitText}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default UserForm;
