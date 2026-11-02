import { z } from 'zod';

const MAX_PERIOD_DAYS = 180;

const birthDataSchema = z.object({
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Формат даты: YYYY-MM-DD'),
  birthTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Формат времени: HH:mm')
    .nullable()
    .optional(),
  birthPlace: z.string().min(2, 'Укажите город рождения'),
});

export const weddingDateRequestSchema = z
  .object({
    partner1: birthDataSchema,
    partner2: birthDataSchema,
    eventCity: z.string().min(2, 'Укажите город проведения свадьбы'),
    periodStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    periodEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  })
  .refine((data) => new Date(data.periodStart) <= new Date(data.periodEnd), {
    message: 'periodStart должен быть не позже periodEnd',
    path: ['periodEnd'],
  })
  .refine(
    (data) => {
      const days =
        (new Date(data.periodEnd) - new Date(data.periodStart)) / (1000 * 60 * 60 * 24);
      return days <= MAX_PERIOD_DAYS;
    },
    { message: `Период поиска не должен превышать ${MAX_PERIOD_DAYS} дней`, path: ['periodEnd'] }
  );

export const horoscopeQuerySchema = z.object({});
