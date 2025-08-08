import { cn } from '@heroui/react';
import Link, { LinkProps } from 'next/link';
import { FC, PropsWithChildren } from 'react';

const MainContainer: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="text-[16px] font-[400] leading-[23px] text-black/80">
      {children}
    </div>
  );
};

const SectionContainer: FC<PropsWithChildren> = ({ children }) => {
  return <div className="mb-[20px]">{children}</div>;
};

const StyledLink: FC<PropsWithChildren<LinkProps & { className?: string }>> = ({
  children,
  href,
  className = '',
  ...restProps
}) => {
  return (
    <Link
      href={href}
      target={'_blank'}
      className={cn('underline hover:opacity-80', className)}
      {...restProps}
    >
      {children}
    </Link>
  );
};

export const PrivacyPolicyContent = () => (
  <MainContainer>
    <SectionContainer>
      <p>
        <StyledLink href="https://ecf.network/">ECF.network</StyledLink> takes
        your privacy seriously even before full deployment. Before testing our
        PoC platform, we would like to bring certain aspects of our privacy
        policy to your attention.
      </p>
    </SectionContainer>

    <SectionContainer>
      <p>
        By proceeding to the alpha test, you acknowledge that you have read,
        understood, and agreed to the terms outlined below:
      </p>
    </SectionContainer>

    <SectionContainer>
      <p>
        <strong>Data Collection: </strong>
        The platform does not collect user data. All the data the platform shows
        to the public are user generated data that are considered intentionally
        published by users. Note: Due to the inherent transparency of blockchain
        technology, wallet addresses are the only form of public data that may
        be traceable to your personal identity. To protect your privacy, we
        strongly recommend using a new, unused address if you are concerned
        about linking activity to your identity.
      </p>
    </SectionContainer>

    <SectionContainer>
      <p>
        <strong>Data Usage: </strong>
        The data shown in your personal profile are used for the purpose of
        improving the platform for next stage and communicating important
        updates or changes. We do not and cannot sell or rent your personal
        information to third parties.
      </p>
    </SectionContainer>

    <SectionContainer>
      <p>
        <strong>Cookies and Tracking: </strong>
        We do not use cookies and similar tracking technologies.
      </p>
    </SectionContainer>

    <SectionContainer>
      <p>
        <strong>Third-Party Links: </strong>
        Depending on content published by users, the Alpha platform may contain
        links to third-party websites or services that are not owned or
        controlled by us. We are not responsible for the privacy practices or
        content of these websites. We encourage you to review the privacy
        policies of those third parties before using their services.
      </p>
    </SectionContainer>

    <SectionContainer>
      <p>
        <strong>Updates to Privacy Policy: </strong>
        Our privacy policy may be updated from time to time. We will notify you
        of any significant changes by posting a prominent notice on our website
        or in community hubs.
      </p>
    </SectionContainer>

    <SectionContainer>
      <strong>
        By continuing to participate in the Alpha, you signify your acceptance
        of this privacy warning and the terms of our privacy policy.
      </strong>
    </SectionContainer>
  </MainContainer>
);

export const AboutECFPensieveContent = () => (
  <MainContainer>
    <SectionContainer>
      <p>
        <StyledLink className="font-[700]" href="https://ecf.network/">
          ECF.network
        </StyledLink>{' '}
        is a ECF Pensieve knowledge base: where truth is validated by
        communities, not gatekeepers.
      </p>
    </SectionContainer>

    <SectionContainer>
      <p>
        "A Pensieve knowledge base is a decentralized, provenance-rich system
        where knowledge is collaboratively verified, transparently governed, and
        socially legitimized—unlike traditional knowledge bases that rely on
        centralized authority and opaque curation."
      </p>
    </SectionContainer>

    <SectionContainer>
      <p className="font-[600] italic">Verify critical facts.</p>
      <p className="font-[600] italic">Validate claims and contribute.</p>
    </SectionContainer>

    <SectionContainer>
      <p>
        The <StyledLink href="https://ecf.network/">ECF.network</StyledLink>{' '}
        platform aims to provide a public good.
      </p>
    </SectionContainer>
  </MainContainer>
);

export const DisclaimerContent = () => (
  <MainContainer>
    <SectionContainer>
      <p>
        Data submitted during alpha is{' '}
        <strong>
          not guaranteed to be included in the genesis block at launch
        </strong>{' '}
        — this will depend on the outcomes of testing. However, acknowledgement
        of your participation and contributions will be recorded.
      </p>
    </SectionContainer>

    <SectionContainer>
      <p>
        "PoC Pensieve-Alpha Testing" is for validation and improvement of the
        Pensieve Social Consensus Mechanism (link to paper in gitbook) and
        feedback for{' '}
        <StyledLink href="https://ecf.network/">ECF.network</StyledLink>{' '}
        Platform.
      </p>
    </SectionContainer>

    <SectionContainer>
      <p>
        We cannot bring the project to the next stage without our community's
        support. Thank you for joining the Alpha.
      </p>
    </SectionContainer>

    <SectionContainer>
      <p>
        <strong>Note:</strong> Due to the inherent transparency of blockchain
        technology, wallet addresses are the only form of public data that may
        be traceable to your personal identity. To protect your privacy, we
        strongly recommend using a new, unused address if you are concerned
        about linking activity to your identity.
      </p>
    </SectionContainer>
  </MainContainer>
);
