'use client';
import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, Button } from 'antd';
import { User, Role } from '@/types';

interface EditUserModalProps {
  open: boolean;
  user: User | null;
  roles: Role[];
  onCancel: () => void;
  onSave: (values: { fullname: string; email: string; role: string }) => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ open, user, roles, onCancel, onSave }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (user && open) {
      form.setFieldsValue({
        fullname: user.fullName,
        email: user.email,
        role: user.role?.name,
      });
    }
  }, [user, open, form]);

  return (
    <Modal open={open} onCancel={onCancel} onOk={form.submit} okText="Save">
      {user && (
        <div>
          <h1 className="text-lg mb-4">Edit User Info</h1>
          <Form
            form={form}
            layout="horizontal"
            labelCol={{ span: 8 }}
            labelAlign="left"
            labelWrap
            wrapperCol={{ span: 16 }}
            colon={false}
            style={{ maxWidth: 600 }}
            onFinish={onSave}
          >
            <Form.Item label="Full Name :" name="fullname" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item label="Email :" name="email" rules={[{ required: true, type: 'email' }]}>
              <Input />
            </Form.Item>
            <Form.Item label="Role :" name="role" rules={[{ required: true }]}>
              <Select placeholder="Select Role">
                {roles.map((role) => (
                  <Select.Option key={role.id} value={role.name}>
                    {role.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
        </div>
      )}
    </Modal>
  );
};

export default EditUserModal;
