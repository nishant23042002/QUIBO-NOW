import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input } from './Input';

const meta = {
  title: 'Primitives/Input',
  component: Input,
  args: {
    label: 'Phone number',
    hint: 'We send a one-time code to this number.',
    inputMode: 'numeric',
    autoComplete: 'tel',
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Disabled: Story = { args: { disabled: true, defaultValue: '9876543210' } };

export const Loading: Story = { args: { loading: true, defaultValue: '9876543210' } };

export const ErrorState: Story = {
  args: { error: 'Enter a 10-digit mobile number.', defaultValue: '98765' },
};
