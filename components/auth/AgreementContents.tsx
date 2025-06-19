'use client';

import React from 'react';

// Privacy Policy Content
export const PrivacyPolicyContent: React.FC = () => (
  <div className="space-y-4 p-5 text-sm leading-relaxed text-gray-700">
    <p>
      <strong>ECF.network</strong> takes your privacy seriously even before full
      deployment. Before testing our PoC platform, we would like to bring
      certain aspects of our privacy policy to your attention.
    </p>

    <p>
      By proceeding to the alpha test, you acknowledge that you have read,
      understood, and agreed to the terms outlined below:
    </p>

    <div className="space-y-4">
      <div>
        <p className="font-semibold">Data Collection:</p>
        <p>
          The platform does not collect user data; you are in full control of
          your own profile and your account security through control of your own
          private keys. All the data the platform shows to the public are
          user-generated data that are considered intentionally published by
          users. Note: Due to the inherent transparency of blockchain
          technology, wallet addresses are the only form of public data that may
          be traceable to your personal identity. To protect your privacy, we
          strongly recommend using a new, unused address if you are concerned
          about linking activity to your identity.
        </p>
      </div>

      <div>
        <p className="font-semibold">Data Usage:</p>
        <p>
          The only data we collect is metadata for analytics and improving user
          experience. This includes but is not limited to page views, user
          interactions, and performance metrics. No personal information is
          collected or stored.
        </p>
      </div>

      <div>
        <p className="font-semibold">Third-party Services:</p>
        <p>
          Our platform integrates with third-party websites or services that are
          not owned or controlled by us. We are not responsible for the privacy
          practices or content of these websites. We encourage you to review the
          privacy policies of those third parties before using their services.
        </p>
      </div>

      <div>
        <p className="font-semibold">Updates to Privacy Policy:</p>
        <p>
          Our privacy policy may be updated from time to time. We will notify
          you of any significant changes by posting a prominent notice on our
          website or in community hubs.
        </p>
      </div>

      <div>
        <p className="font-semibold text-red-600">
          By continuing to participate in the Alpha, you signify your acceptance
          of this privacy warning and the terms of our privacy policy.
        </p>
      </div>
    </div>

    <div className="mt-6 rounded-md bg-gray-50 p-3">
      <p className="text-xs text-gray-600">
        ECF.network takes your privacy seriously even before full deployment.
        Before testing our PoC platform, we would like to bring certain aspects
        of our privacy policy to your attention.
      </p>
    </div>
  </div>
);

// About ECF Pensieve Content
export const AboutECFPensieveContent: React.FC = () => (
  <div className="space-y-4 p-5 text-sm leading-relaxed text-gray-700">
    <p>
      <strong>ecf.network</strong> is a ECF Pensieve knowledge base: where truth
      is validated by communities, not gatekeepers.
    </p>

    <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600">
      "A Pensieve knowledge base is a decentralized, provenance-rich system
      where knowledge is collaboratively verified, transparently governed, and
      socially legitimized—unlike traditional knowledge bases that rely on
      centralized authority and opaque curation."
    </blockquote>

    <div className="space-y-4">
      <div>
        <p className="font-semibold">Verify critical facts.</p>
        <p className="font-semibold">Validate claims and contribute.</p>
      </div>

      <p>The ECF.network platform aims to provide a public good.</p>

      <div className="rounded-md border border-yellow-200 bg-yellow-50 p-3">
        <p className="text-sm">
          <strong>Important:</strong> This is an alpha version for testing
          purposes. Features and functionality may change significantly before
          the final release.
        </p>
      </div>

      <div>
        <p className="font-semibold">How it works:</p>
        <ul className="ml-4 list-inside list-disc space-y-1">
          <li>Community members submit knowledge claims</li>
          <li>Experts and stakeholders validate information</li>
          <li>Transparent governance ensures quality</li>
          <li>Decentralized approach prevents censorship</li>
        </ul>
      </div>

      <div>
        <p className="font-semibold">Your role:</p>
        <p>
          As a participant in this alpha test, you help us refine the platform's
          mechanisms for knowledge validation and community governance. Your
          feedback is crucial for building a robust and reliable knowledge base.
        </p>
      </div>
    </div>

    <div className="mt-6 rounded-md bg-blue-50 p-3">
      <p className="text-xs text-blue-800">
        Thank you for joining the alpha test and helping us build the future of
        decentralized knowledge sharing.
      </p>
    </div>
  </div>
);

// Disclaimer Content
export const DisclaimerContent: React.FC = () => (
  <div className="space-y-4 p-5 text-sm leading-relaxed text-gray-700">
    <p>
      Data submitted during alpha is{' '}
      <strong>not guaranteed to be included in the genesis block</strong> at
      launch — this will depend on the outcomes of testing. However,
      acknowledgement of your participation and contributions will be recorded.
    </p>

    <p>
      "PoC Pensieve-Alpha Testing" is for validation and improvement of the
      Pensieve Social Consensus Mechanism (link to paper in gitbook) and
      feedback for ECF.network Platform.
    </p>

    <p>
      We cannot bring the project to the next stage without our community's
      support. Thank you for joining the Alpha.
    </p>

    <div className="space-y-4">
      <div>
        <p className="font-semibold">Testing Phase Limitations:</p>
        <ul className="ml-4 list-inside list-disc space-y-1">
          <li>Data may be reset or modified during testing</li>
          <li>Features may be incomplete or subject to change</li>
          <li>Platform stability is not guaranteed</li>
          <li>User experience may vary significantly</li>
        </ul>
      </div>

      <div>
        <p className="font-semibold">Participation Acknowledgment:</p>
        <p>
          While data submitted during alpha testing may not be carried forward
          to the final platform, your participation and valuable contributions
          to the development process will be recognized and recorded.
        </p>
      </div>

      <div>
        <p className="font-semibold">Community Support:</p>
        <p>
          The success of this project depends entirely on community
          participation and feedback. Your involvement in the alpha testing
          phase is crucial for shaping the final product.
        </p>
      </div>
    </div>

    <div className="mt-6 rounded-md border border-yellow-200 bg-yellow-50 p-3">
      <p className="text-xs text-yellow-800">
        <strong>Note:</strong> Due to the inherent transparency of blockchain
        technology, wallet addresses are the only form of public data that may
        be traceable to your personal identity. To protect your privacy, we
        strongly recommend using a new, unused address if you are concerned
        about linking activity to your identity.
      </p>
    </div>

    <div className="mt-4 rounded-md border border-green-200 bg-green-50 p-3">
      <p className="text-xs text-green-800">
        We cannot bring the project to the next stage without our community's
        support. Thank you for joining the Alpha.
      </p>
    </div>
  </div>
);
