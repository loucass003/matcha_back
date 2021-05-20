import {
  Controller,
  Params,
  Post,
  Request,
  Response,
} from '@decorators/express';
import express from 'express';
import { createToken, setAuthHeaders } from '../auth';
import { User } from '../entity/User';
import { ValidationMiddleware } from '../middlewares/ValidationMiddleware';
import { Serialize } from '../serializer';
import { AppRequest } from '../types';
import { Status } from '../utils/http-status';
// import {
//   array, num, required, str,
// } from '../validation';

@Controller('/')
export class TestController {
  @Post('/hello/:id', [
    ValidationMiddleware({
      // params: {
      //   username: required().and(str.is()).and(str.length(5, 30)),
      // },
      // body: {
      //   data: required().and(array.is()).and(array.items(num.is())),
      //   toto: required().and(str.is()).and(str.min(3)),
      // },
    }),
  ])
  async hello(
    @Request() { db }: AppRequest,
    @Response() res: express.Response,
      // @Body('data') data: number[],
      // @Params('id') id: number,
  ) {
    const users = await User.all(db);
    console.log(users);
    res.json(Serialize(users, ['public']));
  }

  @Post('/login/:username')
  login(
    @Response() res: express.Response,
    @Params('username') username: string,
  ) {
    setAuthHeaders(res, createToken({ username }));
    res.sendStatus(Status.OK);
  }
}
