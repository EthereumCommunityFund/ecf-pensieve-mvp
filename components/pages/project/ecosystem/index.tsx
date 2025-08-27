'use client';

import { FC, useEffect, useMemo, useState } from 'react';

import EcosystemNav from './nav/EcosystemNav';
import EcosystemTable from './table/EcosystemTable';
import {
  useAffiliatedProjectsColumns,
  useContributingTeamsColumns,
  useStackIntegrationsColumns,
} from './table/columns';
import {
  EcosystemSection,
  IAffiliatedProject,
  IContributingTeam,
  IStackIntegration,
} from './types';

interface EcosystemProps {
  projectId: number;
}

const Ecosystem: FC<EcosystemProps> = ({ projectId }) => {
  const [activeSection, setActiveSection] =
    useState<EcosystemSection>('stack_integrations');

  const stackIntegrationsColumns = useStackIntegrationsColumns();
  const contributingTeamsColumns = useContributingTeamsColumns();
  const affiliatedProjectsColumns = useAffiliatedProjectsColumns();

  const mockStackIntegrationsData: IStackIntegration[] = useMemo(
    () => [
      {
        project: 'Ethereum',
        relation: 'Integration',
        description: 'This project has been a development on Ethereum network.',
        reference: '',
        repository: '',
      },
    ],
    [],
  );

  const mockContributingTeamsData: IContributingTeam[] = useMemo(
    () => [
      {
        project: 'Ethereum',
        contributionArea: 'Integration',
        description:
          'This project has been a development on Ethereum network. Contributed to core protocol development and testing.',
        reference: '',
      },
    ],
    [],
  );

  const mockAffiliatedProjectsData: IAffiliatedProject[] = useMemo(
    () => [
      {
        project: 'Ethereum',
        affiliationType: 'Integration',
        description:
          'This project has been a development on Ethereum network. Partnership established for mutual growth and ecosystem expansion.',
        reference: '',
      },
    ],
    [],
  );

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
      <div className="flex-1">
        <EcosystemTable
          id="stack_integrations"
          title="Stack & Integrations"
          description="The protocols, libraries and building blocks this project relies on or connects with."
          filterButtonText="Relation"
          data={mockStackIntegrationsData}
          columns={stackIntegrationsColumns}
          projectId={projectId}
        />
        <EcosystemTable
          id="contributing_teams"
          title="Contributing Teams"
          description="Teams and organizations that contribute to this project's development and growth."
          filterButtonText="Contribution Type"
          data={mockContributingTeamsData}
          columns={contributingTeamsColumns}
          projectId={projectId}
        />
        <EcosystemTable
          id="affiliated_projects"
          title="Affiliated Projects"
          description="Related projects and partnerships within the ecosystem."
          filterButtonText="Affiliation Type"
          data={mockAffiliatedProjectsData}
          columns={affiliatedProjectsColumns}
          projectId={projectId}
        />
      </div>
    </div>
  );
};

export default Ecosystem;
