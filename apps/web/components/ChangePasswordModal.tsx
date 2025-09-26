import { Form, Input, Modal } from 'antd';
import Password from 'antd/es/input/Password';
import React from 'react';

interface ChangePasswordProp {
  open: boolean;
  onCancel?: () => void;
  changePassword?: (newPassword: string) => void;
}
const ChangePasswordModal: React.FC<ChangePasswordProp> = ({ open, onCancel, changePassword }) => {
  const [form] = Form.useForm();
  const handleOnCancel = () => {
    form.resetFields();
    onCancel?.();
  };
  return (
    <Modal
      open={open}
      title="Change Password"
      okText="Change"
      style={{ minWidth: 600 }}
      onCancel={handleOnCancel}
      onOk={() => {
        form
          .validateFields()
          .then((values) => {
            const { newpassword } = values;
            changePassword?.(newpassword);
          })
          .catch((errorInfo) => {
            console.error('Failed to validate fields:', errorInfo);
          });
      }}
    >
      <Form
        form={form}
        layout="horizontal"
        labelCol={{ span: 8 }}
        labelAlign="left"
        wrapperCol={{ span: 16 }}
        colon={false}
        style={{ minWidth: 400, marginTop: 20, marginBottom: 20 }}
      >
        <Form.Item
          label="New password :"
          name="newpassword"
          rules={[
            { required: true, message: 'Please enter your new password' },
            { min: 6, message: 'Password must be at least 6 characters' },
          ]}
        >
          <Password />
        </Form.Item>
        <Form.Item
          label="Confirm new password :"
          name="confirmpassword"
          dependencies={['Password']}
          rules={[
            { required: true, message: 'Please confirm your password' },
            // custom validator to match passwords
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newpassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('The two passwords do not match'));
              },
            }),
          ]}
        >
          <Password />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ChangePasswordModal;
