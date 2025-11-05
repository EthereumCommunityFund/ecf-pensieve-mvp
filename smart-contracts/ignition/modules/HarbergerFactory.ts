import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

export default buildModule('HarbergerFactoryModule', (m) => {
  const treasury = m.getParameter<string>('treasury');
  const governance = m.getParameter<string>('governance');

  const factory = m.contract('HarbergerFactory', [treasury, governance]);

  return { factory };
});
