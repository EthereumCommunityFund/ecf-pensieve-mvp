'use client';

import React, { useMemo } from 'react';
import { FieldArrayWithId } from 'react-hook-form';

import {
  EmbedTableRemoveButtonCell,
  EmbedTableRow,
  EmbedTableTextInputCell,
  EmbedTableURLInputCell,
} from '../commonCells';

interface AuditReportTableItemProps {
  field: FieldArrayWithId<any, any, 'fieldId'>;
  index: number;
  remove: () => void;
  itemKey: 'audit_report';
  canRemove: boolean;
}

const AuditReportTableItem: React.FC<AuditReportTableItemProps> = ({
  index,
  remove,
  itemKey,
  canRemove,
}) => {
  const fieldPaths = useMemo(
    () => ({
      reportLink: `${itemKey}.${index}.reportLink`,
      auditorName: `${itemKey}.${index}.auditorName`,
    }),
    [itemKey, index],
  );

  return (
    <EmbedTableRow>
      <EmbedTableURLInputCell
        itemKey={itemKey}
        columnKey="reportLink"
        name={fieldPaths.reportLink}
        placeholder="https://"
      />
      <EmbedTableTextInputCell
        itemKey={itemKey}
        columnKey="auditorName"
        name={fieldPaths.auditorName}
        placeholder="Auditor name"
        showRightBorder={false}
      />
      <EmbedTableRemoveButtonCell
        canRemove={canRemove}
        onRemove={remove}
        ariaLabel={`Remove audit report ${index + 1}`}
      />
    </EmbedTableRow>
  );
};

export default AuditReportTableItem;
