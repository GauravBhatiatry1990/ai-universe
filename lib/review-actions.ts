'use server';

import { revalidatePath } from 'next/cache';

export async function revalidateReviews(): Promise<void> {
  revalidatePath('/');
}