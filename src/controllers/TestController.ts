import {
  Controller, Get, Query, Response,
} from '@decorators/express';
import express from 'express';
import { ValidationMiddleware } from '../middlewares/ValidationMiddleware';
import { required, str } from '../validation';

@Controller('/')
export class TestController {
  @Get('/hello', [
    ValidationMiddleware('CA MARCHE !!!!!!'),
  ])
  hello(
    @Response() res: express.Response,
    @Query('word') word: string,
  ) {
    const isValid = required()
      .and(str.is())
      .and(str.length(1, 3));
    console.log(isValid(word));
    res.send(`hello ${word}`);
  }

  @Get('/hello2', [
    ValidationMiddleware('YAY'),
  ])
  hello2(
    @Response() res: express.Response,
    @Query('word') word: string,
  ) {
    const isValid = required()
      .and(str.is())
      .and(str.length(1, 3));
    console.log(isValid(word));
    res.send(`hello ${word}`);
  }
}
