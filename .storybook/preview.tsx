import type { Preview } from '@storybook/react';

import { StoryThemeProvider } from './StoryThemeProvider';
import './tailwind.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#FFFFFF',
        },
        {
          name: 'dark',
          value: '#333333',
        },
      ],
    },
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <StoryThemeProvider>
        <div className="p-4">
          <Story />
        </div>
      </StoryThemeProvider>
    ),
  ],
};

export default preview;
