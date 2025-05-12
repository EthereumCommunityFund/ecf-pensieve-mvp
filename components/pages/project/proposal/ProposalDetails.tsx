'use client';

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useMemo, useState } from 'react';

import { Button } from '@/components/base';
import ECFTypography from '@/components/base/typography';
import { IProposal } from '@/types';

interface ProposalItem {
  property: string;
  input: string;
  reference: string;
  support: number;
}

type CategoryKey = 'basics' | 'dates' | 'technicals' | 'organization';

interface CategoryConfig {
  title: string;
  description: string;
  items: string[];
}

const CATEGORIES: Record<CategoryKey, CategoryConfig> = {
  basics: {
    title: 'Basics',
    description: 'These are the basic information about the project',
    items: [
      'projectName',
      'tagline',
      'categories',
      'mainDescription',
      'projectLogo',
      'websiteUrl',
      'appUrl',
    ],
  },
  dates: {
    title: 'Dates',
    description: 'These are the basic information about the project',
    items: ['dateFounded', 'dateLaunch'],
  },
  technicals: {
    title: 'Technicals',
    description: 'These are the basic information about the project',
    items: [
      'devStatus',
      'openSource',
      'codeRepo',
      'tokenContract',
      'publicGoods',
    ],
  },
  organization: {
    title: 'Organization',
    description: 'These are the basic information about the project',
    items: ['orgStructure', 'fundingStatus', 'founders'],
  },
};

const FIELD_LABELS: Record<string, string> = {
  projectName: 'Project Name',
  tagline: 'Tagline',
  categories: 'Categories',
  mainDescription: 'Description',
  projectLogo: 'Project Logo',
  websiteUrl: 'Website',
  appUrl: 'App Link',
  dateFounded: 'Date Founded',
  dateLaunch: 'Product Launch Date',
  devStatus: 'Development Status',
  openSource: 'Open-source Status',
  codeRepo: 'Repository Link',
  tokenContract: 'Token Contract',
  publicGoods: 'Public-Goods Nature',
  orgStructure: 'Organization Structure',
  fundingStatus: 'Funding Status',
  founders: 'Founders',
};

interface ProposalDetailsProps {
  proposal: IProposal;
  projectId: number;
}

