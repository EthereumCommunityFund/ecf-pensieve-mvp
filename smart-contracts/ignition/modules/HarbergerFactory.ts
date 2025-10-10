import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

const DEFAULT_TREASURY = '0x0425975b9C3f0cbD03F73600bebed294CDb607E4';
const DEFAULT_GOVERNANCE = '0xE7245Ab998c0A7c729b2c7aa91f2d3D93f8B4244';

export default buildModule('HarbergerFactoryModule', (m) => {
  const treasury = m.getParameter('treasury', DEFAULT_TREASURY);
  const governance = m.getParameter('governance', DEFAULT_GOVERNANCE);

  const factory = m.contract('HarbergerFactory', [treasury, governance]);

  return { factory };
});
