import { HttpService } from '@nestjs/axios';
import { Inject } from '@nestjs/common';

export const InjectHttp = () => Inject(HttpService);
