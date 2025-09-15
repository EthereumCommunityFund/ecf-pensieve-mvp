'use client';

import { FC, useEffect, useMemo, useState } from 'react';

import { AFFILIATION_TYPE_OPTIONS } from '@/components/biz/table/embedTable/item/AffiliatedProjectsTableItem';
import { CONTRIBUTION_TYPE_OPTIONS } from '@/components/biz/table/embedTable/item/ContributingTeamsTableItem';
import { STACK_INTEGRATION_TYPE_OPTIONS } from '@/components/biz/table/embedTable/item/StackIntegrationsTableItem';
import { IPocItemKey } from '@/types/item';

import { useProjectTableData } from '../detail/table/hooks/useProjectTableData';

import { useReverseEcosystemData } from './hooks/useReverseEcosystemData';
import EcosystemNav from './nav/EcosystemNav';
import EcosystemTable from './table/EcosystemTable';
import {
  useAffiliatedProjectsColumns,
  useContributingTeamsColumns,
  useStackIntegrationsColumns,
} from './table/columns';
import { EcosystemSection } from './types';

interface EcosystemProps {
  projectId: number;
  onOpenModal?: (
    itemKey: IPocItemKey,
    contentType?: 'viewItemProposal' | 'submitPropose',
  ) => void;
}

