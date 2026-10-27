import { config } from '../config.js';
import { openDatabase } from './connection.js';
import { createTicketRepository } from '../repositories/ticketRepository.js';

const SAMPLE_TICKETS = [
  {
    title: 'Can’t connect to office Wi-Fi',
    description: 'Since this morning my laptop says “unable to join network”. My phone connects fine.',
    priority: 'HIGH',
    requesterName: 'Aisha Rahman',
    status: 'OPEN',
  },
  {
    title: 'Request access to the finance shared drive',
    description: 'I joined the finance team this week and need read access to the shared drive.',
    priority: 'MEDIUM',
    requesterName: 'Daniel Tan',
    status: 'IN_PROGRESS',
  },
  {
    title: 'Monitor flickers on the second floor desk 14',
    description: 'The external monitor flickers every few minutes. I tried a different cable already.',
    priority: 'LOW',
    requesterName: 'Priya Nair',
    status: 'OPEN',
  },
  {
    title: 'Password reset for email',
    description: 'I was locked out after too many attempts and need my email password reset.',
    priority: 'HIGH',
    requesterName: 'Wei Ling',
    status: 'RESOLVED',
  },
];

const db = openDatabase(config.databaseFile);
const tickets = createTicketRepository(db);

const { count } = db.prepare('SELECT COUNT(*) AS count FROM tickets').get(); // get the current number of tickets in the database
if (count > 0) {
  console.log(`Database already has ${count} tickets. Skipping seed.`);
} else {
  for (const { status, ...input } of SAMPLE_TICKETS) { // create each sample ticket, setting the status if it's not OPEN
    const ticket = tickets.create(input);
    if (status !== 'OPEN') tickets.update(ticket.id, { status });
  }
  console.log(`Seeded ${SAMPLE_TICKETS.length} sample tickets.`);
}

db.close();
