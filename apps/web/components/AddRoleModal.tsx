import { Input, Form, Modal } from 'antd';
import React from 'react';

interface EditRoleProp {
  open: boolean;
  onCancel: () => void;
  addRole: (roleName: string) => void;
}

const AddRoleModal: React.FC<EditRoleProp> = ({ open, onCancel, addRole }) => {
  const [form] = Form.useForm();

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