const Ecosystem: FC<EcosystemProps> = ({ projectId, onOpenModal }) => {
  const [activeSection, setActiveSection] =
    useState<EcosystemSection>('stack_integrations');

  const { getItemRowData, isDataFetched } = useProjectTableData();

  // Get reverse ecosystem data
  const {
    stackIntegrationsReverse,
    contributingTeamsReverse,
    affiliatedProjectsReverse,
    isLoading: isLoadingReverse,
  } = useReverseEcosystemData(projectId);

  const stackIntegrationsData = useMemo(() => {
    return getItemRowData('stack_integrations');
  }, [getItemRowData]);

  const contributingTeamsData = useMemo(() => {
    return getItemRowData('contributing_teams');
  }, [getItemRowData]);

  const affiliatedProjectsData = useMemo(() => {
    return getItemRowData('affiliated_projects');
  }, [getItemRowData]);

  const stackIntegrationsColumns = useStackIntegrationsColumns();
  const contributingTeamsColumns = useContributingTeamsColumns();
  const affiliatedProjectsColumns = useAffiliatedProjectsColumns();

  const handleSectionClick = (section: EcosystemSection) => {
    setActiveSection(section);
    const element = document.getElementById(section);
    if (element) {
      const offset = 100;
      const elementPosition =
        element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections: EcosystemSection[] = [
        'stack_integrations',
        'contributing_teams',
        'affiliated_projects',
      ];

      const scrollPosition = window.scrollY + 150;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (
            scrollPosition >= offsetTop &&
            scrollPosition < offsetTop + offsetHeight
          ) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="tablet:flex-col mobile:flex-col mt-[20px] flex gap-[40px] p-[20px]">
      <div className="tablet:hidden mobile:hidden">
        <EcosystemNav
          activeSection={activeSection}
          onSectionClick={handleSectionClick}
        />
      </div>
      <div className="flex-1 space-y-[40px]">
        <div id="stack_integrations" className="space-y-[20px]">
          <div className="mobile:flex-col mobile:items-start flex items-center justify-between gap-[10px]">
            <div>
              <h3 className="mb-[5px] text-[18px] font-bold text-black/80">
                Stack & Integrations
              </h3>
              <p className="text-[13px] text-black/40">
                The protocols, libraries and building blocks this project relies
                on or connects with.
              </p>
            </div>
            <div className="flex items-center gap-[10px]">
              <button
                onClick={() => {
                  onOpenModal?.('stack_integrations', 'submitPropose');
                }}
                className="flex items-center gap-[5px] rounded-[5px] bg-black/[0.05] px-[10px] py-[5px] text-[13px] font-[600] text-black/80 transition-colors hover:bg-black/[0.08]"
              >
                Propose an Entry
              </button>
              <button
                onClick={() => {
                  onOpenModal?.('stack_integrations', 'viewItemProposal');
                }}
                className="flex items-center gap-[5px] rounded-[5px] bg-black/[0.05] px-[10px] py-[5px] text-[13px] font-[600] text-black/80 transition-colors hover:bg-black/[0.08]"
              >
                View Item
              </button>
            </div>
          </div>

          {/* Reverse table - Powered by */}
          <EcosystemTable
            id="stack_integrations_reverse"
            itemKey="stack_integrations"
            title="Powered by:"
            description="Following data are linked via external Pensieve project pages"
            filterButtonText="Relation"
            data={stackIntegrationsReverse}
            columns={stackIntegrationsColumns}
            projectId={projectId}
            isDataFetched={!isLoadingReverse}
            typeKey="type"
            typeOptions={STACK_INTEGRATION_TYPE_OPTIONS}
            onOpenModal={onOpenModal}
          />

          {/* Forward table - Empowering */}
          <EcosystemTable
            id="stack_integrations_forward"
            itemKey="stack_integrations"
            title="Empowering:"
            description="Following data are linked via this project"
            filterButtonText="Relation"
            data={stackIntegrationsData}
            columns={stackIntegrationsColumns}
            projectId={projectId}
            isDataFetched={isDataFetched}
            typeKey="type"
            typeOptions={STACK_INTEGRATION_TYPE_OPTIONS}
            onOpenModal={onOpenModal}
          />
        </div>
        <div id="contributing_teams" className="space-y-[20px]">
          <div className="mobile:flex-col mobile:items-start flex items-center justify-between gap-[10px]">
            <div>
              <h3 className="mb-[5px] text-[18px] font-bold text-black/80">
                Contributing Teams
              </h3>
              <p className="text-[13px] text-black/40">
                The protocols, libraries and building blocks this project relies
                on or connects with.
              </p>
            </div>

            <div className="flex items-center gap-[10px]">
              <button
                onClick={() => {
                  onOpenModal?.('contributing_teams', 'submitPropose');
                }}
                className="flex items-center gap-[5px] rounded-[5px] bg-black/[0.05] px-[10px] py-[5px] text-[13px] font-[600] text-black/80 transition-colors hover:bg-black/[0.08]"
              >
                Propose an Entry
              </button>
              <button
                onClick={() => {
                  onOpenModal?.('contributing_teams', 'viewItemProposal');
                }}
                className="flex items-center gap-[5px] rounded-[5px] bg-black/[0.05] px-[10px] py-[5px] text-[13px] font-[600] text-black/80 transition-colors hover:bg-black/[0.08]"
              >
                View Item
              </button>
            </div>
          </div>

          {/* Reverse table - External Linkage */}
          <EcosystemTable
            id="contributing_teams_reverse"
            itemKey="contributing_teams"
            title="External Linkage"
            description="Following data are linked by external projects"
            filterButtonText="Contribution Type"
            data={contributingTeamsReverse}
            columns={contributingTeamsColumns}
            projectId={projectId}
            isDataFetched={!isLoadingReverse}
            typeKey="type"
            typeOptions={CONTRIBUTION_TYPE_OPTIONS}
            onOpenModal={onOpenModal}
          />

          {/* Forward table - This Project Linkage */}
          <EcosystemTable
            id="contributing_teams_forward"
            itemKey="contributing_teams"
            title="This Project Linkage"
            description="Following data are linked by this project"
            filterButtonText="Contribution Type"
            data={contributingTeamsData}
            columns={contributingTeamsColumns}
            projectId={projectId}
            isDataFetched={isDataFetched}
            typeKey="type"
            typeOptions={CONTRIBUTION_TYPE_OPTIONS}
            onOpenModal={onOpenModal}
          />
        </div>
        <div id="affiliated_projects" className="space-y-[20px]">
          <div className="mobile:flex-col mobile:items-start flex items-center justify-between gap-[10px]">
            <div>
              <h3 className="mb-[5px] text-[18px] font-bold text-black/80">
                Affiliated Projects
              </h3>
              <p className="text-[13px] text-black/40">
                Other partnerships and collaborations around campaigns,
                education, events and more.
              </p>
            </div>

            <div className="flex items-center gap-[10px]">
              <button
                onClick={() => {
                  onOpenModal?.('affiliated_projects', 'submitPropose');
                }}
                className="flex items-center gap-[5px] rounded-[5px] bg-black/[0.05] px-[10px] py-[5px] text-[13px] font-[600] text-black/80 transition-colors hover:bg-black/[0.08]"
              >
                Propose an Entry
              </button>
              <button
                onClick={() => {
                  onOpenModal?.('affiliated_projects', 'viewItemProposal');
                }}
                className="flex items-center gap-[5px] rounded-[5px] bg-black/[0.05] px-[10px] py-[5px] text-[13px] font-[600] text-black/80 transition-colors hover:bg-black/[0.08]"
              >
                View Item
              </button>
            </div>
          </div>

          {/* Reverse table - External Affiliation */}
          <EcosystemTable
            id="affiliated_projects_reverse"
            itemKey="affiliated_projects"
            title="External Affiliation"
            description="Partnerships recorded by other projects"
            filterButtonText="Affiliation Type"
            data={affiliatedProjectsReverse}
            columns={affiliatedProjectsColumns}
            projectId={projectId}
            isDataFetched={!isLoadingReverse}
            typeKey="affiliationType"
            typeOptions={AFFILIATION_TYPE_OPTIONS}
            onOpenModal={onOpenModal}
          />

          {/* Forward table - This Project Affiliation */}
          <EcosystemTable
            id="affiliated_projects_forward"
            itemKey="affiliated_projects"
            title="This Project Affiliation"
            description="Partnerships recorded by this project"
            filterButtonText="Affiliation Type"
            data={affiliatedProjectsData}
            columns={affiliatedProjectsColumns}
            projectId={projectId}
            isDataFetched={isDataFetched}
            typeKey="affiliationType"
            typeOptions={AFFILIATION_TYPE_OPTIONS}
            onOpenModal={onOpenModal}
          />
        </div>
      </div>
    </div>
  );
};

export default Ecosystem;
