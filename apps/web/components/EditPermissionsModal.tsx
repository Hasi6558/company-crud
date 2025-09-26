'use client';
import React from 'react';
import { Modal, Form, Checkbox } from 'antd';
import { Role } from '@/types';
import { PERMISSION_OPTIONS } from '@/constants/permissions';

interface EditPermissionsModalProps {
  open: boolean;
  role: Role | null;
  selectedPermissions: string[];
  onCancel: () => void;
  onSave: () => void;
  onPermissionChange: (checkedValues: string[]) => void;
}

const EditPermissionsModal: React.FC<EditPermissionsModalProps> = ({
  open,
  role,
  selectedPermissions,
  onCancel,
  onSave,
  onPermissionChange,
}) => {
  return (
    <Modal title="Edit Permissions" open={open} onOk={onSave} onCancel={onCancel}>
      <Form>
        <Checkbox.Group
          options={PERMISSION_OPTIONS}
          value={selectedPermissions}
          onChange={onPermissionChange}
        />
      </Form>
    </Modal>
  );
};

export default EditPermissionsModal;
