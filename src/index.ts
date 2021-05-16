import { attachControllers } from '@decorators/express';
import express, { Application } from 'express';
import controllers from './controllers';

const {
  PORT = 3000,
} = process.env;

export class Main {
  public app?: Application;

  public init(): void {
    this.app = express();

    this.app.use(express.json());
    attachControllers(this.app, controllers);
    this.app.listen(PORT, () => {
      console.log(`Connected on port ${PORT}`);
    });
  }
}

new Main().init();
