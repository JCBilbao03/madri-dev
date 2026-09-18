import { defineSecret } from 'firebase-functions/params';

export const titanEmailSecret = defineSecret('TITAN_EMAIL');
export const titanAppPasswordSecret = defineSecret('TITAN_APP_PASSWORD');

export const mailSecrets = [titanEmailSecret, titanAppPasswordSecret];
