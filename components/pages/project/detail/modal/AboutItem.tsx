import { FC } from 'react';

import { AllItemConfig } from '@/constants/itemConfig';
import { IPocItemKey } from '@/types/item';

interface IAboutItemProps {
  itemKey: IPocItemKey;
}

const AboutItem: FC<IAboutItemProps> = ({ itemKey }) => {
  const itemConfig = AllItemConfig[itemKey];
  return (
    <div>
      {itemConfig?.longDescription ||
        itemConfig?.shortDescription ||
        itemConfig?.description}
    </div>
  );
};

export default AboutItem;
