'use server';
/**
 * @fileOverview A GenAI tool for generating a concise video synopsis based on video title and category.
 *
 * - generateVideoSynopsis - A function that handles the video synopsis generation process.
 * - GenerateVideoSynopsisInput - The input type for the generateVideoSynopsis function.
 * - GenerateVideoSynopsisOutput - The return type for the generateVideoSynopsis function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateVideoSynopsisInputSchema = z.object({
  title: z.string().describe('The title of the video.'),
  category: z.string().describe('The category of the video.'),
});
export type GenerateVideoSynopsisInput = z.infer<
  typeof GenerateVideoSynopsisInputSchema
>;

const GenerateVideoSynopsisOutputSchema = z.object({
  synopsis: z.string().describe('A concise synopsis for the video.'),
});
export type GenerateVideoSynopsisOutput = z.infer<
  typeof GenerateVideoSynopsisOutputSchema
>;

export async function generateVideoSynopsis(
  input: GenerateVideoSynopsisInput
): Promise<GenerateVideoSynopsisOutput> {
  return generateVideoSynopsisFlow(input);
}

const generateVideoSynopsisPrompt = ai.definePrompt({
  name: 'generateVideoSynopsisPrompt',
  input: {schema: GenerateVideoSynopsisInputSchema},
  output: {schema: GenerateVideoSynopsisOutputSchema},
  prompt: `You are an AI assistant tasked with generating concise video synopses.

Based on the following video title and category, create a short, engaging synopsis.

Video Title: {{{title}}}
Video Category: {{{category}}}

Ensure the synopsis is no more than 2-3 sentences and accurately reflects the video's content and category.`,
});

const generateVideoSynopsisFlow = ai.defineFlow(
  {
    name: 'generateVideoSynopsisFlow',
    inputSchema: GenerateVideoSynopsisInputSchema,
    outputSchema: GenerateVideoSynopsisOutputSchema,
  },
  async input => {
    const {output} = await generateVideoSynopsisPrompt(input);
    return output!;
  }
);
