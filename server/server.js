import cors from 'cors';
import * as crypto from 'crypto';
import express from 'express';
import pino from 'pino';
import pinoPretty from 'pino-pretty';

const app = express();
const logger = pino(pinoPretty());

// безопасность в браузере (несовпадение origin):
app.use(cors());

// парсинг body на сервере (из строки получаем json):
app.use(express.json());

// установка заголовков ответа:
// app.use((_request, response, next) => {
//   response.setHeader('Content-Type', 'application/json');
//   next();
// });

let tickets = [
  {
    id: crypto.randomUUID(), // уникальный айдишник
    name: 'Поменять краску в принтере, ком. 404',
    description: 'Принтер HP LJ-1210, картриджи на складе',
    status: false,
    created: Date.now(),
  },
  {
    id: crypto.randomUUID(),
    name: 'Переустановить Windows, PC-Hall24',
    description: '',
    status: false,
    created: Date.now(),
  },
  {
    id: crypto.randomUUID(),
    name: 'Установить обновление KB-31642dv3875',
    description: 'Вышло критическое обновление для Windows',
    status: false,
    created: Date.now(),
  },
];

app.use((request, response) => {
  const { method, id } = request.query;

  if (!method) {
    return response.status(204).end();
  }

  switch (method) {
    case 'checkServer': {
      logger.info('Server found');
      response.status(204).end();
      break;
    }

    case 'allTickets': {
      logger.info('All tickets requested');
      response.json(tickets);
      break;
    }

    case 'ticketById': {
      const ticket = tickets.find((ticket) => ticket.id === id);

      if (!ticket) {
        return response.status(404).json({ message: 'Ticket not found' });
      }

      response.json(ticket);
      break;
    }

    case 'createTicket': {
      try {
        const createData = request.body;

        const newTicket = {
          id: crypto.randomUUID(),
          name: createData.name,
          status: false,
          description: createData.description || '',
          created: Date.now(),
        };

        tickets.push(newTicket);

        logger.info({ ticket: newTicket }, 'Ticket created');

        response.json(newTicket);
      } catch (error) {
        logger.error(error);
        response.status(500).json({ error: error.message });
      }

      break;
    }

    case 'deleteById': {
      const ticket = tickets.find((ticket) => ticket.id === id);

      if (!ticket) {
        return response.status(404).json({ message: 'Ticket not found' });
      }

      tickets = tickets.filter((ticket) => ticket.id !== id);

      logger.info({ ticket }, 'Ticket deleted');

      response.status(204).end();

      break;
    }

    case 'updateById': {
      const ticket = tickets.find((ticket) => ticket.id === id);

      if (!ticket) {
        return response.status(404).json({ message: 'Ticket not found' });
      }

      Object.assign(ticket, request.body);

      logger.info({ ticket }, 'Ticket updated');

      response.json(ticket);
      break;
    }

    default: {
      logger.warn({ method, url: request.url }, 'Unknown API method');
      response.status(404).end();
    }
  }
});

const port = process.env.PORT || 7070;

const bootstrap = async() => {
  try {
    app.listen(port, () => logger.info(`Server has been started on http://localhost:${port}`));
  } catch (error) {
    console.error(error);
  }
};

bootstrap();
