import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from './Badge';

const meta = {
  title: 'Primitives/Badge',
  component: Badge,
  args: { tone: 'success', children: 'Open now' },
  argTypes: {
    tone: {
      control: 'inline-radio',
      options: ['neutral', 'success', 'warning', 'danger', 'info'],
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Disabled: Story = { args: { disabled: true, children: 'Closed today' } };

export const Loading: Story = { args: { loading: true, loadingLabel: 'Loading status' } };

export const ErrorState: Story = { args: { tone: 'danger', children: 'Out of stock' } };

/** Every tone side by side, so the colour pair of each one is checked for contrast. */
export const AllTones: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Badge tone="neutral">Neutral</Badge>
      <Badge tone="success">Open now</Badge>
      <Badge tone="warning">Closing soon</Badge>
      <Badge tone="danger">Out of stock</Badge>
      <Badge tone="info">New</Badge>
    </div>
  ),
};
