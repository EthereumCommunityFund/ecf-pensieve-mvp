'use client';

import { Spinner, type Selection } from '@heroui/react';
import type { Key } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { formatAddress } from '@/components/auth/UserProfileSection';
import { Button } from '@/components/base/button';
import { Input } from '@/components/base/input';
import {
  CommonModalHeader,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
} from '@/components/base/modal';
import { Select, SelectItem } from '@/components/base/select';
import { addToast } from '@/components/base/toast';
import Copy from '@/components/biz/common/Copy';
import {
  ADMIN_WHITELIST_ROLES,
  type AdminWhitelistRole,
} from '@/lib/services/adminWhitelist.shared';
import { trpc, type RouterOutputs } from '@/lib/trpc/client';

type AdminWhitelistEntry = RouterOutputs['adminWhitelist']['list'][number];

type CreateFormValues = {
  address: string;
  nickname: string;
  role: AdminWhitelistRole;
  status: 'active' | 'disabled';
};

type EditFormValues = {
  nickname: string;
  role: AdminWhitelistRole;
  status: 'active' | 'disabled';
};

const roleDisplayName: Record<AdminWhitelistRole, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  extra: 'Extra',
};

const selectableRoles = ADMIN_WHITELIST_ROLES.filter(
  (role) => role !== 'super_admin',
);

const statusOptions: Array<{ value: 'active' | 'disabled'; label: string }> = [
  { value: 'active', label: 'Active' },
  { value: 'disabled', label: 'Disabled' },
];

const toStatusValue = (isDisabled?: boolean | null): 'active' | 'disabled' =>
  isDisabled ? 'disabled' : 'active';

const defaultCreateValues: CreateFormValues = {
  address: '',
  nickname: '',
  role: 'admin',
  status: 'active',
};

const defaultEditValues: EditFormValues = {
  nickname: '',
  role: 'admin',
  status: 'active',
};

const toSelection = (value?: string | null): Selection => {
  if (!value) {
    return new Set<Key>() as Selection;
  }
  return new Set<Key>([value as Key]) as Selection;
};

const getFirstKey = (selection: Selection): Key | null => {
  if (selection === 'all') return null;
  const iterator = selection.values().next();
  return iterator.done ? null : iterator.value;
};

