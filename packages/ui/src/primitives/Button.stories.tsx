import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './Button';

const meta = {
  title: 'Primitives/Button',
  component: Button,
  args: { children: 'Place order' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['primary', 'secondary', 'ghost'] },
    size: { control: 'inline-radio', options: ['md', 'lg'] },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Disabled: Story = { args: { disabled: true } };

export const Loading: Story = { args: { loading: true } };

/** After a failed action the button offers a retry, and is tied to the message that explains why. */
export const ErrorState: Story = {
  args: { children: 'Try again' },
  render: (args) => (
    <div className="flex flex-col items-start gap-3">
      <p id="button-error" role="alert" className="font-semibold text-danger">
        The order was not placed. Check your connection and try again.
      </p>
      <Button {...args} aria-describedby="button-error" />
    </div>
  ),
};

export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Button {...args} variant="primary">
        Primary
      </Button>
      <Button {...args} variant="secondary">
        Secondary
      </Button>
      <Button {...args} variant="ghost">
        Ghost
      </Button>
      <Button {...args} variant="primary" size="lg">
        Large
      </Button>
    </div>
  ),
};
