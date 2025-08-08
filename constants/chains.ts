export interface ChainConfig {
  id: string;
  name: string;
  addressPattern?: RegExp;
  isCustom?: boolean;
}

export interface ChainValidationResult {
  valid: boolean;
  error?: string;
}

export interface ChainDisplayInfo {
  name: string;
}

export const PREDEFINED_CHAINS: ChainConfig[] = [
  {
    id: 'ethereum',
    name: 'Ethereum',
    addressPattern: /^0x[a-fA-F0-9]{40}$/,
  },
  {
    id: 'bsc',
    name: 'Binance Smart Chain',
    addressPattern: /^0x[a-fA-F0-9]{40}$/,
  },
  {
    id: 'polygon',
    name: 'Polygon',
    addressPattern: /^0x[a-fA-F0-9]{40}$/,
  },
  {
    id: 'arbitrum',
    name: 'Arbitrum',
    addressPattern: /^0x[a-fA-F0-9]{40}$/,
  },
  {
    id: 'optimism',
    name: 'Optimism',
    addressPattern: /^0x[a-fA-F0-9]{40}$/,
  },
  {
    id: 'avalanche',
    name: 'Avalanche',
    addressPattern: /^0x[a-fA-F0-9]{40}$/,
  },
  {
    id: 'fantom',
    name: 'Fantom',
    addressPattern: /^0x[a-fA-F0-9]{40}$/,
  },
  {
    id: 'gnosis',
    name: 'Gnosis Chain',
    addressPattern: /^0x[a-fA-F0-9]{40}$/,
  },
  {
    id: 'base',
    name: 'Base',
    addressPattern: /^0x[a-fA-F0-9]{40}$/,
  },
  {
    id: 'zksync',
    name: 'zkSync Era',
    addressPattern: /^0x[a-fA-F0-9]{40}$/,
  },
];

// Custom chain option
export const CUSTOM_CHAIN_OPTION: ChainConfig = {
  id: 'custom',
  name: 'Other Chain (Custom)',
  isCustom: true,
  addressPattern: /^0x[a-fA-F0-9]{40}$/,
};

// Get all available chains (excluding the custom option placeholder)
export const getAllChains = (): ChainConfig[] => {
  return [...PREDEFINED_CHAINS];
};

// Get chain by ID
export const getChainById = (id: string): ChainConfig | undefined => {
  if (id === 'custom') return CUSTOM_CHAIN_OPTION;

  // Check predefined chains
  const predefinedChain = PREDEFINED_CHAINS.find((chain) => chain.id === id);
  if (predefinedChain) return predefinedChain;

  // Check if it's a custom chain (format: custom-{name})
  if (id.startsWith('custom-')) {
    const chainName = id.substring(7).replace(/-/g, ' ');
    return createCustomChain(chainName);
  }

  return undefined;
};

// Create custom chain configuration
export const createCustomChain = (name: string): ChainConfig => {
  const sanitizedName = name.trim();
  const id = `custom-${sanitizedName.toLowerCase().replace(/\s+/g, '-')}`;

  return {
    id,
    name: sanitizedName,
    isCustom: true,
    addressPattern: /^0x[a-fA-F0-9]{40}$/,
  };
};

// Validate chain name
export const validateChainName = (
  name: string,
  excludeIds?: string[],
): ChainValidationResult => {
  const trimmedName = name.trim();

  if (!trimmedName) {
    return { valid: false, error: 'Chain name is required' };
  }

  if (trimmedName.length < 2) {
    return { valid: false, error: 'Chain name must be at least 2 characters' };
  }

  if (trimmedName.length > 50) {
    return {
      valid: false,
      error: 'Chain name must be less than 50 characters',
    };
  }

  // Validate against XSS characters
  if (/[<>"'&/\\`]/.test(trimmedName)) {
    return { valid: false, error: 'Chain name contains invalid characters' };
  }

  // Check if name already exists in predefined chains (case-insensitive)
  const existingChain = PREDEFINED_CHAINS.find(
    (chain) => chain.name.toLowerCase() === trimmedName.toLowerCase(),
  );

  if (existingChain) {
    return {
      valid: false,
      error: 'This chain name already exists in the predefined list',
    };
  }

  // Also check the generated ID doesn't conflict with existing chains
  const generatedId = `custom-${trimmedName.toLowerCase().replace(/\s+/g, '-')}`;
  if (PREDEFINED_CHAINS.some((chain) => chain.id === generatedId)) {
    return {
      valid: false,
      error: 'This chain name generates a conflicting ID',
    };
  }

  // Check against excluded IDs if provided
  if (excludeIds) {
    const normalizedExcludeIds = excludeIds.map((id) => id.toLowerCase());
    if (normalizedExcludeIds.includes(generatedId.toLowerCase())) {
      return {
        valid: false,
        error: 'This chain name is already in use',
      };
    }
  }

  return { valid: true };
};

// Get chain display info
export const getChainDisplayInfo = (chainId: string): ChainDisplayInfo => {
  const chain = getChainById(chainId);

  if (!chain) {
    return { name: 'Unknown Chain' };
  }

  return {
    name: chain.name,
  };
};