const ProposalDetails = ({ proposal, projectId }: ProposalDetailsProps) => {
  const [expandedCategories, setExpandedCategories] = useState<
    Record<CategoryKey, boolean>
  >({
    basics: true,
    dates: true,
    technicals: true,
    organization: true,
  });

  // 创建列帮助器
  const columnHelper = createColumnHelper<ProposalItem>();

  // 定义列
  const columns = [
    columnHelper.accessor('property', {
      header: 'Property',
      cell: (info) => (
        <div className="py-[10px]">
          <span className="text-[14px] font-[600] leading-[20px] text-black">
            {info.getValue()}
          </span>
        </div>
      ),
    }),
    columnHelper.accessor('input', {
      header: 'Input',
      cell: (info) => {
        const value = info.getValue();
        return (
          <div className="py-[10px]">
            <div className="flex items-center gap-[5px]">
              <span className="text-[14px] font-[400] leading-[20px] text-black">
                {value}
              </span>
            </div>
          </div>
        );
      },
    }),
    columnHelper.accessor('reference', {
      header: 'Reference',
      cell: (info) => {
        const value = info.getValue();
        return value ? (
          <div className="py-[10px]">
            <Button
              color="secondary"
              size="sm"
              className="min-h-0 min-w-0 border-none bg-transparent px-[10px] py-[2px] text-[14px] font-[400] leading-[20px] text-black"
            >
              Reference
            </Button>
          </div>
        ) : (
          <div className="py-[10px]">
            <span className="text-[14px] font-[400] leading-[20px] text-black/30">
              empty
            </span>
          </div>
        );
      },
    }),
    columnHelper.accessor('support', {
      header: 'Support',
      cell: (info) => {
        const value = info.getValue();
        return (
          <div className="py-[10px]">
            <div className="flex items-center gap-[5px]">
              <Button
                color="secondary"
                size="sm"
                className="min-h-0 min-w-0 border-none bg-transparent px-[10px] py-[2px]"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 4L12 20"
                    stroke="#28C196"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M19 11L12 4L5 11"
                    stroke="#28C196"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Button>
              <span className="text-[14px] font-[400] leading-[20px] text-black">
                {value}
              </span>
            </div>
          </div>
        );
      },
    }),
  ];

  // 处理提案数据，转换为表格数据
  const tableData = useMemo(() => {
    const result: Record<CategoryKey, ProposalItem[]> = {
      basics: [],
      dates: [],
      technicals: [],
      organization: [],
    };

    // 将提案项目按类别分组
    proposal.items.forEach((item: any) => {
      const key = item.key;
      const value = item.value;

      // 查找该字段属于哪个类别
      let category: CategoryKey | null = null;
      for (const [catKey, catConfig] of Object.entries(CATEGORIES)) {
        if (catConfig.items.includes(key)) {
          category = catKey as CategoryKey;
          break;
        }
      }

      if (category) {
        // 查找是否有对应的引用
        const reference = (
          proposal.refs as Array<{
            key: string;
            value: string;
          }>
        )?.find((ref) => ref.key === key);

        result[category].push({
          property: FIELD_LABELS[key] || key,
          input: value,
          reference: reference ? reference.value : '',
          support: 0, // 默认支持数为0
        });
      }
    });

    return result;
  }, [proposal]);

  // 将表格实例的创建移到组件顶层
  const tablesBasics = useReactTable<ProposalItem>({
    data: tableData.basics,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const tablesDates = useReactTable<ProposalItem>({
    data: tableData.dates,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const tablesTechnicals = useReactTable<ProposalItem>({
    data: tableData.technicals,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const tablesOrganization = useReactTable<ProposalItem>({
    data: tableData.organization,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // 创建一个包含所有表格的对象
  const tables = useMemo(() => {
    return {
      basics: tablesBasics,
      dates: tablesDates,
      technicals: tablesTechnicals,
      organization: tablesOrganization,
    };
  }, [tablesBasics, tablesDates, tablesTechnicals, tablesOrganization]);

  // 切换类别展开/折叠状态
  const toggleCategory = (category: CategoryKey) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  return (
    <div className="flex flex-col gap-[20px]">
      <div className="flex items-center justify-between">
        <ECFTypography type="subtitle1">Items</ECFTypography>
        <div className="flex items-center gap-[10px]">
          <Button
            color="secondary"
            size="sm"
            className="min-h-0 min-w-0 border-none bg-transparent px-[10px] py-[2px]"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 6H21"
                stroke="black"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M7 12H17"
                stroke="black"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M11 18H13"
                stroke="black"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Button>
          <div className="flex items-center gap-[5px]">
            <span className="text-[14px] font-[400] leading-[20px] text-black">
              Your Weight
            </span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="8"
                cy="8"
                r="7.5"
                stroke="black"
                strokeOpacity="0.5"
              />
              <path
                d="M8 4V8.5"
                stroke="black"
                strokeOpacity="0.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="8" cy="11" r="1" fill="black" fillOpacity="0.5" />
            </svg>
            <span className="text-[14px] font-[700] leading-[20px] text-black">
              00
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-[20px]">
        {/* 遍历所有类别 */}
        {(Object.keys(CATEGORIES) as CategoryKey[]).map((category) => (
          <div
            key={category}
            className="overflow-hidden rounded-[10px] border border-black/10 bg-white"
          >
            {/* 类别标题 */}
            <div className="flex items-center justify-between border-b border-black/10 bg-[#F5F5F5] px-[20px] py-[10px]">
              <div>
                <ECFTypography type="subtitle2">
                  {CATEGORIES[category].title}
                </ECFTypography>
                <ECFTypography type="body2" className="text-black/60">
                  {CATEGORIES[category].description}
                </ECFTypography>
              </div>
              <div className="flex items-center gap-[10px]">
                <Button
                  color="secondary"
                  size="sm"
                  className="min-h-0 min-w-0 border-none bg-transparent px-[10px] py-[2px]"
                  onPress={() => toggleCategory(category)}
                >
                  {expandedCategories[category] ? 'Collapse' : 'Expand'}
                </Button>
                <Button
                  color="secondary"
                  size="sm"
                  className="min-h-0 min-w-0 border-none bg-transparent px-[10px] py-[2px]"
                >
                  Metrics
                </Button>
              </div>
            </div>

            {/* 表格内容 */}
            {expandedCategories[category] && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-black/10">
                      {tables[category].getHeaderGroups().map((headerGroup) =>
                        headerGroup.headers.map((header) => (
                          <th
                            key={header.id}
                            className="px-[20px] py-[10px] text-left text-[14px] font-[600] text-black/60"
                          >
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                )}
                          </th>
                        )),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {tables[category].getRowModel().rows.map((row) => (
                      <tr
                        key={row.id}
                        className="border-b border-black/10 last:border-b-0"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="px-[20px]">
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 投票或提案按钮 */}
      <div className="mt-[20px] flex flex-col gap-[10px] rounded-[10px] border border-black/10 bg-white p-[20px]">
        <ECFTypography type="subtitle2">Vote or Propose</ECFTypography>
        <ECFTypography type="body2" className="text-black/60">
          Vote on existing proposals or submit a new one for review if none are
          accurate.
        </ECFTypography>
        <Button color="primary" className="mt-[10px]">
          Submit a Proposal
        </Button>
      </div>
    </div>
  );
};

export default ProposalDetails;
