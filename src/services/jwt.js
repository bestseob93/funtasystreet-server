import dotenv from 'dotenv';
dotenv.config();

import jwt from 'jwt-simple';

export function tokenForAccount(account) {

  const timestamp = new Date().getTime();
  console.log('token generating');
  console.log(account);
  return jwt.encode({ sub: account.id, iat: timestamp }, process.env.SECRET_KEY);
}
