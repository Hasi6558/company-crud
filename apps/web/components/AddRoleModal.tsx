'use client';
import { Input, Form, Modal, FormInstance } from 'antd';
import React, { useEffect } from 'react';

interface EditRoleProp {
  open: boolean;
  onCancel: () => void;
  addRole: (roleName: string) => void;
  onFormReady?: (form: FormInstance) => void;
}

const AddRoleModal: React.FC<EditRoleProp> = ({ open, onCancel, addRole, onFormReady }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    onFormReady?.(form);
  }, [form, onFormReady]);

  useEffect(() => {
    if (open) {
      form.resetFields();
    }
  }, [open, form]);

  return (
    <Modal open={open} onCancel={onCancel} okText="Add" title="Add New Role" onOk={form.submit}>
      <Form
        form={form}
        onFinish={(value) => addRole(value.roleName)}
        layout="horizontal"
        labelCol={{ span: 8 }}
        labelAlign="left"
        labelWrap
        wrapperCol={{ span: 16 }}
        colon={false}
        style={{ minWidth: 400 }}
      >
        <Form.Item
          label="Role Name :"
          name="roleName"
          rules={[{ required: true, message: 'Please input the role name!' }]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddRoleModal;
