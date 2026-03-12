export default async function createRequest(options) {
  const isDev = window.location.hostname === 'localhost';

  const baseUrl = isDev
    ? 'http://localhost:7070/?' // локальный сервер
    : 'https://tickets-12s9.onrender.com/?'; // сервер на render.com

  const { method, url, body } = options;

  try {
    const response = await fetch(baseUrl + url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body), // NB! при GET-запросе получим 'undefined'
    });

    if (response.ok) {
      // проверка подключения к серверу и удаление тикетов:
      if (response.status === 204) {
        return { error: false, status: response.status };
      }

      return await response.json(); // сразу присылает данные обратно!
    }

    return { error: true, status: response.status };
  } catch (err) {
    return { error: true, status: 520 };
  }
}
