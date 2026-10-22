import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TicketForm from './TicketForm.jsx';

describe('TicketForm', () => {
  it('shows field errors and does not submit when required fields are empty', async () => {
    const onSubmit = vi.fn();
    render(<TicketForm onSubmit={onSubmit} />);

    await userEvent.click(screen.getByRole('button', { name: /create ticket/i }));

    expect(screen.getByText(/title must be at least 3 characters/i)).toBeInTheDocument();
    expect(screen.getByText(/description must be at least 10 characters/i)).toBeInTheDocument();
    expect(screen.getByText(/choose a priority\./i)).toBeInTheDocument();
    expect(screen.getByText(/name must be at least 2 characters/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits trimmed values when the form is valid', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<TicketForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/title/i), '  Printer is jammed  ');
    await user.type(screen.getByLabelText(/description/i), 'Paper jams on every second page.');
    await user.selectOptions(screen.getByLabelText(/priority/i), 'HIGH');
    await user.type(screen.getByLabelText(/your name/i), 'Aisha');
    await user.click(screen.getByRole('button', { name: /create ticket/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      title: 'Printer is jammed',
      description: 'Paper jams on every second page.',
      priority: 'HIGH',
      requesterName: 'Aisha',
    });
  });

  it('shows server-side errors until the field is edited', async () => {
    const user = userEvent.setup();
    render(<TicketForm onSubmit={vi.fn()} serverErrors={{ title: 'Title is already in use.' }} />);

    expect(screen.getByText('Title is already in use.')).toBeInTheDocument();

    await user.type(screen.getByLabelText(/title/i), 'x');
    expect(screen.queryByText('Title is already in use.')).not.toBeInTheDocument();
  });

  it('disables the submit button while submitting', () => {
    render(<TicketForm onSubmit={vi.fn()} submitting />);
    expect(screen.getByRole('button', { name: /creating ticket/i })).toBeDisabled();
  });
});
