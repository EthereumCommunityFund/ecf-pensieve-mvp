'use client';

import { Spinner } from '@heroui/react';
import { useCallback, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { Button } from '@/components/base/button';
import { Input } from '@/components/base/input';
import { Select, SelectItem } from '@/components/base/select';
import { addToast } from '@/components/base/toast';
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

const statusOptions: Array<{ value: 'active' | 'disabled'; label: string }> = [
  { value: 'active', label: 'Active' },
  { value: 'disabled', label: 'Disabled' },
];

const toStatusValue = (isDisabled?: boolean | null): 'active' | 'disabled' =>
  isDisabled ? 'disabled' : 'active';

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
      createForm.reset({
        address: '',
        nickname: '',
        role: 'admin',
        status: 'active',
      });
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
      setEditingEntry(null);
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
    },
    onError: (mutationError) => {
      addToast({
        color: 'danger',
        title: 'Failed to remove entry',
        description: mutationError.message ?? 'Please try again later.',
      });
    },
  });

  const createForm = useForm<CreateFormValues>({
    defaultValues: {
      address: '',
      nickname: '',
      role: 'admin',
      status: 'active',
    },
    mode: 'onBlur',
  });

  const [editingEntry, setEditingEntry] = useState<AdminWhitelistEntry | null>(
    null,
  );

  const editForm = useForm<EditFormValues>({
    defaultValues: {
      nickname: '',
      role: 'admin',
      status: 'active',
    },
  });

  useEffect(() => {
    if (!editingEntry) {
      editForm.reset({
        nickname: '',
        role: 'admin',
        status: 'active',
      });
      return;
    }

    editForm.reset({
      nickname: editingEntry.nickname ?? '',
      role: editingEntry.role ?? 'admin',
      status: toStatusValue(editingEntry.isDisabled),
    });
  }, [editForm, editingEntry]);

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

  const handleDelete = async (entry: AdminWhitelistEntry) => {
    const confirmation = window.confirm(
      `Remove wallet ${entry.address}? This action cannot be undone.`,
    );
    if (!confirmation) return;

    await deleteMutation.mutateAsync({ id: entry.id });
  };

  const isCreateDisabled = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-4 py-8 lg:flex-row">
      <div className="flex-1 space-y-6">
        <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-[0_8px_24px_rgba(0,0,0,0.05)]">
          <div className="flex flex-col gap-2">
            <h1 className="text-[24px] font-semibold leading-[32px] text-black">
              Admin role management
            </h1>
            <p className="text-[14px] leading-[22px] text-black/70">
              Review, add, or disable admin wallets. Environment-sourced wallets
              are read-only and cannot be edited from this interface.
            </p>
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
                  refetch().catch(() => {});
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
                    const isEditing = editingEntry?.id === entry.id;
                    const statusLabel = entry.isDisabled
                      ? 'Disabled'
                      : 'Active';
                    const createdLabel = entry.createdAt
                      ? new Date(entry.createdAt).toLocaleString()
                      : '—';
                    return (
                      <tr
                        key={entry.id}
                        className="border-b border-black/[0.08] last:border-b-0"
                      >
                        <td className="px-6 py-4 font-mono text-[13px]">
                          {entry.address}
                        </td>
                        <td className="px-6 py-4 text-[14px]">
                          {entry.nickname?.trim() || '—'}
                        </td>
                        <td className="px-6 py-4 text-[14px]">
                          {roleDisplayName[entry.role]}
                        </td>
                        <td className="px-6 py-4 text-[14px]">{statusLabel}</td>
                        <td className="px-6 py-4 text-[13px] text-black/60">
                          {createdLabel}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              onPress={() =>
                                setEditingEntry(isEditing ? null : entry)
                              }
                            >
                              {isEditing ? 'Cancel' : 'Edit'}
                            </Button>
                            <Button
                              size="sm"
                              color="primary"
                              onPress={() => handleDelete(entry)}
                              isDisabled={deleteMutation.isPending}
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

        {editingEntry && (
          <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-[0_8px_24px_rgba(0,0,0,0.05)]">
            <div className="flex flex-col gap-2">
              <h2 className="text-[18px] font-semibold leading-[24px] text-black">
                Edit admin entry
              </h2>
              <p className="text-[13px] leading-[18px] text-black/60">
                Address:{' '}
                <span className="font-mono">{editingEntry.address}</span>
              </p>
            </div>
            <form className="mt-4 flex flex-col gap-4" onSubmit={handleUpdate}>
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
                    label="Nickname"
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
                    label="Role"
                    selectedKeys={
                      field.value
                        ? new Set<React.Key>([field.value])
                        : new Set()
                    }
                    onSelectionChange={(selected) => {
                      if (selected === 'all') {
                        field.onChange('admin');
                        return;
                      }
                      const firstKey = Array.from(selected)[0];
                      field.onChange(
                        (firstKey as AdminWhitelistRole) ?? 'admin',
                      );
                    }}
                    classNames={{
                      trigger: 'h-[42px]',
                    }}
                  >
                    {ADMIN_WHITELIST_ROLES.filter(
                      (role) => role !== 'super_admin',
                    ).map((role) => (
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
                    label="Status"
                    selectedKeys={
                      field.value
                        ? new Set<React.Key>([field.value])
                        : new Set(['active'])
                    }
                    onSelectionChange={(selected) => {
                      if (selected === 'all') {
                        field.onChange('active');
                        return;
                      }
                      const firstKey = Array.from(selected)[0];
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

              <div className="flex gap-3">
                <Button
                  color="primary"
                  type="submit"
                  isLoading={updateMutation.isPending}
                >
                  Save changes
                </Button>
                <Button
                  type="button"
                  onPress={() => setEditingEntry(null)}
                  isDisabled={updateMutation.isPending}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>

      <aside className="w-full max-w-[420px] shrink-0 space-y-6">
        <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.08)]">
          <h2 className="text-[18px] font-semibold leading-[24px] text-black">
            Add admin wallet
          </h2>
          <p className="mb-4 text-[13px] leading-[18px] text-black/60">
            New wallets can become administrators immediately after being added.
            You can update the role or disable access at any time.
          </p>

          <form className="flex flex-col gap-4" onSubmit={handleCreate}>
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
                  placeholder="Nickname (Optional)"
                  errorMessage={createForm.formState.errors.nickname?.message}
                />
              )}
            />

            <Controller
              control={createForm.control}
              name="role"
              render={({ field }) => (
                <Select
                  label="Role"
                  selectedKeys={
                    field.value
                      ? new Set<React.Key>([field.value])
                      : new Set(['admin'])
                  }
                  onSelectionChange={(selected) => {
                    if (selected === 'all') {
                      field.onChange('admin');
                      return;
                    }
                    const firstKey = Array.from(selected)[0];
                    field.onChange((firstKey as AdminWhitelistRole) ?? 'admin');
                  }}
                  classNames={{
                    trigger: 'h-[42px]',
                  }}
                >
                  {ADMIN_WHITELIST_ROLES.filter(
                    (role) => role !== 'super_admin',
                  ).map((role) => (
                    <SelectItem key={role}>{roleDisplayName[role]}</SelectItem>
                  ))}
                </Select>
              )}
            />

            <Controller
              control={createForm.control}
              name="status"
              render={({ field }) => (
                <Select
                  label="Status"
                  selectedKeys={
                    field.value
                      ? new Set<React.Key>([field.value])
                      : new Set(['active'])
                  }
                  onSelectionChange={(selected) => {
                    if (selected === 'all') {
                      field.onChange('active');
                      return;
                    }
                    const firstKey = Array.from(selected)[0];
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

            <Button
              color="primary"
              type="submit"
              isDisabled={isCreateDisabled || createMutation.isPending}
              isLoading={createMutation.isPending}
            >
              Add wallet
            </Button>
          </form>
        </div>
      </aside>
    </div>
  );
};
