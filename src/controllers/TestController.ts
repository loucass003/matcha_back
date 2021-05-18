import {
  Body,
  Controller,
  Params,
  Post,
  Request,
  Response,
} from '@decorators/express';
import express from 'express';
import { createToken, setAuthHeaders } from '../auth';
import { ValidationMiddleware } from '../middlewares/ValidationMiddleware';
import { AppRequest } from '../types';
import {
  array, num, required, str,
} from '../validation';

@Controller('/')
export class TestController {
  @Post('/hello/:id', [
    ValidationMiddleware({
      params: {
        id: required().and(str.is()).and(num.parse()).and(num.min(5)),
      },
      body: {
        data: required().and(array.is()).and(array.items(num.is())),
        toto: required().and(str.is()).and(str.min(3)),
      },
    }),
  ])
  hello(
    @Request() { session, db }: AppRequest,
    @Response() res: express.Response,
    @Body('data') data: number[],
    @Params('id') id: number,
  ) {
    res.send(
      `hello ${data} ${id} Session ${session ? session.username : 'no'}`,
    );
    console.log(db);
  }

  @Post('/login/:username')
  login(
    @Response() res: express.Response,
    @Params('username') username: string,
  ) {
    setAuthHeaders(res, createToken({ username }));
    res.sendStatus(200);
  }
}
