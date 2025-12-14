/**
 * Actor schema definitions.
 *
 * Actors represent people or systems that interact with the system.
 */

import { z } from 'zod';

/**
 * Allowed actor tags.
 */
export const ActorTagSchema = z.enum([
  'customer',
  'internal',
  'vendor',
  'bot',
  'team',
]);

export type ActorTag = z.infer<typeof ActorTagSchema>;

/**
 * Actor schema with conditional validation.
 *
 * - If tag is 'team', slack_channel is required
 * - If tag is 'team', owns array is allowed
 * - Only one tag is allowed per actor
 */
export const ActorSchema = z
  .object({
    id: z.string().regex(/^[a-z][a-zA-Z0-9_]*$/, 'Invalid id format'),
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    tag: ActorTagSchema.optional(),
    slack_channel: z.string().optional(),
    owns: z.array(z.string().regex(/^[a-z][a-zA-Z0-9_]*$/)).optional(),
  })
  .refine(
    (data) => {
      // If tag is 'team', slack_channel is required
      if (data.tag === 'team') {
        return !!data.slack_channel;
      }
      return true;
    },
    {
      message: 'slack_channel is required for team actors',
      path: ['slack_channel'],
    }
  )
  .refine(
    (data) => {
      // Only team actors can have 'owns'
      if (data.owns && data.owns.length > 0) {
        return data.tag === 'team';
      }
      return true;
    },
    {
      message: 'owns is only valid for team actors',
      path: ['owns'],
    }
  );

export type Actor = z.infer<typeof ActorSchema>;
