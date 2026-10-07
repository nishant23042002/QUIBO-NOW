import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Button } from './Button';
import { Card } from './Card';
import { Sheet } from './Sheet';

const meta = {
  title: 'Primitives/Sheet',
  component: Sheet,
  parameters: { layout: 'fullscreen' },
  args: {
    open: true,
    onClose: fn(),
    title: 'Choose a delivery window',
    closeLabel: 'Close',
    children: <p>Pick the time you will be home. We keep to the window we show you.</p>,
    footer: <Button className="w-full">Confirm window</Button>,
  },
} satisfies Meta<typeof Sheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Disabled: Story = {
  args: {
    children: <p>No delivery window is left today.</p>,
    footer: (
      <Button className="w-full" disabled>
        Confirm window
      </Button>
    ),
  },
};

export const Loading: Story = {
  args: {
    busy: true,
    children: <Card loading loadingLabel="Loading delivery windows" />,
    footer: (
      <Button className="w-full" loading>
        Confirm window
      </Button>
    ),
  },
};

export const ErrorState: Story = {
  args: {
    error: 'We could not load delivery windows. Check your connection and try again.',
    footer: <Button className="w-full">Try again</Button>,
  },
};