export const AdminRolePage = () => {
  const utils = trpc.useUtils();

  const {
    data: entries,
    isLoading,
    error,
  } = trpc.adminWhitelist.list.useQuery(undefined, {
    suspense: false,
    staleTime: 30 * 1000,
  });

  const refreshWhitelist = useCallback(async () => {
    await utils.adminWhitelist.list.invalidate();
    await utils.adminWhitelist.list.refetch();
  }, [utils]);

  const createForm = useForm<CreateFormValues>({
    defaultValues: defaultCreateValues,
    mode: 'onBlur',
  });

  const editForm = useForm<EditFormValues>({
    defaultValues: defaultEditValues,
  });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<AdminWhitelistEntry | null>(
    null,
  );
  const [deletingEntry, setDeletingEntry] =
    useState<AdminWhitelistEntry | null>(null);
  const isEditingImmutable = editingEntry?.isImmutable ?? false;

  useEffect(() => {
    if (!editingEntry) {
      editForm.reset({ ...defaultEditValues });
      return;
    }

    editForm.reset({
      nickname: editingEntry.nickname ?? '',
      role: editingEntry.role ?? 'admin',
      status: toStatusValue(editingEntry.isDisabled),
    });
  }, [editForm, editingEntry]);

  const createMutation = trpc.adminWhitelist.create.useMutation({
    onSuccess: async (created) => {
      addToast({
        color: 'success',
        title: 'Wallet added',
        description: 'The wallet has been added to the admin whitelist.',
      });
      if (created) {
        await utils.adminWhitelist.list.setData(undefined, (current) => {
          const next = (current ?? []).concat(created);
          return next.sort((a, b) => {
            const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return aTime - bTime;
          });
        });
      }
      await refreshWhitelist();
      setIsCreateModalOpen(false);
      createForm.reset({ ...defaultCreateValues });
    },
    onError: (mutationError) => {
      addToast({
        color: 'danger',
        title: 'Failed to add wallet',
        description:
          mutationError.message ?? 'Please check the input and try again.',
      });
    },
  });

  const updateMutation = trpc.adminWhitelist.update.useMutation({
    onSuccess: async (updated) => {
      addToast({
        color: 'success',
        title: 'Entry updated',
        description: 'The admin entry has been updated successfully.',
      });
      if (updated) {
        await utils.adminWhitelist.list.setData(undefined, (current) => {
          if (!current) return current;
          return current.map((entry) =>
            entry.id === updated.id ? { ...entry, ...updated } : entry,
          );
        });
      }
      await refreshWhitelist();
      setIsEditModalOpen(false);
      setEditingEntry(null);
      editForm.reset({ ...defaultEditValues });
    },
    onError: (mutationError) => {
      addToast({
        color: 'danger',
        title: 'Failed to update entry',
        description:
          mutationError.message ?? 'Please check the input and try again.',
      });
    },
  });

  const deleteMutation = trpc.adminWhitelist.delete.useMutation({
    onSuccess: async (deleted) => {
      addToast({
        color: 'success',
        title: 'Entry removed',
        description: 'The wallet has been removed from the admin whitelist.',
      });
      await utils.adminWhitelist.list.setData(undefined, (current) => {
        if (!current || !deleted) return current;
        return current.filter((entry) => entry.id !== deleted.id);
      });
      await refreshWhitelist();
      setIsDeleteModalOpen(false);
      setDeletingEntry(null);
    },
    onError: (mutationError) => {
      addToast({
        color: 'danger',
        title: 'Failed to remove entry',
        description: mutationError.message ?? 'Please try again later.',
      });
    },
  });

  const handleOpenCreateModal = () => {
    createForm.reset({ ...defaultCreateValues });
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    if (createMutation.isPending) return;
    setIsCreateModalOpen(false);
    createForm.reset({ ...defaultCreateValues });
  };

  const handleOpenEditModal = (entry: AdminWhitelistEntry) => {
    setEditingEntry(entry);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    if (updateMutation.isPending) return;
    setIsEditModalOpen(false);
    setEditingEntry(null);
    editForm.reset({ ...defaultEditValues });
  };

  const handleOpenDeleteModal = (entry: AdminWhitelistEntry) => {
    if (entry.isImmutable) {
      return;
    }
    setDeletingEntry(entry);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    if (deleteMutation.isPending) return;
    setIsDeleteModalOpen(false);
    setDeletingEntry(null);
  };

  const handleCreate = createForm.handleSubmit(async (values) => {
    await createMutation.mutateAsync({
      address: values.address.trim(),
      nickname: values.nickname.trim() || undefined,
      role: values.role,
      isDisabled: values.status === 'disabled',
    });
  });

  const handleUpdate = editForm.handleSubmit(async (values) => {
    if (!editingEntry) return;

    await updateMutation.mutateAsync({
      id: editingEntry.id,
      nickname: values.nickname.trim() || undefined,
      role: values.role,
      isDisabled: values.status === 'disabled',
    });
  });

  const handleDeleteConfirm = async () => {
    if (!deletingEntry || deletingEntry.isImmutable) return;
    await deleteMutation.mutateAsync({ id: deletingEntry.id });
  };

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 px-4 py-8">
      <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-[0_8px_24px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-[24px] font-semibold leading-[32px] text-black">
              Admin role management
            </h1>
            <p className="text-[14px] leading-[22px] text-black/70">
              Review, add, or disable admin wallets. Environment-sourced wallets
              are read-only and cannot be edited from this interface.
            </p>
          </div>
          <Button
            color="primary"
            onPress={handleOpenCreateModal}
            isDisabled={createMutation.isPending}
          >
            Add admin wallet
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-black/10 bg-white p-0 shadow-[0_8px_24px_rgba(0,0,0,0.05)]">
        <div className="border-b border-black/10 px-6 py-4">
          <h2 className="text-[18px] font-semibold leading-[24px] text-black">
            Whitelist entries
          </h2>
        </div>

        {isLoading ? (
          <div className="flex min-h-[200px] items-center justify-center">
            <Spinner size="lg" className="text-black" />
          </div>
        ) : error ? (
          <div className="flex flex-col gap-3 px-6 py-8">
            <span className="text-[14px] leading-[20px] text-red-500">
              Failed to load admin whitelist.
            </span>
            <Button
              size="sm"
              color="primary"
              onPress={() => {
                refreshWhitelist().catch(() => {});
              }}
            >
              Retry
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead className="bg-black/[0.03] text-left text-[13px] uppercase tracking-wide text-black/60">
                <tr>
                  <th className="px-6 py-3 font-medium">Wallet</th>
                  <th className="px-6 py-3 font-medium">Nickname</th>
                  <th className="px-6 py-3 font-medium">Role</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Created</th>
                  <th className="px-6 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="text-[14px] text-black">
                {(entries ?? []).map((entry) => {
                  const statusLabel = entry.isDisabled ? 'Disabled' : 'Active';
                  const isEnvironmentEntry = entry.source === 'environment';
                  const isImmutableEntry = entry.isImmutable;
                  const createdLabel = entry.createdAt
                    ? new Date(entry.createdAt).toLocaleString()
                    : '—';
                  const displayAddress = formatAddress(entry.address);
                  return (
                    <tr
                      key={entry.id}
                      className="border-b border-black/[0.08] last:border-b-0"
                    >
                      <td className="px-6 py-4 font-mono text-[13px]">
                        <Copy
                          text={entry.address}
                          message={'Wallet address copied'}
                          useCustomChildren={true}
                        >
                          <div className="cursor-pointer hover:text-black/60">
                            {displayAddress}
                          </div>
                        </Copy>
                      </td>
                      <td className="px-6 py-4 text-[14px]">
                        {entry.nickname?.trim() || '—'}
                      </td>
                      <td className="px-6 py-4 text-[14px]">
                        <div className="flex items-center gap-2">
                          <span>{roleDisplayName[entry.role]}</span>
                          {isEnvironmentEntry && (
                            <span className="rounded-[8px] bg-black/[0.05] px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-black/60">
                              Env config
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[14px]">
                        {statusLabel}
                        {isImmutableEntry && !entry.isDisabled && (
                          <span className="ml-2 text-[12px] text-black/50">
                            Locked
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-[13px] text-black/60">
                        {createdLabel}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            onPress={() => handleOpenEditModal(entry)}
                            isDisabled={updateMutation.isPending}
                          >
                            {isImmutableEntry ? 'Edit Nickname' : 'Edit'}
                          </Button>
                          <Button
                            size="sm"
                            color="primary"
                            onPress={() => handleOpenDeleteModal(entry)}
                            isDisabled={
                              deleteMutation.isPending || isImmutableEntry
                            }
                          >
                            Remove
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {entries && entries.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-10 text-center text-[14px] text-black/60"
                    >
                      No admin wallets found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        placement="center"
        isDismissable={!createMutation.isPending}
      >
        <ModalContent>
          <form className="flex flex-col" onSubmit={handleCreate}>
            <CommonModalHeader
              title="Add admin wallet"
              onClose={handleCloseCreateModal}
              isDisabled={createMutation.isPending}
            />
            <ModalBody className="flex flex-col gap-4">
              <Controller
                control={createForm.control}
                name="address"
                rules={{
                  required: 'Wallet address is required.',
                  minLength: {
                    value: 10,
                    message: 'Enter a valid wallet address.',
                  },
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Wallet address, 0x..."
                    errorMessage={createForm.formState.errors.address?.message}
                  />
                )}
              />

              <Controller
                control={createForm.control}
                name="nickname"
                rules={{
                  maxLength: {
                    value: 120,
                    message: 'Nickname cannot exceed 120 characters.',
                  },
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Nickname(Optional)"
                    errorMessage={createForm.formState.errors.nickname?.message}
                  />
                )}
              />

              <Controller
                control={createForm.control}
                name="role"
                render={({ field }) => (
                  <Select
                    selectedKeys={toSelection(field.value ?? 'admin')}
                    onSelectionChange={(selected) => {
                      const firstKey = getFirstKey(selected);
                      field.onChange(
                        (firstKey as AdminWhitelistRole) ?? 'admin',
                      );
                    }}
                    classNames={{
                      trigger: 'h-[42px]',
                    }}
                  >
                    {selectableRoles.map((role) => (
                      <SelectItem key={role}>
                        {roleDisplayName[role]}
                      </SelectItem>
                    ))}
                  </Select>
                )}
              />

              <Controller
                control={createForm.control}
                name="status"
                render={({ field }) => (
                  <Select
                    selectedKeys={toSelection(field.value ?? 'active')}
                    onSelectionChange={(selected) => {
                      const firstKey = getFirstKey(selected);
                      field.onChange(
                        (firstKey as 'active' | 'disabled') ?? 'active',
                      );
                    }}
                    classNames={{
                      trigger: 'h-[42px]',
                    }}
                  >
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value}>{option.label}</SelectItem>
                    ))}
                  </Select>
                )}
              />
            </ModalBody>
            <ModalFooter>
              <Button
                onPress={handleCloseCreateModal}
                isDisabled={createMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                color="primary"
                type="submit"
                isLoading={createMutation.isPending}
                isDisabled={createMutation.isPending}
              >
                Add wallet
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        placement="center"
        isDismissable={!updateMutation.isPending}
      >
        <ModalContent>
          <form className="flex flex-col" onSubmit={handleUpdate}>
            <CommonModalHeader
              title="Edit admin entry"
              description={
                editingEntry ? `Address: ${editingEntry.address}` : undefined
              }
              onClose={handleCloseEditModal}
              isDisabled={updateMutation.isPending}
            />
            <ModalBody className="flex flex-col gap-4">
              <Controller
                control={editForm.control}
                name="nickname"
                rules={{
                  maxLength: {
                    value: 120,
                    message: 'Nickname cannot exceed 120 characters.',
                  },
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Optional nickname"
                    errorMessage={editForm.formState.errors.nickname?.message}
                  />
                )}
              />

              <Controller
                control={editForm.control}
                name="role"
                render={({ field }) => (
                  <Select
                    selectedKeys={toSelection(field.value ?? 'admin')}
                    onSelectionChange={(selected) => {
                      const firstKey = getFirstKey(selected);
                      field.onChange(
                        (firstKey as AdminWhitelistRole) ?? 'admin',
                      );
                    }}
                    classNames={{
                      trigger: 'h-[42px]',
                    }}
                    isDisabled={isEditingImmutable}
                  >
                    {selectableRoles.map((role) => (
                      <SelectItem key={role}>
                        {roleDisplayName[role]}
                      </SelectItem>
                    ))}
                  </Select>
                )}
              />

              <Controller
                control={editForm.control}
                name="status"
                render={({ field }) => (
                  <Select
                    selectedKeys={toSelection(field.value ?? 'active')}
                    onSelectionChange={(selected) => {
                      const firstKey = getFirstKey(selected);
                      field.onChange(
                        (firstKey as 'active' | 'disabled') ?? 'active',
                      );
                    }}
                    classNames={{
                      trigger: 'h-[42px]',
                    }}
                    isDisabled={isEditingImmutable}
                  >
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value}>{option.label}</SelectItem>
                    ))}
                  </Select>
                )}
              />
              {isEditingImmutable && (
                <p className="text-[12px] leading-[18px] text-black/50">
                  Environment-provisioned wallets have a fixed role and status.
                  You can update the nickname for display purposes only.
                </p>
              )}
            </ModalBody>
            <ModalFooter>
              <Button
                onPress={handleCloseEditModal}
                isDisabled={updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                color="primary"
                type="submit"
                isLoading={updateMutation.isPending}
                isDisabled={updateMutation.isPending}
              >
                Save changes
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        placement="center"
        isDismissable={!deleteMutation.isPending}
      >
        <ModalContent>
          <CommonModalHeader
            title="Remove admin wallet"
            onClose={handleCloseDeleteModal}
            isDisabled={deleteMutation.isPending}
          />
          <ModalBody>
            <p className="text-[14px] leading-[20px] text-black/80">
              {deletingEntry
                ? `Remove wallet ${deletingEntry.address}? This action cannot be undone.`
                : 'Remove this wallet from the admin whitelist?'}
            </p>
          </ModalBody>
          <ModalFooter>
            <Button
              onPress={handleCloseDeleteModal}
              isDisabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={handleDeleteConfirm}
              isLoading={deleteMutation.isPending}
              isDisabled={deleteMutation.isPending}
            >
              Confirm remove
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};
