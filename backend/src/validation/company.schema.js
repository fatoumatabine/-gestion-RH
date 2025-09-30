import { z } from 'zod'

export const createCompanySchema = z.object({
  nom: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères')
    .regex(/^[a-zA-ZÀ-ÿ\s\-'&]+$/, 'Le nom contient des caractères invalides'),

  adresse: z.string()
    .max(255, 'L\'adresse ne peut pas dépasser 255 caractères')
    .optional(),

  telephone: z.string()
    .transform(val => val.replace(/\s/g, ''))
    .pipe(z.string().regex(/^(\+221|221)?[76-8]\d{8}$/, 'Format de téléphone invalide ()'))
    .optional(),

  email: z.string()
    .email('Email invalide')
    .max(100, 'L\'email ne peut pas dépasser 100 caractères')
    .optional(),

  siteWeb: z.string()
    .transform(val => {
      if (!val) return val;
      if (!/^https?:\/\//.test(val)) {
        return 'http://' + val;
      }
      return val;
    })
    .pipe(z.string().url('URL invalide').max(200, 'L\'URL du site web ne peut pas dépasser 200 caractères'))
    .optional(),

  description: z.string()
    .max(1000, 'La description ne peut pas dépasser 1000 caractères')
    .optional(),

  devise: z.enum(['XOF', 'EUR', 'USD'], {
    errorMap: () => ({ message: 'Devise invalide. Valeurs acceptées: XOF, EUR, USD' })
  }).optional(),

  timezone: z.string()
    .regex(/^Africa\/[A-Za-z_]+$/, 'Timezone invalide (doit commencer par Africa/)')
    .optional(),

  periodePayroll: z.enum(['MENSUEL', 'BIMENSUEL', 'HEBDOMADAIRE', 'QUINZAINE'], {
    errorMap: () => ({ message: 'Période de paie invalide' })
  }).optional(),

  parametres: z.record(z.any()).optional()
})

export const updateCompanySchema = createCompanySchema.partial().extend({
  nom: createCompanySchema.shape.nom.optional(),
  estActive: z.boolean().optional()
})
