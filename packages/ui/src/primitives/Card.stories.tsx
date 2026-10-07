import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card } from './Card';

const meta = {
  title: 'Primitives/Card',
  component: Card,
  args: {
    children: (
      <>
        <h3 className="text-lg font-bold">Sharma Kirana</h3>
        <p className="text-ink-muted">Staples, dairy and snacks. Delivers by 7:30 pm.</p>
      </>
    ),
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Disabled: Story = { args: { disabled: true } };

export const Loading: Story = { args: { loading: true, loadingLabel: 'Loading shop' } };

export const ErrorState: Story = {
  args: {
    tone: 'error',
    children: (
      <>
        <h3 className="text-lg font-bold">This shop did not load</h3>
        <p>Check your connection and try again.</p>
      </>
    ),
  },
};
